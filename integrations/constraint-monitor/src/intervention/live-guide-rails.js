import { EventEmitter } from 'events';
import { logger, PerformanceTimer, violationLogger } from '../utils/logger.js';

export class LiveGuideRails extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      interventionEnabled: config.interventionEnabled !== false,
      contextInjectionEnabled: config.contextInjectionEnabled !== false,
      riskAssessmentEnabled: config.riskAssessmentEnabled !== false,
      maxInterventionsPerSession: config.maxInterventionsPerSession || 10,
      interventionCooldown: config.interventionCooldown || 30000, // 30 seconds
      highRiskThreshold: config.highRiskThreshold || 0.7,
      ...config
    };

    // Violation queue for pre-hook intervention
    this.violationQueue = [];
    this.interventionHistory = new Map();
    this.sessionStats = new Map();
    this.riskAssessor = new RiskAssessor(this.config.riskAssessment);

    // Performance tracking
    this.stats = {
      interventionsMade: 0,
      violationsBlocked: 0,
      risksDetected: 0,
      contextInjections: 0,
      startTime: Date.now()
    };
  }

  /**
   * Main intervention method - called when violations are detected
   */
  async interventeOnViolations(violations, event, context) {
    const timer = new PerformanceTimer('intervention');
    
    try {
      if (!this.config.interventionEnabled || violations.length === 0) {
        return { intervention: false };
      }

      // Check intervention limits
      const sessionId = event.sessionId || 'unknown';
      if (!this.canIntervene(sessionId, violations)) {
        return { intervention: false, reason: 'intervention_limit_exceeded' };
      }

      // Categorize violations by severity
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      const errorViolations = violations.filter(v => v.severity === 'error');
      const warningViolations = violations.filter(v => v.severity === 'warning');

      let interventionResult = null;

      // Handle critical violations - always block
      if (criticalViolations.length > 0) {
        interventionResult = await this.handleCriticalViolations(criticalViolations, event, context);
      }
      // Handle error violations - block with guidance
      else if (errorViolations.length > 0) {
        interventionResult = await this.handleErrorViolations(errorViolations, event, context);
      }
      // Handle warnings - suggest improvements
      else if (warningViolations.length > 0) {
        interventionResult = await this.handleWarningViolations(warningViolations, event, context);
      }

      if (interventionResult) {
        // Update intervention history
        this.recordIntervention(sessionId, violations, interventionResult);
        
        // Update statistics
        this.updateStats(violations, interventionResult);
        
        timer.end('completed', { 
          violationCount: violations.length,
          blocked: interventionResult.blocked || false
        });
        
        return interventionResult;
      }

      timer.end('no_intervention');
      return { intervention: false };
    } catch (error) {
      timer.end('failed', { error: error.message });
      logger.error('Intervention failed:', error);
      return { intervention: false, error: error.message };
    }
  }

  async handleCriticalViolations(violations, event, context) {
    const correction = await this.generateCorrection(violations, context);
    
    // Add to violation queue for pre-hook blocking
    this.queueViolations(violations);
    
    const result = {
      intervention: true,
      blocked: true,
      severity: 'critical',
      reason: this.formatViolationMessage(violations),
      correction: correction,
      allowOverride: false,
      metadata: {
        violationIds: violations.map(v => v.constraintId),
        eventId: event.uuid,
        timestamp: Date.now()
      }
    };

    violationLogger.info('Critical intervention applied', result);
    this.emit('intervention', result);
    
    return result;
  }

  async handleErrorViolations(violations, event, context) {
    const correction = await this.generateCorrection(violations, context);
    
    // Add to violation queue but allow override
    this.queueViolations(violations);
    
    const result = {
      intervention: true,
      blocked: true,
      severity: 'error', 
      reason: this.formatViolationMessage(violations),
      correction: correction,
      allowOverride: true,
      metadata: {
        violationIds: violations.map(v => v.constraintId),
        eventId: event.uuid,
        timestamp: Date.now()
      }
    };

    violationLogger.info('Error intervention applied', result);
    this.emit('intervention', result);
    
    return result;
  }

  async handleWarningViolations(violations, event, context) {
    const correction = await this.generateCorrection(violations, context);
    
    const result = {
      intervention: true,
      blocked: false,
      severity: 'warning',
      warning: this.formatViolationMessage(violations),
      suggestions: correction.suggestions || [],
      addedContext: `⚠️ Constraint Guidance: ${correction.guidance}`,
      metadata: {
        violationIds: violations.map(v => v.constraintId),
        eventId: event.uuid,
        timestamp: Date.now()
      }
    };

    violationLogger.info('Warning intervention applied', result);
    this.emit('intervention', result);
    
    return result;
  }

  async generateCorrection(violations, context) {
    const timer = new PerformanceTimer('generate-correction');
    
    try {
      // Find similar past resolutions
      const similarResolutions = await this.findSimilarResolutions(violations);
      
      // Generate context-aware suggestions
      const suggestions = this.generateSuggestions(violations, context, similarResolutions);
      
      // Create guidance message
      const guidance = this.createGuidanceMessage(violations, suggestions);
      
      timer.end('completed');
      
      return {
        violations: violations.map(v => ({
          constraintId: v.constraintId,
          message: v.message,
          severity: v.severity
        })),
        suggestions,
        guidance,
        similarResolutions: similarResolutions.slice(0, 3), // Top 3 similar cases
        timestamp: Date.now()
      };
    } catch (error) {
      timer.end('failed', { error: error.message });
      logger.warn('Failed to generate correction:', error);
      
      // Fallback correction
      return {
        violations: violations.map(v => ({
          constraintId: v.constraintId,
          message: v.message,
          severity: v.severity
        })),
        suggestions: ['Ask the user for guidance', 'Consider alternative approaches'],
        guidance: 'Constraint violation detected. Please review and adjust your approach.',
        timestamp: Date.now()
      };
    }
  }

  async findSimilarResolutions(violations) {
    // This would typically query the vector database for similar past violations
    // For now, return basic suggestions based on violation types
    const resolutions = [];
    
    for (const violation of violations) {
      const pastResolutions = this.getKnownResolutions(violation.constraintId);
      resolutions.push(...pastResolutions);
    }
    
    return resolutions;
  }

  getKnownResolutions(constraintId) {
    const knownResolutions = {
      'unauthorized-commit': [
        {
          pattern: 'Ask user permission before git operations',
          successRate: 0.95,
          example: 'User: "Should I commit these changes to fix the authentication bug?"'
        }
      ],
      'no-console-log': [
        {
          pattern: 'Replace with Logger.log() calls',
          successRate: 0.85,
          example: 'Logger.log("debug", "auth", "User login successful")'
        }
      ],
      'excessive-exploration': [
        {
          pattern: 'Focus on specific files related to the task',
          successRate: 0.78,
          example: 'Read only configuration and implementation files for this feature'
        }
      ],
      'trajectory-alignment': [
        {
          pattern: 'Clarify user intent before proceeding',
          successRate: 0.82,
          example: 'User: "To clarify, do you want me to refactor the existing code or create a new implementation?"'
        }
      ]
    };
    
    return knownResolutions[constraintId] || [];
  }

  generateSuggestions(violations, context, similarResolutions) {
    const suggestions = [];
    
    for (const violation of violations) {
      switch (violation.constraintId) {
        case 'unauthorized-commit':
          suggestions.push('Ask the user: "Should I commit these changes?"');
          suggestions.push('Explain what changes will be committed before proceeding');
          break;
          
        case 'no-console-log':
          suggestions.push('Replace console.log with Logger.log("level", "category", "message")');
          suggestions.push('Use appropriate log levels: debug, info, warn, error');
          break;
          
        case 'excessive-exploration':
          suggestions.push('Focus on files directly related to the current task');
          suggestions.push('Ask user to specify which files are most relevant');
          break;
          
        case 'trajectory-alignment':
          suggestions.push('Clarify the user\'s intended goal before continuing');
          suggestions.push('Explain how this action helps achieve the user\'s objective');
          break;
          
        default:
          suggestions.push('Ask the user for guidance on how to proceed');
          suggestions.push('Explain why this constraint exists and how to work with it');
      }
    }
    
    // Add suggestions from similar resolutions
    similarResolutions.forEach(resolution => {
      if (resolution.example && !suggestions.includes(resolution.example)) {
        suggestions.push(resolution.example);
      }
    });
    
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }

  createGuidanceMessage(violations, suggestions) {
    if (violations.length === 1) {
      const violation = violations[0];
      return `${violation.message}. ${suggestions[0] || 'Please ask the user for guidance.'}`;
    } else {
      const severityCount = violations.reduce((acc, v) => {
        acc[v.severity] = (acc[v.severity] || 0) + 1;
        return acc;
      }, {});
      
      const severityText = Object.entries(severityCount)
        .map(([severity, count]) => `${count} ${severity}`)
        .join(', ');
        
      return `Multiple constraint violations detected (${severityText}). ${suggestions[0] || 'Please review and ask the user for guidance.'}`;
    }
  }

  formatViolationMessage(violations) {
    if (violations.length === 1) {
      return violations[0].message;
    } else {
      const messages = violations.map(v => `• ${v.message}`).join('\n');
      return `Multiple constraint violations:\n${messages}`;
    }
  }

  /**
   * Predictive risk assessment
   */
  async assessRisk(event, context) {
    if (!this.config.riskAssessmentEnabled) {
      return { risk: false };
    }

    const timer = new PerformanceTimer('risk-assessment');
    
    try {
      const riskScore = await this.riskAssessor.calculateRisk(event, context);
      
      if (riskScore.score > this.config.highRiskThreshold) {
        const result = {
          risk: true,
          score: riskScore.score,
          factors: riskScore.factors,
          recommendation: riskScore.recommendation,
          alternatives: riskScore.alternatives
        };
        
        this.stats.risksDetected++;
        timer.end('high_risk_detected', { score: riskScore.score });
        
        this.emit('riskDetected', result);
        return result;
      }
      
      timer.end('low_risk');
      return { risk: false, score: riskScore.score };
    } catch (error) {
      timer.end('failed', { error: error.message });
      logger.error('Risk assessment failed:', error);
      return { risk: false, error: error.message };
    }
  }

  /**
   * Context injection for constraint awareness
   */
  async injectConstraintContext(userPrompt, sessionId) {
    if (!this.config.contextInjectionEnabled) {
      return userPrompt;
    }

    const timer = new PerformanceTimer('context-injection');
    
    try {
      const activeConstraints = await this.getActiveConstraints(sessionId);
      const recentViolations = this.getRecentViolations(sessionId, 5);
      
      if (activeConstraints.length === 0 && recentViolations.length === 0) {
        return userPrompt;
      }

      let contextInjection = '';
      
      if (activeConstraints.length > 0) {
        contextInjection += `🛡️ ACTIVE CONSTRAINTS:\n`;
        contextInjection += activeConstraints
          .slice(0, 3) // Limit to top 3 to avoid overwhelming
          .map(c => `• ${c.description || c.message}`)
          .join('\n');
        contextInjection += '\n\n';
      }
      
      if (recentViolations.length > 0) {
        contextInjection += `⚠️ RECENT VIOLATIONS TO AVOID:\n`;
        contextInjection += recentViolations
          .map(v => `• ${v.constraintId} → ${v.resolution || 'Ask for permission first'}`)
          .join('\n');
        contextInjection += '\n\n';
      }
      
      contextInjection += `USER REQUEST: ${userPrompt}`;
      
      this.stats.contextInjections++;
      timer.end('completed', { constraintCount: activeConstraints.length, violationCount: recentViolations.length });
      
      return contextInjection;
    } catch (error) {
      timer.end('failed', { error: error.message });
      logger.error('Context injection failed:', error);
      return userPrompt; // Return original prompt on failure
    }
  }

  /**
   * Manage violation queue for pre-hook intervention
   */
  queueViolations(violations) {
    const queueEntry = {
      violations,
      timestamp: Date.now(),
      resolved: false,
      id: this.generateViolationId()
    };
    
    this.violationQueue.push(queueEntry);
    
    // Limit queue size
    if (this.violationQueue.length > 100) {
      this.violationQueue.shift();
    }
    
    logger.debug(`Queued ${violations.length} violations for pre-hook intervention`);
  }

  getViolationQueue() {
    return this.violationQueue.filter(entry => !entry.resolved);
  }

  resolveViolation(violationId) {
    const entry = this.violationQueue.find(e => e.id === violationId);
    if (entry) {
      entry.resolved = true;
      entry.resolvedAt = Date.now();
      logger.debug(`Resolved violation: ${violationId}`);
    }
  }

  clearViolationQueue() {
    this.violationQueue = [];
    logger.info('Violation queue cleared');
  }

  /**
   * Check if intervention is allowed for this session
   */
  canIntervene(sessionId, violations) {
    const sessionData = this.sessionStats.get(sessionId) || { interventions: 0, lastIntervention: 0 };
    
    // Check intervention limit
    if (sessionData.interventions >= this.config.maxInterventionsPerSession) {
      return false;
    }
    
    // Check cooldown period
    const timeSinceLastIntervention = Date.now() - sessionData.lastIntervention;
    if (timeSinceLastIntervention < this.config.interventionCooldown) {
      return false;
    }
    
    return true;
  }

  recordIntervention(sessionId, violations, result) {
    const sessionData = this.sessionStats.get(sessionId) || { interventions: 0, lastIntervention: 0 };
    
    sessionData.interventions++;
    sessionData.lastIntervention = Date.now();
    
    this.sessionStats.set(sessionId, sessionData);
    
    // Store in intervention history
    const historyEntry = {
      sessionId,
      violations: violations.map(v => ({
        constraintId: v.constraintId,
        severity: v.severity
      })),
      result,
      timestamp: Date.now()
    };
    
    const historyKey = `${sessionId}:${Date.now()}`;
    this.interventionHistory.set(historyKey, historyEntry);
  }

  updateStats(violations, result) {
    this.stats.interventionsMade++;
    
    if (result.blocked) {
      this.stats.violationsBlocked++;
    }
  }

  async getActiveConstraints(sessionId) {
    // This would typically query the constraint configuration
    // For now, return commonly active constraints
    return [
      { id: 'unauthorized-commit', description: 'Ask permission before git operations' },
      { id: 'no-console-log', description: 'Use Logger.log() instead of console.log' },
      { id: 'excessive-exploration', description: 'Focus file reads on relevant files' }
    ];
  }

  getRecentViolations(sessionId, limit = 5) {
    return Array.from(this.interventionHistory.values())
      .filter(entry => entry.sessionId === sessionId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(entry => ({
        constraintId: entry.violations[0]?.constraintId || 'unknown',
        timestamp: entry.timestamp,
        resolution: entry.result.correction?.guidance || null
      }));
  }

  generateViolationId() {
    return 'violation-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Get system statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    
    return {
      uptime,
      interventionsMade: this.stats.interventionsMade,
      violationsBlocked: this.stats.violationsBlocked,
      risksDetected: this.stats.risksDetected,
      contextInjections: this.stats.contextInjections,
      violationQueueSize: this.getViolationQueue().length,
      activeSessions: this.sessionStats.size,
      interventionRate: uptime > 0 ? (this.stats.interventionsMade / (uptime / 1000 / 60)).toFixed(2) : 0 // per minute
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      healthy: this.config.interventionEnabled,
      violationQueueSize: this.getViolationQueue().length,
      activeSessions: this.sessionStats.size,
      stats: this.getStats()
    };
  }
}

