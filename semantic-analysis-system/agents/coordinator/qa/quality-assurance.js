/**
 * Quality Assurance Module for Coordinator Agent
 * Performs comprehensive quality checks on agent outputs and workflows
 */

import { Logger } from '../../../shared/logger.js';

export class QualityAssurance {
  constructor(config = {}) {
    this.logger = new Logger('coordinator-qa');
    this.config = {
      validationLevel: config.validationLevel || 'strict', // strict, moderate, lenient
      autoCorrect: config.autoCorrect || false,
      reportingEnabled: config.reportingEnabled || true,
      thresholds: {
        minSignificance: config.thresholds?.minSignificance || 5,
        minConfidence: config.thresholds?.minConfidence || 0.7,
        maxErrors: config.thresholds?.maxErrors || 3,
        completenessRatio: config.thresholds?.completenessRatio || 0.8
      },
      ...config
    };
    
    this.qualityMetrics = new Map();
    this.validationRules = this.initializeValidationRules();
  }

  initializeValidationRules() {
    return {
      // Agent output validation rules
      semanticAnalysis: {
        required: ['patterns', 'insights', 'significance'],
        optional: ['recommendations', 'references'],
        validators: {
          patterns: this.validatePatterns.bind(this),
          insights: this.validateInsights.bind(this),
          significance: this.validateSignificance.bind(this)
        }
      },
      
      knowledgeGraph: {
        required: ['entity', 'entityType', 'observations'],
        optional: ['relations', 'metadata'],
        validators: {
          entity: this.validateEntity.bind(this),
          relations: this.validateRelations.bind(this),
          observations: this.validateObservations.bind(this)
        }
      },
      
      webSearch: {
        required: ['results', 'query', 'relevance'],
        optional: ['sources', 'timestamp'],
        validators: {
          results: this.validateSearchResults.bind(this),
          relevance: this.validateRelevance.bind(this)
        }
      },
      
      synchronization: {
        required: ['status', 'synced', 'conflicts'],
        optional: ['versions', 'checksums'],
        validators: {
          status: this.validateSyncStatus.bind(this),
          conflicts: this.validateConflicts.bind(this)
        }
      },
      
      deduplication: {
        required: ['duplicates', 'similarity', 'recommendations'],
        optional: ['embeddings', 'mergeStrategy'],
        validators: {
          duplicates: this.validateDuplicates.bind(this),
          similarity: this.validateSimilarity.bind(this)
        }
      }
    };
  }

  /**
   * Perform quality assurance on agent output
   */
  async validateAgentOutput(agentId, output, context = {}) {
    const report = {
      agentId,
      timestamp: new Date().toISOString(),
      validationLevel: this.config.validationLevel,
      passed: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metrics: {}
    };

    try {
      // Get validation rules for the agent
      const rules = this.validationRules[agentId];
      if (!rules) {
        this.logger.warn(`No validation rules defined for agent: ${agentId}`);
        return report;
      }

      // Check required fields
      for (const field of rules.required) {
        if (!output[field]) {
          report.errors.push({
            type: 'missing_required_field',
            field,
            message: `Required field '${field}' is missing`
          });
          report.passed = false;
        }
      }

      // Validate field contents
      for (const [field, validator] of Object.entries(rules.validators)) {
        if (output[field] !== undefined) {
          const validation = await validator(output[field], context);
          if (!validation.valid) {
            if (validation.severity === 'error') {
              report.errors.push(validation);
              report.passed = false;
            } else if (validation.severity === 'warning') {
              report.warnings.push(validation);
            } else {
              report.suggestions.push(validation);
            }
          }
          if (validation.metrics) {
            Object.assign(report.metrics, validation.metrics);
          }
        }
      }

      // Perform cross-field validation
      const crossValidation = await this.performCrossFieldValidation(agentId, output, context);
      if (crossValidation.errors.length > 0) {
        report.errors.push(...crossValidation.errors);
        report.passed = false;
      }
      report.warnings.push(...crossValidation.warnings);
      report.suggestions.push(...crossValidation.suggestions);

      // Calculate quality score
      report.qualityScore = this.calculateQualityScore(report);

      // Store metrics for trending
      this.updateQualityMetrics(agentId, report);

      // Auto-correct if enabled and possible
      if (this.config.autoCorrect && !report.passed) {
        const corrected = await this.attemptAutoCorrection(agentId, output, report);
        if (corrected.success) {
          report.corrected = true;
          report.correctedOutput = corrected.output;
          report.corrections = corrected.corrections;
        }
      }

    } catch (error) {
      this.logger.error(`Quality assurance failed for ${agentId}:`, error);
      report.errors.push({
        type: 'validation_error',
        message: error.message
      });
      report.passed = false;
    }

    return report;
  }

