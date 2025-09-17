#!/usr/bin/env node

/**
 * Debug the complete flow of Sept 13 message through EnhancedTranscriptMonitor
 * to see exactly where it gets lost in the pipeline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EnhancedTranscriptMonitor from './scripts/enhanced-transcript-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugSept13Flow() {
  console.log('🔍 Debugging Sept 13 message flow through complete pipeline...\n');
  
  // Set environment variables for foreign mode
  process.env.TRANSCRIPT_SOURCE_PROJECT = '/Users/q284340/Agentic/nano-degree';
  process.env.CODING_TOOLS_PATH = '/Users/q284340/Agentic/coding';
  
  // Initialize the enhanced transcript monitor with debug enabled
  const monitor = new EnhancedTranscriptMonitor({ 
    projectPath: '/Users/q284340/Agentic/nano-degree',
    skipSemanticAnalysis: false,
    mode: 'foreign',  // Use foreign mode to route coding content to coding project
    debug: true
  });
  
  // Wait for classifier to be ready
  let retries = 0;
  while (!monitor.reliableCodingClassifierReady && retries < 30) {
    console.log(`⏳ Waiting for classifier initialization... (${retries + 1}/30)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    retries++;
  }
  
  if (!monitor.reliableCodingClassifierReady) {
    console.error('❌ Failed to initialize classifier after 30 seconds');
    process.exit(1);
  }
  
  console.log('✅ Monitor and classifier ready\n');
  
  // Process only the Sept 13 transcript
  const transcriptPath = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
  
  // Temporarily override some methods to add debug logging
  const originalDetermineTargetProject = monitor.determineTargetProject.bind(monitor);
  monitor.determineTargetProject = async function(exchange) {
    const result = await originalDetermineTargetProject(exchange);
    if (exchange.timestamp === '2025-09-13T06:14:35.337Z' || 
        (exchange.userMessage && exchange.userMessage.includes('re-directed -from-nano-degree.md'))) {
      console.log('\n🎯 SEPT 13 TARGET PROJECT DETERMINATION:');
      console.log(`   Exchange timestamp: ${exchange.timestamp}`);
      console.log(`   User message snippet: ${exchange.userMessage?.substring(0, 100)}...`);
      console.log(`   Target project result: ${result}`);
      console.log(`   Mode: ${this.config.mode}`);
    }
    return result;
  };
  
  const originalProcessUserPromptSetCompletion = monitor.processUserPromptSetCompletion.bind(monitor);
  monitor.processUserPromptSetCompletion = async function(completedSet, targetProject, tranche) {
    // Check if this set contains our Sept 13 message
    const hasSept13 = completedSet.some(ex => 
      ex.timestamp === '2025-09-13T06:14:35.337Z' || 
      (ex.userMessage && ex.userMessage.includes('re-directed -from-nano-degree.md'))
    );
    
    if (hasSept13) {
      console.log('\n🎯 SEPT 13 PROMPT SET COMPLETION:');
      console.log(`   Completed set size: ${completedSet.length}`);
      console.log(`   Target project: ${targetProject}`);
      console.log(`   Tranche: ${tranche}`);
      console.log(`   Set contains Sept 13 message: YES`);
      
      // Show which exchange has the Sept 13 message
      for (let i = 0; i < completedSet.length; i++) {
        const ex = completedSet[i];
        if (ex.timestamp === '2025-09-13T06:14:35.337Z' || 
            (ex.userMessage && ex.userMessage.includes('re-directed -from-nano-degree.md'))) {
          console.log(`   Sept 13 exchange at index ${i}:`);
          console.log(`     Timestamp: ${ex.timestamp}`);
          console.log(`     User message: ${ex.userMessage?.substring(0, 100)}...`);
          console.log(`     IsUserPrompt: ${ex.isUserPrompt}`);
        }
      }
    }
    
    return await originalProcessUserPromptSetCompletion(completedSet, targetProject, tranche);
  };
  
  const originalIsCodingRelated = monitor.isCodingRelated.bind(monitor);
  monitor.isCodingRelated = async function(exchange) {
    const result = await originalIsCodingRelated(exchange);
    if (exchange.timestamp === '2025-09-13T06:14:35.337Z' || 
        (exchange.userMessage && exchange.userMessage.includes('re-directed -from-nano-degree.md'))) {
      console.log('\n🎯 SEPT 13 CODING CLASSIFICATION:');
      console.log(`   Exchange timestamp: ${exchange.timestamp}`);
      console.log(`   User message snippet: ${exchange.userMessage?.substring(0, 100)}...`);
      console.log(`   Is coding related: ${result}`);
    }
    return result;
  };
  
  console.log('🚀 Processing Sept 13 transcript with debugging...\n');
  console.log(`🎯 FORCING EXACT TRANSCRIPT: ${transcriptPath}`);
  
  // Verify this is the correct transcript file
  console.log(`📁 File exists: ${fs.existsSync(transcriptPath)}`);
  const stats = fs.statSync(transcriptPath);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
  console.log(`🕐 File modified: ${stats.mtime}`);
  
  // Process the transcript file
  const transcriptFile = {
    path: transcriptPath,
    filename: path.basename(transcriptPath),
    size: stats.size
  };
  
  console.log(`🔍 Processing transcript file object:`, JSON.stringify(transcriptFile, null, 2));
  
  const result = await monitor.processSingleTranscriptStreaming(transcriptFile);
  
  console.log('\n📊 Processing Result:');
  console.log(`   File: ${result.file}`);
  console.log(`   Exchanges: ${result.exchanges}`);
  console.log(`   Processed: ${result.processed}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
  
  // Check if Sept 13 files were created
  console.log('\n🔍 Checking for Sept 13 files...');
  const codingHistoryDir = '/Users/q284340/Agentic/coding/.specstory/history';
  const files = fs.readdirSync(codingHistoryDir);
  const sept13Files = files.filter(f => f.includes('2025-09-13'));
  
  console.log(`Found ${sept13Files.length} Sept 13 files in coding project:`);
  sept13Files.forEach(file => console.log(`   - ${file}`));
  
  if (sept13Files.length === 0) {
    console.log('\n❌ NO SEPT 13 FILES CREATED - investigating why...');
  } else {
    console.log('\n✅ Sept 13 files successfully created!');
  }
}

debugSept13Flow().catch(error => {
  console.error('❌ Debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});