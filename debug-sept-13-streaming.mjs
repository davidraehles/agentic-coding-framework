#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StreamingTranscriptReader from './src/live-logging/StreamingTranscriptReader.js';
import ReliableCodingClassifier from './src/live-logging/ReliableCodingClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugSept13Streaming() {
  console.log('🔍 Debugging Sept 13 streaming processing...\n');
  
  // Initialize the classifier
  const classifier = new ReliableCodingClassifier({
    keywordConfigPath: path.join(__dirname, 'scripts', 'coding-keywords.json'),
    debug: true,
    enableLogging: true,
    skipSemanticAnalysis: false
  });
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('✅ Classifier initialized\n');
  
  // Create streaming reader
  const reader = new StreamingTranscriptReader({
    batchSize: 20,
    maxMemoryMB: 50,
    progressInterval: 100,
    debug: true
  });
  
  const transcriptPath = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  
  let foundTarget = false;
  let targetExchange = null;
  
  // Set up event handlers for monitoring
  reader.on('batch', (batchInfo) => {
    console.log(`📋 Batch ${batchInfo.batchNumber} processed: ${batchInfo.batchSize} messages, total: ${batchInfo.totalProcessed}`);
  });
  
  reader.on('complete', () => {
    if (!foundTarget) {
      console.log('\n❌ Target Sept 13 message NOT found in streaming processing');
    } else {
      console.log('\n🎉 Successfully found and classified target Sept 13 message');
    }
  });
  
  reader.on('error', (error) => {
    console.error('\n❌ Streaming error:', error);
  });
  
  // Start processing
  console.log('🚀 Starting streaming processing...\n');
  
  // Define processor function to handle each batch
  const processor = async (batch) => {
    console.log(`📋 Processing batch with ${batch.length} messages`);
    
    // Extract exchanges from the batch using adaptive extraction
    const exchanges = StreamingTranscriptReader.extractExchangesFromBatch(batch, {
      useAdaptiveExtraction: true,
      debug: true
    });
    
    console.log(`   Extracted ${exchanges.length} exchanges from batch`);
    
    // Check each exchange for the target
    for (const exchange of exchanges) {
      if (exchange.timestamp === '2025-09-13T06:14:35.337Z' || 
          (exchange.userMessage && exchange.userMessage.includes('re-directed -from-nano-degree.md'))) {
        foundTarget = true;
        targetExchange = exchange;
        
        console.log('\n🎯 FOUND TARGET SEPT 13 EXCHANGE:');
        console.log(`   Timestamp: ${exchange.timestamp}`);
        console.log(`   User Message: ${exchange.userMessage?.substring(0, 100)}...`);
        console.log(`   UUID: ${exchange.uuid}`);
        
        // Test classification on this exchange
        console.log('\n🔬 Testing classification...');
        const result = await classifier.classify(exchange, '/Users/q284340/Agentic/nano-degree');
        
        console.log('\n📊 Classification Result:');
        console.log(`   Classification: ${result.classification}`);
        console.log(`   Is Coding: ${result.isCoding}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   Decision Path: ${result.decisionPath.join(' → ')}`);
        
        // Stop processing after finding the target
        return;
      }
    }
  };
  
  await reader.processFile(transcriptPath, processor);
}

debugSept13Streaming().catch(error => {
  console.error('❌ Debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});