  /**
   * Validate workflow execution quality
   */
  async validateWorkflow(workflowId, steps, results, context = {}) {
    const report = {
      workflowId,
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: [],
      stepReports: [],
      metrics: {
        totalSteps: steps.length,
        successfulSteps: 0,
        failedSteps: 0,
        duration: 0,
        dataCompleteness: 0
      }
    };

    try {
      // Validate each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepResult = results[i];
        
        const stepReport = await this.validateWorkflowStep(step, stepResult, i, context);
        report.stepReports.push(stepReport);
        
        if (!stepReport.passed) {
          report.errors.push({
            step: i,
            agent: step.agent,
            errors: stepReport.errors
          });
          report.metrics.failedSteps++;
        } else {
          report.metrics.successfulSteps++;
        }
      }

      // Validate workflow completeness
      const completeness = await this.validateWorkflowCompleteness(steps, results);
      report.metrics.dataCompleteness = completeness.score;
      
      if (completeness.score < this.config.thresholds.completenessRatio) {
        report.warnings.push({
          type: 'incomplete_workflow',
          message: `Workflow completeness (${completeness.score}) below threshold (${this.config.thresholds.completenessRatio})`,
          details: completeness.missing
        });
      }

      // Validate workflow coherence
      const coherence = await this.validateWorkflowCoherence(steps, results);
      if (!coherence.valid) {
        report.errors.push(...coherence.errors);
        report.passed = false;
      }

      // Calculate overall workflow quality
      report.qualityScore = this.calculateWorkflowQualityScore(report);
      report.passed = report.errors.length === 0 && 
                     report.qualityScore >= this.config.thresholds.minConfidence;

    } catch (error) {
      this.logger.error(`Workflow validation failed for ${workflowId}:`, error);
      report.errors.push({
        type: 'workflow_validation_error',
        message: error.message
      });
      report.passed = false;
    }

