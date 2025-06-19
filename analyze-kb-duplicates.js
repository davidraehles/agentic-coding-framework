#!/usr/bin/env node

/**
 * Knowledge Base Duplicate Analysis Script
 * Identifies overlapping content, similar patterns, and potential consolidation opportunities
 */

const fs = require('fs');
const path = require('path');

const SHARED_MEMORY_PATH = path.join(__dirname, 'shared-memory.json');

function calculateSimilarity(str1, str2) {
  // Simple Jaccard similarity based on word sets
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function extractKeywords(observations) {
  const allText = observations
    .map(obs => typeof obs === 'string' ? obs : obs.content || '')
    .join(' ')
    .toLowerCase();
  
  // Common technical keywords to identify pattern types
  const keywords = allText.match(/\b(redux|react|logging|culling|animation|routing|mcp|memory|component|hook|state|viewport|three|fiber|pattern|architecture)\b/g) || [];
  return [...new Set(keywords)];
}

function analyzeEntityOverlap(entities) {
  const duplicates = [];
  const similar = [];
  
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const entity1 = entities[i];
      const entity2 = entities[j];
      
      // Skip if different entity types (unless both TransferablePattern)
      if (entity1.entityType !== entity2.entityType && 
          !(entity1.entityType === 'TransferablePattern' && entity2.entityType === 'TransferablePattern')) {
        continue;
      }
      
      // Check name similarity
      const nameSimilarity = calculateSimilarity(entity1.name, entity2.name);
      
      // Check content similarity
      const content1 = entity1.observations.map(obs => typeof obs === 'string' ? obs : obs.content || '').join(' ');
      const content2 = entity2.observations.map(obs => typeof obs === 'string' ? obs : obs.content || '').join(' ');
      const contentSimilarity = calculateSimilarity(content1, content2);
      
      // Check keyword overlap
      const keywords1 = extractKeywords(entity1.observations);
      const keywords2 = extractKeywords(entity2.observations);
      const keywordOverlap = keywords1.filter(k => keywords2.includes(k));
      
      if (nameSimilarity > 0.6 || contentSimilarity > 0.4) {
        if (contentSimilarity > 0.7) {
          duplicates.push({
            entity1: entity1.name,
            entity2: entity2.name,
            nameSimilarity: Math.round(nameSimilarity * 100),
            contentSimilarity: Math.round(contentSimilarity * 100),
            keywordOverlap,
            type: 'HIGH_DUPLICATE'
          });
        } else {
          similar.push({
            entity1: entity1.name,
            entity2: entity2.name,
            nameSimilarity: Math.round(nameSimilarity * 100),
            contentSimilarity: Math.round(contentSimilarity * 100),
            keywordOverlap,
            type: 'SIMILAR_CONTENT'
          });
        }
      }
    }
  }
  
  return { duplicates, similar };
}

function identifySpecificDuplicates(entities) {
  const issues = [];
  
  // Look for specific patterns that indicate duplication
  const patterns = {
    'ViewportCulling': entities.filter(e => e.name.toLowerCase().includes('viewportculling')),
    'Redux': entities.filter(e => e.name.toLowerCase().includes('redux')),
    'React': entities.filter(e => e.name.toLowerCase().includes('react')),
    'Component': entities.filter(e => e.name.toLowerCase().includes('component')),
    'Pattern': entities.filter(e => e.name.endsWith('Pattern'))
  };
  
  Object.entries(patterns).forEach(([category, categoryEntities]) => {
    if (categoryEntities.length > 1) {
      issues.push({
        category,
        entities: categoryEntities.map(e => e.name),
        count: categoryEntities.length,
        suggestion: `Multiple ${category}-related entities detected - review for consolidation`
      });
    }
  });
  
  return issues;
}

function analyzeObservationDuplicates(entities) {
  const duplicateObservations = [];
  
  entities.forEach(entity => {
    const observations = entity.observations;
    const seen = new Map();
    
    observations.forEach((obs, index) => {
      const content = typeof obs === 'string' ? obs : obs.content || '';
      const normalized = content.toLowerCase().trim();
      
      if (seen.has(normalized)) {
        duplicateObservations.push({
          entity: entity.name,
          duplicate: content,
          indices: [seen.get(normalized), index]
        });
      } else {
        seen.set(normalized, index);
      }
    });
  });
  
  return duplicateObservations;
}

