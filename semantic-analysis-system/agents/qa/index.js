/**
 * QA Agent - Quality Assurance and Validation
 * Validates completeness, checks links, ensures structure integrity
 */

import { BaseAgent } from '../../framework/base-agent.js';
import { Logger } from '../../shared/logger.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export class QAAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: 'qa',
      name: 'Quality Assurance Agent',
      description: 'Validates completeness and quality of semantic analysis output',
      ...config
    });
    
    this.logger = new Logger('qa-agent');
    this.validationRules = {
      entityStructure: true,
      documentationLinks: true,
      fileExistence: true,
      contentQuality: true,
      namingConsistency: true
    };
  }

  async initialize() {
    await super.initialize();
    this.logger.info('QA Agent initialized');
  }

  /**
   * RPC Methods
   */
  async validateCompleteness(params) {
    const { entities, documentationFiles, plantUMLFiles, expectedTotal } = params;
    
    this.logger.info(`Starting completeness validation for ${entities?.length || 0} entities`);
    
    const report = {
      totalEntities: entities?.length || 0,
      expectedTotal: expectedTotal || 0,
      validationResults: {},
      missingDocumentation: [],
      brokenLinks: [],
      structureIssues: [],
      namingIssues: [],
      qualityScore: 0,
      completionPercentage: 0
    };

    try {
      // Validate entity structure
      report.validationResults.entityStructure = await this.validateEntityStructure(entities);
      
      // Check documentation links
      report.validationResults.documentationLinks = await this.validateDocumentationLinks(entities);
      
      // Verify file existence
      report.validationResults.fileExistence = await this.validateFileExistence(
        documentationFiles || [], 
        plantUMLFiles || []
      );
      
      // Check naming consistency
      report.validationResults.namingConsistency = await this.validateNamingConsistency(entities);
      
      // Calculate completion percentage
      report.completionPercentage = this.calculateCompletionPercentage(report);
      report.qualityScore = this.calculateQualityScore(report);
      
      this.logger.info(`Validation completed: ${report.completionPercentage}% complete, quality score: ${report.qualityScore}`);
      
      return { validationReport: report };
      
    } catch (error) {
      this.logger.error('Validation failed:', error);
      throw error;
    }
  }

  async finalCompletionCheck(params) {
    const { entities, validationReport, deduplicationReport, syncReport } = params;
    
    this.logger.info('Performing final completion check');
    
    const completionReport = {
      overallStatus: 'pending',
      completionPercentage: 0,
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      remainingTasks: [],
      summary: {}
    };

    try {
      // Check validation results
      if (validationReport) {
        completionReport.completionPercentage = validationReport.completionPercentage;
        if (validationReport.qualityScore < 80) {
          completionReport.criticalIssues.push('Quality score below threshold (80%)');
        }
        if (validationReport.missingDocumentation?.length > 0) {
          completionReport.remainingTasks.push(`Generate ${validationReport.missingDocumentation.length} missing documentation files`);
        }
        if (validationReport.brokenLinks?.length > 0) {
          completionReport.warnings.push(`${validationReport.brokenLinks.length} broken links found`);
        }
      }

      // Check deduplication results
      if (deduplicationReport) {
        if (deduplicationReport.duplicatesRemoved > 0) {
          completionReport.summary.duplicatesRemoved = deduplicationReport.duplicatesRemoved;
        }
        if (deduplicationReport.potentialDuplicates?.length > 0) {
          completionReport.warnings.push(`${deduplicationReport.potentialDuplicates.length} potential duplicates need manual review`);
        }
      }

      // Check sync results
      if (syncReport) {
        if (syncReport.errors?.length > 0) {
          completionReport.criticalIssues.push('Synchronization errors detected');
        }
        completionReport.summary.syncStatus = syncReport.status;
      }

      // Determine overall status
      if (completionReport.criticalIssues.length === 0 && completionReport.completionPercentage >= 95) {
        completionReport.overallStatus = 'completed';
      } else if (completionReport.completionPercentage >= 80) {
        completionReport.overallStatus = 'mostly-complete';
      } else {
        completionReport.overallStatus = 'incomplete';
      }

      // Generate recommendations
      completionReport.recommendations = this.generateRecommendations(completionReport);

      this.logger.info(`Final completion check: ${completionReport.overallStatus} (${completionReport.completionPercentage}%)`);
      
      return {
        completionReport,
        completionPercentage: completionReport.completionPercentage,
        remainingTasks: completionReport.remainingTasks
      };
      
    } catch (error) {
      this.logger.error('Final completion check failed:', error);
      throw error;
    }
  }

  /**
   * Validation Methods
   */
  async validateEntityStructure(entities) {
    const results = {
      valid: 0,
      invalid: 0,
      issues: []
    };

    for (const entity of entities || []) {
      const issues = [];
      
      // Check required fields
      if (!entity.name) issues.push('Missing name');
      if (!entity.entityType) issues.push('Missing entityType');
      if (!entity.observations || !Array.isArray(entity.observations)) {
        issues.push('Missing or invalid observations array');
      }

      // Check observations structure
      if (entity.observations) {
        for (let i = 0; i < entity.observations.length; i++) {
          const obs = entity.observations[i];
          if (typeof obs === 'string') {
            // Old format - should be migrated
            issues.push(`Observation ${i} uses old string format (should be structured)`);
          } else if (typeof obs === 'object') {
            if (!obs.type) issues.push(`Observation ${i} missing type`);
            if (!obs.content) issues.push(`Observation ${i} missing content`);
          }
        }
      }

      if (issues.length === 0) {
        results.valid++;
      } else {
        results.invalid++;
        results.issues.push({
          entity: entity.name || 'unnamed',
          issues: issues
        });
      }
    }

    return results;
  }

  async validateDocumentationLinks(entities) {
    const results = {
      entitiesWithLinks: 0,
      entitiesMissingLinks: 0,
      brokenLinks: [],
      validLinks: 0
    };

    for (const entity of entities || []) {
      let hasDocLink = false;
      
      if (entity.observations) {
        for (const obs of entity.observations) {
          const content = typeof obs === 'string' ? obs : obs.content;
          if (content && content.includes('knowledge-management/insights/')) {
            hasDocLink = true;
            
            // Extract and validate the link
            const linkMatch = content.match(/knowledge-management\/insights\/([^)]+)/);
            if (linkMatch) {
              const relativePath = `../knowledge-management/insights/${linkMatch[1]}`;
              if (existsSync(relativePath)) {
                results.validLinks++;
              } else {
                results.brokenLinks.push({
                  entity: entity.name,
                  link: linkMatch[1],
                  path: relativePath
                });
              }
            }
          }
        }
      }

      if (hasDocLink) {
        results.entitiesWithLinks++;
      } else {
        results.entitiesMissingLinks++;
      }
    }

    return results;
  }

  async validateFileExistence(documentationFiles = [], plantUMLFiles = []) {
    const results = {
      documentation: {
        expected: documentationFiles.length,
        existing: 0,
        missing: []
      },
      plantUML: {
        expected: plantUMLFiles.length,
        existing: 0,
        missing: []
      }
    };

    // Check documentation files
    for (const file of documentationFiles) {
      const path = file.startsWith('/') ? file : join('../knowledge-management/insights/', file);
      if (existsSync(path)) {
        results.documentation.existing++;
      } else {
        results.documentation.missing.push(file);
      }
    }

    // Check PlantUML files
    for (const file of plantUMLFiles) {
      const path = file.startsWith('/') ? file : join('../knowledge-management/puml/', file);
      if (existsSync(path)) {
        results.plantUML.existing++;
      } else {
        results.plantUML.missing.push(file);
      }
    }

    return results;
  }

  async validateNamingConsistency(entities) {
    const results = {
      consistent: 0,
      inconsistent: 0,
      issues: []
    };

    const namingPatterns = {
      camelCase: /^[a-z][a-zA-Z0-9]*$/,
      pascalCase: /^[A-Z][a-zA-Z0-9]*$/,
      kebabCase: /^[a-z0-9-]+$/,
      snakeCase: /^[a-z0-9_]+$/
    };

    const entityTypes = {};
    
    // Group entities by type
    for (const entity of entities || []) {
      if (!entityTypes[entity.entityType]) {
        entityTypes[entity.entityType] = [];
      }
      entityTypes[entity.entityType].push(entity.name);
    }

    // Check consistency within each type
    for (const [type, names] of Object.entries(entityTypes)) {
      const patterns = {};
      
      for (const name of names) {
        for (const [patternName, regex] of Object.entries(namingPatterns)) {
          if (regex.test(name)) {
            if (!patterns[patternName]) patterns[patternName] = 0;
            patterns[patternName]++;
          }
        }
      }

      // Determine predominant pattern
      const predominantPattern = Object.keys(patterns).reduce((a, b) => 
        patterns[a] > patterns[b] ? a : b
      );

      // Check for inconsistencies
      for (const name of names) {
        if (!namingPatterns[predominantPattern].test(name)) {
          results.inconsistent++;
          results.issues.push({
            entity: name,
            type: type,
            expected: predominantPattern,
            actual: 'non-conforming'
          });
        } else {
          results.consistent++;
        }
      }
    }

    return results;
  }

  calculateCompletionPercentage(report) {
    const weights = {
      entityStructure: 0.25,
      documentationLinks: 0.35,
      fileExistence: 0.25,
      namingConsistency: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [category, result] of Object.entries(report.validationResults)) {
      if (weights[category]) {
        let categoryScore = 0;
        
        switch (category) {
          case 'entityStructure':
            categoryScore = result.valid / (result.valid + result.invalid) * 100 || 0;
            break;
          case 'documentationLinks':
            categoryScore = result.entitiesWithLinks / (result.entitiesWithLinks + result.entitiesMissingLinks) * 100 || 0;
            break;
          case 'fileExistence':
            const docScore = result.documentation.existing / result.documentation.expected * 100 || 100;
            const pumlScore = result.plantUML.existing / result.plantUML.expected * 100 || 100;
            categoryScore = (docScore + pumlScore) / 2;
            break;
          case 'namingConsistency':
            categoryScore = result.consistent / (result.consistent + result.inconsistent) * 100 || 100;
            break;
        }
        
        totalScore += categoryScore * weights[category];
        totalWeight += weights[category];
      }
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  calculateQualityScore(report) {
    // Quality score based on various factors
    let score = report.completionPercentage || 0;
    
    // Deduct for critical issues
    if (report.brokenLinks?.length > 0) {
      score -= Math.min(report.brokenLinks.length * 2, 20);
    }
    
    if (report.structureIssues?.length > 0) {
      score -= Math.min(report.structureIssues.length * 3, 30);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  generateRecommendations(completionReport) {
    const recommendations = [];

    if (completionReport.completionPercentage < 95) {
      recommendations.push('Complete remaining documentation generation');
    }

    if (completionReport.criticalIssues.length > 0) {
      recommendations.push('Address critical issues before considering workflow complete');
    }

    if (completionReport.warnings.length > 0) {
      recommendations.push('Review and resolve warnings for improved quality');
    }

    if (completionReport.remainingTasks.length === 0 && completionReport.completionPercentage >= 95) {
      recommendations.push('Semantic analysis workflow is ready for completion');
    }

    return recommendations;
  }

  /**
   * MQTT Event Handlers
   */
  async handleEntityCreated(entity) {
    // Validate newly created entities
    const validation = await this.validateEntityStructure([entity]);
    if (validation.invalid > 0) {
      this.logger.warn(`Entity ${entity.name} failed validation:`, validation.issues[0]);
    }
  }

  async handleWorkflowCompleted(workflowData) {
    // Perform post-workflow validation
    this.logger.info('Performing post-workflow validation');
    // Implementation would depend on workflow data structure
  }
}