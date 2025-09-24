#!/usr/bin/env node

/**
 * Debug script to test content extraction for specific Sept 14 exchange
 */

import fs from 'fs';
import AdaptiveExchangeExtractor from './src/live-logging/AdaptiveExchangeExtractor.js';

// Read just the specific line containing the Sept 14 07:12:32 exchange
const transcriptFile = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
const lines = fs.readFileSync(transcriptFile, 'utf8').split('\n');

// Find the target line
const targetLine = lines[2341]; // Line 2342 is index 2341
if (!targetLine) {
  console.error('Target line not found');
  process.exit(1);
}

const targetMessage = JSON.parse(targetLine);
console.log('🎯 Target message:');
console.log(`   Timestamp: ${targetMessage.timestamp}`);
console.log(`   Type: ${targetMessage.type}`);
console.log(`   Message role: ${targetMessage.message?.role}`);
console.log(`   Message content: ${targetMessage.message?.content?.substring(0, 100)}...`);

// Test extraction with AdaptiveExchangeExtractor
const extractor = new AdaptiveExchangeExtractor({ debug: true });

// Test 1: Single message (like my successful test)
console.log('\n🧪 Test 1: Testing extraction with single message...');
const exchanges1 = extractor.extractExchanges([targetMessage]);

console.log(`\n📊 Test 1 results:`);
console.log(`   Exchanges extracted: ${exchanges1.length}`);
if (exchanges1.length > 0) {
  console.log(`   userMessage exists: ${!!exchanges1[0].userMessage}`);
  console.log(`   userMessage content: ${exchanges1[0].userMessage ? exchanges1[0].userMessage.substring(0, 50) + '...' : 'null'}`);
}

// Test 2: Batch processing (like in streaming mode)
console.log('\n🧪 Test 2: Testing extraction using batch method (like streaming)...');
const exchanges2 = AdaptiveExchangeExtractor.extractExchangesFromBatch([targetMessage], { debug: true });

console.log(`\n📊 Test 2 results:`);
console.log(`   Exchanges extracted: ${exchanges2.length}`);

if (exchanges2.length > 0) {
  const exchange = exchanges2[0];
  console.log(`   userMessage exists: ${!!exchange.userMessage}`);
  console.log(`   userMessage content: ${exchange.userMessage ? exchange.userMessage.substring(0, 50) + '...' : 'null'}`);
} else {
  console.log('   ❌ No exchanges extracted!');
}