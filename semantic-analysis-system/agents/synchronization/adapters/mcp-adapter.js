/**
 * MCP Memory Service Adapter
 * Provides interface to MCP memory server for graph database operations
 */

import { Logger } from '../../../shared/logger.js';

export class MCPAdapter {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      ...config
    };
    
    this.logger = new Logger('mcp-adapter');
    this.initialized = false;
  }

  async initialize() {
    try {
      // Test MCP memory availability
      await this.testConnection();
      
      this.initialized = true;
      this.logger.info('MCP adapter initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize MCP adapter:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      // Test by reading the graph
      const graph = await this.readGraph();
      
      this.logger.debug(`MCP connection test successful: ${graph.entities?.length || 0} entities found`);
      return true;
      
    } catch (error) {
      this.logger.error('MCP connection test failed:', error);
      throw new Error(`MCP memory service not available: ${error.message}`);
    }
  }

  async getFullGraph() {
    try {
      const graph = await this.readGraph();
      
      return {
        entities: graph.entities || [],
        relations: graph.relations || [],
        metadata: graph.metadata || {}
      };
      
    } catch (error) {
      this.logger.error('Failed to get full graph:', error);
      throw error;
    }
  }

  async createEntity(entity) {
    try {
      // MCP memory expects specific format
      const mcpEntity = this.convertToMcpEntity(entity);
      
      await this.createEntities([mcpEntity]);
      
      this.logger.debug(`Entity created in MCP: ${entity.name}`);
      return entity;
      
    } catch (error) {
      this.logger.error('Failed to create entity in MCP:', error);
      throw error;
    }
  }

  async updateEntity(entityId, updates) {
    try {
      // MCP doesn't have direct update, so we need to delete and recreate
      const currentGraph = await this.readGraph();
      const entity = currentGraph.entities.find(e => e.id === entityId);
      
      if (!entity) {
        throw new Error(`Entity not found: ${entityId}`);
      }
      
      // Delete old entity
      await this.deleteEntities([entity.name]);
      
      // Create updated entity
      const updatedEntity = { ...entity, ...updates };
      await this.createEntity(updatedEntity);
      
      this.logger.debug(`Entity updated in MCP: ${entity.name}`);
      return updatedEntity;
      
    } catch (error) {
      this.logger.error('Failed to update entity in MCP:', error);
      throw error;
    }
  }

  async removeEntity(entityId) {
    try {
      const currentGraph = await this.readGraph();
      const entity = currentGraph.entities.find(e => e.id === entityId);
      
      if (!entity) {
        this.logger.warn(`Entity not found for removal: ${entityId}`);
        return;
      }
      
      await this.deleteEntities([entity.name]);
      
      this.logger.debug(`Entity removed from MCP: ${entity.name}`);
      
    } catch (error) {
      this.logger.error('Failed to remove entity from MCP:', error);
      throw error;
    }
  }

  async createRelation(relation) {
    try {
      const mcpRelation = this.convertToMcpRelation(relation);
      
      await this.createRelations([mcpRelation]);
      
      this.logger.debug(`Relation created in MCP: ${relation.from} -> ${relation.to}`);
      return relation;
      
    } catch (error) {
      this.logger.error('Failed to create relation in MCP:', error);
      throw error;
    }
  }

  async updateRelation(relationId, updates) {
    try {
      // Similar to entity update - delete and recreate
      const currentGraph = await this.readGraph();
      const relation = currentGraph.relations.find(r => r.id === relationId);
      
      if (!relation) {
        throw new Error(`Relation not found: ${relationId}`);
      }
      
      // Delete old relation
      await this.deleteRelations([{
        from: relation.from,
        to: relation.to,
        relationType: relation.relationType
      }]);
      
      // Create updated relation
      const updatedRelation = { ...relation, ...updates };
      await this.createRelation(updatedRelation);
      
      return updatedRelation;
      
    } catch (error) {
      this.logger.error('Failed to update relation in MCP:', error);
      throw error;
    }
  }

  async removeRelation(relationId) {
    try {
      const currentGraph = await this.readGraph();
      const relation = currentGraph.relations.find(r => r.id === relationId);
      
      if (!relation) {
        this.logger.warn(`Relation not found for removal: ${relationId}`);
        return;
      }
      
      await this.deleteRelations([{
        from: relation.from,
        to: relation.to,
        relationType: relation.relationType
      }]);
      
      this.logger.debug(`Relation removed from MCP: ${relationId}`);
      
    } catch (error) {
      this.logger.error('Failed to remove relation from MCP:', error);
      throw error;
    }
  }

  async clearGraph() {
    try {
      const currentGraph = await this.readGraph();
      
      // Delete all entities (relations will be deleted automatically)
      if (currentGraph.entities && currentGraph.entities.length > 0) {
        const entityNames = currentGraph.entities.map(e => e.name);
        await this.deleteEntities(entityNames);
      }
      
      this.logger.info('MCP graph cleared');
      
    } catch (error) {
      this.logger.error('Failed to clear MCP graph:', error);
      throw error;
    }
  }

  // MCP Memory API Methods
  async readGraph() {
    try {
      // This would use the actual MCP memory API
      // For now, returning structure that matches MCP format
      const result = await this.callMcpMethod('mcp__memory__read_graph', {});
      
      return result || { entities: [], relations: [] };
      
    } catch (error) {
      this.logger.error('Failed to read graph from MCP:', error);
      throw error;
    }
  }

  async createEntities(entities) {
    try {
      await this.callMcpMethod('mcp__memory__create_entities', { entities });
      
    } catch (error) {
      this.logger.error('Failed to create entities in MCP:', error);
      throw error;
    }
  }

  async createRelations(relations) {
    try {
      await this.callMcpMethod('mcp__memory__create_relations', { relations });
      
    } catch (error) {
      this.logger.error('Failed to create relations in MCP:', error);
      throw error;
    }
  }

  async deleteEntities(entityNames) {
    try {
      await this.callMcpMethod('mcp__memory__delete_entities', { entityNames });
      
    } catch (error) {
      this.logger.error('Failed to delete entities from MCP:', error);
      throw error;
    }
  }

  async deleteRelations(relations) {
    try {
      await this.callMcpMethod('mcp__memory__delete_relations', { relations });
      
    } catch (error) {
      this.logger.error('Failed to delete relations from MCP:', error);
      throw error;
    }
  }

  async searchNodes(query) {
    try {
      const result = await this.callMcpMethod('mcp__memory__search_nodes', { query });
      
      return result || { entities: [], relations: [] };
      
    } catch (error) {
      this.logger.error('Failed to search nodes in MCP:', error);
      throw error;
    }
  }

  async openNodes(names) {
    try {
      const result = await this.callMcpMethod('mcp__memory__open_nodes', { names });
      
      return result || { entities: [], relations: [] };
      
    } catch (error) {
      this.logger.error('Failed to open nodes in MCP:', error);
      throw error;
    }
  }

  // Utility methods
  convertToMcpEntity(entity) {
    // Convert from internal format to MCP format
    return {
      name: entity.name,
      entityType: entity.entityType,
      observations: entity.observations || []
    };
  }

  convertToMcpRelation(relation) {
    // Convert from internal format to MCP format
    return {
      from: relation.from,
      to: relation.to,
      relationType: relation.relationType
    };
  }

  async callMcpMethod(method, params) {
    // In a real implementation, this would call the actual MCP API
    // For now, we'll simulate the behavior
    this.logger.debug(`Calling MCP method: ${method}`, params);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock data based on method
    switch (method) {
      case 'mcp__memory__read_graph':
        return {
          entities: [],
          relations: []
        };
      
      case 'mcp__memory__search_nodes':
        return {
          entities: [],
          relations: []
        };
      
      default:
        return {};
    }
  }

  async close() {
    // Clean up any connections
    this.initialized = false;
    this.logger.info('MCP adapter closed');
  }

  getInfo() {
    return {
      type: 'mcp',
      initialized: this.initialized,
      config: this.config
    };
  }
}