#!/usr/bin/env node
/**
 * Debug isCodingRelated method specifically
 */

async function debugIsCodingRelated() {
  console.log('🔧 Debug isCodingRelated Method');
  console.log('='.repeat(60));
  
  try {
    // Dynamic import for ES module
    const { default: EnhancedTranscriptMonitor } = await import('./scripts/enhanced-transcript-monitor.js');
    
    // Initialize monitor with foreign mode and skip semantic analysis (like in the real scenario)
    const monitor = new EnhancedTranscriptMonitor({
      projectPath: '/Users/q284340/Agentic/nano-degree',
      mode: 'foreign',
      skipSemanticAnalysis: true,  // This is the key - same as real execution
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
      throw new Error('Classifier failed to initialize');
    }
    
    console.log('✅ Monitor initialized with foreign mode');
    
    // Test the same content
    const testExchanges = [
      {
        userMessage: 'check the re-directed -from-nano-degree.md session logs in coding/.specstory/history - there seem to be an awful lot of them, some still with the old half-hour nomenclature. And content wise, they sometimes appear to be clearly nano-degree topics. What is the situation wrt. to these re-directed files? Are we doing a good job? maybe we ought to delete all of these re-directed files in coding and re-create them to have a clean baseline. Can the batch mode already be run without writing local files and only recreating the "foreign" (= coding) files?',
        assistantMessage: 'I\'ll help analyze the redirected files.',
        timestamp: new Date('2025-09-13T06:14:35.337Z').getTime(),
        isUserPrompt: true
      },
      {
        userMessage: 'first make a plan to adjust the batch mode facility. I want to be able to...',
        assistantMessage: 'I\'ll create a plan for the batch mode facility.',
        timestamp: new Date('2025-09-13T06:23:12.013Z').getTime(),
        isUserPrompt: true
      }
    ];
    
    console.log('\n🔍 Testing isCodingRelated:');
    
    for (let i = 0; i < testExchanges.length; i++) {
      const exchange = testExchanges[i];
      console.log(`\n📋 Test ${i + 1}: ${exchange.userMessage.substring(0, 80)}...`);
      
      try {
        const isCoding = await monitor.isCodingRelated(exchange);
        console.log(`   isCodingRelated Result: ${isCoding}`);
        
        if (!isCoding) {
          console.log(`   ❌ PROBLEM: isCodingRelated returned false for coding content!`);
          
          // Let's test the reliable classifier directly too
          const classifierResult = await monitor.reliableCodingClassifier.classify(exchange);
          console.log(`   Direct Classifier Result: ${classifierResult.isCoding}`);
          console.log(`   Direct Classifier Reason: ${classifierResult.reason}`);
        } else {
          console.log(`   ✅ Correctly identified as coding`);
        }
        
        // Test the determineTargetProject method
        const targetProject = await monitor.determineTargetProject(exchange);
        console.log(`   Target Project: ${targetProject}`);
        
        if (targetProject === null) {
          console.log(`   ❌ PROBLEM: determineTargetProject returned null (would skip this exchange)!`);
        } else {
          console.log(`   ✅ Would route to: ${targetProject}`);
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    return false;
  }
}

// Run debug if called directly
if (require.main === module) {
  debugIsCodingRelated()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Debug execution failed:', error);
      process.exit(1);
    });
}

module.exports = { debugIsCodingRelated };