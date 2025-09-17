#!/usr/bin/env node
/**
 * Debug Sept 13-14 Classification Issue
 * 
 * Test the actual content from Sept 13-14 transcripts to understand
 * why they're not being classified as coding content.
 */

const { performance } = require('perf_hooks');

async function debugSept1314() {
  console.log('🔧 Debug Sept 13-14 Classification Issue');
  console.log('='.repeat(50));
  
  try {
    // Dynamic import for ES module
    const { default: ReliableCodingClassifier } = await import('./src/live-logging/ReliableCodingClassifier.js');
    
    console.log('✅ Successfully imported ReliableCodingClassifier');
    
    // Initialize classifier
    const classifier = new ReliableCodingClassifier({
      debug: true,  // Enable debug output
      enableLogging: false
    });
    
    await classifier.initialize();
    console.log('✅ Classifier initialized');
    
    // Test actual content from Sept 13-14 that should be classified as coding
    const testExchanges = [
      {
        name: 'LSL Batch Mode Discussion',
        exchange: {
          userMessage: 'check the re-directed -from-nano-degree.md session logs in coding/.specstory/history - there seem to be an awful lot of them, some still with the old half-hour nomenclature. And content wise, they sometimes appear to be clearly nano-degree topics. What is the situation wrt. to these re-directed files? Are we doing a good job? maybe we ought to delete all of these re-directed files in coding and re-create them to have a clean baseline. Can the batch mode already be run without writing local files and only recreating the "foreign" (= coding) files?',
          assistantResponse: 'I\'ll examine the redirected session logs in the coding project to assess the current state and help you optimize the batch mode facility.'
        },
        expectedCoding: true,
        reason: 'Discussion about coding project structure, LSL system, batch mode'
      },
      {
        name: 'Advanced Batch Mode Planning',
        exchange: {
          userMessage: 'first make a plan to adjust the batch mode facility. I want to be able to...\n(1) recreate everything in a given\'s project transcript (= local and foreign [= coding] entries) -> current impl., only I now also want to be able to recreate "coding" from within a non-coding project, i. e. it\'ll have to run (3) for the non-coding and (2) for the coding transcript \\\n(2) recreate only the local ones, not the re-directed ones\\\n(3) recreate only the foreign ones, not the local ones\\\nIn either case, I want to be able to do this "clean"ly, i. e. first delete all existing logging entries for which we still have transcript files (--> need to check how far back the transcript still reaches. Don\'t delete older LSL entries as we won\'t be able to recreate them)... or "incrementally", i. e. don\'t delete any files, just re-create and overwrite existing files that have the same filename',
          assistantResponse: 'I\'ll create a comprehensive plan for the batch mode facility enhancements you\'ve outlined.'
        },
        expectedCoding: true,
        reason: 'Technical specification for transcript processing system'
      },
      {
        name: 'Session Log Reading Command',
        exchange: {
          userMessage: '# Read session logs for continuity\n\nRead the last session log for continuity. If $ARGUMENTS is given, read the last $ARGUMENTS session log files.\n\n## Steps\n1. Find the latest session log file in the current project\'s .specstory/history folder\n2. Read the most recent session log to establish continuity\n3. If $ARGUMENTS specifies more than 1, read additional previous session files\n4. Summarize all sessions to provide continuity of your awareness and actions across sessions',
          assistantResponse: 'I\'ll read the session logs to establish continuity.'
        },
        expectedCoding: true,
        reason: 'Technical documentation about session log system'
      }
    ];
    
    console.log('\n🔍 Testing Sept 13-14 Content:');
    console.log('='.repeat(50));
    
    let codingResults = 0;
    let nonCodingResults = 0;
    
    for (let i = 0; i < testExchanges.length; i++) {
      const testCase = testExchanges[i];
      console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);
      console.log(`Expected: ${testCase.expectedCoding ? 'CODING' : 'NOT_CODING'} (${testCase.reason})`);
      
      try {
        const classifyStart = performance.now();
        const result = await classifier.classify(testCase.exchange);
        const classifyTime = performance.now() - classifyStart;
        
        const isCorrect = result.isCoding === testCase.expectedCoding;
        const status = isCorrect ? '✅' : '❌';
        
        console.log(`${status} Result: ${result.classification}`);
        console.log(`   Is Coding: ${result.isCoding}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   Layer: ${result.layer}`);
        console.log(`   Time: ${classifyTime.toFixed(2)}ms`);
        console.log(`   Reason: ${result.reason}`);
        
        if (result.isCoding) {
          codingResults++;
        } else {
          nonCodingResults++;
        }
        
        // Show decision path for debugging
        if (result.decisionPath && result.decisionPath.length > 0) {
          console.log('   Decision Path:');
          result.decisionPath.forEach((step, idx) => {
            console.log(`     ${idx + 1}. ${step.layer}: ${step.duration.toFixed(2)}ms`);
          });
        }
        
        if (!isCorrect) {
          console.log(`   ⚠️  MISCLASSIFICATION: Expected ${testCase.expectedCoding ? 'CODING' : 'NOT_CODING'} but got ${result.isCoding ? 'CODING' : 'NOT_CODING'}`);
        }
        
      } catch (error) {
        console.log(`❌ Classification error: ${error.message}`);
        nonCodingResults++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Classification Summary:');
    console.log(`   Coding: ${codingResults}/${testExchanges.length}`);
    console.log(`   Non-Coding: ${nonCodingResults}/${testExchanges.length}`);
    console.log(`   Expected Coding: ${testExchanges.filter(t => t.expectedCoding).length}/${testExchanges.length}`);
    
    if (codingResults < testExchanges.filter(t => t.expectedCoding).length) {
      console.log('\n❌ ISSUE IDENTIFIED: Some coding content is being misclassified as non-coding');
      console.log('   This explains why Sept 13-14 foreign files are missing from the coding project.');
      console.log('   The classifier is not recognizing LSL/transcript system discussions as coding content.');
    } else {
      console.log('\n✅ Classification working correctly - issue may be elsewhere in the pipeline');
    }
    
    return codingResults >= testExchanges.filter(t => t.expectedCoding).length;
    
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
  debugSept1314()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Debug execution failed:', error);
      process.exit(1);
    });
}

module.exports = { debugSept1314 };