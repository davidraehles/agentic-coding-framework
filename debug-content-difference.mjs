#!/usr/bin/env node

import AdaptiveExchangeExtractor from './src/live-logging/AdaptiveExchangeExtractor.js';
import KeywordMatcher from './src/live-logging/KeywordMatcher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugContentDifference() {
  console.log('🔍 Debugging content difference between extracted and expected...\n');
  
  // Read the Sept 13 transcript
  const transcriptPath = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  const content = fs.readFileSync(transcriptPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Find messages around the target
  const targetTimestamp = '2025-09-13T06:14:35.337Z';
  let targetIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    try {
      const message = JSON.parse(lines[i]);
      if (message.timestamp === targetTimestamp) {
        targetIndex = i;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (targetIndex === -1) {
    console.log('❌ Could not find target message');
    return;
  }
  
  // Get surrounding messages
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
  
  // Extract exchanges
  const extractor = new AdaptiveExchangeExtractor({ debug: false });
  const exchanges = extractor.extractExchanges(contextMessages);
  
  // Find the target exchange
  let targetExchange = null;
  for (const exchange of exchanges) {
    if (exchange.timestamp === targetTimestamp || 
        exchange.userMessage?.includes('re-directed -from-nano-degree.md') ||
        exchange.humanMessage?.includes('re-directed -from-nano-degree.md')) {
      targetExchange = exchange;
      break;
    }
  }
  
  if (!targetExchange) {
    console.log('❌ Target exchange not found after extraction');
    return;
  }
  
  console.log('✅ Found target exchange after extraction');
  console.log('📋 Exchange structure:');
  console.log(JSON.stringify(targetExchange, null, 2));
  
  // Test keyword matching on the extracted exchange
  const keywordMatcher = new KeywordMatcher({
    keywordConfigPath: path.join(__dirname, 'scripts', 'coding-keywords.json'),
    debug: true
  });
  
  console.log('\n🔬 Testing keyword matching on extracted exchange...');
  const keywordResult = await keywordMatcher.matchKeywords(targetExchange);
  
  console.log('\n📊 Keyword matcher results:');
  console.log(`   Is Coding: ${keywordResult.isCoding}`);
  console.log(`   Confidence: ${keywordResult.confidence}`);
  console.log(`   Reason: ${keywordResult.reason}`);
  
  if (keywordResult.details?.matchResults) {
    const matches = Object.values(keywordResult.details.matchResults).flat();
    console.log(`   Total Matches: ${matches.length}`);
    if (matches.length > 0) {
      console.log('   Matched Keywords:');
      matches.forEach(match => {
        console.log(`     - "${match.keyword}" (${match.category}, weight: ${match.weight})`);
      });
    }
  }
  
  // Also test the raw content directly
  console.log('\n🧪 Testing keyword matching on raw text...');
  const rawText = targetExchange.userMessage || targetExchange.humanMessage || '';
  console.log(`Raw text to test: "${rawText.substring(0, 200)}..."`);
  
  const rawExchange = { userMessage: rawText, content: rawText };
  const rawKeywordResult = await keywordMatcher.matchKeywords(rawExchange);
  
  console.log('\n📊 Raw text keyword results:');
  console.log(`   Is Coding: ${rawKeywordResult.isCoding}`);
  console.log(`   Confidence: ${rawKeywordResult.confidence}`);
  console.log(`   Reason: ${rawKeywordResult.reason}`);
}

debugContentDifference().catch(error => {
  console.error('❌ Debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});