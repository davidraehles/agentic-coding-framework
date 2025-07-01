/**
 * Document Generator
 * Core component for generating documentation from entities and insights
 */

import { Logger } from '../../../shared/logger.js';

export class DocumentGenerator {
  constructor(config = {}) {
    this.logger = new Logger('document-generator');
    this.config = {
      includeMetadata: config.includeMetadata !== false,
      includeTimestamps: config.includeTimestamps !== false,
      includeReferences: config.includeReferences !== false,
      maxContentLength: config.maxContentLength || 10000,
      ...config
    };
  }

  /**
   * Generate insight documentation
   */
  async generateInsightDoc(insight, options = {}) {
    try {
      const { template, format = 'markdown' } = options;
      
      this.logger.debug(`Generating insight documentation for: ${insight.name}`);
      
      const content = {
        title: insight.name || 'Untitled Insight',
        type: insight.entityType || 'Insight',
        significance: insight.significance || 'Not specified',
        observations: this.extractObservations(insight.observations),
        metadata: this.generateMetadata(insight),
        generated: new Date().toISOString()
      };

      switch (format) {
        case 'markdown':
          return this.generateMarkdownInsight(content);
        case 'html':
          return this.generateHtmlInsight(content);
        case 'json':
          return JSON.stringify(content, null, 2);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
    } catch (error) {
      this.logger.error('Failed to generate insight documentation:', error);
      throw error;
    }
  }

  /**
   * Generate pattern documentation
   */
  async generatePatternDoc(pattern, options = {}) {
    try {
      const { template, format = 'markdown' } = options;
      
      this.logger.debug(`Generating pattern documentation for: ${pattern.name}`);
      
      const content = {
        title: pattern.name || 'Untitled Pattern',
        type: pattern.entityType || 'Pattern',
        description: this.extractDescription(pattern),
        context: this.extractContext(pattern),
        implementation: this.extractImplementation(pattern),
        consequences: this.extractConsequences(pattern),
        observations: this.extractObservations(pattern.observations),
        metadata: this.generateMetadata(pattern),
        generated: new Date().toISOString()
      };

      switch (format) {
        case 'markdown':
          return this.generateMarkdownPattern(content);
        case 'html':
          return this.generateHtmlPattern(content);
        case 'json':
          return JSON.stringify(content, null, 2);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
    } catch (error) {
      this.logger.error('Failed to generate pattern documentation:', error);
      throw error;
    }
  }

  /**
   * Generate workflow documentation
   */
  async generateWorkflowDoc(workflow, options = {}) {
    try {
      const { template, format = 'markdown' } = options;
      
      this.logger.debug(`Generating workflow documentation for: ${workflow.id}`);
      
      const content = {
        title: workflow.name || workflow.id || 'Untitled Workflow',
        id: workflow.id,
        description: workflow.description || 'No description provided',
        steps: this.extractWorkflowSteps(workflow),
        inputs: this.extractWorkflowInputs(workflow),
        outputs: this.extractWorkflowOutputs(workflow),
        dependencies: this.extractWorkflowDependencies(workflow),
        metadata: this.generateWorkflowMetadata(workflow),
        generated: new Date().toISOString()
      };

      switch (format) {
        case 'markdown':
          return this.generateMarkdownWorkflow(content);
        case 'html':
          return this.generateHtmlWorkflow(content);
        case 'json':
          return JSON.stringify(content, null, 2);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
    } catch (error) {
      this.logger.error('Failed to generate workflow documentation:', error);
      throw error;
    }
  }

  /**
   * Generate summary documentation
   */
  async generateSummaryDoc(entities, options = {}) {
    try {
      const { template, format = 'markdown', timeframe } = options;
      
      this.logger.debug(`Generating summary documentation for ${entities.length} entities`);
      
      const content = {
        title: `Knowledge Base Summary${timeframe ? ` - ${timeframe}` : ''}`,
        overview: this.generateOverview(entities),
        keyFindings: this.extractKeyFindings(entities),
        recommendations: this.generateRecommendations(entities),
        statistics: this.generateStatistics(entities),
        entityBreakdown: this.generateEntityBreakdown(entities),
        generated: new Date().toISOString()
      };

      switch (format) {
        case 'markdown':
          return this.generateMarkdownSummary(content);
        case 'html':
          return this.generateHtmlSummary(content);
        case 'json':
          return JSON.stringify(content, null, 2);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
    } catch (error) {
      this.logger.error('Failed to generate summary documentation:', error);
      throw error;
    }
  }

  // Markdown Generators

  generateMarkdownInsight(content) {
    return `# ${content.title}

**Type:** ${content.type}  
**Significance:** ${content.significance}/10  
**Generated:** ${new Date(content.generated).toLocaleDateString()}

## Problem Description

${content.observations.problem || 'No problem description available.'}

## Solution

${content.observations.solution || 'No solution provided.'}

## Rationale

${content.observations.rationale || 'No rationale provided.'}

## Key Learnings

${content.observations.learnings || 'No key learnings documented.'}

## Applicability

${content.observations.applicability || 'Applicability not specified.'}

## Technical Details

${content.observations.technical || 'No technical details provided.'}

${this.config.includeReferences ? this.generateReferencesSection(content) : ''}

${this.config.includeMetadata ? this.generateMetadataSection(content.metadata) : ''}

---
*This document was automatically generated by the Documentation Agent*
`;
  }

  generateMarkdownPattern(content) {
    return `# ${content.title}

**Type:** ${content.type}  
**Generated:** ${new Date(content.generated).toLocaleDateString()}

## Description

${content.description}

## Context

${content.context}

## Implementation

${content.implementation}

## Consequences

${content.consequences}

## Related Observations

${this.formatObservationsList(content.observations)}

${this.config.includeMetadata ? this.generateMetadataSection(content.metadata) : ''}

---
*This document was automatically generated by the Documentation Agent*
`;
  }

  generateMarkdownWorkflow(content) {
    return `# ${content.title}

**Workflow ID:** ${content.id}  
**Generated:** ${new Date(content.generated).toLocaleDateString()}

## Description

${content.description}

## Workflow Steps

${this.formatWorkflowSteps(content.steps)}

## Inputs

${this.formatWorkflowInputs(content.inputs)}

## Outputs

${this.formatWorkflowOutputs(content.outputs)}

## Dependencies

${this.formatWorkflowDependencies(content.dependencies)}

${this.config.includeMetadata ? this.generateWorkflowMetadataSection(content.metadata) : ''}

---
*This document was automatically generated by the Documentation Agent*
`;
  }

  generateMarkdownSummary(content) {
    return `# ${content.title}

**Generated:** ${new Date(content.generated).toLocaleDateString()}

## Overview

${content.overview}

## Key Statistics

${this.formatStatistics(content.statistics)}

## Entity Breakdown

${this.formatEntityBreakdown(content.entityBreakdown)}

## Key Findings

${this.formatKeyFindings(content.keyFindings)}

## Recommendations

${this.formatRecommendations(content.recommendations)}

---
*This document was automatically generated by the Documentation Agent*
`;
  }

  // Content Extraction Methods

  extractObservations(observations) {
    if (!observations || !Array.isArray(observations)) {
      return {};
    }

    const extracted = {};
    
    observations.forEach(obs => {
      if (typeof obs === 'string') {
        // Simple string observations
        if (!extracted.general) extracted.general = [];
        extracted.general.push(obs);
      } else if (obs && typeof obs === 'object') {
        // Structured observations
        const type = obs.type || 'general';
        const content = obs.content || obs.description || obs.observation || String(obs);
        
        if (!extracted[type]) extracted[type] = [];
        extracted[type].push(content);
      }
    });

    // Flatten single-item arrays and concatenate multiple items
    Object.keys(extracted).forEach(key => {
      if (extracted[key].length === 1) {
        extracted[key] = extracted[key][0];
      } else {
        extracted[key] = extracted[key].join('\n\n');
      }
    });

    return extracted;
  }

  extractDescription(entity) {
    const observations = this.extractObservations(entity.observations);
    return observations.description || 
           observations.problem || 
           observations.general || 
           'No description available.';
  }

  extractContext(entity) {
    const observations = this.extractObservations(entity.observations);
    return observations.context || 
           observations.background || 
           'Context not specified.';
  }

  extractImplementation(entity) {
    const observations = this.extractObservations(entity.observations);
    return observations.implementation || 
           observations.solution || 
           observations.technical || 
           'Implementation details not provided.';
  }

  extractConsequences(entity) {
    const observations = this.extractObservations(entity.observations);
    return observations.consequences || 
           observations.impact || 
           observations.results || 
           'Consequences not documented.';
  }

  extractWorkflowSteps(workflow) {
    return workflow.steps || workflow.definition?.steps || [];
  }

  extractWorkflowInputs(workflow) {
    return workflow.inputs || workflow.definition?.inputs || {};
  }

  extractWorkflowOutputs(workflow) {
    return workflow.outputs || workflow.definition?.outputs || {};
  }

  extractWorkflowDependencies(workflow) {
    return workflow.dependencies || workflow.definition?.dependencies || [];
  }

  // Summary Generation Methods

  generateOverview(entities) {
    const totalEntities = entities.length;
    const types = this.getEntityTypes(entities);
    const avgSignificance = this.calculateAverageSignificance(entities);

    return `This summary covers ${totalEntities} entities in the knowledge base, including ${types.join(', ')}. The average significance score is ${avgSignificance.toFixed(1)}/10, indicating a ${this.getSignificanceLevel(avgSignificance)} level of impact across documented insights.`;
  }

  extractKeyFindings(entities) {
    return entities
      .filter(entity => entity.significance >= 8)
      .slice(0, 5)
      .map(entity => ({
        name: entity.name,
        type: entity.entityType,
        significance: entity.significance,
        summary: this.extractDescription(entity).substring(0, 200) + '...'
      }));
  }

  generateRecommendations(entities) {
    const recommendations = [];
    
    // High-significance insights that might need action
    const highSigEntities = entities.filter(e => e.significance >= 8);
    if (highSigEntities.length > 0) {
      recommendations.push('Review and implement high-significance insights to maximize impact');
    }
    
    // Patterns that could be standardized
    const patterns = entities.filter(e => e.entityType?.includes('Pattern'));
    if (patterns.length > 3) {
      recommendations.push('Consider creating a pattern library from documented patterns');
    }
    
    // Knowledge gaps
    const lowDocEntities = entities.filter(e => !e.observations || e.observations.length < 2);
    if (lowDocEntities.length > entities.length * 0.3) {
      recommendations.push('Improve documentation depth for entities with minimal observations');
    }

    return recommendations;
  }

  generateStatistics(entities) {
    return {
      totalEntities: entities.length,
      entityTypes: this.getEntityTypeCounts(entities),
      averageSignificance: this.calculateAverageSignificance(entities),
      significanceDistribution: this.getSignificanceDistribution(entities),
      recentEntities: entities.filter(e => this.isRecentEntity(e)).length
    };
  }

  generateEntityBreakdown(entities) {
    const typeBreakdown = {};
    
    entities.forEach(entity => {
      const type = entity.entityType || 'Unknown';
      if (!typeBreakdown[type]) {
        typeBreakdown[type] = [];
      }
      typeBreakdown[type].push({
        name: entity.name,
        significance: entity.significance,
        observationCount: entity.observations?.length || 0
      });
    });

    return typeBreakdown;
  }

  // Utility Methods

  generateMetadata(entity) {
    const metadata = {};
    
    if (entity.team) metadata.team = entity.team;
    if (entity.project) metadata.project = entity.project;
    if (entity.technologies) metadata.technologies = entity.technologies;
    if (entity.significance) metadata.significance = entity.significance;
    if (entity.created) metadata.created = entity.created;
    if (entity.updated) metadata.updated = entity.updated;
    
    return metadata;
  }

  generateWorkflowMetadata(workflow) {
    const metadata = {};
    
    if (workflow.version) metadata.version = workflow.version;
    if (workflow.author) metadata.author = workflow.author;
    if (workflow.created) metadata.created = workflow.created;
    if (workflow.tags) metadata.tags = workflow.tags;
    if (workflow.category) metadata.category = workflow.category;
    
    return metadata;
  }

  formatObservationsList(observations) {
    if (!observations || Object.keys(observations).length === 0) {
      return 'No observations available.';
    }

    return Object.entries(observations)
      .map(([type, content]) => `**${this.capitalize(type)}:** ${content}`)
      .join('\n\n');
  }

  formatWorkflowSteps(steps) {
    if (!steps || steps.length === 0) {
      return 'No steps defined.';
    }

    return steps
      .map((step, index) => `${index + 1}. **${step.name || `Step ${index + 1}`}**: ${step.description || 'No description'}`)
      .join('\n');
  }

  formatWorkflowInputs(inputs) {
    if (!inputs || Object.keys(inputs).length === 0) {
      return 'No inputs specified.';
    }

    return Object.entries(inputs)
      .map(([name, config]) => `- **${name}**: ${config.description || config.type || 'No description'}`)
      .join('\n');
  }

  formatWorkflowOutputs(outputs) {
    if (!outputs || Object.keys(outputs).length === 0) {
      return 'No outputs specified.';
    }

    return Object.entries(outputs)
      .map(([name, config]) => `- **${name}**: ${config.description || config.type || 'No description'}`)
      .join('\n');
  }

  formatWorkflowDependencies(dependencies) {
    if (!dependencies || dependencies.length === 0) {
      return 'No dependencies.';
    }

    return dependencies
      .map(dep => `- ${dep.name || dep}: ${dep.description || 'Required component'}`)
      .join('\n');
  }

  formatStatistics(stats) {
    return `- **Total Entities:** ${stats.totalEntities}
- **Average Significance:** ${stats.averageSignificance.toFixed(1)}/10
- **Recent Entities:** ${stats.recentEntities}
- **Entity Type Distribution:**
${Object.entries(stats.entityTypes)
  .map(([type, count]) => `  - ${type}: ${count}`)
  .join('\n')}`;
  }

  formatEntityBreakdown(breakdown) {
    return Object.entries(breakdown)
      .map(([type, entities]) => {
        const entityList = entities
          .sort((a, b) => (b.significance || 0) - (a.significance || 0))
          .slice(0, 5)
          .map(e => `  - ${e.name} (${e.significance || 'N/A'}/10)`)
          .join('\n');
        
        return `### ${type}\n\n${entityList}`;
      })
      .join('\n\n');
  }

  formatKeyFindings(findings) {
    if (!findings || findings.length === 0) {
      return 'No significant findings identified.';
    }

    return findings
      .map(finding => `### ${finding.name}\n\n**Type:** ${finding.type}  \n**Significance:** ${finding.significance}/10\n\n${finding.summary}`)
      .join('\n\n');
  }

  formatRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return 'No specific recommendations at this time.';
    }

    return recommendations
      .map((rec, index) => `${index + 1}. ${rec}`)
      .join('\n');
  }

  getEntityTypes(entities) {
    const types = [...new Set(entities.map(e => e.entityType).filter(Boolean))];
    return types.length > 0 ? types : ['Unknown'];
  }

  getEntityTypeCounts(entities) {
    const counts = {};
    entities.forEach(entity => {
      const type = entity.entityType || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  calculateAverageSignificance(entities) {
    const significances = entities
      .map(e => e.significance)
      .filter(s => typeof s === 'number' && s > 0);
    
    return significances.length > 0 
      ? significances.reduce((sum, s) => sum + s, 0) / significances.length
      : 0;
  }

  getSignificanceLevel(avgSig) {
    if (avgSig >= 8) return 'high';
    if (avgSig >= 6) return 'medium';
    if (avgSig >= 4) return 'moderate';
    return 'low';
  }

  getSignificanceDistribution(entities) {
    const distribution = { high: 0, medium: 0, low: 0 };
    
    entities.forEach(entity => {
      const sig = entity.significance || 0;
      if (sig >= 7) distribution.high++;
      else if (sig >= 4) distribution.medium++;
      else distribution.low++;
    });
    
    return distribution;
  }

  isRecentEntity(entity) {
    if (!entity.created && !entity.updated) return false;
    
    const entityDate = new Date(entity.updated || entity.created);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return entityDate > thirtyDaysAgo;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  generateReferencesSection(content) {
    // Placeholder for references - would be expanded with actual reference data
    return `\n## References\n\n*References would be automatically generated from entity relations and sources.*\n`;
  }

  generateMetadataSection(metadata) {
    if (!metadata || Object.keys(metadata).length === 0) {
      return '';
    }

    const metadataEntries = Object.entries(metadata)
      .map(([key, value]) => `**${this.capitalize(key)}:** ${value}`)
      .join('  \n');

    return `\n## Metadata\n\n${metadataEntries}\n`;
  }

  generateWorkflowMetadataSection(metadata) {
    if (!metadata || Object.keys(metadata).length === 0) {
      return '';
    }

    const metadataEntries = Object.entries(metadata)
      .map(([key, value]) => `**${this.capitalize(key)}:** ${value}`)
      .join('  \n');

    return `\n## Workflow Metadata\n\n${metadataEntries}\n`;
  }
}