/**
 * Similarity Detector
 * Calculates similarity between embeddings using various metrics
 */

import { Logger } from '../../../shared/logger.js';

export class SimilarityDetector {
  constructor(config = {}) {
    this.config = {
      metric: config.metric || 'cosine', // 'cosine', 'euclidean', 'manhattan', 'dot'
      threshold: config.threshold || 0.8,
      normalization: config.normalization || true,
      ...config
    };
    
    this.logger = new Logger('similarity-detector');
  }

  calculateSimilarity(embedding1, embedding2, metric = null) {
    const actualMetric = metric || this.config.metric;
    
    // Validate inputs
    this.validateEmbeddings(embedding1, embedding2);
    
    switch (actualMetric) {
      case 'cosine':
        return this.cosineSimilarity(embedding1, embedding2);
      
      case 'euclidean':
        return this.euclideanSimilarity(embedding1, embedding2);
      
      case 'manhattan':
        return this.manhattanSimilarity(embedding1, embedding2);
      
      case 'dot':
        return this.dotProductSimilarity(embedding1, embedding2);
      
      case 'pearson':
        return this.pearsonCorrelation(embedding1, embedding2);
      
      case 'jaccard':
        return this.jaccardSimilarity(embedding1, embedding2);
      
      default:
        throw new Error(`Unknown similarity metric: ${actualMetric}`);
    }
  }

  cosineSimilarity(embedding1, embedding2) {
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }
    
    // Calculate magnitudes
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  euclideanSimilarity(embedding1, embedding2) {
    // Calculate Euclidean distance
    let sumSquaredDiffs = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      const diff = embedding1[i] - embedding2[i];
      sumSquaredDiffs += diff * diff;
    }
    
    const distance = Math.sqrt(sumSquaredDiffs);
    
