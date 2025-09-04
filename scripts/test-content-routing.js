#!/usr/bin/env node

/**
 * Test Content Routing Logic
 * Tests the intelligent routing system for LSL/trajectory files
 */

import TranscriptMonitor from './transcript-monitor.js';

async function testContentRouting() {
  console.log('🧪 Testing Intelligent Content Routing\n');

  // Create monitor with nano-degree as project path
  const monitor = new TranscriptMonitor({
    projectPath: '/Users/q284340/Agentic/nano-degree',
    semanticApiKey: process.env.GROQ_API_KEY
  });

  const testCases = [
    {
      name: 'Edit coding file (should route)',
      exchange: { userMessage: 'Fix the transcript-monitor.js script' },
      toolCall: { name: 'Edit', input: { file_path: '/Users/q284340/Agentic/coding/scripts/transcript-monitor.js' } },
      expectedRouting: 'coding'
    },
    {
      name: 'Write coding file (should route)',
      exchange: { userMessage: 'Create a new script' },
      toolCall: { name: 'Write', input: { file_path: 'coding/bin/new-tool.js' } },
      expectedRouting: 'coding'
    },
    {
      name: 'LSL discussion without file changes (should NOT route)',
      exchange: { userMessage: 'How does the LSL trajectory file system work?' },
      toolCall: { name: 'Read', input: { file_path: 'docs/architecture.md' } },
      expectedRouting: 'local'
    },
    {
      name: 'UKB discussion without file changes (should NOT route)',
      exchange: { userMessage: 'Update the ukb knowledge base with new insights' },
      toolCall: { name: 'Bash', input: { command: 'ukb --interactive' } },
      expectedRouting: 'local'
    },
    {
      name: 'Semantic analysis discussion only (should NOT route)',
      exchange: { userMessage: 'Enhance the semantic analysis integration' },
      toolCall: { name: 'Read', input: { file_path: 'some-file.js' } },
      expectedRouting: 'local'
    },
    {
      name: 'Regular nano-degree work',
      exchange: { userMessage: 'Add a new feature to the main application' },
      toolCall: { name: 'Write', input: { file_path: '/Users/q284340/Agentic/nano-degree/src/app.js' } },
      expectedRouting: 'local'
    },
    {
      name: 'Regular project discussion',
      exchange: { userMessage: 'How should we implement user authentication?' },
      toolCall: { name: 'Read', input: { file_path: 'docs/requirements.md' } },
      expectedRouting: 'local'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Message: "${testCase.exchange.userMessage}"`);
    console.log(`   Tool: ${testCase.toolCall.name}`);
    
    try {
      const shouldRoute = await monitor.shouldRouteToCodingRepo(testCase.exchange, testCase.toolCall);
      const actualRouting = shouldRoute ? 'coding' : 'local';
      
      const status = actualRouting === testCase.expectedRouting ? '✅' : '❌';
      console.log(`   Expected: ${testCase.expectedRouting}, Got: ${actualRouting} ${status}`);
      
      if (actualRouting !== testCase.expectedRouting) {
        console.log(`   ⚠️  MISMATCH: Expected ${testCase.expectedRouting} but got ${actualRouting}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n🏁 Content routing tests completed');
}

// Run tests
testContentRouting().catch(console.error);