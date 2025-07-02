/**
 * WorkflowStateManager
 * Manages persistent storage and recovery of workflow execution state
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../shared/logger.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class WorkflowStateManager {
  constructor(config = {}) {
    this.config = {
      dataDir: config.dataDir || path.join(__dirname, '../../data/workflows'),
      maxRetainedExecutions: config.maxRetainedExecutions || 100,
      checkpointInterval: config.checkpointInterval || 30000, // 30 seconds
      ...config
    };
    
    this.logger = new Logger('workflow-state-manager');
    this.activeCheckpoints = new Map(); // executionId -> checkpoint timer
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.config.dataDir, { recursive: true });
      this.logger.info(`Workflow state storage initialized at: ${this.config.dataDir}`);
    } catch (error) {
      this.logger.error('Failed to initialize workflow state storage:', error);
      throw error;
    }
  }

  /**
   * Save workflow execution state
   */
  async saveExecutionState(execution) {
    try {
      const stateData = {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        currentStepIndex: execution.currentStepIndex,
        currentStep: execution.currentStep,
        context: execution.context,
        results: execution.results,
        startedAt: execution.startedAt,
        lastCheckpointAt: new Date().toISOString(),
        completedAt: execution.completedAt,
        error: execution.error,
        retryCount: execution.retryCount,
        executionPath: execution.executionPath || [],
        fallbacksUsed: execution.fallbacksUsed || [],
        originalPlan: execution.originalPlan || null
      };

      const filePath = path.join(this.config.dataDir, `${execution.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(stateData, null, 2));
      
      this.logger.debug(`Saved execution state for ${execution.id}`);
      
      // Schedule next checkpoint if execution is still running
      if (execution.status === 'running') {
        this.scheduleCheckpoint(execution.id);
      }
      
    } catch (error) {
      this.logger.error(`Failed to save execution state for ${execution.id}:`, error);
      throw error;
    }
  }

  /**
   * Load workflow execution state
   */
  async loadExecutionState(executionId) {
    try {
      const filePath = path.join(this.config.dataDir, `${executionId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const state = JSON.parse(data);
      
      this.logger.debug(`Loaded execution state for ${executionId}`);
      return state;
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      this.logger.error(`Failed to load execution state for ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all incomplete workflow executions
   */
  async getIncompleteExecutions() {
    try {
      const files = await fs.readdir(this.config.dataDir);
      const incompleteExecutions = [];
      
      for (const file of files) {
        if (path.extname(file) === '.json') {
          try {
            const filePath = path.join(this.config.dataDir, file);
            const data = await fs.readFile(filePath, 'utf8');
            const state = JSON.parse(data);
            
            if (state.status === 'running' || state.status === 'paused') {
              incompleteExecutions.push(state);
            }
          } catch (error) {
            this.logger.warn(`Failed to read workflow state file ${file}:`, error);
          }
        }
      }
      
      // Sort by start time (oldest first)
      incompleteExecutions.sort((a, b) => 
        new Date(a.startedAt) - new Date(b.startedAt)
      );
      
      this.logger.info(`Found ${incompleteExecutions.length} incomplete workflow executions`);
      return incompleteExecutions;
      
    } catch (error) {
      this.logger.error('Failed to get incomplete executions:', error);
      throw error;
    }
  }

  /**
   * Mark execution as completed and archive it
   */
  async markExecutionCompleted(executionId, finalState) {
    try {
      const state = await this.loadExecutionState(executionId);
      if (!state) {
        this.logger.warn(`No state found for execution ${executionId}`);
        return;
      }

      // Update final state
      state.status = finalState.status || 'completed';
      state.completedAt = finalState.completedAt || new Date().toISOString();
      state.error = finalState.error || null;
      state.results = finalState.results || state.results;
      
      // Save updated state
      await this.saveExecutionState(state);
      
      // Clear checkpoint timer
      this.clearCheckpoint(executionId);
      
      this.logger.info(`Marked execution ${executionId} as ${state.status}`);
      
    } catch (error) {
      this.logger.error(`Failed to mark execution ${executionId} as completed:`, error);
      throw error;
    }
  }

  /**
   * Delete execution state (cleanup)
   */
  async deleteExecutionState(executionId) {
    try {
      const filePath = path.join(this.config.dataDir, `${executionId}.json`);
      await fs.unlink(filePath);
      this.clearCheckpoint(executionId);
      
      this.logger.debug(`Deleted execution state for ${executionId}`);
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete execution state for ${executionId}:`, error);
      }
    }
  }

  /**
   * Clean up old completed executions
   */
  async cleanupOldExecutions() {
    try {
      const files = await fs.readdir(this.config.dataDir);
      const executions = [];
      
      for (const file of files) {
        if (path.extname(file) === '.json') {
          try {
            const filePath = path.join(this.config.dataDir, file);
            const stats = await fs.stat(filePath);
            const data = await fs.readFile(filePath, 'utf8');
            const state = JSON.parse(data);
            
            executions.push({
              id: state.id,
              status: state.status,
              completedAt: state.completedAt,
              lastModified: stats.mtime,
              filePath
            });
          } catch (error) {
            this.logger.warn(`Failed to read execution file ${file}:`, error);
          }
        }
      }
      
      // Sort by completion time (newest first)
      const completedExecutions = executions
        .filter(exec => exec.status === 'completed' || exec.status === 'failed')
        .sort((a, b) => new Date(b.completedAt || b.lastModified) - new Date(a.completedAt || a.lastModified));
      
      // Keep only the most recent executions
      const toDelete = completedExecutions.slice(this.config.maxRetainedExecutions);
      
      for (const execution of toDelete) {
        await fs.unlink(execution.filePath);
        this.logger.debug(`Cleaned up old execution: ${execution.id}`);
      }
      
      if (toDelete.length > 0) {
        this.logger.info(`Cleaned up ${toDelete.length} old execution states`);
      }
      
    } catch (error) {
      this.logger.error('Failed to cleanup old executions:', error);
    }
  }

  /**
   * Record execution path step
   */
  async recordExecutionStep(executionId, step, metadata = {}) {
    try {
      const state = await this.loadExecutionState(executionId);
      if (!state) {
        this.logger.warn(`No state found for execution ${executionId}`);
        return;
      }

      if (!state.executionPath) {
        state.executionPath = [];
      }

      const stepRecord = {
        stepIndex: state.currentStepIndex,
        stepName: step.name,
        stepType: step.type,
        timestamp: new Date().toISOString(),
        success: metadata.success !== false,
        duration: metadata.duration || null,
        fallbackUsed: metadata.fallbackUsed || null,
        agentUsed: metadata.agentUsed || step.config?.agent || null,
        error: metadata.error || null
      };

      state.executionPath.push(stepRecord);
      await this.saveExecutionState(state);
      
    } catch (error) {
      this.logger.error(`Failed to record execution step for ${executionId}:`, error);
    }
  }

  /**
   * Record fallback usage
   */
  async recordFallbackUsage(executionId, originalPlan, fallbackMethod, reason) {
    try {
      const state = await this.loadExecutionState(executionId);
      if (!state) {
        this.logger.warn(`No state found for execution ${executionId}`);
        return;
      }

      if (!state.fallbacksUsed) {
        state.fallbacksUsed = [];
      }

      const fallbackRecord = {
        timestamp: new Date().toISOString(),
        originalPlan: originalPlan,
        fallbackMethod: fallbackMethod,
        reason: reason,
        stepIndex: state.currentStepIndex,
        stepName: state.currentStep?.name || 'unknown'
      };

      state.fallbacksUsed.push(fallbackRecord);
      await this.saveExecutionState(state);
      
      this.logger.info(`Recorded fallback usage for ${executionId}: ${originalPlan} -> ${fallbackMethod}`);
      
    } catch (error) {
      this.logger.error(`Failed to record fallback usage for ${executionId}:`, error);
    }
  }

  /**
   * Schedule periodic checkpoint
   */
  scheduleCheckpoint(executionId) {
    // Clear existing checkpoint timer
    this.clearCheckpoint(executionId);
    
    // Schedule new checkpoint
    const timer = setTimeout(async () => {
      try {
        const state = await this.loadExecutionState(executionId);
        if (state && state.status === 'running') {
          await this.saveExecutionState(state);
        }
      } catch (error) {
        this.logger.error(`Checkpoint failed for ${executionId}:`, error);
      }
    }, this.config.checkpointInterval);
    
    this.activeCheckpoints.set(executionId, timer);
  }

  /**
   * Clear checkpoint timer
   */
  clearCheckpoint(executionId) {
    const timer = this.activeCheckpoints.get(executionId);
    if (timer) {
      clearTimeout(timer);
      this.activeCheckpoints.delete(executionId);
    }
  }

  /**
   * Get workflow recovery suggestions
   */
  async getRecoverySuggestions(executionId) {
    try {
      const state = await this.loadExecutionState(executionId);
      if (!state) {
        return null;
      }

      const suggestions = {
        executionId: executionId,
        workflowId: state.workflowId,
        currentStatus: state.status,
        timeSinceLastCheckpoint: Date.now() - new Date(state.lastCheckpointAt || state.startedAt).getTime(),
        completionPercentage: this.calculateCompletionPercentage(state),
        suggestedActions: [],
        fallbacksAvailable: []
      };

      // Analyze execution path to suggest recovery actions
      if (state.status === 'running' && state.executionPath) {
        const lastStep = state.executionPath[state.executionPath.length - 1];
        if (lastStep && !lastStep.success) {
          suggestions.suggestedActions.push({
            action: 'retry-last-step',
            reason: 'Last step failed',
            stepName: lastStep.stepName
          });
        }
      }

      // Suggest fallbacks based on failed agents
      if (state.fallbacksUsed && state.fallbacksUsed.length > 0) {
        const failedAgents = new Set(state.fallbacksUsed.map(f => f.originalPlan));
        for (const agent of failedAgents) {
          suggestions.fallbacksAvailable.push({
            originalAgent: agent,
            fallbackMethods: this.getAvailableFallbacks(agent)
          });
        }
      }

      return suggestions;
      
    } catch (error) {
      this.logger.error(`Failed to get recovery suggestions for ${executionId}:`, error);
      return null;
    }
  }

  /**
   * Calculate completion percentage
   */
  calculateCompletionPercentage(state) {
    if (!state.workflow || !state.workflow.steps) {
      return 0;
    }
    
    const totalSteps = state.workflow.steps.length;
    const completedSteps = Math.min(state.currentStepIndex, totalSteps);
    
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Get available fallback methods for an agent
   */
  getAvailableFallbacks(agentType) {
    const fallbackMap = {
      'semantic-analysis': ['rule-based-analysis', 'template-matching', 'statistical-analysis'],
      'web-search': ['cached-results', 'local-documentation', 'manual-research'],
      'knowledge-graph': ['direct-ukb', 'file-based-storage', 'simple-json'],
      'documentation': ['template-generation', 'example-based', 'minimal-docs']
    };
    
    return fallbackMap[agentType] || ['manual-processing'];
  }

  /**
   * Start cleanup routine
   */
  startCleanupRoutine() {
    // Clean up old executions every hour
    setInterval(() => {
      this.cleanupOldExecutions().catch(error => {
        this.logger.error('Cleanup routine failed:', error);
      });
    }, 3600000); // 1 hour
    
    this.logger.info('Workflow state cleanup routine started');
  }

  /**
   * Stop all checkpoint timers
   */
  stop() {
    for (const [executionId, timer] of this.activeCheckpoints) {
      clearTimeout(timer);
    }
    this.activeCheckpoints.clear();
    this.logger.info('Workflow state manager stopped');
  }
}