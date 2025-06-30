/**
 * Embedding Generator
 * Generates vector embeddings for entities using various models
 */

import { Logger } from '../../../shared/logger.js';
import crypto from 'crypto';

export class EmbeddingGenerator {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'openai', // 'openai', 'sentence-transformers', 'local'
      model: config.model || 'text-embedding-ada-002',
      dimensions: config.dimensions || 1536,
      batchSize: config.batchSize || 100,
      ...config
    };
    
    this.logger = new Logger('embedding-generator');
    this.initialized = false;
    this.provider = null;
  }

  async initialize() {
    try {
      // Initialize based on provider
      switch (this.config.provider) {
        case 'openai':
          await this.initializeOpenAI();
          break;
        
        case 'sentence-transformers':
          await this.initializeSentenceTransformers();
          break;
        
        case 'local':
          await this.initializeLocal();
          break;
        
        default:
          throw new Error(`Unknown embedding provider: ${this.config.provider}`);
      }
      
      this.initialized = true;
      this.logger.info(`Embedding generator initialized with ${this.config.provider}`);
      
    } catch (error) {
      this.logger.error('Failed to initialize embedding generator:', error);
      throw error;
    }
  }

  async initializeOpenAI() {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI embeddings');
    }
    
    // In production, would initialize OpenAI client
    this.provider = {
      type: 'openai',
      model: this.config.model,
      apiKey: process.env.OPENAI_API_KEY
    };
  }

  async initializeSentenceTransformers() {
    // Would initialize sentence-transformers model
    this.provider = {
      type: 'sentence-transformers',
      model: this.config.model || 'all-MiniLM-L6-v2'
    };
  }

  async initializeLocal() {
    // Initialize local embedding generation (e.g., TF-IDF, Word2Vec)
    this.provider = {
      type: 'local',
      method: this.config.method || 'tfidf'
    };
  }

  async generateEmbedding(text) {
    if (!this.initialized) {
      throw new Error('Embedding generator not initialized');
    }
    
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for embedding generation');
    }
    
    try {
      switch (this.provider.type) {
        case 'openai':
          return await this.generateOpenAIEmbedding(text);
        
        case 'sentence-transformers':
          return await this.generateSentenceTransformerEmbedding(text);
        
        case 'local':
          return await this.generateLocalEmbedding(text);
        
        default:
          throw new Error(`Unknown provider type: ${this.provider.type}`);
      }
      
    } catch (error) {
      this.logger.error('Embedding generation failed:', error);
      throw error;
    }
  }

  async generateBatchEmbeddings(texts) {
    if (!Array.isArray(texts)) {
      throw new Error('Batch embeddings require array of texts');
    }
    
    const embeddings = [];
    
    // Process in batches
    for (let i = 0; i < texts.length; i += this.config.batchSize) {
      const batch = texts.slice(i, i + this.config.batchSize);
      
      const batchEmbeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }

  async generateOpenAIEmbedding(text) {
    // In production, would call OpenAI API
    // For now, return mock embedding
    this.logger.debug(`Generating OpenAI embedding for text of length ${text.length}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate deterministic mock embedding based on text
    return this.generateMockEmbedding(text, this.config.dimensions);
  }

  async generateSentenceTransformerEmbedding(text) {
    // In production, would use sentence-transformers
    this.logger.debug(`Generating sentence-transformer embedding for text of length ${text.length}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Generate mock embedding
    return this.generateMockEmbedding(text, 384); // Typical size for MiniLM
  }

  async generateLocalEmbedding(text) {
    // Simple local embedding using character frequency
    this.logger.debug(`Generating local embedding for text of length ${text.length}`);
    
    const embedding = new Array(this.config.dimensions).fill(0);
    
    // Simple character frequency based embedding
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const index = charCode % this.config.dimensions;
        embedding[index] += 1 / words.length;
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    
    return embedding;
  }

  generateMockEmbedding(text, dimensions) {
    // Generate deterministic embedding based on text hash
    const hash = crypto.createHash('sha256').update(text).digest();
    const embedding = new Array(dimensions);
    
    // Use hash bytes to generate embedding values
    for (let i = 0; i < dimensions; i++) {
      const byteIndex = i % hash.length;
      const byte = hash[byteIndex];
      
      // Generate value between -1 and 1
      embedding[i] = (byte / 127.5) - 1;
    }
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    
    return embedding;
  }

  async preprocess(text) {
    // Preprocess text before embedding generation
    let processed = text;
    
    // Remove excessive whitespace
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (OpenAI has token limits)
    if (this.config.maxLength && processed.length > this.config.maxLength) {
      processed = processed.substring(0, this.config.maxLength) + '...';
    }
    
    return processed;
  }

  validateEmbedding(embedding) {
    if (!Array.isArray(embedding)) {
      throw new Error('Embedding must be an array');
    }
    
    if (embedding.length !== this.config.dimensions) {
      throw new Error(`Embedding dimension mismatch: expected ${this.config.dimensions}, got ${embedding.length}`);
    }
    
    // Check if values are valid numbers
    for (const value of embedding) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Embedding contains invalid values');
      }
    }
    
    return true;
  }

  getEmbeddingStats(embedding) {
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
    
    return {
      dimensions: embedding.length,
      magnitude,
      mean,
      variance,
      stdDev: Math.sqrt(variance)
    };
  }

  getInfo() {
    return {
      provider: this.config.provider,
      model: this.config.model,
      dimensions: this.config.dimensions,
      initialized: this.initialized,
      batchSize: this.config.batchSize
    };
  }
}