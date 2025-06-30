/**
 * Entity Merger
 * Merges duplicate entities using various strategies
 */

import { Logger } from '../../../shared/logger.js';

export class EntityMerger {
  constructor(config = {}) {
    this.config = {
      strategy: config.strategy || 'auto', // 'auto', 'weighted', 'priority', 'manual'
      preserveHistory: config.preserveHistory !== false,
      conflictResolution: config.conflictResolution || 'merge',
      ...config
    };
    
    this.logger = new Logger('entity-merger');
  }

  async merge(sourceEntity, targetEntity, strategy = null) {
    const mergeStrategy = strategy || this.config.strategy;
    
    this.logger.info(`Merging entities using strategy: ${mergeStrategy}`);
    
    try {
      switch (mergeStrategy) {
        case 'auto':
          return this.autoMerge(sourceEntity, targetEntity);
        
        case 'weighted':
          return this.weightedMerge(sourceEntity, targetEntity);
        
        case 'priority':
          return this.priorityMerge(sourceEntity, targetEntity);
        
        case 'union':
          return this.unionMerge(sourceEntity, targetEntity);
        
        case 'intersection':
          return this.intersectionMerge(sourceEntity, targetEntity);
        
        case 'manual':
          return this.manualMerge(sourceEntity, targetEntity);
        
        default:
          throw new Error(`Unknown merge strategy: ${mergeStrategy}`);
      }
      
    } catch (error) {
      this.logger.error('Entity merge failed:', error);
      throw error;
    }
  }

  autoMerge(sourceEntity, targetEntity) {
    // Automatic merge based on entity characteristics
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    // Use the entity with higher significance as primary
    const primary = sourceEntity.significance >= targetEntity.significance 
      ? sourceEntity 
      : targetEntity;
    const secondary = primary === sourceEntity ? targetEntity : sourceEntity;
    
    // Merge fields
    merged.name = this.mergeName(primary, secondary);
    merged.entityType = primary.entityType;
    merged.significance = Math.max(primary.significance, secondary.significance);
    merged.observations = this.mergeObservations(primary.observations, secondary.observations);
    merged.metadata = this.mergeMetadata(primary.metadata, secondary.metadata);
    
    return merged;
  }

  weightedMerge(sourceEntity, targetEntity) {
    // Weighted merge based on entity quality scores
    const sourceWeight = this.calculateEntityWeight(sourceEntity);
    const targetWeight = this.calculateEntityWeight(targetEntity);
    
    const totalWeight = sourceWeight + targetWeight;
    const sourceRatio = sourceWeight / totalWeight;
    const targetRatio = targetWeight / totalWeight;
    
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    // Weighted field selection
    if (sourceRatio > 0.6) {
      merged.name = sourceEntity.name;
      merged.entityType = sourceEntity.entityType;
    } else if (targetRatio > 0.6) {
      merged.name = targetEntity.name;
      merged.entityType = targetEntity.entityType;
    } else {
      // Close weights - use other criteria
      merged.name = this.selectBetterName(sourceEntity.name, targetEntity.name);
      merged.entityType = sourceEntity.entityType; // Default to source
    }
    
    // Weighted significance
    merged.significance = Math.round(
      sourceEntity.significance * sourceRatio + 
      targetEntity.significance * targetRatio
    );
    
    merged.observations = this.mergeObservations(sourceEntity.observations, targetEntity.observations);
    merged.metadata = this.mergeMetadata(sourceEntity.metadata, targetEntity.metadata);
    merged.metadata.mergeWeights = { source: sourceRatio, target: targetRatio };
    
    return merged;
  }

  priorityMerge(sourceEntity, targetEntity) {
    // Priority-based merge using predefined rules
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    // Priority rules
    const primary = this.selectPrimaryEntity(sourceEntity, targetEntity);
    const secondary = primary === sourceEntity ? targetEntity : sourceEntity;
    
    merged.name = primary.name;
    merged.entityType = primary.entityType;
    merged.significance = Math.max(primary.significance, secondary.significance);
    merged.observations = this.mergeObservations(primary.observations, secondary.observations);
    merged.metadata = this.mergeMetadata(primary.metadata, secondary.metadata);
    
    return merged;
  }

  unionMerge(sourceEntity, targetEntity) {
    // Union merge - combine all information
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    merged.name = this.selectBetterName(sourceEntity.name, targetEntity.name);
    merged.entityType = sourceEntity.entityType; // Use source type
    merged.significance = Math.max(sourceEntity.significance, targetEntity.significance);
    merged.observations = this.mergeObservations(sourceEntity.observations, targetEntity.observations);
    merged.metadata = this.mergeMetadata(sourceEntity.metadata, targetEntity.metadata);
    
    // Add alternative names
    if (sourceEntity.name !== targetEntity.name) {
      merged.metadata.alternativeNames = merged.metadata.alternativeNames || [];
      if (!merged.metadata.alternativeNames.includes(sourceEntity.name)) {
        merged.metadata.alternativeNames.push(sourceEntity.name);
      }
      if (!merged.metadata.alternativeNames.includes(targetEntity.name)) {
        merged.metadata.alternativeNames.push(targetEntity.name);
      }
    }
    
    return merged;
  }

