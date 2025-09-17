#!/usr/bin/env node

import AdaptiveExchangeExtractor from './src/live-logging/AdaptiveExchangeExtractor.js';
import fs from 'fs';

async function testSept13Extraction() {
  console.log('🧪 Testing Sept 13 message extraction...\n');
  
  // Read the Sept 13 transcript
  const transcriptPath = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  const content = fs.readFileSync(transcriptPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Find the specific Sept 13 message
  const targetTimestamp = '2025-09-13T06:14:35.337Z';
  const targetMessage = 'check the re-directed -from-nano-degree.md session logs';
  
  let targetLine = null;
  let targetIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    try {
      const message = JSON.parse(lines[i]);
      if (message.timestamp === targetTimestamp || 
          (message.message?.content && message.message.content.includes('re-directed -from-nano-degree.md'))) {
        targetLine = message;
        targetIndex = i;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (!targetLine) {
    console.log('❌ Could not find target Sept 13 message');
    return;
  }
  
  console.log('✅ Found target Sept 13 message:');
  console.log(`   Timestamp: ${targetLine.timestamp}`);
  console.log(`   Type: ${targetLine.type}`);
  console.log(`   UUID: ${targetLine.uuid}`);
  console.log(`   Content: ${targetLine.message?.content?.substring(0, 100)}...`);
  
  // Get surrounding messages for context (±10 messages)
  const startIndex = Math.max(0, targetIndex - 10);
  const endIndex = Math.min(lines.length, targetIndex + 10);
  
  const contextMessages = [];
  for (let i = startIndex; i < endIndex; i++) {
    try {
      contextMessages.push(JSON.parse(lines[i]));
    } catch (e) {
      continue;
    }
  }
  
  console.log(`\n📋 Testing extraction with ${contextMessages.length} context messages...`);
  
  // Test AdaptiveExchangeExtractor
  const extractor = new AdaptiveExchangeExtractor({ debug: true });
  const exchanges = extractor.extractExchanges(contextMessages);
  
  console.log(`\n📊 Extraction results:`);
  console.log(`   Total exchanges extracted: ${exchanges.length}`);
  
  // Check if the target message is in the extracted exchanges
  let foundTarget = false;
  for (let i = 0; i < exchanges.length; i++) {
    const exchange = exchanges[i];
    
    if (exchange.timestamp === targetTimestamp || 
        exchange.userMessage?.includes('re-directed -from-nano-degree.md') ||
        exchange.humanMessage?.includes('re-directed -from-nano-degree.md')) {
      foundTarget = true;
      console.log(`\n✅ Found target message in exchange ${i + 1}:`);
      console.log(`   Timestamp: ${exchange.timestamp}`);
      console.log(`   User Message: ${exchange.userMessage?.substring(0, 100)}...`);
      console.log(`   Human Message: ${exchange.humanMessage?.substring(0, 100)}...`);
      console.log(`   UUID: ${exchange.uuid}`);
      break;
    }
  }
  
  if (!foundTarget) {
    console.log('\n❌ Target Sept 13 message NOT found in extracted exchanges');
    console.log('\n📋 Available exchanges:');
    exchanges.forEach((exchange, i) => {
      console.log(`   ${i + 1}. ${exchange.timestamp} - ${(exchange.userMessage || exchange.humanMessage || '').substring(0, 50)}...`);
    });
  } else {
    console.log('\n🎉 Target Sept 13 message successfully extracted!');
  }
}

testSept13Extraction().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});