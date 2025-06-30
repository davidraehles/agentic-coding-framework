/**
 * Version Manager
 * Manages version history and rollback capabilities for sync operations
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Logger } from '../../../shared/logger.js';

export class VersionManager {
  constructor(config = {}) {
    this.config = {
      versionsPath: config.versionsPath || '/Users/q284340/Agentic/coding/.versions',
      maxVersions: config.maxVersions || 50,
      compressionEnabled: config.compressionEnabled || true,
      ...config
    };
    
    this.logger = new Logger('version-manager');
    this.versions = new Map();
    this.failures = [];
  }

  async createVersion(targetPath, trigger = 'manual', metadata = {}) {
    try {
      // Ensure versions directory exists
      await this.ensureVersionsDirectory();
      
      // Read current file content
      const content = await fs.readFile(targetPath, 'utf8');
      const data = JSON.parse(content);
      
      // Create version entry
      const version = {
        id: crypto.randomUUID(),
        targetPath,
        trigger,
        timestamp: new Date().toISOString(),
        checksum: this.calculateChecksum(content),
        metadata: {
          ...metadata,
          entityCount: data.entities?.length || 0,
          relationCount: data.relations?.length || 0,
          fileSize: content.length
        }
      };
      
      // Save version data
      const versionPath = this.getVersionPath(version.id);
      await fs.writeFile(versionPath, content, 'utf8');
      
      // Store version info
      this.versions.set(version.id, version);
      
      // Clean old versions
      await this.cleanOldVersions(targetPath);
      
      this.logger.debug(`Version created: ${version.id} for ${targetPath}`);
      
      return version;
      
    } catch (error) {
      this.logger.error(`Failed to create version for ${targetPath}:`, error);
      throw error;
    }
  }

  async rollback(versionId, targetPath) {
    try {
      const version = this.versions.get(versionId);
      
      if (!version) {
        throw new Error(`Version not found: ${versionId}`);
      }
      
      if (version.targetPath !== targetPath) {
        throw new Error(`Version ${versionId} is not for target ${targetPath}`);
      }
      
      // Create backup of current state before rollback
      await this.createVersion(targetPath, 'pre-rollback', {
        rollbackFrom: versionId
      });
      
      // Read version data
      const versionPath = this.getVersionPath(versionId);
      const versionContent = await fs.readFile(versionPath, 'utf8');
      
      // Verify checksum
      const checksum = this.calculateChecksum(versionContent);
      if (checksum !== version.checksum) {
        throw new Error('Version data corrupted - checksum mismatch');
      }
      
      // Restore version
      await fs.writeFile(targetPath, versionContent, 'utf8');
      
      this.logger.info(`Rolled back ${targetPath} to version ${versionId}`);
      
      return {
        versionId,
        targetPath,
        rolledBack: true,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.logger.error(`Rollback failed for version ${versionId}:`, error);
      throw error;
    }
  }

  async getHistory(targetPath, limit = 10) {
    const history = [];
    
    for (const [id, version] of this.versions) {
      if (version.targetPath === targetPath) {
        history.push({
          id,
          timestamp: version.timestamp,
          trigger: version.trigger,
          metadata: version.metadata
        });
      }
    }
    
    // Sort by timestamp descending
    history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return history.slice(0, limit);
  }

  async recordFailure(failure) {
    this.failures.push({
      ...failure,
      recorded: new Date().toISOString()
    });
    
    // Keep only recent failures
    if (this.failures.length > 100) {
      this.failures = this.failures.slice(-100);
    }
    
    this.logger.debug(`Recorded sync failure: ${failure.operationId}`);
  }

  async getFailures(limit = 10) {
    return this.failures.slice(-limit).reverse();
  }

  async ensureVersionsDirectory() {
    try {
      await fs.mkdir(this.config.versionsPath, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create versions directory:', error);
      throw error;
    }
  }

  getVersionPath(versionId) {
    return path.join(this.config.versionsPath, `${versionId}.json`);
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async cleanOldVersions(targetPath) {
    try {
      // Get all versions for this target
      const targetVersions = [];
      
      for (const [id, version] of this.versions) {
        if (version.targetPath === targetPath) {
          targetVersions.push({ id, timestamp: version.timestamp });
        }
      }
      
      // Sort by timestamp
      targetVersions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Keep only maxVersions
      if (targetVersions.length > this.config.maxVersions) {
        const toDelete = targetVersions.slice(this.config.maxVersions);
        
        for (const { id } of toDelete) {
          // Delete version file
          const versionPath = this.getVersionPath(id);
          try {
            await fs.unlink(versionPath);
          } catch (error) {
            this.logger.debug(`Failed to delete old version ${id}:`, error.message);
          }
          
          // Remove from memory
          this.versions.delete(id);
        }
        
        this.logger.debug(`Cleaned ${toDelete.length} old versions for ${targetPath}`);
      }
      
    } catch (error) {
      this.logger.warn('Failed to clean old versions:', error.message);
    }
  }

  async loadVersionHistory() {
    try {
      // Load version metadata from disk on startup
      const files = await fs.readdir(this.config.versionsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const versionId = file.replace('.json', '');
          
          // Try to load version metadata
          try {
            const metadataPath = path.join(this.config.versionsPath, `${versionId}.meta`);
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);
            
            this.versions.set(versionId, metadata);
          } catch (error) {
            // Metadata file might not exist for older versions
            this.logger.debug(`No metadata for version ${versionId}`);
          }
        }
      }
      
      this.logger.info(`Loaded ${this.versions.size} versions from history`);
      
    } catch (error) {
      this.logger.warn('Failed to load version history:', error.message);
    }
  }

  async saveVersionMetadata(version) {
    try {
      const metadataPath = path.join(this.config.versionsPath, `${version.id}.meta`);
      await fs.writeFile(metadataPath, JSON.stringify(version, null, 2), 'utf8');
    } catch (error) {
      this.logger.warn(`Failed to save version metadata for ${version.id}:`, error.message);
    }
  }

  getInfo() {
    const versionsByTarget = new Map();
    
    for (const version of this.versions.values()) {
      const count = versionsByTarget.get(version.targetPath) || 0;
      versionsByTarget.set(version.targetPath, count + 1);
    }
    
    return {
      totalVersions: this.versions.size,
      versionsByTarget: Object.fromEntries(versionsByTarget),
      failureCount: this.failures.length,
      config: {
        versionsPath: this.config.versionsPath,
        maxVersions: this.config.maxVersions
      }
    };
  }
}