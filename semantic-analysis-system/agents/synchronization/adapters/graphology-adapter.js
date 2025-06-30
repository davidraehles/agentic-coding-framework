/**
 * Graphology Database Adapter
 * Provides interface to Graphology graph database for CoPilot integration
 */

import { Logger } from '../../../shared/logger.js';
import http from 'http';

export class GraphologyAdapter {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 3002,
      timeout: config.timeout || 30000,
      ...config
    };
    
    this.logger = new Logger('graphology-adapter');
    this.initialized = false;
  }

  async initialize() {
    try {
      // Test Graphology availability
      await this.testConnection();
      
      this.initialized = true;
      this.logger.info('Graphology adapter initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Graphology adapter:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('GET', '/api/graph/status');
      
      if (response.status === 'ok') {
        this.logger.debug('Graphology connection test successful');
        return true;
      }
      
      throw new Error('Graphology service not responding correctly');
      
    } catch (error) {
      this.logger.error('Graphology connection test failed:', error);
      throw new Error(`Graphology service not available: ${error.message}`);
    }
  }

  async getFullGraph() {
    try {
      const response = await this.makeRequest('GET', '/api/graph');
      
      return {
        entities: response.nodes || [],
        relations: response.edges || [],
        metadata: response.metadata || {}
      };
      
    } catch (error) {
      this.logger.error('Failed to get full graph:', error);
      throw error;
    }
  }

  async createEntity(entity) {
    try {
      const node = this.convertToGraphologyNode(entity);
      
      const response = await this.makeRequest('POST', '/api/graph/nodes', node);
      
      this.logger.debug(`Entity created in Graphology: ${entity.name}`);
      return this.convertFromGraphologyNode(response);
      
    } catch (error) {
      this.logger.error('Failed to create entity in Graphology:', error);
      throw error;
    }
  }

  async updateEntity(entityId, updates) {
    try {
      const node = this.convertToGraphologyNode({ id: entityId, ...updates });
      
      const response = await this.makeRequest('PUT', `/api/graph/nodes/${entityId}`, node);
      
      this.logger.debug(`Entity updated in Graphology: ${entityId}`);
      return this.convertFromGraphologyNode(response);
      
    } catch (error) {
      this.logger.error('Failed to update entity in Graphology:', error);
      throw error;
    }
  }

  async removeEntity(entityId) {
    try {
      await this.makeRequest('DELETE', `/api/graph/nodes/${entityId}`);
      
      this.logger.debug(`Entity removed from Graphology: ${entityId}`);
      
    } catch (error) {
      this.logger.error('Failed to remove entity from Graphology:', error);
      throw error;
    }
  }

  async createRelation(relation) {
    try {
      const edge = this.convertToGraphologyEdge(relation);
      
      const response = await this.makeRequest('POST', '/api/graph/edges', edge);
      
      this.logger.debug(`Relation created in Graphology: ${relation.from} -> ${relation.to}`);
      return this.convertFromGraphologyEdge(response);
      
    } catch (error) {
      this.logger.error('Failed to create relation in Graphology:', error);
      throw error;
    }
  }

  async updateRelation(relationId, updates) {
    try {
      const edge = this.convertToGraphologyEdge({ id: relationId, ...updates });
      
      const response = await this.makeRequest('PUT', `/api/graph/edges/${relationId}`, edge);
      
      return this.convertFromGraphologyEdge(response);
      
    } catch (error) {
      this.logger.error('Failed to update relation in Graphology:', error);
      throw error;
    }
  }

  async removeRelation(relationId) {
    try {
      await this.makeRequest('DELETE', `/api/graph/edges/${relationId}`);
      
      this.logger.debug(`Relation removed from Graphology: ${relationId}`);
      
    } catch (error) {
      this.logger.error('Failed to remove relation from Graphology:', error);
      throw error;
    }
  }

  async clearGraph() {
    try {
      await this.makeRequest('DELETE', '/api/graph');
      
      this.logger.info('Graphology graph cleared');
      
    } catch (error) {
      this.logger.error('Failed to clear Graphology graph:', error);
      throw error;
    }
  }

  async searchNodes(query) {
    try {
      const response = await this.makeRequest('GET', `/api/graph/search?q=${encodeURIComponent(query)}`);
      
      return {
        entities: (response.nodes || []).map(n => this.convertFromGraphologyNode(n)),
        relations: (response.edges || []).map(e => this.convertFromGraphologyEdge(e))
      };
      
    } catch (error) {
      this.logger.error('Failed to search nodes in Graphology:', error);
      throw error;
    }
  }

  // Conversion methods
  convertToGraphologyNode(entity) {
    return {
      id: entity.id,
      label: entity.name,
      attributes: {
        type: entity.entityType,
        significance: entity.significance,
        observations: entity.observations,
        metadata: entity.metadata,
        created: entity.created || new Date().toISOString(),
        updated: entity.updated || new Date().toISOString()
      }
    };
  }

  convertFromGraphologyNode(node) {
    return {
      id: node.id,
      name: node.label,
      entityType: node.attributes?.type || 'Unknown',
      significance: node.attributes?.significance || 5,
      observations: node.attributes?.observations || [],
      metadata: node.attributes?.metadata || {},
      created: node.attributes?.created,
      updated: node.attributes?.updated
    };
  }

  convertToGraphologyEdge(relation) {
    return {
      id: relation.id,
      source: relation.from,
      target: relation.to,
      type: relation.relationType,
      attributes: {
        metadata: relation.metadata,
        created: relation.created || new Date().toISOString()
      }
    };
  }

  convertFromGraphologyEdge(edge) {
    return {
      id: edge.id,
      from: edge.source,
      to: edge.target,
      relationType: edge.type,
      metadata: edge.attributes?.metadata || {},
      created: edge.attributes?.created
    };
  }

  // HTTP request helper
  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`Graphology request failed: ${res.statusCode} - ${parsed.error || responseData}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse Graphology response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Graphology request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Graphology request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async close() {
    // Clean up any connections
    this.initialized = false;
    this.logger.info('Graphology adapter closed');
  }

  getInfo() {
    return {
      type: 'graphology',
      initialized: this.initialized,
      config: {
        host: this.config.host,
        port: this.config.port
      }
    };
  }
}