  intersectionMerge(sourceEntity, targetEntity) {
    // Intersection merge - only keep common information
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    merged.name = this.selectBetterName(sourceEntity.name, targetEntity.name);
    merged.entityType = sourceEntity.entityType === targetEntity.entityType 
      ? sourceEntity.entityType 
      : 'Mixed';
    merged.significance = Math.min(sourceEntity.significance, targetEntity.significance);
    
    // Only keep common observations
    merged.observations = this.getCommonObservations(sourceEntity.observations, targetEntity.observations);
    
    // Only keep common metadata
    merged.metadata = this.getCommonMetadata(sourceEntity.metadata, targetEntity.metadata);
    
    return merged;
  }

  manualMerge(sourceEntity, targetEntity) {
    // Manual merge - requires human intervention
    // For now, return a merge template that would be filled manually
    const merged = this.createBaseMergedEntity(sourceEntity, targetEntity);
    
    merged.name = `[MANUAL] ${sourceEntity.name} + ${targetEntity.name}`;
    merged.entityType = 'ManualMergeRequired';
    merged.significance = Math.max(sourceEntity.significance, targetEntity.significance);
    merged.observations = [
      '[MANUAL MERGE REQUIRED]',
      `Source: ${sourceEntity.name}`,
      `Target: ${targetEntity.name}`,
      ...sourceEntity.observations.map(obs => `[SOURCE] ${obs}`),
      ...targetEntity.observations.map(obs => `[TARGET] ${obs}`)
    ];
    
    merged.metadata = {
      ...this.mergeMetadata(sourceEntity.metadata, targetEntity.metadata),
      mergeStatus: 'manual-required',
      sourceEntity: { id: sourceEntity.id, name: sourceEntity.name },
      targetEntity: { id: targetEntity.id, name: targetEntity.name }
    };
    
    return merged;
  }

  createBaseMergedEntity(sourceEntity, targetEntity) {
    return {
      id: targetEntity.id, // Keep target ID
      created: sourceEntity.created < targetEntity.created 
        ? sourceEntity.created 
        : targetEntity.created,
      updated: new Date().toISOString(),
      name: '',
      entityType: '',
      significance: 0,
      observations: [],
      metadata: {
        merged: true,
        mergedAt: new Date().toISOString(),
        sourceEntities: [
          { id: sourceEntity.id, name: sourceEntity.name },
          { id: targetEntity.id, name: targetEntity.name }
        ],
        mergeStrategy: this.config.strategy
      }
    };
  }

  mergeName(primary, secondary) {
    // Select the better name based on various criteria
    return this.selectBetterName(primary.name, secondary.name);
  }

  selectBetterName(name1, name2) {
    // Name selection criteria
    
    // Prefer longer, more descriptive names
    if (name1.length > name2.length * 1.5) {
      return name1;
    }
    if (name2.length > name1.length * 1.5) {
      return name2;
    }
    
    // Prefer names without certain patterns
    const hasPattern1 = /^\w+\d+$/.test(name1); // ends with numbers
    const hasPattern2 = /^\w+\d+$/.test(name2);
    
    if (hasPattern1 && !hasPattern2) {
      return name2;
    }
    if (hasPattern2 && !hasPattern1) {
      return name1;
    }
    
    // Prefer names with certain keywords
    const descriptiveWords = ['pattern', 'workflow', 'solution', 'analysis'];
    const score1 = descriptiveWords.filter(word => 
      name1.toLowerCase().includes(word)
    ).length;
    const score2 = descriptiveWords.filter(word => 
      name2.toLowerCase().includes(word)
    ).length;
    
    if (score1 > score2) return name1;
    if (score2 > score1) return name2;
    
    // Default to first name (or could be alphabetical)
    return name1;
  }

  mergeObservations(obs1, obs2) {
    const merged = [];
    const seen = new Set();
    
    // Add all observations, removing duplicates
    const allObservations = [...(obs1 || []), ...(obs2 || [])];
    
    for (const obs of allObservations) {
      const normalized = this.normalizeObservation(obs);
      
      if (!seen.has(normalized)) {
        seen.add(normalized);
        merged.push(obs);
      }
    }
    
    // Sort observations for consistency
    return merged.sort();
  }

  normalizeObservation(observation) {
    if (typeof observation === 'string') {
      return observation.toLowerCase().trim();
    }
    
    if (typeof observation === 'object' && observation.content) {
      return observation.content.toLowerCase().trim();
    }
    
    return JSON.stringify(observation).toLowerCase();
  }

