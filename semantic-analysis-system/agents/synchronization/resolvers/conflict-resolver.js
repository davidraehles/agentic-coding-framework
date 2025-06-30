/**
 * Conflict Resolver
 * Handles sync conflicts between graph database and JSON files
 */

import crypto from 'crypto';
import { Logger } from '../../../shared/logger.js';

export class ConflictResolver {
  constructor(config = {}) {
    this.config = {
      strategy: config.strategy || 'manual', // 'manual', 'latest-wins', 'merge'
      autoResolveThreshold: config.autoResolveThreshold || 0.95,
      ...config
    };
    
    this.logger = new Logger('conflict-resolver');
    this.conflicts = new Map();
  }

  async createConflict(conflictData) {
    const conflict = {
      id: crypto.randomUUID(),
      type: conflictData.type,
      source: conflictData.source,
      fileData: conflictData.fileData,
      graphData: conflictData.graphData,
      details: conflictData.details,
      created: new Date().toISOString(),
      status: 'pending',
      resolution: null
    };
    
    this.conflicts.set(conflict.id, conflict);
    
    // Attempt auto-resolution based on strategy
    if (this.config.strategy !== 'manual') {
      await this.attemptAutoResolve(conflict);
    }
    
    return conflict;
  }

  async resolveConflict(conflictId, resolution) {
    const conflict = this.conflicts.get(conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }
    
    if (conflict.status !== 'pending') {
      throw new Error(`Conflict already resolved: ${conflictId}`);
    }
    
    // Apply resolution
    const result = await this.applyResolution(conflict, resolution);
    
    // Update conflict status
    conflict.status = 'resolved';
    conflict.resolution = resolution;
    conflict.resolved = new Date().toISOString();
    conflict.result = result;
    
    this.logger.info(`Conflict resolved: ${conflictId} - ${resolution.strategy}`);
    
    return result;
  }

  async attemptAutoResolve(conflict) {
    try {
      let resolution = null;
      
      switch (this.config.strategy) {
        case 'latest-wins':
          resolution = await this.resolveLatestWins(conflict);
          break;
        
        case 'merge':
          resolution = await this.resolveMerge(conflict);
          break;
        
        default:
          return; // Manual resolution required
      }
      
      if (resolution) {
        await this.resolveConflict(conflict.id, resolution);
      }
      
    } catch (error) {
      this.logger.warn(`Auto-resolution failed for conflict ${conflict.id}:`, error.message);
    }
  }

  async resolveLatestWins(conflict) {
    // Compare timestamps to determine which is newer
    const fileTimestamp = new Date(conflict.fileData?.metadata?.last_updated || 0);
    const graphTimestamp = new Date(conflict.graphData?.metadata?.last_updated || 0);
    
    if (fileTimestamp > graphTimestamp) {
      return {
        strategy: 'use-file',
        reason: 'File data is more recent',
        automatic: true
      };
    } else {
      return {
        strategy: 'use-graph',
        reason: 'Graph data is more recent',
        automatic: true
      };
    }
  }

  async resolveMerge(conflict) {
    // Attempt to merge data based on conflict type
    switch (conflict.type) {
      case 'entity-mismatch':
        return this.mergeEntityConflict(conflict);
      
      case 'relation-mismatch':
        return this.mergeRelationConflict(conflict);
      
      default:
        return null; // Cannot auto-merge
    }
  }

  mergeEntityConflict(conflict) {
    const fileEntity = conflict.fileData;
    const graphEntity = conflict.graphData;
    
    // Calculate similarity
    const similarity = this.calculateEntitySimilarity(fileEntity, graphEntity);
    
    if (similarity >= this.config.autoResolveThreshold) {
      // Merge observations and metadata
      const mergedObservations = this.mergeArrays(
        fileEntity.observations || [],
        graphEntity.observations || []
      );
      
      const mergedMetadata = {
        ...graphEntity.metadata,
        ...fileEntity.metadata,
        merged: true,
        mergedAt: new Date().toISOString()
      };
      
      return {
        strategy: 'merge',
        mergedData: {
          ...graphEntity,
          ...fileEntity,
          observations: mergedObservations,
          metadata: mergedMetadata,
          significance: Math.max(
            fileEntity.significance || 5,
            graphEntity.significance || 5
          )
        },
        similarity,
        automatic: true
      };
    }
    
    return null; // Too different to auto-merge
  }

