#!/usr/bin/env node
/**
 * Remove garbage auto-discovered patterns and fix duplicate observations
 */

const fs = require('fs');
const path = require('path');

const sharedMemoryPath = path.join(process.cwd(), 'shared-memory.json');

async function removeGarbagePatterns() {
    try {
        console.log('🗑️  Removing garbage patterns...');
        
        // Read current file
        const data = JSON.parse(fs.readFileSync(sharedMemoryPath, 'utf8'));
        
        console.log(`📊 Before: ${data.entities.length} entities, ${data.relations.length} relations`);
        
        // Filter out garbage patterns
        const cleanEntities = data.entities.filter(entity => {
            // Remove auto-discovered garbage patterns
            if (entity.name.match(/^(GitPattern_|ConversationPattern_|SuccessPattern_.*post-logged)/)) {
                console.log(`❌ Removing garbage pattern: ${entity.name}`);
                return false;
            }
            
            // Remove entities with "Auto-discovered" observations (clearly low quality)
            if (entity.observations && entity.observations.some(obs => 
                typeof obs === 'string' && obs.includes('Auto-discovered'))) {
                console.log(`❌ Removing auto-discovered entity: ${entity.name}`);
                return false;
            }
            
            // Remove entities with empty or meaningless problem descriptions
            if (entity.problem && entity.problem.description && 
                entity.problem.description.match(/^(Error encountered:|occurred\. Please consult)/)) {
                console.log(`❌ Removing entity with meaningless problem: ${entity.name}`);
                return false;
            }
            
            return true;
        });
        
        // Clean up observations - remove duplicates and auto-discovered entries
        cleanEntities.forEach(entity => {
            if (entity.observations && Array.isArray(entity.observations)) {
                // Remove auto-discovered observations
                let cleanObs = entity.observations.filter(obs => 
                    typeof obs !== 'string' || !obs.includes('Auto-discovered')
                );
                
                // Remove duplicates by converting to Set and back
                cleanObs = [...new Set(cleanObs)];
                
                // If we removed observations, update the entity
                if (cleanObs.length !== entity.observations.length) {
                    console.log(`🧹 Cleaned observations for ${entity.name}: ${entity.observations.length} → ${cleanObs.length}`);
                    entity.observations = cleanObs;
                }
            }
        });
        
        // Remove relations pointing to removed entities
        const entityNames = new Set(cleanEntities.map(e => e.name));
        const cleanRelations = data.relations.filter(rel => 
            entityNames.has(rel.from) && entityNames.has(rel.to)
        );
        
        // Create cleaned data
        const cleanedData = {
            entities: cleanEntities,
            relations: cleanRelations,
            metadata: {
                ...data.metadata,
                total_entities: cleanEntities.length,
                total_relations: cleanRelations.length,
                last_updated: new Date().toISOString(),
                garbage_removal_performed: new Date().toISOString()
            }
        };
        
        console.log(`✨ After: ${cleanedData.entities.length} entities, ${cleanedData.relations.length} relations`);
        console.log(`🗑️  Removed: ${data.entities.length - cleanedData.entities.length} garbage entities, ${data.relations.length - cleanedData.relations.length} orphaned relations`);
        
        // Create backup
        const backupPath = `${sharedMemoryPath}.backup.garbage-removal.${Date.now()}`;
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`💾 Backup created: ${backupPath}`);
        
        // Write cleaned file
        fs.writeFileSync(sharedMemoryPath, JSON.stringify(cleanedData, null, 2));
        
        console.log('✅ Garbage removal complete!');
        
        // Show remaining entity types
        const entityTypes = {};
        cleanedData.entities.forEach(e => {
            entityTypes[e.entityType] = (entityTypes[e.entityType] || 0) + 1;
        });
        
        console.log('\n📊 Remaining entity types:');
        Object.entries(entityTypes).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        
    } catch (error) {
        console.error('❌ Garbage removal failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    removeGarbagePatterns();
}

module.exports = removeGarbagePatterns;