    // Convert distance to similarity (0-1 range)
    // Using exponential decay
    return Math.exp(-distance);
  }

  manhattanSimilarity(embedding1, embedding2) {
    // Calculate Manhattan distance
    let sumAbsDiffs = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      sumAbsDiffs += Math.abs(embedding1[i] - embedding2[i]);
    }
    
    // Convert distance to similarity
    return Math.exp(-sumAbsDiffs);
  }

  dotProductSimilarity(embedding1, embedding2) {
    let dotProduct = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }
    
    // Normalize by vector length
    return dotProduct / embedding1.length;
  }

  pearsonCorrelation(embedding1, embedding2) {
    const n = embedding1.length;
    
    // Calculate means
    const mean1 = embedding1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = embedding2.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate numerator and denominators
    let numerator = 0;
    let sumSquared1 = 0;
    let sumSquared2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = embedding1[i] - mean1;
      const diff2 = embedding2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSquared1 += diff1 * diff1;
      sumSquared2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSquared1 * sumSquared2);
    
    if (denominator === 0) {
      return 0;
    }
    
    return numerator / denominator;
  }

  jaccardSimilarity(embedding1, embedding2) {
    // Convert embeddings to binary (for Jaccard)
    const threshold = 0;
    const binary1 = embedding1.map(val => val > threshold ? 1 : 0);
    const binary2 = embedding2.map(val => val > threshold ? 1 : 0);
    
    let intersection = 0;
    let union = 0;
    
    for (let i = 0; i < binary1.length; i++) {
      if (binary1[i] === 1 && binary2[i] === 1) {
        intersection++;
      }
      if (binary1[i] === 1 || binary2[i] === 1) {
        union++;
      }
    }
    
    if (union === 0) {
      return 1; // Both vectors are zero
    }
    
    return intersection / union;
  }

  calculateBatchSimilarities(embeddings, targetEmbedding, metric = null) {
    const similarities = [];
    
    for (const embedding of embeddings) {
      const similarity = this.calculateSimilarity(embedding, targetEmbedding, metric);
      similarities.push(similarity);
    }
    
    return similarities;
  }

  findMostSimilar(embeddings, targetEmbedding, topK = 5, metric = null) {
    const similarities = embeddings.map((embedding, index) => ({
      index,
      embedding,
      similarity: this.calculateSimilarity(embedding, targetEmbedding, metric)
    }));
    
    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, topK);
  }

  findSimilarAboveThreshold(embeddings, targetEmbedding, threshold = null, metric = null) {
    const actualThreshold = threshold || this.config.threshold;
    const similar = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      const similarity = this.calculateSimilarity(embeddings[i], targetEmbedding, metric);
      
      if (similarity >= actualThreshold) {
        similar.push({
          index: i,
          embedding: embeddings[i],
          similarity
        });
      }
    }
    
    // Sort by similarity descending
    similar.sort((a, b) => b.similarity - a.similarity);
    
    return similar;
  }

  clusterBySimilarity(embeddings, threshold = null, metric = null) {
    const actualThreshold = threshold || this.config.threshold;
    const clusters = [];
    const assigned = new Set();
    
    for (let i = 0; i < embeddings.length; i++) {
      if (assigned.has(i)) continue;
      
      const cluster = {
        centroid: embeddings[i],
        members: [{ index: i, embedding: embeddings[i], similarity: 1.0 }]
      };
      
      assigned.add(i);
      
      // Find similar embeddings
      for (let j = i + 1; j < embeddings.length; j++) {
        if (assigned.has(j)) continue;
        
        const similarity = this.calculateSimilarity(embeddings[i], embeddings[j], metric);
        
        if (similarity >= actualThreshold) {
          cluster.members.push({
            index: j,
            embedding: embeddings[j],
            similarity
          });
          assigned.add(j);
        }
      }
      
      // Only include clusters with multiple members
      if (cluster.members.length > 1) {
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }

  calculateSimilarityMatrix(embeddings, metric = null) {
    const matrix = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      const row = [];
      
      for (let j = 0; j < embeddings.length; j++) {
        if (i === j) {
          row.push(1.0);
        } else {
          const similarity = this.calculateSimilarity(embeddings[i], embeddings[j], metric);
          row.push(similarity);
        }
      }
      
      matrix.push(row);
    }
    
    return matrix;
  }

  findOutliers(embeddings, threshold = 0.3, metric = null) {
    const outliers = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      let maxSimilarity = 0;
      
      // Find maximum similarity to any other embedding
      for (let j = 0; j < embeddings.length; j++) {
        if (i !== j) {
          const similarity = this.calculateSimilarity(embeddings[i], embeddings[j], metric);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      // If maximum similarity is below threshold, it's an outlier
      if (maxSimilarity < threshold) {
        outliers.push({
          index: i,
          embedding: embeddings[i],
          maxSimilarity
        });
      }
    }
    
    return outliers;
  }

  validateEmbeddings(embedding1, embedding2) {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      throw new Error('Embeddings must be arrays');
    }
    
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }
    
    if (embedding1.length === 0) {
      throw new Error('Embeddings cannot be empty');
    }
    
    // Check for valid numbers
    for (const value of embedding1) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Embedding1 contains invalid values');
      }
    }
    
    for (const value of embedding2) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Embedding2 contains invalid values');
      }
    }
  }

  normalizeEmbedding(embedding) {
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude === 0) {
      return embedding.slice(); // Return copy of zero vector
    }
    
    return embedding.map(val => val / magnitude);
  }

  getDistanceMetrics(embedding1, embedding2) {
    return {
      cosine: this.cosineSimilarity(embedding1, embedding2),
      euclidean: this.euclideanSimilarity(embedding1, embedding2),
      manhattan: this.manhattanSimilarity(embedding1, embedding2),
      dot: this.dotProductSimilarity(embedding1, embedding2),
      pearson: this.pearsonCorrelation(embedding1, embedding2),
      jaccard: this.jaccardSimilarity(embedding1, embedding2)
    };
  }

  getInfo() {
    return {
      metric: this.config.metric,
      threshold: this.config.threshold,
      normalization: this.config.normalization,
      supportedMetrics: [
        'cosine',
        'euclidean', 
        'manhattan',
        'dot',
        'pearson',
        'jaccard'
      ]
    };
  }
}