function generateConsolidationPlan(duplicates, similar, categories, observationDups) {
  const plan = [];
  
  // High priority: exact duplicates
  duplicates.forEach(dup => {
    plan.push({
      priority: 'HIGH',
      action: 'MERGE',
      target: dup.entity1,
      source: dup.entity2,
      reason: `${dup.contentSimilarity}% content similarity`,
      command: `ukb --merge-entities "${dup.entity1},${dup.entity2}"`
    });
  });
  
  // Medium priority: similar content
  similar.forEach(sim => {
    plan.push({
      priority: 'MEDIUM',
      action: 'REVIEW',
      target: sim.entity1,
      source: sim.entity2,
      reason: `${sim.contentSimilarity}% content similarity, overlapping keywords: ${sim.keywordOverlap.join(', ')}`,
      command: 'Manual review recommended'
    });
  });
  
  // Category-based consolidation opportunities
  categories.forEach(cat => {
    if (cat.count > 2) {
      plan.push({
        priority: 'LOW',
        action: 'CONSOLIDATE_CATEGORY',
        targets: cat.entities,
        reason: cat.suggestion,
        command: 'Manual consolidation of category'
      });
    }
  });
  
  return plan.sort((a, b) => {
    const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorities[b.priority] - priorities[a.priority];
  });
}

function main() {
  try {
    console.log('🔍 Analyzing Knowledge Base for Overlapping Content...\n');
    
    const data = JSON.parse(fs.readFileSync(SHARED_MEMORY_PATH, 'utf8'));
    const entities = data.entities;
    
    console.log(`📊 Analyzing ${entities.length} entities...\n`);
    
    // Analyze entity overlaps
    const { duplicates, similar } = analyzeEntityOverlap(entities);
    
    // Identify category-based patterns
    const categoryIssues = identifySpecificDuplicates(entities);
    
    // Check for duplicate observations within entities
    const observationDups = analyzeObservationDuplicates(entities);
    
    // Generate consolidation plan
    const plan = generateConsolidationPlan(duplicates, similar, categoryIssues, observationDups);
    
    // Report findings
    console.log('🚨 HIGH PRIORITY DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   • ${dup.entity1} ↔ ${dup.entity2}`);
      console.log(`     Content similarity: ${dup.contentSimilarity}%`);
      console.log(`     Shared keywords: ${dup.keywordOverlap.join(', ')}`);
      console.log();
    });
    
    if (duplicates.length === 0) {
      console.log('   ✅ No high-priority duplicates found\n');
    }
    
    console.log('⚠️  SIMILAR CONTENT REQUIRING REVIEW:');
    similar.forEach(sim => {
      console.log(`   • ${sim.entity1} ↔ ${sim.entity2}`);
      console.log(`     Content similarity: ${sim.contentSimilarity}%`);
      console.log(`     Shared keywords: ${sim.keywordOverlap.join(', ')}`);
      console.log();
    });
    
    if (similar.length === 0) {
      console.log('   ✅ No similar content issues found\n');
    }
    
    console.log('📂 CATEGORY-BASED PATTERNS:');
    categoryIssues.forEach(issue => {
      console.log(`   • ${issue.category}: ${issue.count} entities`);
      console.log(`     Entities: ${issue.entities.join(', ')}`);
      console.log(`     ${issue.suggestion}`);
      console.log();
    });
    
    if (categoryIssues.length === 0) {
      console.log('   ✅ No category consolidation needed\n');
    }
    
    console.log('🔄 DUPLICATE OBSERVATIONS:');
    if (observationDups.length > 0) {
      observationDups.forEach(dup => {
        console.log(`   • ${dup.entity}: Duplicate observation at indices ${dup.indices.join(', ')}`);
        console.log(`     Content: "${dup.duplicate.substring(0, 80)}..."`);
        console.log();
      });
    } else {
      console.log('   ✅ No duplicate observations found\n');
    }
    
    console.log('📋 CONSOLIDATION PLAN:');
    plan.forEach((item, index) => {
      console.log(`${index + 1}. [${item.priority}] ${item.action}`);
      if (item.target && item.source) {
        console.log(`   Target: ${item.target} ← Source: ${item.source}`);
      } else if (item.targets) {
        console.log(`   Targets: ${item.targets.join(', ')}`);
      }
      console.log(`   Reason: ${item.reason}`);
      console.log(`   Command: ${item.command}`);
      console.log();
    });
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   High-priority duplicates: ${duplicates.length}`);
    console.log(`   Similar content pairs: ${similar.length}`);
    console.log(`   Category consolidation opportunities: ${categoryIssues.length}`);
    console.log(`   Duplicate observations: ${observationDups.length}`);
    console.log(`   Total consolidation actions: ${plan.length}`);
    
    if (plan.length === 0) {
      console.log('\n🎉 Knowledge base is well-organized with minimal duplication!');
    } else {
      console.log('\n💡 Consider implementing the consolidation plan above to optimize the knowledge base.');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeEntityOverlap, identifySpecificDuplicates };