/**
 * Risk assessment component
 */
class RiskAssessor {
  constructor(config = {}) {
    this.config = {
      factors: [
        { type: 'file_deletion', weight: 0.8, patterns: ['rm', 'delete', 'remove'] },
        { type: 'network_access', weight: 0.5, patterns: ['curl', 'wget', 'fetch', 'http'] },
        { type: 'system_modification', weight: 0.9, patterns: ['sudo', 'chmod', 'chown'] },
        { type: 'large_operation', weight: 0.3, threshold: 1000 }
      ],
      ...config
    };
  }

  async calculateRisk(event, context) {
    const factors = [];
    const content = event.content || '';
    
    // Check each risk factor
    for (const factor of this.config.factors) {
      if (factor.patterns) {
        const hasPattern = factor.patterns.some(pattern => 
          new RegExp(pattern, 'i').test(content)
        );
        
        if (hasPattern) {
          factors.push({
            type: factor.type,
            weight: factor.weight,
            reason: `${factor.type.replace('_', ' ')} detected`
          });
        }
      }
      
      if (factor.type === 'large_operation' && content.length > factor.threshold) {
        factors.push({
          type: factor.type,
          weight: factor.weight,
          reason: `Large operation detected (${content.length} characters)`
        });
      }
    }
    
    // Calculate overall risk score
    const score = Math.min(1.0, factors.reduce((sum, factor) => sum + factor.weight, 0));
    
    return {
      score,
      factors,
      recommendation: this.getRecommendation(score, factors),
      alternatives: this.getAlternatives(factors)
    };
  }

  getRecommendation(score, factors) {
    if (score > 0.8) {
      return 'High risk operation - strongly recommend user approval';
    } else if (score > 0.5) {
      return 'Medium risk operation - consider asking user';
    } else if (score > 0.2) {
      return 'Low risk operation - proceed with caution';
    } else {
      return 'Low risk operation';
    }
  }

  getAlternatives(factors) {
    const alternatives = [];
    
    for (const factor of factors) {
      switch (factor.type) {
        case 'file_deletion':
          alternatives.push('Create backup before deletion');
          alternatives.push('Use --dry-run to preview changes');
          break;
        case 'network_access':
          alternatives.push('Verify destination URL with user');
          alternatives.push('Use local alternatives if available');
          break;
        case 'system_modification':
          alternatives.push('Ask for explicit permission');
          alternatives.push('Explain necessity of system access');
          break;
        case 'large_operation':
          alternatives.push('Break into smaller operations');
          alternatives.push('Provide progress updates');
          break;
      }
    }
    
    return [...new Set(alternatives)].slice(0, 3); // Unique alternatives, max 3
  }
}