/**
 * FallbackLogger
 * Tracks plan deviations, agent failures, and non-AI fallback usage
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../shared/logger.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FallbackLogger {
  constructor(config = {}) {
    this.config = {
      logDir: config.logDir || path.join(__dirname, '../../data/fallbacks'),
      maxLogFiles: config.maxLogFiles || 50,
      rotateInterval: config.rotateInterval || 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };
    
    this.logger = new Logger('fallback-logger');
    this.currentSession = this.generateSessionId();
    this.fallbackLog = [];
    this.deviationLog = [];
    this.effectivenessTracking = new Map();
    
    this.initializeLogging();
  }

  async initializeLogging() {
    try {
      await fs.mkdir(this.config.logDir, { recursive: true });
      this.logger.info(`Fallback logging initialized for session: ${this.currentSession}`);
      
      // Start periodic log rotation
      this.startLogRotation();
      
    } catch (error) {
      this.logger.error('Failed to initialize fallback logging:', error);
      throw error;
    }
  }

  /**
   * Log when workflow deviates from original plan
   */
  async logPlanDeviation(executionId, originalPlan, actualPath, reason, context = {}) {
    const deviation = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession,
      executionId,
      type: 'plan_deviation',
      originalPlan: {
        agent: originalPlan.agent,
        action: originalPlan.action,
        expectedOutcome: originalPlan.expectedOutcome
      },
      actualPath: {
        agent: actualPath.agent,
        action: actualPath.action,
        actualOutcome: actualPath.actualOutcome
      },
      reason,
      severity: this.assessDeviationSeverity(originalPlan, actualPath),
      context,
      impact: context.impact || 'unknown'
    };
    
    this.deviationLog.push(deviation);
    
    // Immediate console output with color coding
    const severityColor = deviation.severity === 'high' ? '\x1b[31m' : 
                         deviation.severity === 'medium' ? '\x1b[33m' : '\x1b[36m';
    
    console.log(`${severityColor}🚨 PLAN DEVIATION\x1b[0m: ${reason}`);
    console.log(`   Original: ${originalPlan.agent}/${originalPlan.action}`);
    console.log(`   Actual: ${actualPath.agent}/${actualPath.action}`);
    console.log(`   Severity: ${deviation.severity.toUpperCase()}`);
    
    this.logger.warn('Plan deviation recorded', deviation);
    
    // Save to persistent log
    await this.persistLog('deviation', deviation);
  }

  /**
   * Log when an AI agent fails and fallback is used
   */
  async logAgentFallback(executionId, plannedAgent, fallbackMethod, reason, context = {}) {
    const fallback = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession,
      executionId,
      type: 'agent_fallback',
      plannedAgent: {
        name: plannedAgent.name,
        type: plannedAgent.type || 'ai',
        capabilities: plannedAgent.capabilities || []
      },
      fallbackMethod: {
        name: fallbackMethod.name,
        type: fallbackMethod.type || 'non-ai',
        capabilities: fallbackMethod.capabilities || [],
        expectedEffectiveness: fallbackMethod.expectedEffectiveness || 'unknown'
      },
      reason,
      context,
      stepIndex: context.stepIndex || null,
      stepName: context.stepName || null
    };
    
    this.fallbackLog.push(fallback);
    
    // Immediate console output with warning icon
    console.log(`\x1b[33m⚠️  FALLBACK ACTIVE\x1b[0m: ${plannedAgent.name} unavailable, using ${fallbackMethod.name}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Expected effectiveness: ${fallbackMethod.expectedEffectiveness || 'unknown'}`);
    
    this.logger.warn('Agent fallback activated', fallback);
    
    // Save to persistent log
    await this.persistLog('fallback', fallback);
  }

  /**
   * Log when non-AI methods are used instead of AI
   */
  async logNonAiFallback(executionId, task, fallbackTool, effectiveness, context = {}) {
    const nonAiFallback = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession,
      executionId,
      type: 'non_ai_fallback',
      task: {
        description: task.description,
        originalMethod: task.originalMethod || 'ai-analysis',
        complexity: task.complexity || 'medium'
      },
      fallbackTool: {
        name: fallbackTool.name,
        type: fallbackTool.type || 'rule-based',
        version: fallbackTool.version || null
      },
      effectiveness: {
        score: effectiveness.score || null, // 0-100
        metrics: effectiveness.metrics || {},
        coverage: effectiveness.coverage || null, // percentage of task completed
        quality: effectiveness.quality || null // subjective assessment
      },
      context,
      duration: context.duration || null,
      retryAttempts: context.retryAttempts || 0
    };
    
    this.fallbackLog.push(nonAiFallback);
    
    // Track effectiveness for reporting
    this.trackEffectiveness(fallbackTool.name, effectiveness);
    
    // Console output with effectiveness indicator
    const effectivenessIcon = (effectiveness.score || 0) >= 80 ? '✅' : 
                             (effectiveness.score || 0) >= 60 ? '⚠️' : '❌';
    
    console.log(`\x1b[36m📊 NON-AI FALLBACK\x1b[0m: Using ${fallbackTool.name} for ${task.description}`);
    console.log(`   ${effectivenessIcon} Effectiveness: ${effectiveness.score || 'unknown'}% coverage`);
    
    this.logger.info('Non-AI fallback used', nonAiFallback);
    
    // Save to persistent log
    await this.persistLog('non_ai_fallback', nonAiFallback);
  }

  /**
   * Log successful recovery completion
   */
  async logRecoveryCompletion(executionId, originalPlan, actualPath, outcome, metrics = {}) {
    const recovery = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession,
      executionId,
      type: 'recovery_completion',
      originalPlan,
      actualPath,
      outcome: {
        status: outcome.status,
        completionPercentage: outcome.completionPercentage || null,
        qualityScore: outcome.qualityScore || null,
        timeToCompletion: outcome.timeToCompletion || null
      },
      metrics: {
        fallbacksUsed: metrics.fallbacksUsed || 0,
        deviationsFromPlan: metrics.deviationsFromPlan || 0,
        overallEffectiveness: metrics.overallEffectiveness || null,
        userSatisfaction: metrics.userSatisfaction || null
      },
      lessonsLearned: metrics.lessonsLearned || []
    };
    
    // Console output with success indicator
    const statusIcon = outcome.status === 'completed' ? '✅' : 
                      outcome.status === 'partial' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} \x1b[32mRECOVERY COMPLETE\x1b[0m: Analysis completed via alternative execution path`);
    console.log(`   Completion: ${outcome.completionPercentage || 'unknown'}%`);
    console.log(`   Fallbacks used: ${metrics.fallbacksUsed || 0}`);
    console.log(`   Overall effectiveness: ${metrics.overallEffectiveness || 'unknown'}%`);
    
    this.logger.info('Recovery completion logged', recovery);
    
    // Save to persistent log
    await this.persistLog('recovery', recovery);
  }

  /**
   * Log decision reasoning for fallback choices
   */
  async logDecisionReasoning(executionId, decision, reasoning, alternatives = []) {
    const decisionLog = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession,
      executionId,
      type: 'decision_reasoning',
      decision: {
        chosen: decision.chosen,
        type: decision.type,
        confidence: decision.confidence || null
      },
      reasoning: {
        factors: reasoning.factors || [],
        weights: reasoning.weights || {},
        riskAssessment: reasoning.riskAssessment || null,
        expectedOutcome: reasoning.expectedOutcome || null
      },
      alternatives: alternatives.map(alt => ({
        option: alt.option,
        pros: alt.pros || [],
        cons: alt.cons || [],
        riskLevel: alt.riskLevel || null,
        rejectionReason: alt.rejectionReason || null
      }))
    };
    
    console.log(`\x1b[35m🤔 DECISION LOGGED\x1b[0m: ${decision.chosen} (confidence: ${decision.confidence || 'unknown'}%)`);
    console.log(`   Key factors: ${reasoning.factors?.slice(0, 2).join(', ') || 'none specified'}`);
    
    this.logger.info('Decision reasoning recorded', decisionLog);
    
    // Save to persistent log
    await this.persistLog('decision', decisionLog);
  }

  /**
   * Track effectiveness of fallback methods
   */
  trackEffectiveness(fallbackMethod, effectiveness) {
    if (!this.effectivenessTracking.has(fallbackMethod)) {
      this.effectivenessTracking.set(fallbackMethod, {
        uses: 0,
        totalScore: 0,
        averageScore: 0,
        successRate: 0,
        lastUsed: null
      });
    }
    
    const tracking = this.effectivenessTracking.get(fallbackMethod);
    tracking.uses++;
    tracking.totalScore += (effectiveness.score || 0);
    tracking.averageScore = tracking.totalScore / tracking.uses;
    tracking.lastUsed = new Date().toISOString();
    
    if (effectiveness.score >= 70) {
      tracking.successRate = ((tracking.successRate * (tracking.uses - 1)) + 100) / tracking.uses;
    } else {
      tracking.successRate = (tracking.successRate * (tracking.uses - 1)) / tracking.uses;
    }
  }

  /**
   * Generate effectiveness report
   */
  generateEffectivenessReport() {
    const report = {
      sessionId: this.currentSession,
      generatedAt: new Date().toISOString(),
      totalFallbacks: this.fallbackLog.length,
      totalDeviations: this.deviationLog.length,
      fallbackMethods: Object.fromEntries(this.effectivenessTracking),
      summary: {
        mostEffectiveFallback: null,
        leastEffectiveFallback: null,
        averageEffectiveness: 0,
        commonFailureReasons: []
      }
    };
    
    // Calculate summary statistics
    if (this.effectivenessTracking.size > 0) {
      const methods = Array.from(this.effectivenessTracking.entries());
      
      // Most/least effective
      methods.sort((a, b) => b[1].averageScore - a[1].averageScore);
      report.summary.mostEffectiveFallback = methods[0];
      report.summary.leastEffectiveFallback = methods[methods.length - 1];
      
      // Average effectiveness
      const totalScore = methods.reduce((sum, [_, stats]) => sum + stats.averageScore, 0);
      report.summary.averageEffectiveness = totalScore / methods.length;
    }
    
    // Common failure reasons
    const reasonCounts = new Map();
    this.fallbackLog.forEach(entry => {
      const reason = entry.reason;
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });
    
    report.summary.commonFailureReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
    
    return report;
  }

  /**
   * Assess the severity of a plan deviation
   */
  assessDeviationSeverity(originalPlan, actualPath) {
    // Simple heuristic - can be made more sophisticated
    if (originalPlan.agent !== actualPath.agent) {
      if (originalPlan.agent.includes('ai') && !actualPath.agent.includes('ai')) {
        return 'high'; // AI to non-AI is high severity
      }
      return 'medium'; // Different agents
    }
    
    if (originalPlan.action !== actualPath.action) {
      return 'low'; // Same agent, different action
    }
    
    return 'minimal'; // Minor deviation
  }

  /**
   * Persist log entry to file
   */
  async persistLog(type, logEntry) {
    try {
      const fileName = `${this.currentSession}_${type}.jsonl`;
      const filePath = path.join(this.config.logDir, fileName);
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(filePath, logLine);
      
    } catch (error) {
      this.logger.error(`Failed to persist ${type} log:`, error);
    }
  }

  /**
   * Start log rotation routine
   */
  startLogRotation() {
    setInterval(async () => {
      try {
        await this.rotateLogsIfNeeded();
      } catch (error) {
        this.logger.error('Log rotation failed:', error);
      }
    }, this.config.rotateInterval);
  }

  /**
   * Rotate logs if needed
   */
  async rotateLogsIfNeeded() {
    try {
      const files = await fs.readdir(this.config.logDir);
      const logFiles = files.filter(f => f.endsWith('.jsonl')).sort();
      
      if (logFiles.length > this.config.maxLogFiles) {
        const toDelete = logFiles.slice(0, logFiles.length - this.config.maxLogFiles);
        
        for (const file of toDelete) {
          await fs.unlink(path.join(this.config.logDir, file));
          this.logger.debug(`Rotated log file: ${file}`);
        }
        
        this.logger.info(`Rotated ${toDelete.length} log files`);
      }
      
    } catch (error) {
      this.logger.error('Log rotation check failed:', error);
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.currentSession,
      totalFallbacks: this.fallbackLog.length,
      totalDeviations: this.deviationLog.length,
      effectivenessReport: this.generateEffectivenessReport()
    };
  }

  /**
   * Export logs for analysis
   */
  async exportLogs(format = 'json') {
    const exportData = {
      sessionId: this.currentSession,
      exportedAt: new Date().toISOString(),
      fallbackLog: this.fallbackLog,
      deviationLog: this.deviationLog,
      effectivenessTracking: Object.fromEntries(this.effectivenessTracking),
      summary: this.generateEffectivenessReport()
    };
    
    const fileName = `fallback_export_${this.currentSession}.${format}`;
    const filePath = path.join(this.config.logDir, fileName);
    
    if (format === 'json') {
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    } else {
      // Could add CSV or other formats
      throw new Error(`Unsupported export format: ${format}`);
    }
    
    this.logger.info(`Exported fallback logs to: ${filePath}`);
    return filePath;
  }
}