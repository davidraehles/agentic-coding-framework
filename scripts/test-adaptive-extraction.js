#!/usr/bin/env node

/**
 * Test script for adaptive transcript format detection and extraction
 */

import StreamingTranscriptReader from '../src/live-logging/StreamingTranscriptReader.js';
import AdaptiveTranscriptFormatDetector from '../src/live-logging/AdaptiveTranscriptFormatDetector.js';
import AdaptiveExchangeExtractor from '../src/live-logging/AdaptiveExchangeExtractor.js';

const TRANSCRIPT_FILE = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';

async function testAdaptiveExtraction() {
  console.log('🧪 Testing Adaptive Transcript Format Detection\n');
  
  // Test 1: Format Detection
  console.log('📋 Test 1: Format Detection');
  const detector = new AdaptiveTranscriptFormatDetector({ debug: true });
  
  // Load sample messages from transcript
  const reader = new StreamingTranscriptReader({ debug: true });
  const sampleMessages = [];
  
  await reader.processFile(TRANSCRIPT_FILE, async (messageBatch) => {
    sampleMessages.push(...messageBatch);
    
    // Stop after we have enough samples
    if (sampleMessages.length > 200) {
      return false; // Stop processing
    }
  });
  
  console.log(`📊 Collected ${sampleMessages.length} sample messages`);
  
  // Detect format
  const formatResult = detector.detectFormat(sampleMessages);
  
  if (formatResult) {
    console.log(`✅ Format detected: ${formatResult.formatId}`);
    console.log(`   Name: ${formatResult.format.name}`);
    console.log(`   Confidence: ${formatResult.matchScore.toFixed(2)}`);
    console.log(`   Message types: ${Array.from(formatResult.analysis.messageTypes.keys()).join(', ')}`);
  } else {
    console.log('❌ No format detected');
  }
  
  // Test 2: Adaptive Extraction
  console.log('\n📋 Test 2: Adaptive Exchange Extraction');
  
  const extractor = new AdaptiveExchangeExtractor({ debug: true });
  const exchanges = extractor.extractExchanges(sampleMessages);
  
  console.log(`✅ Extracted ${exchanges.length} exchanges using adaptive method`);
  
  // Compare with legacy extraction
  console.log('\n📋 Test 3: Comparison with Legacy Extraction');
  
  const legacyExchanges = StreamingTranscriptReader.legacyExtractExchangesFromBatch(sampleMessages);
  console.log(`📊 Legacy extraction: ${legacyExchanges.length} exchanges`);
  console.log(`📊 Adaptive extraction: ${exchanges.length} exchanges`);
  
  const difference = Math.abs(exchanges.length - legacyExchanges.length);
  if (difference === 0) {
    console.log('✅ Both methods extracted the same number of exchanges');
  } else {
    console.log(`⚠️ Difference: ${difference} exchanges`);
  }
  
  // Test 4: Performance and Stats
  console.log('\n📋 Test 4: Performance Statistics');
  
  const stats = extractor.getStats();
  console.log('📊 Adaptive Extractor Stats:');
  console.log(`   Formats detected: ${stats.formatsDetected}`);
  console.log(`   Exchanges extracted: ${stats.exchangesExtracted}`);
  console.log(`   Cache hits: ${stats.cacheHits}`);
  console.log(`   Cache misses: ${stats.cacheMisses}`);
  console.log(`   Known formats: ${stats.knownFormats}`);
  
  // Test 5: Config File Generation
  console.log('\n📋 Test 5: Config File Generation');
  
  try {
    const { existsSync, readFileSync } = await import('fs');
    const configPath = '/Users/q284340/Agentic/coding/config/transcript-formats.json';
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      console.log('✅ Format config file generated successfully');
      console.log(`📊 Formats in config: ${Object.keys(config.formats || {}).length}`);
      console.log(`📅 Last updated: ${config.lastUpdated}`);
      
      // Show format details
      for (const [formatId, format] of Object.entries(config.formats || {})) {
        console.log(`   📋 ${formatId}: ${format.name} (v${format.version})`);
        console.log(`      Message types: ${Object.keys(format.patterns || {}).length}`);
        console.log(`      Confidence: ${format.confidence.toFixed(2)}`);
        console.log(`      Auto-detected: ${format.autoDetected || false}`);
      }
    } else {
      console.log('❌ Config file not generated');
    }
  } catch (error) {
    console.log(`❌ Error checking config: ${error.message}`);
  }
  
  // Test 6: Future Format Simulation
  console.log('\n📋 Test 6: Future Format Simulation');
  
  // Create a simulated new format
  const newFormatMessages = [
    { type: 'conversation_start', uuid: 'test-1', timestamp: '2025-09-16T10:00:00Z', session_id: 'sim-1' },
    { type: 'user_input', uuid: 'test-2', timestamp: '2025-09-16T10:00:01Z', content: 'Hello' },
    { type: 'ai_response', uuid: 'test-3', timestamp: '2025-09-16T10:00:02Z', content: 'Hi there!' },
    { type: 'conversation_end', uuid: 'test-4', timestamp: '2025-09-16T10:00:03Z' }
  ];
  
  const newFormatResult = detector.detectFormat(newFormatMessages);
  
  if (newFormatResult) {
    console.log(`✅ New format detected and learned: ${newFormatResult.formatId}`);
    console.log(`   Confidence: ${newFormatResult.analysis.confidence.toFixed(2)}`);
  } else {
    console.log('📊 New format not detected (expected for small sample)');
  }
  
  console.log('\n🎉 Adaptive format detection testing complete!');
}

testAdaptiveExtraction().catch(console.error);