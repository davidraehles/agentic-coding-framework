/**
 * Data Processor - Prepares knowledge base data for visualization
 */

import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from './utils/logging.js';

export class DataProcessor {
  constructor(options) {
    this.sharedMemoryPath = options.sharedMemoryPath;
    this.visualizerDir = options.visualizerDir;
    this.projectRoot = options.projectRoot;
    this.logger = new Logger('DataProcessor');
  }
  
  /**
   * Prepare memory data for visualization
   */
  async prepareData() {
    this.logger.info('Preparing memory data for visualization...');
    
    // Ensure paths exist
    await this.validatePaths();
    
    // Create symlink to knowledge-management directory
    await this.createKnowledgeManagementLink();
    
    // Process memory data
    await this.processMemoryData();
    
    // Get statistics
    const stats = await this.getStatistics();
    this.logger.info(`Entities: ${stats.entities}, Relations: ${stats.relations}`);
    
    return { success: true, stats };
  }
  
  /**
   * Validate required paths exist
   */
  async validatePaths() {
    // Check visualizer directory
    try {
      await fs.access(this.visualizerDir);
    } catch {
      throw new Error(`Memory visualizer directory not found: ${this.visualizerDir}`);
    }
    
    // Check shared memory file
    try {
      await fs.access(this.sharedMemoryPath);
    } catch {
      throw new Error(`Shared memory file not found: ${this.sharedMemoryPath}`);
    }
    
    // Ensure dist directory exists
    const distDir = path.join(this.visualizerDir, 'dist');
    await fs.mkdir(distDir, { recursive: true });
  }
  
  /**
   * Create symlink to knowledge-management directory
   */
  async createKnowledgeManagementLink() {
    const kmLink = path.join(this.visualizerDir, 'dist', 'knowledge-management');
    const kmSource = path.join(this.projectRoot, 'knowledge-management');
    
    // Remove existing symlink if present
    try {
      const stats = await fs.lstat(kmLink);
      if (stats.isSymbolicLink()) {
        await fs.unlink(kmLink);
      }
    } catch {
      // Link doesn't exist, which is fine
    }
    
    // Create new symlink
    try {
      await fs.symlink(kmSource, kmLink);
      this.logger.info('Knowledge management files linked for serving');
      
      // Count insight files
      const insightsDir = path.join(kmSource, 'insights');
      try {
        const files = await fs.readdir(insightsDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        this.logger.info(`Found ${mdFiles.length} insight files`);
      } catch {
        this.logger.warn('Could not count insight files');
      }
    } catch (error) {
      this.logger.warn('Could not create symlink to knowledge-management directory');
      this.logger.warn('Insight files may not be accessible');
    }
  }
  
  /**
   * Process memory data into NDJSON format
   */
  async processMemoryData() {
    const memoryDist = path.join(this.visualizerDir, 'dist', 'memory.json');
    
    // Check if ukb has already generated the NDJSON file
    try {
      await fs.access(memoryDist);
      const stats = await fs.stat(memoryDist);
      const sharedStats = await fs.stat(this.sharedMemoryPath);
      
      // If memory.json is newer than shared-memory.json, use it
      if (stats.mtime > sharedStats.mtime) {
        this.logger.info('Using existing NDJSON data (managed by ukb)');
        return;
      }
    } catch {
      // File doesn't exist, we'll create it
    }
    
    // Convert shared-memory.json to NDJSON format
    this.logger.info('Converting shared memory to NDJSON format...');
    
    const sharedMemory = JSON.parse(await fs.readFile(this.sharedMemoryPath, 'utf8'));
    const ndjsonLines = [];
    
    // Process entities
    if (sharedMemory.entities && Array.isArray(sharedMemory.entities)) {
      // Group by name and take the latest version
      const entityMap = new Map();
      
      for (const entity of sharedMemory.entities) {
        const existing = entityMap.get(entity.name);
        if (!existing || (entity.created || '2000-01-01') > (existing.created || '2000-01-01')) {
          entityMap.set(entity.name, entity);
        }
      }
      
      // Convert to NDJSON
      for (const entity of entityMap.values()) {
        const processed = { ...entity, type: 'entity' };
        
        // Handle different observation formats
        if (processed.observations && Array.isArray(processed.observations)) {
          if (processed.observations.length > 0 && typeof processed.observations[0] === 'object') {
            // Enhanced format - extract content
            processed.observations = processed.observations.map(obs => 
              typeof obs === 'object' ? obs.content : obs
            );
          }
        } else if (processed.legacy_observations && Array.isArray(processed.legacy_observations)) {
          // Use legacy observations if available
          processed.observations = processed.legacy_observations;
        }
        
        ndjsonLines.push(JSON.stringify(processed));
      }
    }
    
    // Process relations
    if (sharedMemory.relations && Array.isArray(sharedMemory.relations)) {
      for (const relation of sharedMemory.relations) {
        ndjsonLines.push(JSON.stringify(relation));
      }
    }
    
    // Write NDJSON file
    await fs.writeFile(memoryDist, ndjsonLines.join('\n'), 'utf8');
    this.logger.info('Memory data converted to NDJSON format');
  }
  
  /**
   * Get statistics about the knowledge base
   */
  async getStatistics() {
    try {
      const sharedMemory = JSON.parse(await fs.readFile(this.sharedMemoryPath, 'utf8'));
      return {
        entities: sharedMemory.entities?.length || 0,
        relations: sharedMemory.relations?.length || 0
      };
    } catch {
      return { entities: 0, relations: 0 };
    }
  }
}