#!/usr/bin/env node

import KeywordMatcher from './src/live-logging/KeywordMatcher.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testKeywordMatcher() {
  console.log('🧪 Testing KeywordMatcher on Sept 13 message...\n');
  
  const keywordMatcher = new KeywordMatcher({
    keywordConfigPath: path.join(__dirname, 'scripts', 'coding-keywords.json'),
    debug: true
  });
  
  const testMessage = `check the re-directed -from-nano-degree.md session logs in coding/.specstory/history - there seem to be an awful lot of them, some still with the old half-hour nomenclature. And content wise, they sometimes appear to be clearly nano-degree topics. What is the situation wrt. to these re-directed files? Are we doing a good job? maybe we ought to delete all of these re-directed files in coding and re-create them to have a clean baseline. Can the batch mode already be run without writing local files and only recreating the "foreign" (= coding) files?`;
  
  // Create test exchange
  const exchange = {
    userMessage: testMessage,
    content: testMessage
  };
  
  console.log('Message to test:');
  console.log(testMessage);
  console.log('\n' + '='.repeat(80) + '\n');
  
  const result = await keywordMatcher.matchKeywords(exchange);
  
  console.log('Keyword Matcher Result:');
  console.log(`- Is Coding: ${result.isCoding}`);
  console.log(`- Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`- Reason: ${result.reason}`);
  console.log(`- Matches Found: ${result.matches?.length || 0}`);
  
  if (result.matches && result.matches.length > 0) {
    console.log('\nMatched Keywords:');
    result.matches.forEach(match => {
      console.log(`  - "${match.keyword}" (${match.category}, weight: ${match.weight})`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Final Keyword Result: ${result.isCoding ? '✅ CODING' : '❌ NOT CODING'}`);
}

testKeywordMatcher().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});