  mergeMetadata(meta1, meta2) {
    const merged = { ...(meta1 || {}), ...(meta2 || {}) };
    
    // Handle arrays specially
    if (meta1?.technologies && meta2?.technologies) {
      merged.technologies = this.mergeArrays(meta1.technologies, meta2.technologies);
    }
    
    if (meta1?.references && meta2?.references) {
      merged.references = this.mergeArrays(meta1.references, meta2.references);
    }
    
    if (meta1?.codeFiles && meta2?.codeFiles) {
      merged.codeFiles = this.mergeArrays(meta1.codeFiles, meta2.codeFiles);
    }
    
    // Preserve history if configured
    if (this.config.preserveHistory) {
      merged.mergeHistory = merged.mergeHistory || [];
      merged.mergeHistory.push({
        timestamp: new Date().toISOString(),
        sources: [
          { metadata: meta1 },
          { metadata: meta2 }
        ]
      });
    }
    
    return merged;
  }

  mergeArrays(arr1, arr2) {
    const merged = [...(arr1 || [])];
    
    for (const item of (arr2 || [])) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    
    return merged.sort();
  }

  getCommonObservations(obs1, obs2) {
    const common = [];
    const set1 = new Set((obs1 || []).map(obs => this.normalizeObservation(obs)));
    
    for (const obs of (obs2 || [])) {
      const normalized = this.normalizeObservation(obs);
      if (set1.has(normalized)) {
        common.push(obs);
      }
    }
    
    return common;
  }

  getCommonMetadata(meta1, meta2) {
    const common = {};
    
    for (const key in meta1) {
      if (key in meta2) {
        if (meta1[key] === meta2[key]) {
          common[key] = meta1[key];
        } else if (Array.isArray(meta1[key]) && Array.isArray(meta2[key])) {
          const intersection = meta1[key].filter(item => meta2[key].includes(item));
          if (intersection.length > 0) {
            common[key] = intersection;
          }
        }
      }
    }
    
    return common;
  }

  calculateEntityWeight(entity) {
    let weight = 0;
    
    // Base weight from significance
    weight += entity.significance || 0;
    
    // Weight from observation count
    weight += Math.min((entity.observations?.length || 0) * 0.5, 5);
    
    // Weight from metadata richness
    const metadataFields = Object.keys(entity.metadata || {}).length;
    weight += Math.min(metadataFields * 0.3, 3);
    
    // Weight from creation date (newer is better)
    if (entity.created) {
      const age = Date.now() - new Date(entity.created).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      weight += Math.max(0, 5 - daysSinceCreation * 0.1);
    }
    
    return Math.max(1, weight); // Minimum weight of 1
  }

  selectPrimaryEntity(entity1, entity2) {
    // Priority rules for selecting primary entity
    
    // Rule 1: Higher significance wins
    if (entity1.significance > entity2.significance) return entity1;
    if (entity2.significance > entity1.significance) return entity2;
    
    // Rule 2: More observations wins
    const obs1Count = (entity1.observations || []).length;
    const obs2Count = (entity2.observations || []).length;
    if (obs1Count > obs2Count) return entity1;
    if (obs2Count > obs1Count) return entity2;
    
    // Rule 3: Better entity type (preference order)
    const typePreference = [
      'WorkflowPattern',
      'TransferablePattern',
      'TransferableKnowledge',
      'Insight',
      'Pattern'
    ];
    
    const type1Index = typePreference.indexOf(entity1.entityType);
    const type2Index = typePreference.indexOf(entity2.entityType);
    
    if (type1Index >= 0 && type2Index >= 0) {
      if (type1Index < type2Index) return entity1;
      if (type2Index < type1Index) return entity2;
    } else if (type1Index >= 0) {
      return entity1;
    } else if (type2Index >= 0) {
      return entity2;
    }
    
    // Rule 4: Newer entity wins
    const date1 = new Date(entity1.created || 0);
    const date2 = new Date(entity2.created || 0);
    
    return date1 > date2 ? entity1 : entity2;
  }

  validateMerge(mergedEntity, sourceEntity, targetEntity) {
    const issues = [];
    
    // Check required fields
    if (!mergedEntity.name) {
      issues.push('Merged entity missing name');
    }
    
    if (!mergedEntity.entityType) {
      issues.push('Merged entity missing entity type');
    }
    
    // Check significance is reasonable
    if (mergedEntity.significance < Math.min(sourceEntity.significance, targetEntity.significance)) {
      issues.push('Merged entity significance is lower than both sources');
    }
    
    // Check observations were preserved
    if ((mergedEntity.observations || []).length === 0 && 
        ((sourceEntity.observations || []).length > 0 || (targetEntity.observations || []).length > 0)) {
      issues.push('All observations were lost in merge');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  getInfo() {
    return {
      strategy: this.config.strategy,
      preserveHistory: this.config.preserveHistory,
      conflictResolution: this.config.conflictResolution,
      supportedStrategies: [
        'auto',
        'weighted',
        'priority',
        'union',
        'intersection',
        'manual'
      ]
    };
  }
}