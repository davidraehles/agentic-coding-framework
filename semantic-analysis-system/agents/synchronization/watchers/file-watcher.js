/**
 * File Watcher
 * Monitors shared-memory JSON files for changes
 */

import { watch } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../../shared/logger.js';

export class FileWatcher {
  constructor(config = {}) {
    this.config = {
      debounceDelay: config.debounceDelay || 1000,
      ...config
    };
    
    this.logger = new Logger('file-watcher');
    this.watchers = new Map();
    this.callbacks = new Map();
    this.debounceTimers = new Map();
  }

  async watch(filePath, callback) {
    try {
      // Ensure file exists
      await this.ensureFileExists(filePath);
      
      // Stop existing watcher if any
      if (this.watchers.has(filePath)) {
        this.stop(filePath);
      }
      
      // Create watcher
      const watcher = watch(filePath, { persistent: true }, (eventType, filename) => {
        this.handleFileEvent(filePath, eventType, filename);
      });
      
      // Store watcher and callback
      this.watchers.set(filePath, watcher);
      this.callbacks.set(filePath, callback);
      
      this.logger.info(`Watching file: ${filePath}`);
      
    } catch (error) {
      this.logger.error(`Failed to watch file ${filePath}:`, error);
      throw error;
    }
  }

  async ensureFileExists(filePath) {
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        // Create empty JSON file
        const emptyData = {
          entities: [],
          relations: [],
          metadata: {
            version: '2.0.0',
            created: new Date().toISOString()
          }
        };
        
        await fs.writeFile(filePath, JSON.stringify(emptyData, null, 2), 'utf8');
        this.logger.info(`Created empty file: ${filePath}`);
      } else {
        throw error;
      }
    }
  }

  handleFileEvent(filePath, eventType, filename) {
    // Clear existing debounce timer
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath));
    }
    
    // Set new debounce timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.processFileChange(filePath, eventType);
    }, this.config.debounceDelay);
    
    this.debounceTimers.set(filePath, timer);
  }

  async processFileChange(filePath, eventType) {
    try {
      // Verify file still exists
      const exists = await this.fileExists(filePath);
      
      if (!exists) {
        this.logger.warn(`File no longer exists: ${filePath}`);
        return;
      }
      
      // Get callback and execute
      const callback = this.callbacks.get(filePath);
      
      if (callback) {
        await callback(eventType, filePath);
      }
      
    } catch (error) {
      this.logger.error(`Error processing file change for ${filePath}:`, error);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  stop(filePath) {
    // Stop watcher
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }
    
    // Clear callback
    this.callbacks.delete(filePath);
    
    // Clear any pending debounce timer
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath));
      this.debounceTimers.delete(filePath);
    }
    
    this.logger.debug(`Stopped watching: ${filePath}`);
  }

  async stopAll() {
    const filePaths = Array.from(this.watchers.keys());
    
    for (const filePath of filePaths) {
      this.stop(filePath);
    }
    
    this.logger.info('All file watchers stopped');
  }

  getInfo() {
    return {
      watchedFiles: Array.from(this.watchers.keys()),
      activeWatchers: this.watchers.size,
      pendingDebounces: this.debounceTimers.size,
      config: this.config
    };
  }

  async stop() {
    await this.stopAll();
  }
}