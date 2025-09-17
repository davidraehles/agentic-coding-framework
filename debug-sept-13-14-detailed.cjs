#!/usr/bin/env node
/**
 * Debug Sept 13-14 Content in Detail
 */

const { performance } = require('perf_hooks');

async function debugDetailedContent() {
  console.log('🔧 Debug Sept 13-14 Content Classification');
  console.log('='.repeat(60));
  
  try {
    // Dynamic import for ES module
    const { default: ReliableCodingClassifier } = await import('./src/live-logging/ReliableCodingClassifier.js');
    
    // Initialize classifier with debug enabled
    const classifier = new ReliableCodingClassifier({
      debug: true,
      enableLogging: true,
      skipSemanticAnalysis: true  // Use only fast classification for debugging
    });
    
    await classifier.initialize();
    console.log('✅ Classifier initialized');
    
    // Test the actual content from Sept 13-14
    const testContent = [
      'check the re-directed -from-nano-degree.md session logs in coding/.specstory/history - there seem to be an awful lot of them, some still with the old half-hour nomenclature. And content wise, they sometimes appear to be clearly nano-degree topics. What is the situation wrt. to these re-directed files? Are we doing a good job? maybe we ought to delete all of these re-directed files in coding and re-create them to have a clean baseline. Can the batch mode already be run without writing local files and only recreating the "foreign" (= coding) files?',
      
      'first make a plan to adjust the batch mode facility. I want to be able to...\n(1) recreate everything in a given\'s project transcript (= local and foreign [= coding] entries) -> current impl., only I now also want to be able to recreate "coding" from within a non-coding project, i. e. it\'ll have to run (3) for the non-coding and (2) for the coding transcript \\\n(2) recreate only the local ones, not the re-directed ones\\\n(3) recreate only the foreign ones, not the local ones\\\nIn either case, I want to be able to do this "clean"ly, i. e. first delete all existing logging entries for which we still have transcript files (--> need to check how far back the transcript still reaches. Don\'t delete older LSL entries as we won\'t be able to recreate them)... or "incrementally", i. e. don\'t delete any files, just re-create and overwrite existing files that have the same filename',
      
      '# Read session logs for continuity\n\nRead the last session log for continuity. If $ARGUMENTS is given, read the last $ARGUMENTS session log files.\n\n## Steps\n1. Find the latest session log file in the current project\'s .specstory/history folder\n2. Read the most recent session log to establish continuity\n3. If $ARGUMENTS specifies more than 1, read additional previous session files\n4. Summarize all sessions to provide continuity of your awareness and actions across sessions\n\n## Implementation Notes\n- Session filenames follow pattern: `YYYY-MM-DD_HH-MM-SS_projectname-session.md`\n- All sessions are logged locally in the current project\'s .specstory/history directory\n- For multiple sessions, start with most recent and work backwards\n- Focus on understanding the project context and previous work completed'
    ];
    
    console.log('\n🔍 Testing Classification of Sept 13-14 Content:');
    
    for (let i = 0; i < testContent.length; i++) {
      const content = testContent[i];
      console.log(`\n📋 Test ${i + 1}: ${content.substring(0, 80)}...`);
      
      const exchange = {
        userMessage: content,
        assistantResponse: 'I\'ll help you with that.',
        timestamp: Date.now()
      };
      
      const result = await classifier.classify(exchange);
      
      console.log(`   Result: ${result.classification}`);
      console.log(`   Is Coding: ${result.isCoding}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Layer: ${result.layer}`);
      console.log(`   Reason: ${result.reason}`);
      
      if (!result.isCoding) {
        console.log(`   ❌ PROBLEM: This should be classified as coding!`);
      } else {
        console.log(`   ✅ Correctly classified as coding`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Classifier Stats:');
    const stats = classifier.getStats();
    console.log(`   Total Classifications: ${stats.totalClassifications}`);
    console.log(`   Path Analysis Hits: ${stats.pathAnalysisHits}`);
    console.log(`   Keyword Analysis Hits: ${stats.keywordAnalysisHits}`);
    console.log(`   Semantic Analysis Hits: ${stats.semanticAnalysisHits}`);
    
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
  debugDetailedContent()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Debug execution failed:', error);
      process.exit(1);
    });
}

module.exports = { debugDetailedContent };