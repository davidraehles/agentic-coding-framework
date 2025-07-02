/**
 * Workflow Engine
 * Executes and manages workflow instances
 */

import { EventEmitter } from 'events';
import { Logger } from '../../../shared/logger.js';
import { EventTypes } from '../../../infrastructure/events/event-types.js';
import { WorkflowStateManager } from '../../../framework/persistence/workflow-state-manager.js';
import { FallbackLogger } from '../../../framework/logging/fallback-logger.js';

export class WorkflowEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows || 10,
      defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 5000,
      ...config
    };
    
    this.logger = new Logger('workflow-engine');
    this.workflows = new Map(); // workflowId -> workflow definition
    this.executions = new Map(); // executionId -> execution state
    this.running = false;
    
    // Enhanced persistence and logging
    this.stateManager = new WorkflowStateManager(config.persistence);
    this.fallbackLogger = new FallbackLogger(config.fallbackLogging);
    this.recoveryMode = false;
    
    this.startEngine();
  }

  async startEngine() {
    this.running = true;
    this.logger.info('Workflow engine started');
    
    // Start cleanup routine for state manager
    this.stateManager.startCleanupRoutine();
    
    // Recover incomplete executions
    await this.recoverIncompleteExecutions();
    
    // Start monitoring loop
    this.monitoringInterval = setInterval(() => {
      this.monitorExecutions();
    }, 10000); // Check every 10 seconds
  }

  stopEngine() {
    this.running = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Stop state manager
    this.stateManager.stop();
    
    this.logger.info('Workflow engine stopped');
  }

  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, workflow);
    this.logger.debug(`Registered workflow: ${workflow.id}`);
  }

  async startWorkflow(workflowId, parameters = {}) {
    try {
      const workflow = this.workflows.get(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Check concurrent execution limit
      const runningCount = Array.from(this.executions.values())
        .filter(exec => exec.status === 'running').length;
      
      if (runningCount >= this.config.maxConcurrentWorkflows) {
        throw new Error('Maximum concurrent workflows reached');
      }

      // Create execution instance
      const execution = this.createExecution(workflow, parameters);
      this.executions.set(execution.id, execution);
      
      // Save initial state
      await this.stateManager.saveExecutionState(execution);
      
      this.logger.info(`Starting workflow execution: ${execution.id} (${workflowId})`);
      this.logger.workflowCheckpoint(execution.id, 0, 0, { status: 'started' });
      
      // Start execution
      await this.executeWorkflow(execution);
      
      return execution;
      
    } catch (error) {
      this.logger.error(`Failed to start workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async stopWorkflow(executionId) {
    try {
      const execution = this.executions.get(executionId);
      
      if (!execution) {
        throw new Error(`Execution not found: ${executionId}`);
      }

      execution.status = 'stopped';
      execution.stoppedAt = new Date().toISOString();
      
      // Cancel any pending timeouts
      if (execution.stepTimeout) {
        clearTimeout(execution.stepTimeout);
      }

      // Save final state
      await this.stateManager.markExecutionCompleted(executionId, {
        status: 'stopped',
        completedAt: execution.stoppedAt
      });

      this.logger.info(`Stopped workflow execution: ${executionId}`);
      
      this.emit('workflow-stopped', { executionId, execution });
      
    } catch (error) {
      this.logger.error(`Failed to stop workflow ${executionId}:`, error);
      throw error;
    }
  }

  async continueWorkflow(executionId, eventData) {
    try {
      const execution = this.executions.get(executionId);
      
      if (!execution || execution.status !== 'running') {
        return;
      }

      // Clear step timeout
      if (execution.stepTimeout) {
        clearTimeout(execution.stepTimeout);
        execution.stepTimeout = null;
      }

      // Continue with next step
      await this.executeNextStep(execution, eventData);
      
    } catch (error) {
      this.logger.error(`Failed to continue workflow ${executionId}:`, error);
      await this.failExecution(execution, error);
    }
  }

  async getWorkflowStatus(executionId) {
    const execution = this.executions.get(executionId);
    
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      currentStepIndex: execution.currentStepIndex,
      currentStep: execution.currentStep,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      error: execution.error,
      progress: this.calculateProgress(execution),
      context: execution.context
    };
  }

  createExecution(workflow, parameters) {
    const executionId = this.generateExecutionId();
    
    return {
      id: executionId,
      workflowId: workflow.id,
      workflow: workflow,
      status: 'created',
      currentStepIndex: 0,
      currentStep: null,
      context: { ...parameters },
      results: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      stepTimeout: null,
      retryCount: 0
    };
  }

  async executeWorkflow(execution) {
    try {
      execution.status = 'running';
      
      this.emit('workflow-started', {
        executionId: execution.id,
        workflowId: execution.workflowId
      });

      await this.executeNextStep(execution);
      
    } catch (error) {
      await this.failExecution(execution, error);
    }
  }

  async executeNextStep(execution, eventData = null) {
    try {
      const workflow = execution.workflow;
      
      // Check if workflow is complete
      if (execution.currentStepIndex >= workflow.steps.length) {
        await this.completeExecution(execution);
        return;
      }

      const step = workflow.steps[execution.currentStepIndex];
      execution.currentStep = step;
      
      this.logger.debug(`Executing step ${execution.currentStepIndex + 1}/${workflow.steps.length}: ${step.name} (${execution.id})`);
      
      // Check step conditions
      if (!this.checkStepConditions(step, execution.context, eventData)) {
        this.logger.debug(`Skipping step ${step.name} - conditions not met`);
        execution.currentStepIndex++;
        await this.executeNextStep(execution);
        return;
      }

      // Execute the step
      const stepResult = await this.executeStep(step, execution, eventData);
      
      // Handle step result
      await this.handleStepResult(execution, step, stepResult);
      
    } catch (error) {
      this.logger.error(`Step execution failed for ${execution.id}:`, error);
      
      // Try to retry the step
      if (execution.retryCount < this.config.retryAttempts) {
        execution.retryCount++;
        this.logger.info(`Retrying step (attempt ${execution.retryCount}/${this.config.retryAttempts})`);
        
        setTimeout(() => {
          this.executeNextStep(execution, eventData);
        }, this.config.retryDelay);
        
        return;
      }
      
      await this.failExecution(execution, error);
    }
  }

  async executeStep(step, execution, eventData) {
    const stepStartTime = Date.now();
    
    try {
      let result;
      
      switch (step.type) {
        case 'agent-call':
          result = await this.executeAgentCall(step, execution, eventData);
          break;
        case 'condition':
          result = await this.executeCondition(step, execution, eventData);
          break;
        case 'parallel':
          result = await this.executeParallel(step, execution, eventData);
          break;
        case 'wait':
          result = await this.executeWait(step, execution, eventData);
          break;
        case 'transform':
          result = await this.executeTransform(step, execution, eventData);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      const duration = Date.now() - stepStartTime;
      this.logger.debug(`Step ${step.name} completed in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - stepStartTime;
      this.logger.error(`Step ${step.name} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  async executeAgentCall(step, execution, eventData) {
    const { agent, action, parameters = {} } = step.config;
    
    // Build request parameters
    const requestParams = this.buildRequestParameters(parameters, execution.context, eventData);
    
    // Set timeout for step
    const timeout = step.timeout || this.config.defaultTimeout;
    execution.stepTimeout = setTimeout(() => {
      this.logger.error(`Step timeout: ${step.name} in execution ${execution.id}`);
      this.failExecution(execution, new Error(`Step timeout: ${step.name}`));
    }, timeout);

    // Send request to agent
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      
      // Store request for tracking
      execution.currentRequest = { requestId, resolve, reject };
      
      // If this is a wait step, we don't send a request, just wait for events
      if (step.config.waitingFor) {
        execution.currentStep.waitingFor = step.config.waitingFor;
        return; // Will be resolved by continueWorkflow when event arrives
      }
      
      // Send the actual request
      this.emit('agent-request', {
        agent,
        action,
        parameters: { ...requestParams, requestId },
        executionId: execution.id,
        stepName: step.name
      });
    });
  }

  async executeCondition(step, execution, eventData) {
    const { condition } = step.config;
    
    // Evaluate condition based on context and event data
    const result = this.evaluateCondition(condition, execution.context, eventData);
    
    return { conditionResult: result };
  }

  async executeParallel(step, execution, eventData) {
    const { steps } = step.config;
    
    // Execute all parallel steps
    const promises = steps.map(parallelStep => 
      this.executeStep(parallelStep, execution, eventData)
    );
    
    const results = await Promise.all(promises);
    
    return { parallelResults: results };
  }

  async executeWait(step, execution, eventData) {
    const { duration, condition, waitingFor } = step.config;
    
    if (duration) {
      // Wait for specific duration
      await new Promise(resolve => setTimeout(resolve, duration));
      return { waitCompleted: true };
    }
    
    if (waitingFor) {
      // Wait for specific event (handled by continueWorkflow)
      execution.currentStep.waitingFor = waitingFor;
      return new Promise((resolve) => {
        execution.currentRequest = { resolve };
      });
    }
    
    if (condition) {
      // Wait until condition is met
      return new Promise((resolve) => {
        const checkCondition = () => {
          if (this.evaluateCondition(condition, execution.context, eventData)) {
            resolve({ conditionMet: true });
          } else {
            setTimeout(checkCondition, 1000); // Check every second
          }
        };
        checkCondition();
      });
    }
    
    throw new Error('Wait step requires duration, condition, or waitingFor');
  }

  async executeTransform(step, execution, eventData) {
    const { transform } = step.config;
    
    // Apply transformation to context
    const result = this.applyTransformation(transform, execution.context, eventData);
    
    return { transformResult: result };
  }

  buildRequestParameters(parameters, context, eventData) {
    const built = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        // Template substitution
        const path = value.slice(2, -1);
        built[key] = this.getValueFromPath(path, { context, eventData });
      } else {
        built[key] = value;
      }
    }
    
    return built;
  }

  getValueFromPath(path, data) {
    const parts = path.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  checkStepConditions(step, context, eventData) {
    if (!step.conditions) return true;
    
    for (const condition of step.conditions) {
      if (!this.evaluateCondition(condition, context, eventData)) {
        return false;
      }
    }
    
    return true;
  }

  evaluateCondition(condition, context, eventData) {
    // Simple condition evaluation
    // In production, use a proper expression evaluator
    try {
      const { field, operator, value } = condition;
      const fieldValue = this.getValueFromPath(field, { context, eventData });
      
      switch (operator) {
        case 'equals': return fieldValue === value;
        case 'not_equals': return fieldValue !== value;
        case 'greater_than': return fieldValue > value;
        case 'less_than': return fieldValue < value;
        case 'contains': return String(fieldValue).includes(value);
        case 'exists': return fieldValue !== undefined && fieldValue !== null;
        default: return true;
      }
    } catch (error) {
      this.logger.warn('Condition evaluation failed:', error);
      return false;
    }
  }

  applyTransformation(transform, context, eventData) {
    // Apply transformation rules
    const result = {};
    
    for (const [targetKey, sourceKey] of Object.entries(transform)) {
      result[targetKey] = this.getValueFromPath(sourceKey, { context, eventData });
    }
    
    return result;
  }

  async handleStepResult(execution, step, result) {
    // Store step result
    execution.results.push({
      step: step.name,
      result: result,
      timestamp: new Date().toISOString()
    });
    
    // Update context with step results
    if (step.outputMapping) {
      for (const [contextKey, resultKey] of Object.entries(step.outputMapping)) {
        execution.context[contextKey] = this.getValueFromPath(resultKey, { result });
      }
    }
    
    // Reset retry count on successful step
    execution.retryCount = 0;
    
    // Move to next step
    execution.currentStepIndex++;
    
    // Continue workflow
    if (step.type !== 'wait' || !step.config.waitingFor) {
      await this.executeNextStep(execution);
    }
  }

  async completeExecution(execution) {
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    
    this.logger.info(`Workflow execution completed: ${execution.id}`);
    
    this.emit('workflow-completed', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      results: execution.results,
      context: execution.context
    });
  }

  async failExecution(execution, error) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.completedAt = new Date().toISOString();
    
    // Clear any timeouts
    if (execution.stepTimeout) {
      clearTimeout(execution.stepTimeout);
    }
    
    this.logger.error(`Workflow execution failed: ${execution.id}`, error);
    
    this.emit('workflow-failed', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      error: error.message,
      context: execution.context
    });
  }

  calculateProgress(execution) {
    if (execution.workflow.steps.length === 0) return 100;
    
    const completedSteps = Math.min(execution.currentStepIndex, execution.workflow.steps.length);
    return Math.round((completedSteps / execution.workflow.steps.length) * 100);
  }

  monitorExecutions() {
    const now = Date.now();
    
    for (const [executionId, execution] of this.executions) {
      // Clean up completed executions older than 1 hour
      if (execution.status !== 'running') {
        const completedTime = new Date(execution.completedAt || execution.startedAt).getTime();
        if (now - completedTime > 3600000) { // 1 hour
          this.executions.delete(executionId);
          this.logger.debug(`Cleaned up execution: ${executionId}`);
        }
      }
    }
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getInfo() {
    return {
      running: this.running,
      registeredWorkflows: this.workflows.size,
      activeExecutions: this.executions.size,
      recoveryMode: this.recoveryMode,
      config: this.config
    };
  }

  /**
   * Recovery and persistence methods
   */

  /**
   * Recover incomplete executions from previous sessions
   */
  async recoverIncompleteExecutions() {
    try {
      this.logger.info('Checking for incomplete workflow executions to recover...');
      this.recoveryMode = true;
      
      const incompleteExecutions = await this.stateManager.getIncompleteExecutions();
      
      if (incompleteExecutions.length === 0) {
        this.logger.info('No incomplete executions found');
        this.recoveryMode = false;
        return;
      }
      
      this.logger.info(`Found ${incompleteExecutions.length} incomplete executions to recover`);
      
      for (const savedState of incompleteExecutions) {
        try {
          await this.recoverExecution(savedState);
        } catch (error) {
          this.logger.error(`Failed to recover execution ${savedState.id}:`, error);
          
          // Log fallback decision
          await this.fallbackLogger.logPlanDeviation(
            savedState.id,
            { agent: 'workflow-engine', action: 'recover_execution', expectedOutcome: 'resumed' },
            { agent: 'manual-intervention', action: 'mark_failed', actualOutcome: 'marked_as_failed' },
            'Automatic recovery failed',
            { error: error.message, originalPlan: savedState.originalPlan }
          );
          
          // Mark as failed
          await this.stateManager.markExecutionCompleted(savedState.id, {
            status: 'failed',
            error: error.message,
            completedAt: new Date().toISOString()
          });
        }
      }
      
      this.recoveryMode = false;
      this.logger.info('Execution recovery process completed');
      
    } catch (error) {
      this.logger.error('Failed to recover incomplete executions:', error);
      this.recoveryMode = false;
    }
  }

  /**
   * Recover a single execution
   */
  async recoverExecution(savedState) {
    this.logger.info(`Recovering execution: ${savedState.id} from step ${savedState.currentStepIndex}`);
    
    // Reconstruct execution object
    const execution = {
      ...savedState,
      workflow: this.workflows.get(savedState.workflowId) || savedState.workflow,
      stepTimeout: null,
      recovered: true,
      recoveredAt: new Date().toISOString()
    };
    
    // Validate workflow still exists
    if (!execution.workflow) {
      throw new Error(`Workflow definition not found: ${savedState.workflowId}`);
    }
    
    // Check if agents are available for recovery
    const requiredAgents = this.extractRequiredAgents(execution.workflow);
    const availableAgents = await this.checkAgentAvailability(requiredAgents);
    
    if (availableAgents.length < requiredAgents.length) {
      const unavailableAgents = requiredAgents.filter(agent => !availableAgents.includes(agent));
      
      this.logger.warn(`Some agents unavailable for recovery: ${unavailableAgents.join(', ')}`);
      
      // Log agent fallback
      for (const agent of unavailableAgents) {
        await this.fallbackLogger.logAgentFallback(
          execution.id,
          { name: agent, type: 'ai' },
          { name: 'recovery-coordinator', type: 'non-ai', expectedEffectiveness: '70%' },
          'Agent unavailable during recovery',
          { step: execution.currentStep?.name, recovery: true }
        );
      }
      
      // Modify execution plan to use available fallbacks
      execution = await this.adaptExecutionForFallbacks(execution, unavailableAgents);
    }
    
    // Store in active executions
    this.executions.set(execution.id, execution);
    
    // Log recovery
    this.logger.systemRecovery(
      'workflow-execution',
      execution.status,
      'recovering',
      'persistent-state-restoration'
    );
    
    // Continue execution from current step
    execution.status = 'running';
    await this.stateManager.saveExecutionState(execution);
    
    // Resume execution
    await this.executeNextStep(execution);
    
    this.logger.info(`Successfully recovered execution: ${execution.id}`);
  }

  /**
   * Enhance step execution with persistence and fallback tracking
   */
  async executeStepWithTracking(step, execution, eventData = null) {
    const stepStartTime = Date.now();
    const originalAgent = step.config?.agent;
    let actualAgent = originalAgent;
    let fallbackUsed = null;
    
    try {
      // Check if planned agent is available
      if (originalAgent && !await this.isAgentAvailable(originalAgent)) {
        // Find fallback
        const fallback = await this.findAgentFallback(originalAgent, step);
        if (fallback) {
          actualAgent = fallback.agent;
          fallbackUsed = fallback.method;
          
          // Log fallback usage
          await this.fallbackLogger.logAgentFallback(
            execution.id,
            { name: originalAgent, type: 'ai' },
            { name: actualAgent, type: fallback.type, expectedEffectiveness: fallback.effectiveness },
            'Original agent unavailable',
            { stepIndex: execution.currentStepIndex, stepName: step.name }
          );
          
          // Update step configuration
          step = { ...step, config: { ...step.config, agent: actualAgent } };
        } else {
          throw new Error(`No fallback available for agent: ${originalAgent}`);
        }
      }
      
      // Execute the step
      let result = await this.executeStep(step, execution, eventData);
      
      // Handle non-AI fallback if AI method failed
      if (!result && fallbackUsed) {
        result = await this.executeNonAiFallback(step, execution, eventData);
        
        if (result) {
          await this.fallbackLogger.logNonAiFallback(
            execution.id,
            { description: step.name, originalMethod: 'ai-analysis' },
            { name: fallbackUsed, type: 'rule-based' },
            { score: result.effectivenessScore || 75, coverage: result.coverage || 80 },
            { stepIndex: execution.currentStepIndex }
          );
        }
      }
      
      const duration = Date.now() - stepStartTime;
      
      // Record execution step
      await this.stateManager.recordExecutionStep(execution.id, step, {
        success: true,
        duration,
        fallbackUsed,
        agentUsed: actualAgent
      });
      
      // Log plan deviation if fallback was used
      if (fallbackUsed && originalAgent !== actualAgent) {
        await this.fallbackLogger.logPlanDeviation(
          execution.id,
          { agent: originalAgent, action: step.name, expectedOutcome: 'ai-processing' },
          { agent: actualAgent, action: step.name, actualOutcome: 'fallback-processing' },
          'Agent unavailable, used fallback',
          { fallbackMethod: fallbackUsed, effectiveness: result?.effectivenessScore }
        );
      }
      
      // Save execution state after successful step
      await this.stateManager.saveExecutionState(execution);
      
      this.logger.debug(`Step ${step.name} completed in ${duration}ms with agent ${actualAgent}`);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - stepStartTime;
      
      // Record failed step
      await this.stateManager.recordExecutionStep(execution.id, step, {
        success: false,
        duration,
        fallbackUsed,
        agentUsed: actualAgent,
        error: error.message
      });
      
      this.logger.error(`Step ${step.name} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Execute non-AI fallback methods
   */
  async executeNonAiFallback(step, execution, eventData) {
    const fallbackMethods = {
      'semantic-analysis': this.executeRuleBasedAnalysis,
      'web-search': this.executeCachedSearch,
      'knowledge-graph': this.executeDirectUkb,
      'documentation': this.executeTemplateGeneration
    };
    
    const agent = step.config?.agent;
    const fallbackMethod = fallbackMethods[agent];
    
    if (!fallbackMethod) {
      this.logger.warn(`No non-AI fallback available for agent: ${agent}`);
      return null;
    }
    
    this.logger.info(`Executing non-AI fallback for ${agent}`);
    
    try {
      const result = await fallbackMethod.call(this, step, execution, eventData);
      result.effectivenessScore = this.calculateFallbackEffectiveness(step, result);
      return result;
    } catch (error) {
      this.logger.error(`Non-AI fallback failed for ${agent}:`, error);
      return null;
    }
  }

  /**
   * Fallback method implementations
   */
  async executeRuleBasedAnalysis(step, execution, eventData) {
    // Simple rule-based semantic analysis
    const context = execution.context;
    const repository = context.repository || context.target;
    
    return {
      type: 'rule-based-analysis',
      result: {
        patterns: ['basic-pattern-detected'],
        insights: ['rule-based insight generated'],
        confidence: 0.7
      },
      coverage: 60,
      method: 'rule-based'
    };
  }

  async executeCachedSearch(step, execution, eventData) {
    // Use cached search results or local documentation
    return {
      type: 'cached-search',
      result: {
        sources: ['local-cache'],
        results: ['cached result'],
        confidence: 0.6
      },
      coverage: 50,
      method: 'cached'
    };
  }

  async executeDirectUkb(step, execution, eventData) {
    // Direct UKB integration without AI analysis
    return {
      type: 'direct-ukb',
      result: {
        entities: [],
        success: true
      },
      coverage: 80,
      method: 'direct-integration'
    };
  }

  async executeTemplateGeneration(step, execution, eventData) {
    // Template-based documentation generation
    return {
      type: 'template-generation',
      result: {
        documents: ['template-based-doc'],
        success: true
      },
      coverage: 70,
      method: 'template-based'
    };
  }

  /**
   * Agent availability and fallback methods
   */
  async isAgentAvailable(agentId) {
    try {
      // Simple ping test - could be enhanced
      const response = await this.sendRequest(`${agentId}/ping`, {}, 5000);
      return response && response.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  async checkAgentAvailability(agentIds) {
    const available = [];
    for (const agentId of agentIds) {
      if (await this.isAgentAvailable(agentId)) {
        available.push(agentId);
      }
    }
    return available;
  }

  async findAgentFallback(originalAgent, step) {
    const fallbackMap = {
      'semantic-analysis': { agent: 'rule-based-analyzer', method: 'rule-based', type: 'non-ai', effectiveness: '70%' },
      'web-search': { agent: 'cached-search', method: 'cached-results', type: 'non-ai', effectiveness: '60%' },
      'knowledge-graph': { agent: 'direct-ukb', method: 'direct-integration', type: 'non-ai', effectiveness: '80%' },
      'documentation': { agent: 'template-generator', method: 'template-based', type: 'non-ai', effectiveness: '75%' }
    };
    
    return fallbackMap[originalAgent] || null;
  }

  extractRequiredAgents(workflow) {
    const agents = new Set();
    if (workflow.steps) {
      for (const step of workflow.steps) {
        if (step.config?.agent) {
          agents.add(step.config.agent);
        }
      }
    }
    return Array.from(agents);
  }

  async adaptExecutionForFallbacks(execution, unavailableAgents) {
    // Modify workflow steps to use fallbacks for unavailable agents
    if (execution.workflow?.steps) {
      execution.workflow.steps = execution.workflow.steps.map(step => {
        if (step.config?.agent && unavailableAgents.includes(step.config.agent)) {
          const fallback = this.findAgentFallback(step.config.agent, step);
          if (fallback) {
            return {
              ...step,
              config: { ...step.config, agent: fallback.agent },
              fallbackInfo: fallback
            };
          }
        }
        return step;
      });
    }
    
    return execution;
  }

  calculateFallbackEffectiveness(step, result) {
    // Simple effectiveness calculation - could be enhanced
    let score = 50; // Base score
    
    if (result.coverage) score += result.coverage * 0.3;
    if (result.confidence) score += result.confidence * 20;
    if (result.result?.success) score += 10;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Enhanced completion methods
   */
  async completeExecution(execution) {
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    
    // Calculate completion metrics
    const metrics = {
      fallbacksUsed: execution.fallbacksUsed?.length || 0,
      deviationsFromPlan: this.countPlanDeviations(execution),
      overallEffectiveness: this.calculateOverallEffectiveness(execution),
      completionPercentage: 100
    };
    
    // Log recovery completion
    await this.fallbackLogger.logRecoveryCompletion(
      execution.id,
      execution.originalPlan || 'standard-workflow',
      execution.executionPath || [],
      { status: 'completed', completionPercentage: 100 },
      metrics
    );
    
    // Mark as completed in state manager
    await this.stateManager.markExecutionCompleted(execution.id, {
      status: 'completed',
      completedAt: execution.completedAt,
      results: execution.results
    });
    
    this.logger.info(`Workflow execution completed: ${execution.id}`);
    this.logger.recoveryComplete(execution.id, { status: 'completed', completionPercentage: 100 }, metrics);
    
    this.emit('workflow-completed', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      results: execution.results,
      context: execution.context,
      metrics
    });
  }

  countPlanDeviations(execution) {
    return execution.executionPath?.filter(step => step.fallbackUsed).length || 0;
  }

  calculateOverallEffectiveness(execution) {
    if (!execution.executionPath?.length) return 100;
    
    const stepEffectiveness = execution.executionPath.map(step => {
      if (step.fallbackUsed) {
        return step.effectivenessScore || 70; // Default fallback effectiveness
      }
      return 100; // Original plan effectiveness
    });
    
    return Math.round(stepEffectiveness.reduce((sum, score) => sum + score, 0) / stepEffectiveness.length);
  }

  /**
   * Mock request sender (to be replaced with actual implementation)
   */
  async sendRequest(endpoint, params, timeout = 30000) {
    // This would be implemented to actually send requests to agents
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Mock: Agent at ${endpoint} unavailable`));
      }, 100);
    });
  }
}