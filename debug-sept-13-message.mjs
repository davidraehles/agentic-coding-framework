#!/usr/bin/env node

/**
 * Debug specific Sept 13 message classification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ReliableCodingClassifier from './src/live-logging/ReliableCodingClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSept13Message() {
  console.log('🧪 Testing Sept 13 message classification...\n');
  
  // Initialize the classifier with debug enabled
  const classifier = new ReliableCodingClassifier({
    keywordConfigPath: path.join(__dirname, 'scripts', 'coding-keywords.json'),
    debug: true,
    enableLogging: true,
    skipSemanticAnalysis: false  // Keep semantic analysis to see the conflict
  });
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // The exact Sept 13 message
  const testMessage = `check the re-directed -from-nano-degree.md session logs in coding/.specstory/history - there seem to be an awful lot of them, some still with the old half-hour nomenclature. And content wise, they sometimes appear to be clearly nano-degree topics. What is the situation wrt. to these re-directed files? Are we doing a good job? maybe we ought to delete all of these re-directed files in coding and re-create them to have a clean baseline. Can the batch mode already be run without writing local files and only recreating the "foreign" (= coding) files?`;
  
  console.log('Message to classify:');
  console.log(testMessage);
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Check available methods
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(classifier)));
  
  // Test the classification with debug details
  const startTime = Date.now();
  
  // Create the exact exchange structure used by ReliableCodingClassifier
  const exchange = {
    userMessage: testMessage,
    content: testMessage
  };
  
  console.log('Exchange structure sent to classifier:');
  console.log(JSON.stringify(exchange, null, 2));
  console.log('\n');
  
  const result = await classifier.classify(exchange, '/Users/q284340/Agentic/nano-degree');
  const duration = Date.now() - startTime;
  
  console.log('Classification Result:');
  console.log(`- Classification: ${result.classification}`);
  console.log(`- Is Coding: ${result.isCoding}`);
  console.log(`- Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`- Duration: ${duration}ms`);
  console.log(`- Decision Path: ${result.decisionPath.join(' → ')}`);
  
  if (result.details) {
    console.log('\nDetailed Analysis:');
    if (result.details.pathAnalysis) {
      console.log(`- Path Analysis: ${JSON.stringify(result.details.pathAnalysis, null, 2)}`);
    }
    if (result.details.keywordMatches) {
      console.log(`- Keyword Matches: ${result.details.keywordMatches.length} found`);
      result.details.keywordMatches.forEach(match => {
        console.log(`  - "${match.keyword}" (${match.category}, weight: ${match.weight})`);
      });
    }
    if (result.details.semanticAnalysis) {
      console.log(`- Semantic Analysis: ${JSON.stringify(result.details.semanticAnalysis, null, 2)}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Final Result: ${result.isCoding ? '✅ CODING' : '❌ NOT CODING'}`);
  
  // Show stats
  const stats = classifier.getStats();
  console.log('\nClassifier Stats:');
  console.log(`- Total Classifications: ${stats.totalClassifications}`);
  console.log(`- Avg Classification Time: ${stats.avgClassificationTime?.toFixed(1)}ms`);
}

testSept13Message().catch(error => {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});