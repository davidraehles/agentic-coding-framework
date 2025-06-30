/**
 * Knowledge Graph Agent
 * Manages knowledge graph operations and integrates with existing ukb system
 */

import { BaseAgent } from '../../framework/base-agent.js';
import { KnowledgeAPI } from './providers/knowledge-api.js';
import { UkbIntegration } from './integrations/ukb-integration.js';
import { EntityProcessor } from './processors/entity-processor.js';
import { EventTypes } from '../../infrastructure/events/event-types.js';
import { Logger } from '../../shared/logger.js';

export class KnowledgeGraphAgent extends BaseAgent {
  constructor(config) {
    super({
      id: 'knowledge-graph',
      ...config
    });
    
    this.knowledgeAPI = null;
    this.ukbIntegration = null;
    this.entityProcessor = null;
    this.operationQueue = [];
    this.isProcessing = false;
  }

  async onInitialize() {
    this.logger.info('Initializing Knowledge Graph Agent...');
    
    // Initialize knowledge API
    this.knowledgeAPI = new KnowledgeAPI(this.config.knowledgeApi);
    
    // Initialize UKB integration
    this.ukbIntegration = new UkbIntegration(this.config.ukb);
    
    // CRITICAL: Load UKB API reference at startup
    try {
      await this.ukbIntegration.loadUkbApiReference();
      this.logger.info('UKB API reference loaded successfully');
    } catch (error) {
      this.logger.warn('Failed to load UKB API reference at startup:', error.message);
    }
    
    // Initialize entity processor
    this.entityProcessor = new EntityProcessor(this.config.processing);
    
    // Register request handlers
    this.registerRequestHandlers();
    
    // Subscribe to events
    await this.subscribeToEvents();
    
    // Start operation processor
    this.startOperationProcessor();
    
    this.logger.info('Knowledge Graph Agent initialized successfully');
  }

  registerRequestHandlers() {
    // Entity operations
    this.registerRequestHandler(EventTypes.ENTITY_CREATE_REQUESTED,
      this.handleEntityCreateRequest.bind(this));
    
    this.registerRequestHandler('knowledge/entity/update',
      this.handleEntityUpdateRequest.bind(this));
    
    this.registerRequestHandler('knowledge/entity/remove',
      this.handleEntityRemoveRequest.bind(this));
    
    this.registerRequestHandler('knowledge/entity/search',
      this.handleEntitySearchRequest.bind(this));
    
    // Relation operations
    this.registerRequestHandler(EventTypes.RELATION_CREATE_REQUESTED,
      this.handleRelationCreateRequest.bind(this));
    
    this.registerRequestHandler('knowledge/relation/search',
      this.handleRelationSearchRequest.bind(this));
    
    // Graph operations
    this.registerRequestHandler('knowledge/graph/export',
      this.handleGraphExportRequest.bind(this));
    
    this.registerRequestHandler('knowledge/graph/import',
      this.handleGraphImportRequest.bind(this));
    
    // Insight operations
    this.registerRequestHandler('knowledge/insights/extract',
      this.handleInsightExtractionRequest.bind(this));
    
    // UKB integration
    this.registerRequestHandler('knowledge/ukb/sync',
      this.handleUkbSyncRequest.bind(this));
  }

  async subscribeToEvents() {
    // Subscribe to analysis completion events for knowledge extraction
    await this.subscribe(EventTypes.CODE_ANALYSIS_COMPLETED,
      this.handleCodeAnalysisCompleted.bind(this));
    
    await this.subscribe(EventTypes.CONVERSATION_ANALYSIS_COMPLETED,
      this.handleConversationAnalysisCompleted.bind(this));
    
    await this.subscribe(EventTypes.WEB_SEARCH_COMPLETED,
      this.handleWebSearchCompleted.bind(this));
    
    // Subscribe to pattern detection events
    await this.subscribe(EventTypes.PATTERN_DETECTED,
      this.handlePatternDetected.bind(this));
    
    // Subscribe to knowledge updates
    await this.subscribe('knowledge/#', (data, topic) => {
      this.logger.debug(`Received knowledge event: ${topic}`);
    });
  }

