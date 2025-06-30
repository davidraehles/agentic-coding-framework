/**
 * Synchronization Agent
 * Ensures bidirectional sync between graph databases (MCP/Graphology) and JSON files
 */

import { BaseAgent } from '../../framework/base-agent.js';
import { MCPAdapter } from './adapters/mcp-adapter.js';
import { GraphologyAdapter } from './adapters/graphology-adapter.js';
import { FileWatcher } from './watchers/file-watcher.js';
import { ConflictResolver } from './resolvers/conflict-resolver.js';
import { VersionManager } from './managers/version-manager.js';
import { EventTypes } from '../../infrastructure/events/event-types.js';
import { Logger } from '../../shared/logger.js';
import { promises as fs } from 'fs';
import crypto from 'crypto';

export class SynchronizationAgent extends BaseAgent {
  constructor(config) {
    super({
      id: 'synchronization',
      ...config
    });
    
    this.graphAdapter = null;
    this.fileWatcher = null;
    this.conflictResolver = null;
    this.versionManager = null;
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTimestamps = new Map();
    this.checksums = new Map();
  }

  async onInitialize() {
    this.logger.info('Initializing Synchronization Agent...');
    
    // Initialize graph database adapter based on configuration
    await this.initializeGraphAdapter();
    
    // Initialize file system watcher
    this.fileWatcher = new FileWatcher(this.config.files);
    
    // Initialize conflict resolver
    this.conflictResolver = new ConflictResolver(this.config.conflict);
    
    // Initialize version manager
    this.versionManager = new VersionManager(this.config.versioning);
    
    // Register request handlers
    this.registerRequestHandlers();
    
    // Subscribe to events
    await this.subscribeToEvents();
    
    // Start file watching
    await this.startFileWatching();
    
    // Perform initial sync check
    await this.performInitialSync();
    
    // Start sync processor
    this.startSyncProcessor();
    
    this.logger.info('Synchronization Agent initialized successfully');
  }

  async initializeGraphAdapter() {
    const adapterType = this.config.graphDb?.type || 'mcp';
    
    switch (adapterType) {
      case 'mcp':
        this.graphAdapter = new MCPAdapter(this.config.graphDb?.mcp || {});
        break;
      case 'graphology':
        this.graphAdapter = new GraphologyAdapter(this.config.graphDb?.graphology || {});
        break;
      default:
        throw new Error(`Unknown graph database adapter: ${adapterType}`);
    }
    
    await this.graphAdapter.initialize();
    this.logger.info(`Graph adapter initialized: ${adapterType}`);
  }

  registerRequestHandlers() {
    // Sync operations
    this.registerRequestHandler('sync/trigger',
      this.handleSyncTriggerRequest.bind(this));
    
    this.registerRequestHandler('sync/status',
      this.handleSyncStatusRequest.bind(this));
    
    this.registerRequestHandler('sync/force',
      this.handleForceSyncRequest.bind(this));
    
    // Conflict resolution
    this.registerRequestHandler('sync/conflicts/resolve',
      this.handleConflictResolutionRequest.bind(this));
    
    // Version management
    this.registerRequestHandler('sync/version/rollback',
      this.handleVersionRollbackRequest.bind(this));
    
    this.registerRequestHandler('sync/version/history',
      this.handleVersionHistoryRequest.bind(this));
  }

  async subscribeToEvents() {
    // Subscribe to knowledge graph changes
    await this.subscribe(EventTypes.ENTITY_CREATED,
      this.handleEntityCreated.bind(this));
    
    await this.subscribe(EventTypes.ENTITY_UPDATED,
      this.handleEntityUpdated.bind(this));
    
    await this.subscribe(EventTypes.ENTITY_REMOVED,
      this.handleEntityRemoved.bind(this));
    
    await this.subscribe(EventTypes.RELATION_CREATED,
      this.handleRelationCreated.bind(this));
    
    await this.subscribe(EventTypes.RELATION_REMOVED,
      this.handleRelationRemoved.bind(this));
    
    // Subscribe to sync events
    await this.subscribe('sync/#', (data, topic) => {
      this.logger.debug(`Received sync event: ${topic}`);
    });
  }

  async startFileWatching() {
    const sharedMemoryPaths = this.config.files?.sharedMemoryPaths || [
      '/Users/q284340/Agentic/coding/shared-memory-coding.json',
      '/Users/q284340/Agentic/coding/shared-memory-ui.json',
      '/Users/q284340/Agentic/coding/shared-memory-resi.json'
    ];
    
    for (const filePath of sharedMemoryPaths) {
      await this.fileWatcher.watch(filePath, async (event, path) => {
        this.logger.debug(`File change detected: ${event} on ${path}`);
        await this.handleFileChange(path, event);
      });
    }
    
    this.logger.info(`Watching ${sharedMemoryPaths.length} shared memory files`);
  }

