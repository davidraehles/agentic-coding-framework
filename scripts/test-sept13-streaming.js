#!/usr/bin/env node

/**
 * Test script to directly run streaming processor on Sept 13 file
 */

import EnhancedTranscriptMonitor from './enhanced-transcript-monitor.js';

async function main() {
  console.log('🧪 Testing streaming processor on Sept 13 file directly');
  
  const monitor = new EnhancedTranscriptMonitor({ 
    projectPath: '/Users/q284340/Agentic/nano-degree',
    debug: true
  });

  // Force classifier initialization
  console.log('⏳ Initializing classifier...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const transcriptFile = {
    path: '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl',
    filename: 'e093980f-ac28-4a92-8677-687d7091930f.jsonl',
    size: 23 * 1024 * 1024 // 23MB
  };
  
  console.log('🌊 Testing streaming processing...');
  const result = await monitor.processSingleTranscriptStreaming(transcriptFile);
  
  console.log('📊 Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);