#!/usr/bin/env node

/**
 * Debug user prompt detection for the specific Sept 13 message
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdaptiveExchangeExtractor from './src/live-logging/AdaptiveExchangeExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugUserPromptDetection() {
  console.log('🔍 Debugging user prompt detection for Sept 13 message...\n');
  
  // Read the transcript file and find the Sept 13 message
  const transcriptPath = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  const fileContent = fs.readFileSync(transcriptPath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  console.log(`📊 Total lines in transcript: ${lines.length}`);
  
  // Find the Sept 13 message
  let sept13Message = null;
  let sept13Line = null;
  
  for (let i = 0; i < lines.length; i++) {
    try {
      const message = JSON.parse(lines[i]);
      if (message.timestamp === '2025-09-13T06:14:35.337Z' || 
          message.uuid === '86175546-da16-4452-9ae5-60f353decb50') {
        sept13Message = message;
        sept13Line = i + 1;
        break;
      }
    } catch (error) {
      // Skip invalid JSON lines
    }
  }
  
  if (!sept13Message) {
    console.error('❌ Sept 13 message not found in transcript');
    process.exit(1);
  }
  
  console.log(`✅ Found Sept 13 message at line ${sept13Line}`);
  console.log(`🎯 UUID: ${sept13Message.uuid}`);
  console.log(`⏰ Timestamp: ${sept13Message.timestamp}`);
  console.log(`📝 Type: ${sept13Message.type}`);
  console.log(`👤 User Type: ${sept13Message.userType}`);
  
  // Test the exchange extraction
  console.log('\n🧪 Testing exchange extraction...');
  
  // Create a small batch with just the Sept 13 message and surrounding context
  const testBatch = [];
  const contextSize = 5;
  const startIndex = Math.max(0, sept13Line - contextSize - 1);
  const endIndex = Math.min(lines.length, sept13Line + contextSize);
  
  for (let i = startIndex; i < endIndex; i++) {
    try {
      const message = JSON.parse(lines[i]);
      testBatch.push(message);
    } catch (error) {
      console.warn(`⚠️ Skipping invalid JSON at line ${i + 1}`);
    }
  }
  
  console.log(`📦 Test batch size: ${testBatch.length} messages`);
  console.log(`📍 Sept 13 message is at index ${testBatch.findIndex(m => m.uuid === sept13Message.uuid)} in the batch`);
  
  // Extract exchanges using AdaptiveExchangeExtractor
  const extractor = new AdaptiveExchangeExtractor({
    debug: true,
    formatConfigPath: path.join(__dirname, 'config', 'transcript-formats.json')
  });
  
  console.log('\n🔄 Extracting exchanges...');
  const exchanges = await extractor.extractExchanges(testBatch);
  
  console.log(`\n📊 Extraction Results:`);
  console.log(`   Total exchanges: ${exchanges.length}`);
  
  // Check if the Sept 13 message is in any exchange
  let foundInExchange = false;
  for (let i = 0; i < exchanges.length; i++) {
    const exchange = exchanges[i];
    console.log(`\n📋 Exchange ${i + 1}:`);
    console.log(`   UUID: ${exchange.uuid || exchange.id}`);
    console.log(`   Timestamp: ${exchange.timestamp}`);
    console.log(`   Is User Prompt: ${exchange.isUserPrompt}`);
    console.log(`   User Message: ${exchange.userMessage?.substring(0, 100)}...`);
    console.log(`   Human Message: ${exchange.humanMessage?.substring(0, 100)}...`);
    
    if (exchange.uuid === sept13Message.uuid || exchange.id === sept13Message.uuid) {
      foundInExchange = true;
      console.log(`   🎯 THIS IS THE SEPT 13 EXCHANGE!`);
      
      if (!exchange.isUserPrompt) {
        console.log(`   ❌ PROBLEM: isUserPrompt is FALSE`);
      } else {
        console.log(`   ✅ isUserPrompt is correctly TRUE`);
      }
    }
  }
  
  if (!foundInExchange) {
    console.log(`\n❌ PROBLEM: Sept 13 message not found in any extracted exchange`);
    
    // Check if the message structure is being parsed correctly
    console.log(`\n🔍 Analyzing Sept 13 message structure:`);
    console.log(JSON.stringify(sept13Message, null, 2));
  } else {
    console.log(`\n✅ Sept 13 message found in exchanges`);
  }
}

debugUserPromptDetection().catch(error => {
  console.error('❌ Debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});