  mergeRelationConflict(conflict) {
    const fileRelation = conflict.fileData;
    const graphRelation = conflict.graphData;
    
    // Relations are simpler - check if they're essentially the same
    if (fileRelation.from === graphRelation.from &&
        fileRelation.to === graphRelation.to &&
        fileRelation.relationType === graphRelation.relationType) {
      
      // Merge metadata
      const mergedMetadata = {
        ...graphRelation.metadata,
        ...fileRelation.metadata,
        merged: true,
        mergedAt: new Date().toISOString()
      };
      
      return {
        strategy: 'merge',
        mergedData: {
          ...graphRelation,
          ...fileRelation,
          metadata: mergedMetadata
        },
        automatic: true
      };
    }
    
    return null;
  }

  calculateEntitySimilarity(entity1, entity2) {
    // Simple similarity calculation based on key fields
    let score = 0;
    let factors = 0;
    
    // Name similarity
    if (entity1.name === entity2.name) {
      score += 0.3;
    }
    factors += 0.3;
    
    // Type similarity
    if (entity1.entityType === entity2.entityType) {
      score += 0.2;
    }
    factors += 0.2;
    
    // Observations overlap
    const obs1 = new Set(entity1.observations || []);
    const obs2 = new Set(entity2.observations || []);
    const intersection = new Set([...obs1].filter(x => obs2.has(x)));
    const union = new Set([...obs1, ...obs2]);
    
    if (union.size > 0) {
      score += (intersection.size / union.size) * 0.5;
    }
    factors += 0.5;
    
    return factors > 0 ? score / factors : 0;
  }

  mergeArrays(arr1, arr2) {
    // Merge arrays removing duplicates
    const merged = [...arr1];
    
    for (const item of arr2) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    
    return merged;
  }

  async applyResolution(conflict, resolution) {
    const result = {
      conflictId: conflict.id,
      strategy: resolution.strategy,
      applied: true,
      changes: []
    };
    
    switch (resolution.strategy) {
      case 'use-file':
        result.data = conflict.fileData;
        result.changes.push('Used file data, discarded graph data');
        break;
      
      case 'use-graph':
        result.data = conflict.graphData;
        result.changes.push('Used graph data, discarded file data');
        break;
      
      case 'merge':
        result.data = resolution.mergedData;
        result.changes.push('Merged file and graph data');
        break;
      
      case 'custom':
        result.data = resolution.customData;
        result.changes.push('Applied custom resolution');
        break;
      
      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
    }
    
    return result;
  }

  getPendingConflicts() {
    const pending = [];
    
    for (const [id, conflict] of this.conflicts) {
      if (conflict.status === 'pending') {
        pending.push({
          id,
          type: conflict.type,
          source: conflict.source,
          created: conflict.created
        });
      }
    }
    
    return pending;
  }

  getPendingCount() {
    let count = 0;
    
    for (const conflict of this.conflicts.values()) {
      if (conflict.status === 'pending') {
        count++;
      }
    }
    
    return count;
  }

  getConflict(conflictId) {
    return this.conflicts.get(conflictId);
  }

  clearResolved() {
    const resolved = [];
    
    for (const [id, conflict] of this.conflicts) {
      if (conflict.status === 'resolved') {
        resolved.push(id);
      }
    }
    
    for (const id of resolved) {
      this.conflicts.delete(id);
    }
    
    this.logger.debug(`Cleared ${resolved.length} resolved conflicts`);
    
    return resolved.length;
  }

  getInfo() {
    const stats = {
      total: this.conflicts.size,
      pending: 0,
      resolved: 0,
      automatic: 0
    };
    
    for (const conflict of this.conflicts.values()) {
      if (conflict.status === 'pending') {
        stats.pending++;
      } else {
        stats.resolved++;
        if (conflict.resolution?.automatic) {
          stats.automatic++;
        }
      }
    }
    
    return {
      strategy: this.config.strategy,
      conflicts: stats,
      autoResolveThreshold: this.config.autoResolveThreshold
    };
  }
}