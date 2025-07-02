/**
 * TaskDetector
 * Identifies incomplete work from previous sessions and determines recovery actions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../shared/logger.js';
import { WorkflowStateManager } from '../persistence/workflow-state-manager.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TaskDetector {
  constructor(config = {}) {
    this.config = {
      conversationHistoryPath: config.conversationHistoryPath || '/Users/q284340/Agentic/coding/.specstory/history',
      knowledgeBasePath: config.knowledgeBasePath || '/Users/q284340/Agentic/coding/shared-memory-coding.json',
      lookbackDays: config.lookbackDays || 7,
      minSignificance: config.minSignificance || 6,
      semanticAnalysisKeywords: [
        'semantic analysis', 'analyze repository', 'determine insights',
        'code analysis', 'pattern analysis', 'system analysis'
      ],
      ...config
    };
    
    this.logger = new Logger('task-detector');
    this.workflowStateManager = new WorkflowStateManager();
    this.detectedTasks = new Map();
    this.lastScanTime = null;
  }

  /**
   * Scan for incomplete tasks from all sources
   */
  async scanForIncompleteTasks() {
    try {
      this.logger.info('Scanning for incomplete tasks from previous sessions...');
      
      const tasks = new Map();
      
      // 1. Check for incomplete workflow executions
      const incompleteWorkflows = await this.detectIncompleteWorkflows();
      for (const workflow of incompleteWorkflows) {
        tasks.set(`workflow_${workflow.id}`, {
          type: 'incomplete_workflow',
          source: 'workflow_state',
          data: workflow,
          priority: this.calculateWorkflowPriority(workflow),
          detectedAt: new Date().toISOString()
        });
      }
      
      // 2. Check conversation history for incomplete requests
      const incompleteConversations = await this.detectIncompleteConversations();
      for (const conversation of incompleteConversations) {
        tasks.set(`conversation_${conversation.id}`, {
          type: 'incomplete_conversation',
          source: 'conversation_history',
          data: conversation,
          priority: this.calculateConversationPriority(conversation),
          detectedAt: new Date().toISOString()
        });
      }
      
      // 3. Check knowledge base for missing insights
      const missingInsights = await this.detectMissingInsights();
      for (const insight of missingInsights) {
        tasks.set(`insight_${insight.id}`, {
          type: 'missing_insight',
          source: 'knowledge_base',
          data: insight,
          priority: this.calculateInsightPriority(insight),
          detectedAt: new Date().toISOString()
        });
      }
      
      // 4. Check for partial analysis results
      const partialAnalyses = await this.detectPartialAnalyses();
      for (const analysis of partialAnalyses) {
        tasks.set(`analysis_${analysis.id}`, {
          type: 'partial_analysis',
          source: 'analysis_results',
          data: analysis,
          priority: this.calculateAnalysisPriority(analysis),
          detectedAt: new Date().toISOString()
        });
      }
      
      this.detectedTasks = tasks;
      this.lastScanTime = new Date().toISOString();
      
      this.logger.info(`Detected ${tasks.size} incomplete tasks`);
      
      // Log summary by type
      const tasksByType = this.groupTasksByType(tasks);
      for (const [type, count] of Object.entries(tasksByType)) {
        this.logger.info(`  ${type}: ${count} tasks`);
      }
      
      return Array.from(tasks.values()).sort((a, b) => b.priority - a.priority);
      
    } catch (error) {
      this.logger.error('Failed to scan for incomplete tasks:', error);
      throw error;
    }
  }

  /**
   * Detect incomplete workflow executions
   */
  async detectIncompleteWorkflows() {
    try {
      const incompleteExecutions = await this.workflowStateManager.getIncompleteExecutions();
      
      return incompleteExecutions.map(execution => ({
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        currentStep: execution.currentStep,
        progress: this.calculateWorkflowProgress(execution),
        timeSinceLastActivity: Date.now() - new Date(execution.lastCheckpointAt || execution.startedAt).getTime(),
        context: execution.context,
        fallbacksUsed: execution.fallbacksUsed || [],
        originalPlan: execution.originalPlan,
        recovery: this.suggestWorkflowRecovery(execution)
      }));
      
    } catch (error) {
      this.logger.error('Failed to detect incomplete workflows:', error);
      return [];
    }
  }

  /**
   * Detect incomplete conversations from history
   */
  async detectIncompleteConversations() {
    try {
      if (!await this.fileExists(this.config.conversationHistoryPath)) {
        this.logger.warn(`Conversation history path not found: ${this.config.conversationHistoryPath}`);
        return [];
      }
      
      const files = await fs.readdir(this.config.conversationHistoryPath);
      const recentFiles = files
        .filter(f => f.endsWith('.md'))
        .filter(f => this.isFileRecent(f, this.config.lookbackDays))
        .sort()
        .reverse()
        .slice(0, 10); // Check last 10 files
      
      const incompleteConversations = [];
      
      for (const file of recentFiles) {
        try {
          const filePath = path.join(this.config.conversationHistoryPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          const analysis = this.analyzeConversationCompletion(content, file);
          if (analysis.isIncomplete) {
            incompleteConversations.push({
              id: this.extractFileId(file),
              filename: file,
              filePath,
              content: content.substring(0, 1000), // Sample for analysis
              analysis,
              detectedIncompleteRequests: analysis.incompleteRequests,
              lastActivity: this.extractLastActivityTime(content),
              suggestedActions: this.suggestConversationRecovery(analysis)
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to analyze conversation file ${file}:`, error);
        }
      }
      
      return incompleteConversations;
      
    } catch (error) {
      this.logger.error('Failed to detect incomplete conversations:', error);
      return [];
    }
  }

  /**
   * Detect missing insights from knowledge base
   */
  async detectMissingInsights() {
    try {
      if (!await this.fileExists(this.config.knowledgeBasePath)) {
        this.logger.warn(`Knowledge base not found: ${this.config.knowledgeBasePath}`);
        return [];
      }
      
      const kbContent = await fs.readFile(this.config.knowledgeBasePath, 'utf8');
      const knowledgeBase = JSON.parse(kbContent);
      
      const missingInsights = [];
      
      // Check for entities that should have insights but don't
      if (knowledgeBase.entities) {
        for (const entity of knowledgeBase.entities) {
          if (this.shouldHaveInsights(entity) && !this.hasAdequateInsights(entity)) {
            missingInsights.push({
              id: `missing_insight_${entity.name}`,
              entityName: entity.name,
              entityType: entity.entityType,
              currentObservations: entity.observations?.length || 0,
              expectedObservations: this.getExpectedObservationCount(entity),
              lastUpdated: entity.lastUpdated || 'unknown',
              suggestedActions: this.suggestInsightActions(entity)
            });
          }
        }
      }
      
      return missingInsights;
      
    } catch (error) {
      this.logger.error('Failed to detect missing insights:', error);
      return [];
    }
  }

  /**
   * Detect partial analysis results
   */
  async detectPartialAnalyses() {
    try {
      const partialAnalyses = [];
      
      // Check analysis results directory if it exists
      const analysisDir = path.join(__dirname, '../../docs/insights');
      if (await this.fileExists(analysisDir)) {
        const files = await fs.readdir(analysisDir);
        
        for (const file of files) {
          if (file.endsWith('.json') || file.endsWith('.md')) {
            try {
              const filePath = path.join(analysisDir, file);
              const stats = await fs.stat(filePath);
              
              if (this.isFileRecent(file, this.config.lookbackDays)) {
                const content = await fs.readFile(filePath, 'utf8');
                const analysis = this.analyzeResultCompleteness(content, file);
                
                if (analysis.isPartial) {
                  partialAnalyses.push({
                    id: `partial_${this.extractFileId(file)}`,
                    filename: file,
                    filePath,
                    lastModified: stats.mtime.toISOString(),
                    analysis,
                    completionPercentage: analysis.completionPercentage,
                    missingComponents: analysis.missingComponents,
                    suggestedActions: this.suggestAnalysisCompletion(analysis)
                  });
                }
              }
            } catch (error) {
              this.logger.warn(`Failed to analyze result file ${file}:`, error);
            }
          }
        }
      }
      
      return partialAnalyses;
      
    } catch (error) {
      this.logger.error('Failed to detect partial analyses:', error);
      return [];
    }
  }

  /**
   * Analyze conversation for completion status
   */
  analyzeConversationCompletion(content, filename) {
    const analysis = {
      isIncomplete: false,
      incompleteRequests: [],
      lastUserRequest: null,
      lastAssistantResponse: null,
      hasErrorsOrInterruptions: false,
      hasSemanticAnalysisRequest: false,
      completionIndicators: []
    };
    
    // Look for semantic analysis keywords
    const hasSemanticKeywords = this.config.semanticAnalysisKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    analysis.hasSemanticAnalysisRequest = hasSemanticKeywords;
    
    // Look for incomplete patterns
    const incompletePatterns = [
      /interrupted by user/i,
      /request interrupted/i,
      /API Error/i,
      /timeout/i,
      /failed to/i,
      /error occurred/i
    ];
    
    analysis.hasErrorsOrInterruptions = incompletePatterns.some(pattern => 
      pattern.test(content)
    );
    
    // Look for completion indicators
    const completionPatterns = [
      /analysis completed/i,
      /task completed/i,
      /successfully generated/i,
      /results saved/i,
      /workflow completed/i
    ];
    
    const hasCompletionIndicators = completionPatterns.some(pattern => 
      pattern.test(content)
    );
    
    // Extract last exchanges
    const exchanges = this.extractExchanges(content);
    if (exchanges.length > 0) {
      const lastExchange = exchanges[exchanges.length - 1];
      analysis.lastUserRequest = lastExchange.user;
      analysis.lastAssistantResponse = lastExchange.assistant;
    }
    
    // Determine if incomplete
    analysis.isIncomplete = (
      analysis.hasSemanticAnalysisRequest && 
      (analysis.hasErrorsOrInterruptions || !hasCompletionIndicators)
    );
    
    if (analysis.isIncomplete) {
      analysis.incompleteRequests = this.extractIncompleteRequests(content);
    }
    
    return analysis;
  }

  /**
   * Analyze result completeness
   */
  analyzeResultCompleteness(content, filename) {
    const analysis = {
      isPartial: false,
      completionPercentage: 0,
      missingComponents: [],
      hasErrors: false,
      expectedComponents: [
        'analysis_summary',
        'key_findings',
        'insights',
        'recommendations',
        'patterns_identified'
      ]
    };
    
    // Check for expected components
    let foundComponents = 0;
    for (const component of analysis.expectedComponents) {
      const patterns = [
        new RegExp(component.replace('_', '\\s*'), 'i'),
        new RegExp(component.replace('_', '[-_\\s]*'), 'i')
      ];
      
      if (patterns.some(pattern => pattern.test(content))) {
        foundComponents++;
      } else {
        analysis.missingComponents.push(component);
      }
    }
    
    analysis.completionPercentage = Math.round((foundComponents / analysis.expectedComponents.length) * 100);
    analysis.isPartial = analysis.completionPercentage < 80;
    
    // Check for error indicators
    const errorPatterns = [/error/i, /failed/i, /incomplete/i, /partial/i];
    analysis.hasErrors = errorPatterns.some(pattern => pattern.test(content));
    
    return analysis;
  }

  /**
   * Calculate priority scores
   */
  calculateWorkflowPriority(workflow) {
    let priority = 50; // Base priority
    
    // Age factor (newer = higher priority)
    const ageHours = (Date.now() - new Date(workflow.startedAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) priority += 30;
    else if (ageHours < 24) priority += 20;
    else if (ageHours < 168) priority += 10; // 1 week
    
    // Progress factor (more complete = higher priority to finish)
    priority += workflow.progress * 0.3;
    
    // Fallback usage (more fallbacks = higher priority)
    priority += (workflow.fallbacksUsed?.length || 0) * 5;
    
    return Math.min(100, Math.max(0, priority));
  }

  calculateConversationPriority(conversation) {
    let priority = 40; // Base priority
    
    // Semantic analysis requests get higher priority
    if (conversation.analysis.hasSemanticAnalysisRequest) priority += 30;
    
    // Errors/interruptions increase priority
    if (conversation.analysis.hasErrorsOrInterruptions) priority += 20;
    
    // Recent activity increases priority
    if (conversation.lastActivity) {
      const ageHours = (Date.now() - new Date(conversation.lastActivity).getTime()) / (1000 * 60 * 60);
      if (ageHours < 24) priority += 15;
    }
    
    return Math.min(100, Math.max(0, priority));
  }

  calculateInsightPriority(insight) {
    let priority = 30; // Base priority
    
    // Entity type importance
    const importantTypes = ['WorkflowPattern', 'SystemArchitecturePattern', 'TransferablePattern'];
    if (importantTypes.includes(insight.entityType)) priority += 20;
    
    // Observation gap
    const gap = insight.expectedObservations - insight.currentObservations;
    priority += gap * 5;
    
    return Math.min(100, Math.max(0, priority));
  }

  calculateAnalysisPriority(analysis) {
    let priority = 35; // Base priority
    
    // Completion percentage (higher completion = higher priority to finish)
    priority += (100 - analysis.completionPercentage) * 0.2;
    
    // Recent modification increases priority
    if (analysis.lastModified) {
      const ageHours = (Date.now() - new Date(analysis.lastModified).getTime()) / (1000 * 60 * 60);
      if (ageHours < 24) priority += 15;
    }
    
    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Recovery suggestion methods
   */
  suggestWorkflowRecovery(execution) {
    const suggestions = [];
    
    if (execution.status === 'running' && execution.timeSinceLastActivity > 300000) { // 5 minutes
      suggestions.push({
        action: 'resume_from_checkpoint',
        reason: 'Workflow appears stalled',
        confidence: 85
      });
    }
    
    if (execution.fallbacksUsed && execution.fallbacksUsed.length > 0) {
      suggestions.push({
        action: 'retry_with_original_agents',
        reason: 'Previous run used fallbacks',
        confidence: 70
      });
    }
    
    suggestions.push({
      action: 'continue_from_current_step',
      reason: 'Resume normal execution',
      confidence: 90
    });
    
    return suggestions;
  }

  suggestConversationRecovery(analysis) {
    const suggestions = [];
    
    if (analysis.hasSemanticAnalysisRequest && analysis.hasErrorsOrInterruptions) {
      suggestions.push({
        action: 'restart_semantic_analysis',
        reason: 'Previous analysis was interrupted',
        confidence: 95
      });
    }
    
    if (analysis.incompleteRequests.length > 0) {
      suggestions.push({
        action: 'complete_pending_requests',
        reason: `${analysis.incompleteRequests.length} incomplete requests found`,
        confidence: 90
      });
    }
    
    return suggestions;
  }

  /**
   * Utility methods
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  isFileRecent(filename, days) {
    // Extract date from filename patterns like "2025-07-02_..."
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) return true; // If no date found, include it
    
    const fileDate = new Date(dateMatch[1]);
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    return fileDate >= cutoffDate;
  }

  extractFileId(filename) {
    return filename.replace(/\.(md|json)$/, '');
  }

  extractExchanges(content) {
    // Simple extraction - could be made more sophisticated
    const exchanges = [];
    const userPattern = /\*\*User:\*\*/g;
    const assistantPattern = /\*\*Assistant:\*\*/g;
    
    // This is a simplified version - would need proper markdown parsing
    return exchanges;
  }

  extractIncompleteRequests(content) {
    const requests = [];
    // Look for patterns indicating incomplete requests
    const patterns = [
      /complete.*semantic analysis/i,
      /analyze.*repository/i,
      /determine insights/i
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        requests.push(matches[0]);
      }
    }
    
    return requests;
  }

  shouldHaveInsights(entity) {
    const insightfulTypes = [
      'WorkflowPattern', 'SystemArchitecturePattern', 'TransferablePattern',
      'TechnicalPattern', 'ProcessPattern'
    ];
    return insightfulTypes.includes(entity.entityType);
  }

  hasAdequateInsights(entity) {
    const minObservations = this.getExpectedObservationCount(entity);
    return (entity.observations?.length || 0) >= minObservations;
  }

  getExpectedObservationCount(entity) {
    const expectations = {
      'WorkflowPattern': 3,
      'SystemArchitecturePattern': 4,
      'TransferablePattern': 3,
      'TechnicalPattern': 2,
      'ProcessPattern': 2
    };
    return expectations[entity.entityType] || 2;
  }

  calculateWorkflowProgress(execution) {
    if (!execution.workflow?.steps) return 0;
    return Math.round((execution.currentStepIndex / execution.workflow.steps.length) * 100);
  }

  groupTasksByType(tasks) {
    const grouped = {};
    for (const task of tasks.values()) {
      grouped[task.type] = (grouped[task.type] || 0) + 1;
    }
    return grouped;
  }

  extractLastActivityTime(content) {
    // Extract timestamp from content - simplified
    const timePattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/;
    const match = content.match(timePattern);
    return match ? match[1] : null;
  }

  suggestInsightActions(entity) {
    return [
      {
        action: 'analyze_entity_context',
        reason: 'Entity needs more detailed observations',
        confidence: 80
      }
    ];
  }

  suggestAnalysisCompletion(analysis) {
    return analysis.missingComponents.map(component => ({
      action: `complete_${component}`,
      reason: `Missing ${component.replace('_', ' ')}`,
      confidence: 75
    }));
  }

  /**
   * Get prioritized recovery plan
   */
  getRecoveryPlan() {
    const tasks = Array.from(this.detectedTasks.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // Top 10 priorities
    
    return {
      totalTasksDetected: this.detectedTasks.size,
      highPriorityTasks: tasks.filter(t => t.priority >= 70).length,
      recommendedActions: tasks.map(task => ({
        taskId: task.type + '_' + (task.data.id || 'unknown'),
        type: task.type,
        priority: task.priority,
        suggestedAction: task.data.suggestedActions?.[0] || task.data.recovery?.[0],
        estimatedEffort: this.estimateEffort(task),
        dependsOn: this.findDependencies(task)
      })),
      lastScanTime: this.lastScanTime
    };
  }

  estimateEffort(task) {
    const effortMap = {
      'incomplete_workflow': 'medium',
      'incomplete_conversation': 'high',
      'missing_insight': 'low',
      'partial_analysis': 'medium'
    };
    return effortMap[task.type] || 'unknown';
  }

  findDependencies(task) {
    // Simple dependency detection - could be enhanced
    const dependencies = [];
    
    if (task.type === 'incomplete_conversation' && task.data.analysis.hasSemanticAnalysisRequest) {
      dependencies.push('system_availability');
    }
    
    return dependencies;
  }
}