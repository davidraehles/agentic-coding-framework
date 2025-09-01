#!/usr/bin/env node

/**
 * Claude Code Pre-Hook: Action Interceptor
 * 
 * This pre-hook checks for constraint violations before Claude Code executes actions.
 * If violations are found, it blocks the action and provides guidance.
 * 
 * Usage in Claude Code hooks configuration:
 * {
 *   "pre-tool-use": {
 *     "command": "node",
 *     "args": ["./integrations/constraint-monitor/hooks/pre-action-interceptor.js"],
 *     "captureInput": true
 *   }
 * }
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class PreActionInterceptor {
  constructor() {
    this.config = this.loadConfig();
    this.violationQueuePath = join(__dirname, '../data/violation-queue.json');
    this.contextCachePath = join(__dirname, '../data/context-cache.json');
  }

  loadConfig() {
    try {
      const configPath = join(__dirname, '../config/hooks.json');
      if (existsSync(configPath)) {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        return config.preHook || {};
      }
    } catch (error) {
      // Use default config
    }

    return {
      enabled: true,
      blockOnViolations: true,
      checkViolationQueue: true,
      performRiskAssessment: true,
      processorEndpoint: 'http://localhost:8767/api/pre-check',
      timeout: 2000, // 2 second timeout for real-time response
      fallbackMode: 'warn' // 'block', 'warn', or 'allow'
    };
  }

  async processPreHook() {
    if (!this.config.enabled) {
      this.exitSuccess();
      return;
    }

    try {
      // Read input from Claude Code
      const input = await this.readStdin();
      const actionData = input ? JSON.parse(input) : {};
      
      // Check violation queue first (fastest check)
      const queuedViolations = this.checkViolationQueue();
      if (queuedViolations.length > 0) {
        this.blockWithViolations(queuedViolations);
        return;
      }

      // Perform real-time constraint check
      const constraintResult = await this.checkConstraints(actionData);
      if (constraintResult.shouldBlock) {
        this.blockWithMessage(constraintResult.message, constraintResult.suggestions);
        return;
      }

      // Perform risk assessment
      if (this.config.performRiskAssessment) {
        const riskResult = await this.assessRisk(actionData);
        if (riskResult.highRisk) {
          this.warnWithRisk(riskResult.message, riskResult.alternatives);
          return;
        }
      }

      // No issues found - allow action to proceed
      this.exitSuccess();
    } catch (error) {
      this.logError(error);
      this.handleError(error);
    }
  }

  async readStdin() {
    return new Promise((resolve) => {
      let data = '';
      
      if (process.stdin.isTTY) {
        resolve('');
        return;
      }

      process.stdin.setEncoding('utf8');
      
      process.stdin.on('data', (chunk) => {
        data += chunk;
      });
      
      process.stdin.on('end', () => {
        resolve(data.trim());
      });
      
      // Quick timeout for real-time response
      setTimeout(() => {
        resolve(data.trim());
      }, 500);
    });
  }

  checkViolationQueue() {
    try {
      if (!existsSync(this.violationQueuePath)) {
        return [];
      }

      const queueData = JSON.parse(readFileSync(this.violationQueuePath, 'utf8'));
      
      // Return only unresolved violations
      return queueData.violations?.filter(v => !v.resolved) || [];
    } catch (error) {
      this.logError('Failed to check violation queue:', error);
      return [];
    }
  }

  async checkConstraints(actionData) {
    try {
      // Fast local constraint checks first
      const localResult = this.performLocalConstraintChecks(actionData);
      if (localResult.shouldBlock) {
        return localResult;
      }

      // If processor is available, do full semantic check
      if (this.config.processorEndpoint) {
        return await this.performRemoteConstraintCheck(actionData);
      }

      return { shouldBlock: false };
    } catch (error) {
      this.logError('Constraint check failed:', error);
      return this.getFallbackResult();
    }
  }

  performLocalConstraintChecks(actionData) {
    const tool = actionData.tool || actionData.toolName || '';
    const input = JSON.stringify(actionData.input || actionData.args || {});
    
    // High-priority constraint checks that can be done locally
    const localChecks = [
      {
        id: 'unauthorized-git-ops',
        pattern: /git\s+(commit|push|merge|rebase)/i,
        message: 'Git operations require explicit permission. Ask the user before committing changes.',
        severity: 'critical'
      },
      {
        id: 'destructive-file-ops', 
        pattern: /rm\s+-rf|delete|remove/i,
        message: 'Destructive file operations detected. Confirm with user before proceeding.',
        severity: 'critical'
      },
      {
        id: 'network-operations',
        pattern: /curl|wget|fetch|http/i,
        tools: ['Bash'],
        message: 'Network operations require user awareness for security.',
        severity: 'warning'
      },
      {
        id: 'system-modifications',
        pattern: /sudo|chmod\s+777|chown/i,
        message: 'System-level modifications detected. Ensure user approval.',
        severity: 'critical'
      }
    ];

    for (const check of localChecks) {
      let shouldTrigger = false;

      // Check pattern in input
      if (check.pattern && check.pattern.test(input)) {
        shouldTrigger = true;
      }

      // Check tool-specific rules
      if (check.tools && check.tools.includes(tool) && check.pattern?.test(input)) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        return {
          shouldBlock: check.severity === 'critical',
          message: check.message,
          suggestions: this.getSuggestionsForConstraint(check.id),
          constraintId: check.id,
          severity: check.severity
        };
      }
    }

    return { shouldBlock: false };
  }

  async performRemoteConstraintCheck(actionData) {
    try {
      const { default: fetch } = await import('node-fetch');
      
      const response = await fetch(this.config.processorEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: actionData,
          timestamp: Date.now(),
          checkType: 'pre-action'
        }),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      this.logError('Remote constraint check failed:', error);
      return this.getFallbackResult();
    }
  }

  async assessRisk(actionData) {
    try {
      // Quick local risk assessment based on action patterns
      const riskFactors = this.calculateRiskFactors(actionData);
      const riskScore = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);
      
      if (riskScore > 0.7) {
        return {
          highRisk: true,
          message: `High-risk action detected (score: ${riskScore.toFixed(2)})`,
          alternatives: this.suggestAlternatives(actionData, riskFactors),
          riskFactors
        };
      }

      return { highRisk: false };
    } catch (error) {
      this.logError('Risk assessment failed:', error);
      return { highRisk: false };
    }
  }

  calculateRiskFactors(actionData) {
    const factors = [];
    const tool = actionData.tool || '';
    const input = JSON.stringify(actionData.input || {});

    // File system risks
    if (tool === 'Bash' && /rm|delete/i.test(input)) {
      factors.push({ type: 'file_deletion', weight: 0.8, message: 'File deletion detected' });
    }

    // Network risks  
    if (/curl|wget|fetch/i.test(input)) {
      factors.push({ type: 'network_access', weight: 0.5, message: 'Network access detected' });
    }

    // System modification risks
    if (/sudo|chmod|chown/i.test(input)) {
      factors.push({ type: 'system_modification', weight: 0.9, message: 'System modification detected' });
    }

    // Large operations
    if (input.length > 1000) {
      factors.push({ type: 'large_operation', weight: 0.3, message: 'Large operation detected' });
    }

    return factors;
  }

  suggestAlternatives(actionData, riskFactors) {
    const alternatives = [];

    for (const factor of riskFactors) {
      switch (factor.type) {
        case 'file_deletion':
          alternatives.push('Consider moving files to a backup location first');
          alternatives.push('Use --dry-run flag to preview changes');
          break;
        case 'network_access':
          alternatives.push('Verify the destination URL with the user');
          alternatives.push('Consider using a safer method if available');
          break;
        case 'system_modification':
          alternatives.push('Ask for explicit permission before system changes');
          alternatives.push('Explain the necessity of system-level access');
          break;
      }
    }

    return alternatives.slice(0, 3); // Limit to top 3 suggestions
  }

  getSuggestionsForConstraint(constraintId) {
    const suggestions = {
      'unauthorized-git-ops': [
        'Ask the user: "Should I commit these changes?"',
        'Explain what changes will be committed before proceeding',
        'Consider using --dry-run to preview git operations'
      ],
      'destructive-file-ops': [
        'Confirm the specific files to be deleted with the user',
        'Suggest creating a backup before deletion',
        'Use --interactive flag for step-by-step confirmation'
      ],
      'network-operations': [
        'Inform the user about the network request being made',
        'Verify the destination URL is expected and safe',
        'Ask permission for external network access'
      ],
      'system-modifications': [
        'Explain why system-level access is needed',
        'Ask for explicit permission for system changes',
        'Suggest less privileged alternatives if available'
      ]
    };

    return suggestions[constraintId] || [
      'Ask the user for permission before proceeding',
      'Explain what the action will do and why',
      'Consider if there\'s a safer alternative approach'
    ];
  }

  getFallbackResult() {
    switch (this.config.fallbackMode) {
      case 'block':
        return {
          shouldBlock: true,
          message: 'Constraint monitoring service unavailable. Blocking action as precaution.',
          suggestions: ['Try again in a moment', 'Check constraint monitor service status']
        };
      case 'warn':
        return {
          shouldBlock: false,
          message: 'Warning: Constraint monitoring service unavailable.',
          suggestions: []
        };
      default: // 'allow'
        return { shouldBlock: false };
    }
  }

  blockWithViolations(violations) {
    const blockMessage = {
      blocked: true,
      reason: 'Active constraint violations detected',
      violations: violations.map(v => ({
        type: v.constraintId,
        message: v.message,
        severity: v.severity
      })),
      suggestions: [
        'Address the constraint violations before proceeding',
        'Ask the user for guidance on resolving the violations',
        'Check the constraint monitor dashboard for details'
      ]
    };

    console.error(JSON.stringify(blockMessage, null, 2));
    process.exit(1);
  }

  blockWithMessage(message, suggestions = []) {
    const blockMessage = {
      blocked: true,
      reason: message,
      suggestions: suggestions.length > 0 ? suggestions : [
        'Ask the user for permission to proceed',
        'Explain what the action will do and why it\'s needed',
        'Consider alternative approaches that avoid this constraint'
      ]
    };

    console.error(JSON.stringify(blockMessage, null, 2));
    process.exit(1);
  }

  warnWithRisk(message, alternatives = []) {
    const warningMessage = {
      blocked: false,
      warning: true,
      message: message,
      alternatives: alternatives,
      addedContext: `⚠️ HIGH RISK: ${message}. Consider: ${alternatives.slice(0, 2).join(', ')}`
    };

    console.log(JSON.stringify(warningMessage, null, 2));
    process.exit(0);
  }

  exitSuccess() {
    // No output = success for Claude Code pre-hooks
    process.exit(0);
  }

  handleError(error) {
    this.logError('Pre-hook error:', error);
    
    // Use fallback behavior on error
    const fallbackResult = this.getFallbackResult();
    if (fallbackResult.shouldBlock) {
      this.blockWithMessage(fallbackResult.message, fallbackResult.suggestions);
    } else {
      this.exitSuccess();
    }
  }

  logError(message, error) {
    try {
      const errorLog = {
        timestamp: Date.now(),
        type: 'pre-hook-error',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        error: error ? (error.message || error.toString()) : undefined,
        stack: error?.stack
      };

      const errorPath = join(__dirname, '../logs/hook-errors.jsonl');
      const fs = await import('fs');
      fs.appendFileSync(errorPath, JSON.stringify(errorLog) + '\n', 'utf8');
    } catch (logError) {
      // Can't log the error - continue silently
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// Set timeout to prevent hanging (critical for pre-hooks)
setTimeout(() => {
  process.exit(0);
}, 5000); // 5 second absolute timeout

// Run the interceptor
const interceptor = new PreActionInterceptor();
interceptor.processPreHook().catch(() => {
  // Exit gracefully even on error to avoid blocking Claude Code
  process.exit(0);
});