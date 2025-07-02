/**
 * Shared Logger
 * Provides consistent logging across all agents and services
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Logger {
  constructor(component = 'default') {
    this.component = component;
    this.winston = this.createLogger();
  }

  createLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, component, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level.toUpperCase()}] [${this.component}] ${message} ${metaStr}`;
      })
    );

    const transports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      })
    ];

    // Add file transport if log file is specified
    const logFile = process.env.LOG_FILE;
    if (logFile) {
      transports.push(
        new winston.transports.File({
          filename: path.resolve(logFile),
          format: logFormat,
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5
        })
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  debug(message, ...args) {
    this.winston.debug(message, ...args);
  }

  info(message, ...args) {
    this.winston.info(message, ...args);
  }

  warn(message, ...args) {
    this.winston.warn(message, ...args);
  }

  error(message, ...args) {
    this.winston.error(message, ...args);
  }

  child(childComponent) {
    return new Logger(`${this.component}:${childComponent}`);
  }

  /**
   * Specialized fallback logging methods
   */
  
  planDeviation(originalPlan, actualPath, reason, context = {}) {
    const message = `Plan deviation: ${originalPlan} -> ${actualPath} (${reason})`;
    this.winston.warn(message, {
      type: 'plan_deviation',
      originalPlan,
      actualPath,
      reason,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Console output with color coding
    console.log(`\x1b[31m🚨 PLAN DEVIATION\x1b[0m: ${reason}`);
    console.log(`   Original: ${originalPlan}`);
    console.log(`   Actual: ${actualPath}`);
  }

  agentFallback(plannedAgent, fallbackMethod, context = {}) {
    const message = `Agent fallback: ${plannedAgent} unavailable, using ${fallbackMethod}`;
    this.winston.warn(message, {
      type: 'agent_fallback',
      plannedAgent,
      fallbackMethod,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Console output with warning icon
    console.log(`\x1b[33m⚠️  FALLBACK ACTIVE\x1b[0m: ${plannedAgent} unavailable, using ${fallbackMethod}`);
    if (context.reason) {
      console.log(`   Reason: ${context.reason}`);
    }
  }

  nonAiFallback(task, fallbackTool, effectiveness, context = {}) {
    const effectivenessPercent = effectiveness?.score || 'unknown';
    const message = `Non-AI fallback: ${task} -> ${fallbackTool} (${effectivenessPercent}% effective)`;
    
    this.winston.info(message, {
      type: 'non_ai_fallback',
      task,
      fallbackTool,
      effectiveness,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Console output with effectiveness indicator
    const effectivenessIcon = (effectiveness?.score || 0) >= 80 ? '✅' : 
                             (effectiveness?.score || 0) >= 60 ? '⚠️' : '❌';
    
    console.log(`\x1b[36m📊 NON-AI FALLBACK\x1b[0m: Using ${fallbackTool} for ${task}`);
    console.log(`   ${effectivenessIcon} Effectiveness: ${effectivenessPercent}%`);
  }

  recoveryComplete(executionId, outcome, metrics = {}) {
    const message = `Recovery completed for ${executionId}: ${outcome.status}`;
    
    this.winston.info(message, {
      type: 'recovery_completion',
      executionId,
      outcome,
      metrics,
      timestamp: new Date().toISOString()
    });
    
    // Console output with success indicator
    const statusIcon = outcome.status === 'completed' ? '✅' : 
                      outcome.status === 'partial' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} \x1b[32mRECOVERY COMPLETE\x1b[0m: Analysis completed via alternative execution path`);
    console.log(`   Completion: ${outcome.completionPercentage || 'unknown'}%`);
    console.log(`   Fallbacks used: ${metrics.fallbacksUsed || 0}`);
  }

  decisionReasoning(decision, reasoning, alternatives = []) {
    const message = `Decision: ${decision.chosen} (confidence: ${decision.confidence || 'unknown'}%)`;
    
    this.winston.info(message, {
      type: 'decision_reasoning',
      decision,
      reasoning,
      alternatives,
      timestamp: new Date().toISOString()
    });
    
    console.log(`\x1b[35m🤔 DECISION\x1b[0m: ${decision.chosen} (confidence: ${decision.confidence || 'unknown'}%)`);
    if (reasoning.factors?.length) {
      console.log(`   Key factors: ${reasoning.factors.slice(0, 2).join(', ')}`);
    }
  }

  workflowCheckpoint(executionId, currentStep, progress, context = {}) {
    const message = `Workflow checkpoint: ${executionId} at step ${currentStep} (${progress}% complete)`;
    
    this.winston.debug(message, {
      type: 'workflow_checkpoint',
      executionId,
      currentStep,
      progress,
      context,
      timestamp: new Date().toISOString()
    });
  }

  agentAvailability(agentId, status, capabilities = []) {
    const message = `Agent ${agentId} is ${status}`;
    
    this.winston.info(message, {
      type: 'agent_availability',
      agentId,
      status,
      capabilities,
      timestamp: new Date().toISOString()
    });
    
    const statusIcon = status === 'available' ? '✅' : 
                      status === 'busy' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} Agent ${agentId}: ${status}`);
  }

  systemRecovery(component, previousState, newState, recoveryMethod) {
    const message = `System recovery: ${component} ${previousState} -> ${newState} via ${recoveryMethod}`;
    
    this.winston.info(message, {
      type: 'system_recovery',
      component,
      previousState,
      newState,
      recoveryMethod,
      timestamp: new Date().toISOString()
    });
    
    console.log(`\x1b[32m🔄 SYSTEM RECOVERY\x1b[0m: ${component} restored using ${recoveryMethod}`);
  }
}

export { Logger };