  async performInitialSync() {
    try {
      this.logger.info('Performing initial synchronization check...');
      
      const sharedMemoryPaths = this.config.files?.sharedMemoryPaths || [];
      
      for (const filePath of sharedMemoryPaths) {
        await this.syncFileWithGraph(filePath, 'initial');
      }
      
      this.logger.info('Initial synchronization completed');
      
    } catch (error) {
      this.logger.error('Initial synchronization failed:', error);
    }
  }

  async handleSyncTriggerRequest(data) {
    try {
      const { source, target, requestId } = data;
      
      this.logger.info(`Processing sync trigger: ${source} -> ${target}`);
      
      const result = await this.performSync(source, target);
      
      await this.publish('sync/triggered', {
        requestId,
        source,
        target,
        result,
        status: 'completed'
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Sync trigger failed:', error);
      throw error;
    }
  }

  async handleSyncStatusRequest(data) {
    try {
      const { requestId } = data;
      
      const status = {
        isSyncing: this.isSyncing,
        queueSize: this.syncQueue.length,
        lastSyncTimestamps: Object.fromEntries(this.lastSyncTimestamps),
        checksums: Object.fromEntries(this.checksums),
        conflicts: await this.conflictResolver.getPendingConflicts()
      };
      
      await this.publish('sync/status/retrieved', {
        requestId,
        status
      });
      
      return status;
      
    } catch (error) {
      this.logger.error('Status retrieval failed:', error);
      throw error;
    }
  }

  async handleForceSyncRequest(data) {
    try {
      const { direction, requestId } = data;
      
      this.logger.warn(`Force sync requested: ${direction}`);
      
      let result;
      
      switch (direction) {
        case 'graph-to-files':
          result = await this.forceGraphToFiles();
          break;
        case 'files-to-graph':
          result = await this.forceFilesToGraph();
          break;
        default:
          throw new Error(`Unknown sync direction: ${direction}`);
      }
      
      await this.publish('sync/forced', {
        requestId,
        direction,
        result,
        status: 'completed'
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Force sync failed:', error);
      throw error;
    }
  }

  async handleConflictResolutionRequest(data) {
    try {
      const { conflictId, resolution, requestId } = data;
      
      const result = await this.conflictResolver.resolveConflict(conflictId, resolution);
      
      await this.publish('sync/conflict/resolved', {
        requestId,
        conflictId,
        resolution,
        result
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Conflict resolution failed:', error);
      throw error;
    }
  }

  async handleVersionRollbackRequest(data) {
    try {
      const { versionId, target, requestId } = data;
      
      const result = await this.versionManager.rollback(versionId, target);
      
      await this.publish('sync/version/rolledback', {
        requestId,
        versionId,
        target,
        result
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Version rollback failed:', error);
      throw error;
    }
  }

  async handleVersionHistoryRequest(data) {
    try {
      const { target, limit = 10, requestId } = data;
      
      const history = await this.versionManager.getHistory(target, limit);
      
      await this.publish('sync/version/history/retrieved', {
        requestId,
        target,
        history
      });
      
      return history;
      
    } catch (error) {
      this.logger.error('Version history retrieval failed:', error);
      throw error;
    }
  }

  async handleEntityCreated(data) {
    try {
      const { entity } = data;
      
      this.logger.debug(`Entity created in graph: ${entity.name}`);
      
      // Queue sync to files
      await this.queueSync({
        type: 'entity-created',
        source: 'graph',
        target: 'files',
        data: entity
      });
      
    } catch (error) {
      this.logger.error('Failed to handle entity creation:', error);
    }
  }

  async handleEntityUpdated(data) {
    try {
      const { entity } = data;
      
      this.logger.debug(`Entity updated in graph: ${entity.name}`);
      
      // Queue sync to files
      await this.queueSync({
        type: 'entity-updated',
        source: 'graph',
        target: 'files',
        data: entity
      });
      
    } catch (error) {
      this.logger.error('Failed to handle entity update:', error);
    }
  }

  async handleEntityRemoved(data) {
    try {
      const { entityName } = data;
      
      this.logger.debug(`Entity removed from graph: ${entityName}`);
      
      // Queue sync to files
      await this.queueSync({
        type: 'entity-removed',
        source: 'graph',
        target: 'files',
        data: { entityName }
      });
      
    } catch (error) {
      this.logger.error('Failed to handle entity removal:', error);
    }
  }

  async handleRelationCreated(data) {
    try {
      const { relation } = data;
      
      this.logger.debug(`Relation created in graph: ${relation.from} -> ${relation.to}`);
      
      // Queue sync to files
      await this.queueSync({
        type: 'relation-created',
        source: 'graph',
        target: 'files',
        data: relation
      });
      
    } catch (error) {
      this.logger.error('Failed to handle relation creation:', error);
    }
  }

  async handleRelationRemoved(data) {
    try {
      const { relationId } = data;
      
      this.logger.debug(`Relation removed from graph: ${relationId}`);
      
      // Queue sync to files
      await this.queueSync({
        type: 'relation-removed',
        source: 'graph',
        target: 'files',
        data: { relationId }
      });
      
    } catch (error) {
      this.logger.error('Failed to handle relation removal:', error);
    }
  }

  async handleFileChange(filePath, event) {
    try {
      // Check if this is our own write (to avoid infinite loops)
      const currentChecksum = await this.calculateFileChecksum(filePath);
      const lastChecksum = this.checksums.get(filePath);
      
      if (currentChecksum === lastChecksum) {
        this.logger.debug(`Ignoring self-triggered file change: ${filePath}`);
        return;
      }
      
      this.logger.info(`External file change detected: ${filePath}`);
      
      // Queue sync to graph
      await this.queueSync({
        type: 'file-changed',
        source: 'files',
        target: 'graph',
        data: { filePath, event }
      });
      
    } catch (error) {
      this.logger.error(`Failed to handle file change for ${filePath}:`, error);
    }
  }

  async queueSync(syncOperation) {
    this.syncQueue.push({
      ...syncOperation,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
    
    // Process queue if not already processing
    if (!this.isSyncing) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }
    
    this.isSyncing = true;
    
    try {
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        
        try {
          await this.executeSyncOperation(operation);
          
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          this.logger.error(`Sync operation failed:`, error);
          
          // Handle sync failure
          await this.handleSyncFailure(operation, error);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async executeSyncOperation(operation) {
    this.logger.debug(`Executing sync operation: ${operation.type}`);
    
    switch (operation.type) {
      case 'entity-created':
      case 'entity-updated':
        await this.syncEntityToFiles(operation.data);
        break;
      
      case 'entity-removed':
        await this.removeEntityFromFiles(operation.data.entityName);
        break;
      
      case 'relation-created':
        await this.syncRelationToFiles(operation.data);
        break;
      
      case 'relation-removed':
        await this.removeRelationFromFiles(operation.data.relationId);
        break;
      
      case 'file-changed':
        await this.syncFileToGraph(operation.data.filePath);
        break;
      
      default:
        this.logger.warn(`Unknown sync operation type: ${operation.type}`);
    }
    
    // Update last sync timestamp
    this.lastSyncTimestamps.set(operation.source, Date.now());
  }

  async syncEntityToFiles(entity) {
    const targetFile = this.determineTargetFile(entity);
    
    try {
      // Load current file data
      const fileData = await this.loadJsonFile(targetFile);
      
      // Find or create entity in file
      const existingIndex = fileData.entities.findIndex(e => e.id === entity.id);
      
      if (existingIndex >= 0) {
        // Update existing entity
        fileData.entities[existingIndex] = entity;
      } else {
        // Add new entity
        fileData.entities.push(entity);
      }
      
      // Update metadata
      fileData.metadata = fileData.metadata || {};
      fileData.metadata.last_updated = new Date().toISOString();
      fileData.metadata.total_entities = fileData.entities.length;
      
      // Save file and update checksum
      await this.saveJsonFile(targetFile, fileData);
      
      this.logger.debug(`Entity synced to file: ${entity.name} -> ${targetFile}`);
      
    } catch (error) {
      this.logger.error(`Failed to sync entity to files:`, error);
      throw error;
    }
  }

  async removeEntityFromFiles(entityName) {
    const sharedMemoryPaths = this.config.files?.sharedMemoryPaths || [];
    
    for (const filePath of sharedMemoryPaths) {
      try {
        const fileData = await this.loadJsonFile(filePath);
        
        const initialLength = fileData.entities.length;
        fileData.entities = fileData.entities.filter(e => e.name !== entityName);
        
        if (fileData.entities.length < initialLength) {
          // Entity was found and removed
          fileData.metadata = fileData.metadata || {};
          fileData.metadata.last_updated = new Date().toISOString();
          fileData.metadata.total_entities = fileData.entities.length;
          
          await this.saveJsonFile(filePath, fileData);
          
          this.logger.debug(`Entity removed from file: ${entityName} <- ${filePath}`);
          break;
        }
      } catch (error) {
        this.logger.warn(`Failed to remove entity from ${filePath}:`, error.message);
      }
    }
  }

  async syncRelationToFiles(relation) {
    const targetFile = this.determineTargetFileForRelation(relation);
    
    try {
      const fileData = await this.loadJsonFile(targetFile);
      
      // Find or create relation in file
      const existingIndex = fileData.relations.findIndex(r => r.id === relation.id);
      
      if (existingIndex >= 0) {
        fileData.relations[existingIndex] = relation;
      } else {
        fileData.relations.push(relation);
      }
      
      // Update metadata
      fileData.metadata = fileData.metadata || {};
      fileData.metadata.last_updated = new Date().toISOString();
      fileData.metadata.total_relations = fileData.relations.length;
      
      await this.saveJsonFile(targetFile, fileData);
      
      this.logger.debug(`Relation synced to file: ${relation.from} -> ${relation.to}`);
      
    } catch (error) {
      this.logger.error(`Failed to sync relation to files:`, error);
      throw error;
    }
  }

  async removeRelationFromFiles(relationId) {
    const sharedMemoryPaths = this.config.files?.sharedMemoryPaths || [];
    
    for (const filePath of sharedMemoryPaths) {
      try {
        const fileData = await this.loadJsonFile(filePath);
        
        const initialLength = fileData.relations.length;
        fileData.relations = fileData.relations.filter(r => r.id !== relationId);
        
        if (fileData.relations.length < initialLength) {
          fileData.metadata = fileData.metadata || {};
          fileData.metadata.last_updated = new Date().toISOString();
          fileData.metadata.total_relations = fileData.relations.length;
          
          await this.saveJsonFile(filePath, fileData);
          
          this.logger.debug(`Relation removed from file: ${relationId}`);
          break;
        }
      } catch (error) {
        this.logger.warn(`Failed to remove relation from ${filePath}:`, error.message);
      }
    }
  }

  async syncFileToGraph(filePath) {
    try {
      const fileData = await this.loadJsonFile(filePath);
      const graphData = await this.graphAdapter.getFullGraph();
      
      // Compare and sync entities
      await this.syncEntitiesToGraph(fileData.entities, graphData.entities);
      
      // Compare and sync relations
      await this.syncRelationsToGraph(fileData.relations, graphData.relations);
      
      this.logger.info(`File synced to graph: ${filePath}`);
      
    } catch (error) {
      this.logger.error(`Failed to sync file to graph:`, error);
      throw error;
    }
  }

  async syncEntitiesToGraph(fileEntities, graphEntities) {
    const graphEntityMap = new Map(graphEntities.map(e => [e.id, e]));
    
    // Add or update entities from file
    for (const fileEntity of fileEntities) {
      const graphEntity = graphEntityMap.get(fileEntity.id);
      
      if (!graphEntity) {
        // Add new entity to graph
        await this.graphAdapter.createEntity(fileEntity);
      } else if (this.hasEntityChanged(fileEntity, graphEntity)) {
        // Update existing entity in graph
        await this.graphAdapter.updateEntity(fileEntity.id, fileEntity);
      }
    }
    
    // Remove entities not in file
    const fileEntityIds = new Set(fileEntities.map(e => e.id));
    for (const graphEntity of graphEntities) {
      if (!fileEntityIds.has(graphEntity.id)) {
        await this.graphAdapter.removeEntity(graphEntity.id);
      }
    }
  }

  async syncRelationsToGraph(fileRelations, graphRelations) {
    const graphRelationMap = new Map(graphRelations.map(r => [r.id, r]));
    
    // Add or update relations from file
    for (const fileRelation of fileRelations) {
      const graphRelation = graphRelationMap.get(fileRelation.id);
      
      if (!graphRelation) {
        await this.graphAdapter.createRelation(fileRelation);
      } else if (this.hasRelationChanged(fileRelation, graphRelation)) {
        await this.graphAdapter.updateRelation(fileRelation.id, fileRelation);
      }
    }
    
    // Remove relations not in file
    const fileRelationIds = new Set(fileRelations.map(r => r.id));
    for (const graphRelation of graphRelations) {
      if (!fileRelationIds.has(graphRelation.id)) {
        await this.graphAdapter.removeRelation(graphRelation.id);
      }
    }
  }

  async syncFileWithGraph(filePath, trigger = 'manual') {
    try {
      // Version the current state before sync
      await this.versionManager.createVersion(filePath, trigger);
      
      // Perform sync
      await this.syncFileToGraph(filePath);
      
    } catch (error) {
      this.logger.error(`Failed to sync file with graph:`, error);
      
      // Check for conflicts
      if (error.type === 'conflict') {
        await this.handleSyncConflict(filePath, error);
      } else {
        throw error;
      }
    }
  }

  async performSync(source, target) {
    if (source === 'files' && target === 'graph') {
      return await this.syncAllFilesToGraph();
    } else if (source === 'graph' && target === 'files') {
      return await this.syncGraphToAllFiles();
    } else {
      throw new Error(`Invalid sync direction: ${source} -> ${target}`);
    }
  }

  async forceGraphToFiles() {
    const graphData = await this.graphAdapter.getFullGraph();
    const results = [];
    
    for (const filePath of this.config.files?.sharedMemoryPaths || []) {
      try {
        const fileData = {
          entities: [],
          relations: [],
          metadata: {
            version: '2.0.0',
            last_updated: new Date().toISOString(),
            source: 'force-sync-from-graph'
          }
        };
        
        // Group entities by team/area
        const area = this.extractAreaFromPath(filePath);
        fileData.entities = graphData.entities.filter(e => 
          this.belongsToArea(e, area)
        );
        
        // Include relations for entities in this file
        const entityIds = new Set(fileData.entities.map(e => e.id));
        fileData.relations = graphData.relations.filter(r =>
          entityIds.has(r.from) || entityIds.has(r.to)
        );
        
        await this.saveJsonFile(filePath, fileData);
        
        results.push({
          file: filePath,
          entities: fileData.entities.length,
          relations: fileData.relations.length,
          status: 'success'
        });
        
      } catch (error) {
        results.push({
          file: filePath,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    return results;
  }

  async forceFilesToGraph() {
    // Clear graph first
    await this.graphAdapter.clearGraph();
    
    const results = [];
    
    for (const filePath of this.config.files?.sharedMemoryPaths || []) {
      try {
        const fileData = await this.loadJsonFile(filePath);
        
        // Add all entities
        for (const entity of fileData.entities) {
          await this.graphAdapter.createEntity(entity);
        }
        
        // Add all relations
        for (const relation of fileData.relations) {
          await this.graphAdapter.createRelation(relation);
        }
        
        results.push({
          file: filePath,
          entities: fileData.entities.length,
          relations: fileData.relations.length,
          status: 'success'
        });
        
      } catch (error) {
        results.push({
          file: filePath,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    return results;
  }

  async handleSyncConflict(filePath, conflictError) {
    const conflict = await this.conflictResolver.createConflict({
      type: conflictError.conflictType,
      source: filePath,
      fileData: conflictError.fileData,
      graphData: conflictError.graphData,
      details: conflictError.details
    });
    
    await this.publish('sync/conflict/detected', {
      conflictId: conflict.id,
      source: filePath,
      type: conflict.type,
      details: conflict.details
    });
    
    this.logger.warn(`Sync conflict detected: ${conflict.id}`);
  }

  async handleSyncFailure(operation, error) {
    // Log the failure
    this.logger.error(`Sync operation ${operation.id} failed:`, error);
    
    // Create failure record
    const failure = {
      operationId: operation.id,
      operation,
      error: error.message,
      timestamp: Date.now()
    };
    
    // Store for retry or manual intervention
    await this.versionManager.recordFailure(failure);
    
    // Publish failure event
    await this.publish('sync/operation/failed', failure);
  }

  determineTargetFile(entity) {
    // Determine which shared-memory file based on entity metadata or type
    const team = entity.metadata?.team || 'coding';
    const basePath = '/Users/q284340/Agentic/coding';
    
    return `${basePath}/shared-memory-${team}.json`;
  }

  determineTargetFileForRelation(relation) {
    // Relations go to the same file as their source entity
    // This would need to be looked up from the entity
    return '/Users/q284340/Agentic/coding/shared-memory-coding.json';
  }

  extractAreaFromPath(filePath) {
    const match = filePath.match(/shared-memory-(\w+)\.json$/);
    return match ? match[1] : 'coding';
  }

  belongsToArea(entity, area) {
    return (entity.metadata?.team || 'coding') === area;
  }

  hasEntityChanged(entity1, entity2) {
    // Compare relevant fields to detect changes
    return JSON.stringify({
      name: entity1.name,
      observations: entity1.observations,
      significance: entity1.significance,
      metadata: entity1.metadata
    }) !== JSON.stringify({
      name: entity2.name,
      observations: entity2.observations,
      significance: entity2.significance,
      metadata: entity2.metadata
    });
  }

  hasRelationChanged(relation1, relation2) {
    return JSON.stringify({
      from: relation1.from,
      to: relation1.to,
      relationType: relation1.relationType,
      metadata: relation1.metadata
    }) !== JSON.stringify({
      from: relation2.from,
      to: relation2.to,
      relationType: relation2.relationType,
      metadata: relation2.metadata
    });
  }

  async loadJsonFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty structure
        return {
          entities: [],
          relations: [],
          metadata: {
            version: '2.0.0',
            created: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  }

  async saveJsonFile(filePath, data) {
    const content = JSON.stringify(data, null, 2);
    
    // Calculate and store checksum before writing
    const checksum = crypto.createHash('md5').update(content).digest('hex');
    this.checksums.set(filePath, checksum);
    
    await fs.writeFile(filePath, content, 'utf8');
  }

  async calculateFileChecksum(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  async syncAllFilesToGraph() {
    const results = [];
    
    for (const filePath of this.config.files?.sharedMemoryPaths || []) {
      try {
        await this.syncFileToGraph(filePath);
        results.push({ file: filePath, status: 'success' });
      } catch (error) {
        results.push({ file: filePath, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }

  async syncGraphToAllFiles() {
    const graphData = await this.graphAdapter.getFullGraph();
    const results = [];
    
    // Group entities by area and sync to appropriate files
    const entityGroups = this.groupEntitiesByArea(graphData.entities);
    
    for (const [area, entities] of entityGroups.entries()) {
      const filePath = `/Users/q284340/Agentic/coding/shared-memory-${area}.json`;
      
      try {
        const fileData = await this.loadJsonFile(filePath);
        
        // Update entities
        fileData.entities = entities;
        
        // Update relations (include those involving these entities)
        const entityIds = new Set(entities.map(e => e.id));
        fileData.relations = graphData.relations.filter(r =>
          entityIds.has(r.from) || entityIds.has(r.to)
        );
        
        // Update metadata
        fileData.metadata = fileData.metadata || {};
        fileData.metadata.last_updated = new Date().toISOString();
        fileData.metadata.total_entities = fileData.entities.length;
        fileData.metadata.total_relations = fileData.relations.length;
        
        await this.saveJsonFile(filePath, fileData);
        
        results.push({
          file: filePath,
          entities: fileData.entities.length,
          relations: fileData.relations.length,
          status: 'success'
        });
        
      } catch (error) {
        results.push({
          file: filePath,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    return results;
  }

  groupEntitiesByArea(entities) {
    const groups = new Map();
    
    for (const entity of entities) {
      const area = entity.metadata?.team || 'coding';
      
      if (!groups.has(area)) {
        groups.set(area, []);
      }
      
      groups.get(area).push(entity);
    }
    
    return groups;
  }

  startSyncProcessor() {
    // Process sync queue periodically
    setInterval(() => {
      if (!this.isSyncing && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 5000); // Every 5 seconds
  }

  getCapabilities() {
    return [
      'bidirectional-sync',
      'conflict-resolution',
      'version-management',
      'multi-adapter-support',
      'file-watching',
      'queue-management',
      'checksum-validation',
      'force-sync',
      'rollback-support'
    ];
  }

  getMetadata() {
    return {
      graphAdapter: this.graphAdapter?.getInfo(),
      fileWatcher: this.fileWatcher?.getInfo(),
      syncQueueSize: this.syncQueue.length,
      isSyncing: this.isSyncing,
      lastSyncTimestamps: Object.fromEntries(this.lastSyncTimestamps),
      pendingConflicts: this.conflictResolver?.getPendingCount(),
      config: this.config
    };
  }

  async onStop() {
    // Process remaining sync operations
    if (this.syncQueue.length > 0) {
      this.logger.info(`Processing ${this.syncQueue.length} remaining sync operations...`);
      await this.processSyncQueue();
    }
    
    // Stop file watcher
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
    }
    
    // Close graph adapter connection
    if (this.graphAdapter) {
      await this.graphAdapter.close();
    }
    
    this.logger.info('Synchronization Agent stopped');
  }
}