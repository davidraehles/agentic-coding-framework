const path = require('path');
const fs = require('fs').promises;
const Graph = require('graphology');
const { subgraph } = require('graphology-utils');

class MemoryFallbackService {
  constructor(config = {}) {
    this.dbPath = config.dbPath || path.join(process.cwd(), '.coding-tools', 'memory.json');
    this.graph = new Graph({ multi: true }); // Allow multiple edges between nodes
    this.initialized = false;
  }

  async initialize() {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      // Load existing graph if it exists
      await this.loadGraph();
      
      this.initialized = true;
      console.log(`Memory service initialized with ${this.graph.order} nodes and ${this.graph.size} edges`);
    } catch (error) {
      throw new Error(`Failed to initialize memory service: ${error.message}`);
    }
  }

  async cleanup() {
    // Save graph before cleanup
    if (this.initialized) {
      await this.saveGraph();
    }
  }

  /**
   * Load graph from persistent storage
   */
  async loadGraph() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const graphData = JSON.parse(data);
      
      // Clear existing graph
      this.graph.clear();
      
      // Import nodes
      if (graphData.nodes) {
        for (const node of graphData.nodes) {
          this.graph.addNode(node.key, node.attributes);
        }
      }
      
      // Import edges
      if (graphData.edges) {
        for (const edge of graphData.edges) {
          this.graph.addEdge(edge.source, edge.target, edge.attributes);
        }
      }
      
    } catch (error) {
      // File doesn't exist or is invalid, start with empty graph
      console.log('No existing graph data found, starting fresh');
    }
  }

  /**
   * Save graph to persistent storage
   */
  async saveGraph() {
    try {
      const graphData = {
        nodes: this.graph.mapNodes((node, attributes) => ({
          key: node,
          attributes
        })),
        edges: this.graph.mapEdges((edge, attributes, source, target) => ({
          source,
          target,
          attributes
        })),
        metadata: {
          lastSaved: new Date().toISOString(),
          nodeCount: this.graph.order,
          edgeCount: this.graph.size
        }
      };
      
      await fs.writeFile(this.dbPath, JSON.stringify(graphData, null, 2));
    } catch (error) {
      console.error('Failed to save graph:', error.message);
    }
  }

  /**
   * Create entities in the graph
   */
  async createEntities(entities) {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const created = [];
    const updated = [];
    
    for (const entity of entities) {
      const nodeId = this.getNodeId(entity.name);
      
      if (this.graph.hasNode(nodeId)) {
        // Update existing node
        const existing = this.graph.getNodeAttributes(nodeId);
        const updatedAttributes = {
          ...existing,
          ...entity,
          observations: [
            ...(existing.observations || []),
            ...(entity.observations || [])
          ],
          lastUpdated: new Date().toISOString()
        };
        
        this.graph.replaceNodeAttributes(nodeId, updatedAttributes);
        updated.push(entity.name);
      } else {
        // Create new node
        this.graph.addNode(nodeId, {
          ...entity,
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        created.push(entity.name);
      }
    }
    
    // Save after modifications
    await this.saveGraph();
    
    return { 
      success: true, 
      created: created.length,
      updated: updated.length,
      total: entities.length 
    };
  }

  /**
   * Create relations between entities
   */
  async createRelations(relations) {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const created = [];
    const failed = [];
    
    for (const relation of relations) {
      const sourceId = this.getNodeId(relation.from);
      const targetId = this.getNodeId(relation.to);
      
      // Ensure both nodes exist
      if (!this.graph.hasNode(sourceId)) {
        this.graph.addNode(sourceId, {
          name: relation.from,
          entityType: 'Unknown',
          created: new Date().toISOString()
        });
      }
      
      if (!this.graph.hasNode(targetId)) {
        this.graph.addNode(targetId, {
          name: relation.to,
          entityType: 'Unknown',
          created: new Date().toISOString()
        });
      }
      
      try {
        // Add edge with relation type as attribute
        this.graph.addEdge(sourceId, targetId, {
          relationType: relation.relationType,
          created: new Date().toISOString()
        });
        created.push(relation);
      } catch (error) {
        // Edge might already exist, update it
        const existingEdges = this.graph.edges(sourceId, targetId);
        if (existingEdges.length > 0) {
          // Update first matching edge
          this.graph.replaceEdgeAttributes(existingEdges[0], {
            relationType: relation.relationType,
            updated: new Date().toISOString()
          });
          created.push(relation);
        } else {
          failed.push(relation);
        }
      }
    }
    
    // Save after modifications
    await this.saveGraph();
    
    return { 
      success: true, 
      created: created.length,
      failed: failed.length 
    };
  }

  /**
   * Search for nodes matching a query
   */
  async searchNodes(query) {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    this.graph.forEachNode((node, attributes) => {
      // Search in node name
      if (attributes.name && attributes.name.toLowerCase().includes(queryLower)) {
        results.push(this.formatNode(node, attributes));
        return;
      }
      
      // Search in entity type
      if (attributes.entityType && attributes.entityType.toLowerCase().includes(queryLower)) {
        results.push(this.formatNode(node, attributes));
        return;
      }
      
      // Search in observations
      if (attributes.observations && Array.isArray(attributes.observations)) {
        for (const obs of attributes.observations) {
          if (typeof obs === 'string' && obs.toLowerCase().includes(queryLower)) {
            results.push(this.formatNode(node, attributes));
            return;
          }
        }
      }
    });
    
    return results;
  }

  /**
   * Read the entire graph
   */
  async readGraph() {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const nodes = this.graph.mapNodes((node, attributes) => 
      this.formatNode(node, attributes)
    );
    
    const edges = this.graph.mapEdges((edge, attributes, source, target) => ({
      from: this.graph.getNodeAttribute(source, 'name'),
      to: this.graph.getNodeAttribute(target, 'name'),
      relationType: attributes.relationType || 'related'
    }));
    
    return { 
      nodes, 
      edges,
      metadata: {
        nodeCount: this.graph.order,
        edgeCount: this.graph.size,
        lastAccessed: new Date().toISOString()
      }
    };
  }

  /**
   * Delete entities
   */
  async deleteEntities(entityNames) {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const deleted = [];
    const notFound = [];
    
    for (const name of entityNames) {
      const nodeId = this.getNodeId(name);
      
      if (this.graph.hasNode(nodeId)) {
        this.graph.dropNode(nodeId);
        deleted.push(name);
      } else {
        notFound.push(name);
      }
    }
    
    // Save after modifications
    await this.saveGraph();
    
    return { 
      success: true, 
      deleted: deleted.length,
      notFound: notFound.length 
    };
  }

  /**
   * Get nodes connected to a specific node
   */
  async getConnectedNodes(entityName, depth = 1) {
    if (!this.initialized) throw new Error('Memory service not initialized');
    
    const nodeId = this.getNodeId(entityName);
    if (!this.graph.hasNode(nodeId)) {
      return { nodes: [], edges: [] };
    }
    
    const connectedNodes = new Set([nodeId]);
    const connectedEdges = new Set();
    
    // BFS to find nodes within specified depth
    const queue = [{ node: nodeId, currentDepth: 0 }];
    const visited = new Set([nodeId]);
    
    while (queue.length > 0) {
      const { node, currentDepth } = queue.shift();
      
      if (currentDepth < depth) {
        // Get neighbors
        this.graph.forEachNeighbor(node, (neighbor) => {
          connectedNodes.add(neighbor);
          
          // Add edges
          this.graph.forEachEdge(node, neighbor, (edge) => {
            connectedEdges.add(edge);
          });
          
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ node: neighbor, currentDepth: currentDepth + 1 });
          }
        });
      }
    }
    
    // Format results
    const nodes = Array.from(connectedNodes).map(nodeId => 
      this.formatNode(nodeId, this.graph.getNodeAttributes(nodeId))
    );
    
    const edges = Array.from(connectedEdges).map(edgeId => {
      const edgeData = this.graph.getEdgeAttributes(edgeId);
      const { source, target } = this.graph.extremities(edgeId);
      return {
        from: this.graph.getNodeAttribute(source, 'name'),
        to: this.graph.getNodeAttribute(target, 'name'),
        relationType: edgeData.relationType || 'related'
      };
    });
    
    return { nodes, edges };
  }

  /**
   * Import data from MCP memory format
   */
  async importFromMCP(data) {
    if (data.nodes) {
      const entities = data.nodes.map(node => ({
        name: node.name,
        entityType: node.entityType,
        observations: node.observations || []
      }));
      await this.createEntities(entities);
    }
    
    if (data.edges) {
      await this.createRelations(data.edges);
    }
    
    return { success: true };
  }

  /**
   * Export data to MCP memory format
   */
  async exportToMCP() {
    const graph = await this.readGraph();
    return {
      nodes: graph.nodes,
      edges: graph.edges
    };
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return {
      nodes: this.graph.order,
      edges: this.graph.size,
      density: this.graph.size / (this.graph.order * (this.graph.order - 1)),
      components: this.graph.order > 0 ? 1 : 0 // Simplified
    };
  }

  // Helper methods
  
  getNodeId(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  formatNode(nodeId, attributes) {
    return {
      name: attributes.name,
      entityType: attributes.entityType,
      observations: attributes.observations || [],
      created: attributes.created,
      lastUpdated: attributes.lastUpdated
    };
  }
}

module.exports = MemoryFallbackService;