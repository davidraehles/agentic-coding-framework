#!/usr/bin/env node

/**
 * Debug script to understand why message extraction is failing
 */

import fs from 'fs';
import readline from 'readline';
import StreamingTranscriptReader from './src/live-logging/StreamingTranscriptReader.js';

async function debugExtraction() {
  const transcriptFile = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  
  console.log('🔍 Debugging transcript extraction...\n');
  
  // Read just a few lines to see the format
  const fileStream = fs.createReadStream(transcriptFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lineCount = 0;
  const sampleMessages = [];
  
  for await (const line of rl) {
    if (!line.trim()) continue;
    
    lineCount++;
    
    // Look for Sept 13 entries with actual content
    if (line.includes('2025-09-13') && line.includes('course_structure_analysis.py')) {
      try {
        const message = JSON.parse(line);
        sampleMessages.push(message);
        console.log(`📝 Found Python script message (line ${lineCount}):`);
        console.log(`   Type: ${message.type}`);
        console.log(`   Role: ${message.message?.role}`);
        console.log(`   Content type: ${typeof message.message?.content}`);
        if (message.message?.content) {
          if (Array.isArray(message.message.content)) {
            console.log(`   Content array length: ${message.message.content.length}`);
            message.message.content.forEach((item, i) => {
              console.log(`   Content[${i}]: type=${item.type}`);
              if (item.type === 'tool_use') {
                console.log(`      Tool: ${item.name}`);
                console.log(`      Input keys: ${Object.keys(item.input || {}).join(', ')}`);
                if (item.input?.content) {
                  console.log(`      Content length: ${item.input.content.length}`);
                  console.log(`      Content preview: "${item.input.content.substring(0, 200)}..."`);
                }
              } else if (item.type === 'tool_result') {
                console.log(`      Tool result content: ${item.content?.substring(0, 100) || 'N/A'}`);
              } else if (item.type === 'text') {
                console.log(`      Text length: ${item.text?.length || 'N/A'}`);
                console.log(`      Text preview: "${item.text?.substring(0, 100) || 'N/A'}..."`);
              }
            });
          } else {
            console.log(`   Content length: ${message.message.content.length}`);
          }
        }
        console.log('---');
        
        if (sampleMessages.length >= 3) break;
      } catch (error) {
        console.error(`Error parsing line ${lineCount}:`, error.message);
      }
    }
    
    if (lineCount > 50000) break; // Don't read the entire huge file
  }
  
  rl.close();
  
  if (sampleMessages.length === 0) {
    console.log('❌ No Python script messages found in first 50k lines');
    return;
  }
  
  console.log(`\n🧪 Testing extraction on ${sampleMessages.length} sample messages...\n`);
  
  // Test the extraction
  const extracted = StreamingTranscriptReader.extractExchangesFromBatch(sampleMessages, { debug: true });
  
  console.log(`📊 Extraction results:`);
  console.log(`   Input messages: ${sampleMessages.length}`);
  console.log(`   Extracted exchanges: ${extracted.length}`);
  
  extracted.forEach((exchange, i) => {
    console.log(`\n   Exchange ${i + 1}:`);
    console.log(`     UUID: ${exchange.uuid}`);
    console.log(`     Timestamp: ${exchange.timestamp}`);
    console.log(`     Human message length: ${exchange.humanMessage?.length || 0}`);
    console.log(`     Assistant message length: ${exchange.assistantMessage?.length || 0}`);
    console.log(`     Tool calls: ${exchange.toolCalls?.length || 0}`);
    console.log(`     isUserPrompt: ${exchange.isUserPrompt}`);
    
    if (exchange.humanMessage?.length > 0) {
      console.log(`     Human preview: "${exchange.humanMessage.substring(0, 100)}..."`);
    }
    if (exchange.assistantMessage?.length > 0) {
      console.log(`     Assistant preview: "${exchange.assistantMessage.substring(0, 100)}..."`);
    }
  });
}

debugExtraction().catch(console.error);