    return report;
  }

  /**
   * Pattern validation
   */
  async validatePatterns(patterns, context) {
    const validation = {
      valid: true,
      severity: 'info',
      metrics: {
        patternCount: patterns.length,
        avgSignificance: 0
      }
    };

    if (!Array.isArray(patterns)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_type',
        field: 'patterns',
        message: 'Patterns must be an array'
      };
    }

    if (patterns.length === 0) {
      return {
        valid: false,
        severity: 'warning',
        type: 'empty_patterns',
        field: 'patterns',
        message: 'No patterns identified'
      };
    }

    let totalSignificance = 0;
    for (const pattern of patterns) {
      if (!pattern.name || !pattern.type) {
        validation.valid = false;
        validation.severity = 'error';
        validation.message = 'Pattern missing required fields (name, type)';
        break;
      }
      
      if (pattern.significance) {
        totalSignificance += pattern.significance;
      }
    }

    validation.metrics.avgSignificance = totalSignificance / patterns.length;
    
    if (validation.metrics.avgSignificance < this.config.thresholds.minSignificance) {
      validation.severity = 'warning';
      validation.message = `Average pattern significance (${validation.metrics.avgSignificance}) below threshold`;
    }

    return validation;
  }

  /**
   * Entity validation
   */
  async validateEntity(entity, context) {
    const validation = {
      valid: true,
      severity: 'info'
    };

    // Check entity structure
    if (!entity.name || entity.name.trim().length === 0) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_entity_name',
        field: 'entity.name',
        message: 'Entity name is required and cannot be empty'
      };
    }

    // Check entity name length
    if (entity.name.length > 200) {
      return {
        valid: false,
        severity: 'error',
        type: 'entity_name_too_long',
        field: 'entity.name',
        message: 'Entity name exceeds maximum length (200 characters)'
      };
    }

    // Check for valid entity type
    const validTypes = ['Pattern', 'TransferablePattern', 'Insight', 'Documentation', 
                       'ArchitecturalPattern', 'DesignPattern', 'AntiPattern'];
    
    if (entity.entityType && !validTypes.includes(entity.entityType)) {
      validation.severity = 'warning';
      validation.message = `Unknown entity type: ${entity.entityType}`;
    }

    return validation;
  }

  /**
   * Relations validation
   */
  async validateRelations(relations, context) {
    const validation = {
      valid: true,
      severity: 'info',
      metrics: {
        relationCount: 0,
        missingRelations: []
      }
    };

    if (!Array.isArray(relations)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_relations_type',
        field: 'relations',
        message: 'Relations must be an array'
      };
    }

    validation.metrics.relationCount = relations.length;

    // Check for required relations
    const requiredRelations = ['CollectiveKnowledge'];
    const foundRelations = relations.map(r => r.to || r.target);
    
    for (const required of requiredRelations) {
      if (!foundRelations.includes(required)) {
        validation.metrics.missingRelations.push(required);
      }
    }

    if (validation.metrics.missingRelations.length > 0) {
      validation.severity = 'warning';
      validation.message = `Missing required relations: ${validation.metrics.missingRelations.join(', ')}`;
    }

    return validation;
  }

  /**
   * Cross-field validation
   */
  async performCrossFieldValidation(agentId, output, context) {
    const result = {
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Agent-specific cross-field validations
    switch (agentId) {
      case 'semanticAnalysis':
        // Check if patterns and insights are coherent
        if (output.patterns && output.insights) {
          if (output.patterns.length > 0 && output.insights.length === 0) {
            result.warnings.push({
              type: 'missing_insights',
              message: 'Patterns identified but no insights generated'
            });
          }
        }
        break;

      case 'knowledgeGraph':
        // Check if entity has proper metadata
        if (output.entity && !output.entity.metadata?.team) {
          result.suggestions.push({
            type: 'missing_team_metadata',
            message: 'Entity should include team metadata for better organization'
          });
        }
        break;

      case 'deduplication':
        // Check if high similarity items have merge recommendations
        if (output.duplicates && output.similarity > 0.9 && !output.recommendations) {
          result.warnings.push({
            type: 'missing_merge_recommendation',
            message: 'High similarity detected but no merge recommendation provided'
          });
        }
        break;
    }

    return result;
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore(report) {
    let score = 100;
    
    // Deduct points for errors
    score -= report.errors.length * 20;
    
    // Deduct points for warnings
    score -= report.warnings.length * 5;
    
    // Bonus for following suggestions
    score += Math.min(report.suggestions.length * 2, 10);
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Attempt auto-correction
   */
  async attemptAutoCorrection(agentId, output, report) {
    const corrected = {
      success: false,
      output: { ...output },
      corrections: []
    };

    try {
      // Apply agent-specific corrections
      switch (agentId) {
        case 'knowledgeGraph':
          // Add missing required relations
          if (report.errors.some(e => e.type === 'missing_required_relations')) {
            corrected.output.relations = corrected.output.relations || [];
            corrected.output.relations.push({
              from: output.entity.name,
              to: 'CollectiveKnowledge',
              type: 'contains'
            });
            corrected.corrections.push('Added required relation to CollectiveKnowledge');
            corrected.success = true;
          }
          break;

        case 'semanticAnalysis':
          // Add default significance if missing
          if (report.errors.some(e => e.field === 'significance')) {
            corrected.output.significance = this.config.thresholds.minSignificance;
            corrected.corrections.push(`Set default significance to ${this.config.thresholds.minSignificance}`);
            corrected.success = true;
          }
          break;
      }
    } catch (error) {
      this.logger.error('Auto-correction failed:', error);
    }

    return corrected;
  }

  /**
   * Update quality metrics for trending
   */
  updateQualityMetrics(agentId, report) {
    if (!this.qualityMetrics.has(agentId)) {
      this.qualityMetrics.set(agentId, {
        totalValidations: 0,
        passed: 0,
        failed: 0,
        totalScore: 0,
        errors: new Map(),
        warnings: new Map()
      });
    }

    const metrics = this.qualityMetrics.get(agentId);
    metrics.totalValidations++;
    
    if (report.passed) {
      metrics.passed++;
    } else {
      metrics.failed++;
    }
    
    metrics.totalScore += report.qualityScore || 0;
    
    // Track error types
    for (const error of report.errors) {
      const count = metrics.errors.get(error.type) || 0;
      metrics.errors.set(error.type, count + 1);
    }
    
    // Track warning types
    for (const warning of report.warnings) {
      const count = metrics.warnings.get(warning.type) || 0;
      metrics.warnings.set(warning.type, count + 1);
    }
  }

  /**
   * Generate quality report
   */
  generateQualityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      agents: {}
    };

    for (const [agentId, metrics] of this.qualityMetrics) {
      report.agents[agentId] = {
        totalValidations: metrics.totalValidations,
        passRate: metrics.totalValidations > 0 ? metrics.passed / metrics.totalValidations : 0,
        averageScore: metrics.totalValidations > 0 ? metrics.totalScore / metrics.totalValidations : 0,
        topErrors: Array.from(metrics.errors.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        topWarnings: Array.from(metrics.warnings.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      };
    }

    return report;
  }

  // Additional validation methods...
  
  async validateInsights(insights, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (!Array.isArray(insights)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_insights_type',
        message: 'Insights must be an array'
      };
    }
    
    if (insights.length === 0) {
      validation.severity = 'warning';
      validation.message = 'No insights generated';
    }
    
    return validation;
  }

  async validateSignificance(significance, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (typeof significance !== 'number') {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_significance_type',
        message: 'Significance must be a number'
      };
    }
    
    if (significance < 1 || significance > 10) {
      return {
        valid: false,
        severity: 'error',
        type: 'significance_out_of_range',
        message: 'Significance must be between 1 and 10'
      };
    }
    
    return validation;
  }

  async validateSearchResults(results, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (!Array.isArray(results)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_results_type',
        message: 'Search results must be an array'
      };
    }
    
    return validation;
  }

  async validateRelevance(relevance, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (typeof relevance !== 'number' || relevance < 0 || relevance > 1) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_relevance',
        message: 'Relevance must be a number between 0 and 1'
      };
    }
    
    return validation;
  }

  async validateObservations(observations, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (!Array.isArray(observations)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_observations_type',
        message: 'Observations must be an array'
      };
    }
    
    if (observations.length === 0) {
      return {
        valid: false,
        severity: 'error',
        type: 'empty_observations',
        message: 'At least one observation is required'
      };
    }
    
    return validation;
  }

  async validateSyncStatus(status, context) {
    const validation = { valid: true, severity: 'info' };
    
    const validStatuses = ['synced', 'syncing', 'failed', 'conflict'];
    if (!validStatuses.includes(status)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_sync_status',
        message: `Invalid sync status: ${status}`
      };
    }
    
    return validation;
  }

  async validateConflicts(conflicts, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (!Array.isArray(conflicts)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_conflicts_type',
        message: 'Conflicts must be an array'
      };
    }
    
    if (conflicts.length > 0) {
      validation.severity = 'warning';
      validation.message = `${conflicts.length} conflicts detected`;
    }
    
    return validation;
  }

  async validateDuplicates(duplicates, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (!Array.isArray(duplicates)) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_duplicates_type',
        message: 'Duplicates must be an array'
      };
    }
    
    return validation;
  }

  async validateSimilarity(similarity, context) {
    const validation = { valid: true, severity: 'info' };
    
    if (typeof similarity !== 'number' || similarity < 0 || similarity > 1) {
      return {
        valid: false,
        severity: 'error',
        type: 'invalid_similarity',
        message: 'Similarity must be a number between 0 and 1'
      };
    }
    
    return validation;
  }

  async validateWorkflowStep(step, result, index, context) {
    const stepReport = {
      step: index,
      agent: step.agent,
      passed: true,
      errors: [],
      warnings: []
    };

    if (!result) {
      stepReport.passed = false;
      stepReport.errors.push({
        type: 'missing_result',
        message: `No result for step ${index}`
      });
      return stepReport;
    }

    if (result.error) {
      stepReport.passed = false;
      stepReport.errors.push({
        type: 'step_error',
        message: result.error.message || 'Step execution failed'
      });
      return stepReport;
    }

    // Validate step output based on agent
    const agentValidation = await this.validateAgentOutput(step.agent, result.output || result, context);
    
    if (!agentValidation.passed) {
      stepReport.passed = false;
      stepReport.errors.push(...agentValidation.errors);
    }
    
    stepReport.warnings.push(...agentValidation.warnings);
    
    return stepReport;
  }

  async validateWorkflowCompleteness(steps, results) {
    const completeness = {
      score: 0,
      missing: []
    };

    const totalSteps = steps.length;
    let completedSteps = 0;

    for (let i = 0; i < steps.length; i++) {
      if (results[i] && !results[i].error) {
        completedSteps++;
      } else {
        completeness.missing.push({
          step: i,
          agent: steps[i].agent,
          reason: results[i]?.error?.message || 'No result'
        });
      }
    }

    completeness.score = totalSteps > 0 ? completedSteps / totalSteps : 0;
    
    return completeness;
  }

  async validateWorkflowCoherence(steps, results) {
    const coherence = {
      valid: true,
      errors: []
    };

    // Check if data flows properly between steps
    for (let i = 1; i < steps.length; i++) {
      const currentStep = steps[i];
      const previousResult = results[i - 1];
      
      // Check if current step dependencies are met
      if (currentStep.requires && previousResult) {
        for (const requirement of currentStep.requires) {
          if (!previousResult[requirement]) {
            coherence.valid = false;
            coherence.errors.push({
              type: 'missing_dependency',
              step: i,
              message: `Step ${i} requires '${requirement}' from previous step`
            });
          }
        }
      }
    }

    return coherence;
  }

  calculateWorkflowQualityScore(report) {
    let score = 100;
    
    // Base score on step success rate
    const successRate = report.metrics.successfulSteps / report.metrics.totalSteps;
    score = score * successRate;
    
    // Deduct for errors
    score -= report.errors.length * 10;
    
    // Deduct for warnings
    score -= report.warnings.length * 2;
    
    // Factor in data completeness
    score = score * report.metrics.dataCompleteness;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}