  async handleEntityCreateRequest(data) {
    try {
      this.logger.info('Processing entity creation request:', data);
      
      const { name, entityType, significance, observations, metadata, requestId } = data;
      
      if (!name || !entityType) {
        throw new Error('Entity name and type are required');
      }

      // Validate entity before creation
      const validationResult = await this.validateEntity({
        name,
        entityType,
        significance: significance || 5,
        observations: observations || [],
        metadata: metadata || {}
      });

      if (!validationResult.valid) {
        throw new Error(`Entity validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Process entity data
      const processedEntity = await this.entityProcessor.processEntity(validationResult.entity);

      // Check for duplicates before creation
      const duplicateCheck = await this.checkForDuplicates(processedEntity);
      if (duplicateCheck.hasDuplicates && !data.allowDuplicates) {
        this.logger.warn(`Potential duplicate detected: ${duplicateCheck.similar.map(s => s.name).join(', ')}`);
        
        // Publish duplicate warning but continue with creation
        await this.publish('knowledge/entity/duplicate-detected', {
          requestId,
          entity: processedEntity,
          similar: duplicateCheck.similar
        });
      }

      // Create entity via knowledge API
      const entity = await this.knowledgeAPI.createEntity(processedEntity);
      
      // Automatically create relations to central nodes
      await this.createAutomaticRelations(entity);
      
      // Sync with UKB if configured
      if (this.config.autoSyncUkb) {
        await this.ukbIntegration.syncEntity(entity);
      }

      // Publish success event
      await this.publish(EventTypes.ENTITY_CREATED, {
        requestId,
        entity,
        status: 'completed'
      });

      this.logger.info(`Entity created: ${entity.name}`);
      return entity;
      
    } catch (error) {
      this.logger.error('Entity creation failed:', error);
      
      await this.publish(EventTypes.AGENT_ERROR, {
        requestId: data.requestId,
        error: error.message,
        operation: 'entity-create'
      });
      
      throw error;
    }
  }

  async handleEntityUpdateRequest(data) {
    try {
      const { entityId, updates, requestId } = data;
      
      if (!entityId) {
        throw new Error('Entity ID is required for updates');
      }

      const updatedEntity = await this.knowledgeAPI.updateEntity(entityId, updates);
      
      if (this.config.autoSyncUkb) {
        await this.ukbIntegration.syncEntity(updatedEntity);
      }

      await this.publish('knowledge/entity/updated', {
        requestId,
        entity: updatedEntity,
        status: 'completed'
      });

      return updatedEntity;
      
    } catch (error) {
      this.logger.error('Entity update failed:', error);
      throw error;
    }
  }

  async handleEntityRemoveRequest(data) {
    try {
      this.logger.info('Processing entity removal request:', data);
      
      const { entityName, requestId } = data;
      
      if (!entityName) {
        throw new Error('Entity name is required for removal');
      }

      // Remove from knowledge API first
      await this.knowledgeAPI.removeEntity(entityName);
      
      // Remove from UKB using validated command
      if (this.config.autoSyncUkb) {
        const ukbResult = await this.ukbIntegration.removeEntity(entityName);
        this.logger.info(`Entity removed from UKB: ${entityName}`, ukbResult);
      }

      await this.publish('knowledge/entity/removed', {
        requestId,
        entityName,
        status: 'completed'
      });

      this.logger.info(`Entity removed: ${entityName}`);
      return { entityName, removed: true };
      
    } catch (error) {
      this.logger.error('Entity removal failed:', error);
      
      await this.publish(EventTypes.AGENT_ERROR, {
        requestId: data.requestId,
        error: error.message,
        operation: 'entity-remove'
      });
      
      throw error;
    }
  }

  async handleEntitySearchRequest(data) {
    try {
      const { query, filters, requestId } = data;
      
      const results = await this.knowledgeAPI.searchEntities(query, filters);
      
      await this.publish('knowledge/entity/search/completed', {
        requestId,
        results,
        query,
        status: 'completed'
      });

      return results;
      
    } catch (error) {
      this.logger.error('Entity search failed:', error);
      throw error;
    }
  }

  async handleRelationCreateRequest(data) {
    try {
      this.logger.info('Processing relation creation request:', data);
      
      const { from, to, relationType, metadata, requestId } = data;
      
      if (!from || !to || !relationType) {
        throw new Error('From entity, to entity, and relation type are required');
      }

      const relation = await this.knowledgeAPI.createRelation({
        from,
        to,
        relationType,
        metadata: metadata || {}
      });
      
      if (this.config.autoSyncUkb) {
        await this.ukbIntegration.syncRelation(relation);
      }

      await this.publish(EventTypes.RELATION_CREATED, {
        requestId,
        relation,
        status: 'completed'
      });

      this.logger.info(`Relation created: ${from} -> ${to} (${relationType})`);
      return relation;
      
    } catch (error) {
      this.logger.error('Relation creation failed:', error);
      throw error;
    }
  }

  async handleRelationSearchRequest(data) {
    try {
      const { entityId, direction, relationType, requestId } = data;
      
      const relations = await this.knowledgeAPI.getRelations(entityId, {
        direction,
        relationType
      });
      
      await this.publish('knowledge/relation/search/completed', {
        requestId,
        relations,
        entityId,
        status: 'completed'
      });

      return relations;
      
    } catch (error) {
      this.logger.error('Relation search failed:', error);
      throw error;
    }
  }

  async handleGraphExportRequest(data) {
    try {
      const { format, filters, requestId } = data;
      
      const exportData = await this.knowledgeAPI.exportGraph(format, filters);
      
      await this.publish('knowledge/graph/exported', {
        requestId,
        format,
        data: exportData,
        status: 'completed'
      });

      return exportData;
      
    } catch (error) {
      this.logger.error('Graph export failed:', error);
      throw error;
    }
  }

  async handleGraphImportRequest(data) {
    try {
      const { format, data: importData, options, requestId } = data;
      
      const result = await this.knowledgeAPI.importGraph(format, importData, options);
      
      if (this.config.autoSyncUkb) {
        await this.ukbIntegration.syncAll();
      }

      await this.publish('knowledge/graph/imported', {
        requestId,
        result,
        status: 'completed'
      });

      return result;
      
    } catch (error) {
      this.logger.error('Graph import failed:', error);
      throw error;
    }
  }

  async handleInsightExtractionRequest(data) {
    try {
      const { analysisData, context, requestId } = data;
      
      const insights = await this.entityProcessor.extractInsights(analysisData, context);
      
      // Create entities for significant insights
      for (const insight of insights) {
        if (insight.significance >= (this.config.significanceThreshold || 7)) {
          await this.queueOperation('create-entity', {
            name: insight.title,
            entityType: 'Insight',
            significance: insight.significance,
            observations: [insight.description],
            metadata: {
              source: 'insight-extraction',
              context,
              extractedAt: new Date().toISOString()
            }
          });
        }
      }

      await this.publish('knowledge/insights/extracted', {
        requestId,
        insights,
        status: 'completed'
      });

      return insights;
      
    } catch (error) {
      this.logger.error('Insight extraction failed:', error);
      throw error;
    }
  }

  async handleUkbSyncRequest(data) {
    try {
      const { direction, requestId } = data; // 'to-ukb', 'from-ukb', 'bidirectional'
      
      let result;
      
      switch (direction) {
        case 'to-ukb':
          result = await this.ukbIntegration.exportToUkb();
          break;
        case 'from-ukb':
          result = await this.ukbIntegration.importFromUkb();
          break;
        case 'bidirectional':
          result = await this.ukbIntegration.syncBidirectional();
          break;
        default:
          throw new Error(`Unknown sync direction: ${direction}`);
      }

      await this.publish(EventTypes.KNOWLEDGE_SYNCED, {
        requestId,
        direction,
        result,
        status: 'completed'
      });

      return result;
      
    } catch (error) {
      this.logger.error('UKB sync failed:', error);
      throw error;
    }
  }

  async handleCodeAnalysisCompleted(data) {
    try {
      const { result } = data;
      
      // Extract entities from code analysis
      const entities = await this.entityProcessor.extractEntitiesFromCodeAnalysis(result);
      
      // Queue entity creation operations
      for (const entity of entities) {
        await this.queueOperation('create-entity', entity);
      }
      
    } catch (error) {
      this.logger.warn('Failed to process code analysis for knowledge extraction:', error.message);
    }
  }

  async handleConversationAnalysisCompleted(data) {
    try {
      const { result } = data;
      
      // Extract entities from conversation analysis
      const entities = await this.entityProcessor.extractEntitiesFromConversation(result);
      
      // Queue entity creation operations
      for (const entity of entities) {
        await this.queueOperation('create-entity', entity);
      }
      
    } catch (error) {
      this.logger.warn('Failed to process conversation analysis for knowledge extraction:', error.message);
    }
  }

  async handleWebSearchCompleted(data) {
    try {
      const { result } = data;
      
      // Extract reference entities from search results
      const references = await this.entityProcessor.extractReferencesFromSearch(result);
      
      // Queue reference creation operations
      for (const reference of references) {
        await this.queueOperation('create-entity', reference);
      }
      
    } catch (error) {
      this.logger.warn('Failed to process search results for knowledge extraction:', error.message);
    }
  }

  async handlePatternDetected(data) {
    try {
      const { type, analysis, significance } = data;
      
      if (significance >= (this.config.significanceThreshold || 7)) {
        await this.queueOperation('create-entity', {
          name: `Pattern: ${type}`,
          entityType: 'Pattern',
          significance,
          observations: [JSON.stringify(analysis)],
          metadata: {
            source: 'pattern-detection',
            detectedAt: new Date().toISOString()
          }
        });
      }
      
    } catch (error) {
      this.logger.warn('Failed to process pattern detection for knowledge storage:', error.message);
    }
  }

  async queueOperation(type, data) {
    this.operationQueue.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processOperationQueue();
    }
  }

  async processOperationQueue() {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.operationQueue.length > 0) {
        const operation = this.operationQueue.shift();
        
        try {
          switch (operation.type) {
            case 'create-entity':
              await this.handleEntityCreateRequest(operation.data);
              break;
            case 'create-relation':
              await this.handleRelationCreateRequest(operation.data);
              break;
            default:
              this.logger.warn(`Unknown operation type: ${operation.type}`);
          }
          
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          this.logger.error(`Failed to process queued operation:`, error);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  startOperationProcessor() {
    // Process queue periodically
    setInterval(() => {
      if (!this.isProcessing && this.operationQueue.length > 0) {
        this.processOperationQueue();
      }
    }, 5000); // Every 5 seconds
  }

  getCapabilities() {
    return [
      'entity-management',
      'relation-management',
      'graph-operations',
      'ukb-integration',
      'insight-extraction',
      'automatic-knowledge-capture',
      'pattern-storage'
    ];
  }

  getMetadata() {
    return {
      knowledgeAPI: this.knowledgeAPI?.getInfo(),
      ukbIntegration: this.ukbIntegration?.getInfo(),
      queueSize: this.operationQueue.length,
      isProcessing: this.isProcessing,
      config: this.config
    };
  }

  async validateEntity(entity) {
    const errors = [];
    const warnings = [];
    
    // Name validation
    if (!entity.name || entity.name.trim().length === 0) {
      errors.push('Entity name is required');
    } else if (entity.name.length > 200) {
      errors.push('Entity name too long (max 200 characters)');
    } else if (!/^[a-zA-Z0-9\s\-_:.()]+$/.test(entity.name)) {
      warnings.push('Entity name contains special characters');
    }
    
    // Entity type validation
    const validTypes = [
      'WorkflowPattern', 'TransferablePattern', 'TransferableKnowledge',
      'Insight', 'Pattern', 'SystemDocumentation', 'EntityGroup'
    ];
    
    if (!validTypes.includes(entity.entityType)) {
      warnings.push(`Unknown entity type: ${entity.entityType}`);
    }
    
    // Significance validation
    if (entity.significance < 1 || entity.significance > 10) {
      errors.push('Significance must be between 1 and 10');
    }
    
    // Observations validation
    if (!entity.observations || !Array.isArray(entity.observations)) {
      entity.observations = [];
      warnings.push('No observations provided');
    } else if (entity.observations.length === 0) {
      warnings.push('Entity has no observations');
    }
    
    // Metadata validation
    if (!entity.metadata || typeof entity.metadata !== 'object') {
      entity.metadata = {};
    }
    
    // Validate metadata structure
    if (entity.metadata.team && typeof entity.metadata.team !== 'string') {
      warnings.push('Metadata team should be a string');
    }
    
    if (entity.metadata.technologies && !Array.isArray(entity.metadata.technologies)) {
      warnings.push('Metadata technologies should be an array');
    }
    
    if (entity.metadata.references && !Array.isArray(entity.metadata.references)) {
      warnings.push('Metadata references should be an array');
    }
    
    // Ensure required metadata fields
    if (!entity.metadata.created) {
      entity.metadata.created = new Date().toISOString();
    }
    
    if (!entity.metadata.team) {
      entity.metadata.team = 'coding'; // Default team
    }
    
    return {
      valid: errors.length === 0,
      entity,
      errors,
      warnings
    };
  }

  async checkForDuplicates(entity) {
    try {
      // Search for entities with similar names
      const searchResults = await this.knowledgeAPI.searchEntities(entity.name, {
        entityType: entity.entityType,
        maxResults: 5
      });
      
      const similar = [];
      
      for (const result of searchResults) {
        if (result.id === entity.id) continue; // Skip self
        
        // Calculate name similarity
        const nameSimilarity = this.calculateNameSimilarity(entity.name, result.name);
        
        if (nameSimilarity > 0.8) {
          similar.push({
            ...result,
            similarity: nameSimilarity
          });
        }
      }
      
      return {
        hasDuplicates: similar.length > 0,
        similar
      };
      
    } catch (error) {
      this.logger.warn('Duplicate check failed:', error.message);
      return { hasDuplicates: false, similar: [] };
    }
  }

  calculateNameSimilarity(name1, name2) {
    // Simple Levenshtein distance similarity
    const longer = name1.length > name2.length ? name1 : name2;
    const shorter = name1.length > name2.length ? name2 : name1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async createAutomaticRelations(entity) {
    try {
      const relations = [];
      
      // 1. Create relation to CollectiveKnowledge (central hub)
      const collectiveKnowledgeExists = await this.findEntityByName('CollectiveKnowledge');
      if (collectiveKnowledgeExists) {
        relations.push({
          from: 'CollectiveKnowledge',
          to: entity.name,
          relationType: 'contains'
        });
      } else {
        // Create CollectiveKnowledge if it doesn't exist
        await this.createCentralNode('CollectiveKnowledge', 'Central knowledge repository');
        relations.push({
          from: 'CollectiveKnowledge',
          to: entity.name,
          relationType: 'contains'
        });
      }
      
      // 2. Create relation to team/project node (e.g., Coding, UI, etc.)
      const team = entity.metadata?.team || 'coding';
      const teamNodeName = this.capitalizeFirst(team);
      
      const teamNodeExists = await this.findEntityByName(teamNodeName);
      if (teamNodeExists) {
        relations.push({
          from: teamNodeName,
          to: entity.name,
          relationType: 'contains'
        });
      } else {
        // Create team node if it doesn't exist
        await this.createCentralNode(teamNodeName, `${teamNodeName} team knowledge`);
        relations.push({
          from: teamNodeName,
          to: entity.name,
          relationType: 'contains'
        });
      }
      
      // 3. Create relations based on entity type
      await this.createTypeBasedRelations(entity, relations);
      
      // 4. Create relations based on technologies
      if (entity.metadata?.technologies) {
        await this.createTechnologyRelations(entity, relations);
      }
      
      // Create all relations
      for (const relation of relations) {
        try {
          await this.knowledgeAPI.createRelation(relation);
          this.logger.debug(`Created relation: ${relation.from} -> ${relation.to} (${relation.relationType})`);
        } catch (error) {
          this.logger.warn(`Failed to create relation ${relation.from} -> ${relation.to}:`, error.message);
        }
      }
      
      this.logger.info(`Created ${relations.length} automatic relations for entity: ${entity.name}`);
      
    } catch (error) {
      this.logger.error('Failed to create automatic relations:', error);
    }
  }

  async createTypeBasedRelations(entity, relations) {
    // Create relations based on entity type patterns
    switch (entity.entityType) {
      case 'WorkflowPattern':
      case 'TransferablePattern':
        // Connect to Patterns hub
        const patternsHubExists = await this.findEntityByName('Patterns');
        if (!patternsHubExists) {
          await this.createCentralNode('Patterns', 'Collection of reusable patterns');
        }
        relations.push({
          from: 'Patterns',
          to: entity.name,
          relationType: 'includes'
        });
        break;
      
      case 'SystemDocumentation':
        // Connect to Documentation hub
        const docsHubExists = await this.findEntityByName('Documentation');
        if (!docsHubExists) {
          await this.createCentralNode('Documentation', 'System documentation collection');
        }
        relations.push({
          from: 'Documentation',
          to: entity.name,
          relationType: 'includes'
        });
        break;
      
      case 'Insight':
        // Connect to Insights hub
        const insightsHubExists = await this.findEntityByName('Insights');
        if (!insightsHubExists) {
          await this.createCentralNode('Insights', 'Collected insights and learnings');
        }
        relations.push({
          from: 'Insights',
          to: entity.name,
          relationType: 'includes'
        });
        break;
    }
  }

  async createTechnologyRelations(entity, relations) {
    // Create relations to technology nodes
    for (const tech of entity.metadata.technologies) {
      const techNodeName = `Technology:${tech}`;
      
      const techNodeExists = await this.findEntityByName(techNodeName);
      if (!techNodeExists) {
        await this.createCentralNode(techNodeName, `${tech} technology and patterns`);
      }
      
      relations.push({
        from: techNodeName,
        to: entity.name,
        relationType: 'uses'
      });
    }
  }

  async findEntityByName(name) {
    try {
      const searchResults = await this.knowledgeAPI.searchEntities(name, { maxResults: 1 });
      return searchResults.find(entity => entity.name === name);
    } catch (error) {
      this.logger.debug(`Entity search failed for ${name}:`, error.message);
      return null;
    }
  }

  async createCentralNode(name, description) {
    try {
      const centralNode = {
        name,
        entityType: 'SystemDocumentation',
        significance: 8,
        observations: [description],
        metadata: {
          created: new Date().toISOString(),
          team: 'system',
          nodeType: 'central'
        }
      };
      
      await this.knowledgeAPI.createEntity(centralNode);
      this.logger.info(`Created central node: ${name}`);
      
    } catch (error) {
      this.logger.warn(`Failed to create central node ${name}:`, error.message);
    }
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async onStop() {
    // Process remaining operations before stopping
    if (this.operationQueue.length > 0) {
      this.logger.info(`Processing ${this.operationQueue.length} remaining operations...`);
      await this.processOperationQueue();
    }
    
    this.logger.info('Knowledge Graph Agent stopped');
  }
}