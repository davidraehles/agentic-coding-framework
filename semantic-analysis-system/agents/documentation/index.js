/**
 * Documentation Agent
 * Generates comprehensive documentation from semantic analysis insights
 */

import { BaseAgent } from '../../framework/base-agent.js';
import { DocumentGenerator } from './generators/document-generator.js';
import { TemplateManager } from './templates/template-manager.js';
import { EventTypes } from '../../infrastructure/events/event-types.js';
import { Logger } from '../../shared/logger.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export class DocumentationAgent extends BaseAgent {
  constructor(config) {
    super({
      id: 'documentation',
      ...config
    });
    
    this.documentGenerator = null;
    this.templateManager = null;
    this.outputPath = config.outputPath || './docs/insights';
    this.templates = new Map();
  }

  async onInitialize() {
    this.logger.info('Initializing Documentation Agent...');
    
    // Initialize components
    this.documentGenerator = new DocumentGenerator(this.config.generation);
    this.templateManager = new TemplateManager(this.config.templates);
    
    // Load templates
    await this.loadTemplates();
    
    // Register request handlers
    this.registerRequestHandlers();
    
    // Subscribe to events
    await this.subscribeToEvents();
    
    // Ensure output directory exists
    this.ensureOutputDirectory();
    
    this.logger.info('Documentation Agent initialized successfully');
  }

  registerRequestHandlers() {
    // Document generation
    this.registerRequestHandler('documentation/generate/insight',
      this.handleGenerateInsightRequest.bind(this));
    
    this.registerRequestHandler('documentation/generate/pattern',
      this.handleGeneratePatternRequest.bind(this));
    
    this.registerRequestHandler('documentation/generate/workflow',
      this.handleGenerateWorkflowRequest.bind(this));
    
    this.registerRequestHandler('documentation/generate/summary',
      this.handleGenerateSummaryRequest.bind(this));
    
    // Template management
    this.registerRequestHandler('documentation/template/list',
      this.handleListTemplatesRequest.bind(this));
    
    this.registerRequestHandler('documentation/template/get',
      this.handleGetTemplateRequest.bind(this));
    
    // Batch operations
    this.registerRequestHandler('documentation/batch/generate-from-entities',
      this.handleBatchGenerateFromEntitiesRequest.bind(this));
  }

  async subscribeToEvents() {
    // Auto-generate documentation when insights are created
    await this.subscribe(EventTypes.ENTITY_CREATED,
      this.handleEntityCreated.bind(this));
    
    await this.subscribe(EventTypes.PATTERN_IDENTIFIED,
      this.handlePatternIdentified.bind(this));
    
    await this.subscribe(EventTypes.WORKFLOW_COMPLETED,
      this.handleWorkflowCompleted.bind(this));
  }

  async loadTemplates() {
    this.logger.info('Loading documentation templates...');
    
    const templateConfigs = {
      insight: {
        name: 'Insight Documentation',
        fields: ['problem', 'solution', 'rationale', 'learnings', 'applicability'],
        format: 'markdown'
      },
      pattern: {
        name: 'Pattern Documentation',
        fields: ['description', 'context', 'implementation', 'consequences'],
        format: 'markdown'
      },
      workflow: {
        name: 'Workflow Documentation',
        fields: ['steps', 'inputs', 'outputs', 'dependencies'],
        format: 'markdown'
      },
      summary: {
        name: 'Summary Documentation',
        fields: ['overview', 'keyFindings', 'recommendations'],
        format: 'markdown'
      }
    };

    for (const [type, config] of Object.entries(templateConfigs)) {
      this.templates.set(type, config);
    }
  }

  async handleGenerateInsightRequest(data) {
    try {
      const { insight, format = 'markdown', requestId } = data;
      
      this.logger.info(`Generating insight documentation: ${insight.name}`);
      
      const document = await this.documentGenerator.generateInsightDoc(insight, {
        template: this.templates.get('insight'),
        format
      });
      
      const filePath = await this.saveDocument(document, `insights/${insight.name}`, format);
      
      await this.publish('documentation/insight/generated', {
        requestId,
        insight: insight.name,
        filePath,
        document,
        status: 'completed'
      });

      return { filePath, document };
      
    } catch (error) {
      this.logger.error('Insight documentation generation failed:', error);
      throw error;
    }
  }

  async handleGeneratePatternRequest(data) {
    try {
      const { pattern, format = 'markdown', requestId } = data;
      
      this.logger.info(`Generating pattern documentation: ${pattern.name}`);
      
      const document = await this.documentGenerator.generatePatternDoc(pattern, {
        template: this.templates.get('pattern'),
        format
      });
      
      const filePath = await this.saveDocument(document, `patterns/${pattern.name}`, format);
      
      await this.publish('documentation/pattern/generated', {
        requestId,
        pattern: pattern.name,
        filePath,
        document,
        status: 'completed'
      });

      return { filePath, document };
      
    } catch (error) {
      this.logger.error('Pattern documentation generation failed:', error);
      throw error;
    }
  }

  async handleGenerateWorkflowRequest(data) {
    try {
      const { workflow, format = 'markdown', requestId } = data;
      
      this.logger.info(`Generating workflow documentation: ${workflow.id}`);
      
      const document = await this.documentGenerator.generateWorkflowDoc(workflow, {
        template: this.templates.get('workflow'),
        format
      });
      
      const filePath = await this.saveDocument(document, `workflows/${workflow.id}`, format);
      
      await this.publish('documentation/workflow/generated', {
        requestId,
        workflowId: workflow.id,
        filePath,
        document,
        status: 'completed'
      });

      return { filePath, document };
      
    } catch (error) {
      this.logger.error('Workflow documentation generation failed:', error);
      throw error;
    }
  }

  async handleGenerateSummaryRequest(data) {
    try {
      const { entities, timeframe, format = 'markdown', requestId } = data;
      
      this.logger.info(`Generating summary documentation for ${entities.length} entities`);
      
      const document = await this.documentGenerator.generateSummaryDoc(entities, {
        template: this.templates.get('summary'),
        format,
        timeframe
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filePath = await this.saveDocument(document, `summaries/summary-${timestamp}`, format);
      
      await this.publish('documentation/summary/generated', {
        requestId,
        entities: entities.length,
        timeframe,
        filePath,
        document,
        status: 'completed'
      });

      return { filePath, document };
      
    } catch (error) {
      this.logger.error('Summary documentation generation failed:', error);
      throw error;
    }
  }

  async handleListTemplatesRequest(data) {
    try {
      const { requestId } = data;
      
      const templateList = Array.from(this.templates.entries()).map(([type, config]) => ({
        type,
        ...config
      }));
      
      await this.publish('documentation/templates/listed', {
        requestId,
        templates: templateList,
        status: 'completed'
      });

      return templateList;
      
    } catch (error) {
      this.logger.error('Template listing failed:', error);
      throw error;
    }
  }

  async handleGetTemplateRequest(data) {
    try {
      const { templateType, requestId } = data;
      
      const template = this.templates.get(templateType);
      if (!template) {
        throw new Error(`Template not found: ${templateType}`);
      }
      
      await this.publish('documentation/template/retrieved', {
        requestId,
        templateType,
        template,
        status: 'completed'
      });

      return template;
      
    } catch (error) {
      this.logger.error('Template retrieval failed:', error);
      throw error;
    }
  }

  async handleBatchGenerateFromEntitiesRequest(data) {
    try {
      const { entities, includePatterns = true, includeSummary = true, format = 'markdown', requestId } = data;
      
      this.logger.info(`Starting batch documentation generation for ${entities.length} entities`);
      
      const results = {
        insights: [],
        patterns: [],
        summary: null,
        errors: []
      };

      // Generate insight documentation
      for (const entity of entities) {
        try {
          if (entity.entityType === 'Insight' || entity.entityType === 'TransferablePattern') {
            const doc = await this.documentGenerator.generateInsightDoc(entity, {
              template: this.templates.get('insight'),
              format
            });
            
            const filePath = await this.saveDocument(doc, `insights/${entity.name}`, format);
            results.insights.push({ entity: entity.name, filePath, document: doc });
          }
        } catch (error) {
          results.errors.push({ entity: entity.name, error: error.message });
          this.logger.error(`Failed to generate doc for ${entity.name}:`, error);
        }
      }

      // Generate pattern documentation if requested
      if (includePatterns) {
        for (const entity of entities) {
          try {
            if (entity.entityType === 'Pattern' || entity.entityType === 'ArchitecturalPattern') {
              const doc = await this.documentGenerator.generatePatternDoc(entity, {
                template: this.templates.get('pattern'),
                format
              });
              
              const filePath = await this.saveDocument(doc, `patterns/${entity.name}`, format);
              results.patterns.push({ entity: entity.name, filePath, document: doc });
            }
          } catch (error) {
            results.errors.push({ entity: entity.name, error: error.message });
            this.logger.error(`Failed to generate pattern doc for ${entity.name}:`, error);
          }
        }
      }

      // Generate summary if requested
      if (includeSummary) {
        try {
          const summaryDoc = await this.documentGenerator.generateSummaryDoc(entities, {
            template: this.templates.get('summary'),
            format
          });
          
          const timestamp = new Date().toISOString().split('T')[0];
          const summaryPath = await this.saveDocument(summaryDoc, `summaries/batch-summary-${timestamp}`, format);
          results.summary = { filePath: summaryPath, document: summaryDoc };
        } catch (error) {
          results.errors.push({ entity: 'summary', error: error.message });
          this.logger.error('Failed to generate summary doc:', error);
        }
      }
      
      await this.publish('documentation/batch/completed', {
        requestId,
        results,
        stats: {
          totalEntities: entities.length,
          insightsGenerated: results.insights.length,
          patternsGenerated: results.patterns.length,
          summaryGenerated: results.summary ? 1 : 0,
          errors: results.errors.length
        },
        status: 'completed'
      });

      return results;
      
    } catch (error) {
      this.logger.error('Batch documentation generation failed:', error);
      throw error;
    }
  }

  async handleEntityCreated(data) {
    try {
      // Auto-generate documentation for new entities if enabled
      if (this.config.autoGenerate && data.entity) {
        const { entity } = data;
        
        this.logger.info(`Auto-generating documentation for new entity: ${entity.name}`);
        
        const docType = this.getDocumentationType(entity.entityType);
        if (docType) {
          await this.generateEntityDocumentation(entity, docType);
        }
      }
    } catch (error) {
      this.logger.error('Auto-documentation failed:', error);
    }
  }

  async handlePatternIdentified(data) {
    try {
      if (this.config.autoGenerate && data.pattern) {
        const { pattern } = data;
        
        this.logger.info(`Auto-generating pattern documentation: ${pattern.name}`);
        await this.generateEntityDocumentation(pattern, 'pattern');
      }
    } catch (error) {
      this.logger.error('Auto-pattern documentation failed:', error);
    }
  }

  async handleWorkflowCompleted(data) {
    try {
      if (this.config.autoGenerate && data.workflow) {
        const { workflow } = data;
        
        this.logger.info(`Auto-generating workflow documentation: ${workflow.id}`);
        await this.generateEntityDocumentation(workflow, 'workflow');
      }
    } catch (error) {
      this.logger.error('Auto-workflow documentation failed:', error);
    }
  }

  async generateEntityDocumentation(entity, docType) {
    try {
      let document;
      let subPath;

      switch (docType) {
        case 'insight':
          document = await this.documentGenerator.generateInsightDoc(entity, {
            template: this.templates.get('insight'),
            format: 'markdown'
          });
          subPath = `insights/${entity.name}`;
          break;
          
        case 'pattern':
          document = await this.documentGenerator.generatePatternDoc(entity, {
            template: this.templates.get('pattern'),
            format: 'markdown'
          });
          subPath = `patterns/${entity.name}`;
          break;
          
        case 'workflow':
          document = await this.documentGenerator.generateWorkflowDoc(entity, {
            template: this.templates.get('workflow'),
            format: 'markdown'
          });
          subPath = `workflows/${entity.id || entity.name}`;
          break;
          
        default:
          this.logger.warn(`Unknown documentation type: ${docType}`);
          return;
      }

      const filePath = await this.saveDocument(document, subPath, 'markdown');
      this.logger.info(`Auto-generated documentation saved: ${filePath}`);
      
      return { filePath, document };
      
    } catch (error) {
      this.logger.error(`Failed to generate ${docType} documentation:`, error);
      throw error;
    }
  }

  getDocumentationType(entityType) {
    const typeMapping = {
      'Insight': 'insight',
      'TransferablePattern': 'insight',
      'Pattern': 'pattern',
      'ArchitecturalPattern': 'pattern',
      'DesignPattern': 'pattern',
      'Workflow': 'workflow'
    };
    
    return typeMapping[entityType];
  }

  async saveDocument(document, relativePath, format) {
    try {
      const extension = format === 'markdown' ? 'md' : format;
      const fileName = `${relativePath}.${extension}`;
      const fullPath = join(this.outputPath, fileName);
      
      // Ensure directory exists
      const dir = dirname(fullPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      // Write document
      writeFileSync(fullPath, document, 'utf8');
      
      this.logger.debug(`Document saved: ${fullPath}`);
      return fullPath;
      
    } catch (error) {
      this.logger.error('Failed to save document:', error);
      throw error;
    }
  }

  ensureOutputDirectory() {
    try {
      if (!existsSync(this.outputPath)) {
        mkdirSync(this.outputPath, { recursive: true });
        this.logger.info(`Created output directory: ${this.outputPath}`);
      }
      
      // Create subdirectories
      const subdirs = ['insights', 'patterns', 'workflows', 'summaries'];
      for (const subdir of subdirs) {
        const path = join(this.outputPath, subdir);
        if (!existsSync(path)) {
          mkdirSync(path, { recursive: true });
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to create output directory:', error);
      throw error;
    }
  }

  getCapabilities() {
    return [
      'insight-documentation',
      'pattern-documentation', 
      'workflow-documentation',
      'summary-generation',
      'template-management',
      'batch-generation',
      'auto-documentation',
      'markdown-export',
      'multiple-formats'
    ];
  }

  getMetadata() {
    return {
      outputPath: this.outputPath,
      availableTemplates: Array.from(this.templates.keys()),
      autoGenerate: this.config.autoGenerate || false,
      supportedFormats: ['markdown', 'html', 'json'],
      config: this.config
    };
  }

  async onStop() {
    this.logger.info('Documentation Agent stopped');
  }
}