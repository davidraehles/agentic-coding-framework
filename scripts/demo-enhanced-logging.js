#!/usr/bin/env node

/**
 * Demo Script for Enhanced Live Session Logging
 * Shows the difference between old and new logging approaches
 */

import SemanticToolInterpreter from './semantic-tool-interpreter.js';
import ExchangeClassifier from './exchange-classifier.js';
import HybridSessionLogger from './hybrid-session-logger.js';

console.log('🎬 Enhanced Live Session Logging Demo\n');

async function demonstrateOldVsNew() {
  console.log('📋 OLD LOGGING APPROACH:');
  console.log('  [Tool: Glob]');
  console.log('  [Tool: Read]');
  console.log('  [Tool: Edit]');
  console.log('  [Tool: mcp__memory__search_nodes]\n');

  console.log('🚀 NEW ENHANCED LOGGING APPROACH:\n');

  const interpreter = new SemanticToolInterpreter();
  const classifier = new ExchangeClassifier();
  const logger = await HybridSessionLogger.createFromCurrentContext();

  // Demo tool interactions
  const demoInteractions = [
    {
      toolCall: { name: 'Glob', params: { pattern: '**/*session*', path: '.specstory' } },
      result: '.specstory/history/2025-09-02_15-14-27_coding-session.md\n.specstory/history/2025-09-02_16-20-15_project-session.md'
    },
    {
      toolCall: { name: 'Read', params: { file_path: '/Users/q284340/Agentic/coding/CLAUDE.md' } },
      result: '# CLAUDE.md - Claude Code Instructions\n\nThis file provides essential guidance...\n(150 lines total)'
    },
    {
      toolCall: { name: 'Edit', params: { 
        file_path: './src/components/UserProfile.js', 
        old_string: 'useState(null)', 
        new_string: 'useState({ name: "", email: "" })' 
      }},
      result: 'File updated successfully'
    },
    {
      toolCall: { name: 'mcp__memory__search_nodes', params: { query: 'ConditionalLoggingPattern' } },
      result: { entities: [{ name: 'ConditionalLoggingPattern', type: 'TransferablePattern' }] }
    },
    {
      toolCall: { name: 'mcp__constraint-monitor__get_constraint_status', params: {} },
      result: { status: 'operational', compliance_score: 8.5, active_violations: 0 }
    }
  ];

  for (const [index, interaction] of demoInteractions.entries()) {
    console.log(`## Exchange ${index + 1}:`);
    
    // 1. Semantic interpretation
    const summary = await interpreter.summarize(interaction.toolCall, interaction.result);
    console.log(`${summary.icon} **${summary.type}**: ${summary.summary}`);
    
    if (summary.details) {
      console.log(`   Details: ${summary.details.slice(0, 80)}${summary.details.length > 80 ? '...' : ''}`);
    }
    
    // 2. Classification
    const classification = await classifier.classifyExchange({
      summary,
      toolCall: interaction.toolCall,
      result: interaction.result
    });
    
    console.log(`   📊 Classification: ${classification.target} (${Math.round(classification.confidence * 100)}% confidence)`);
    if (classification.hybrid) {
      console.log(`   🔄 Hybrid: Will log to both coding/.specstory/ AND .specstory/`);
    }
    
    if (classification.reasons && classification.reasons.length > 0) {
      console.log(`   📋 Reasons: ${classification.reasons.slice(0, 2).join(', ')}`);
    }
    
    // 3. Log the interaction
    await logger.onToolInteraction(interaction.toolCall, interaction.result, {
      demo: true,
      exchangeNumber: index + 1
    });
    
    console.log('');
  }

  // Finalize session
  console.log('📋 Finalizing demo session...');
  const summary = await logger.finalizeSession();
  
  console.log('✅ Demo session completed!');
  console.log(`   📊 Total exchanges: ${summary.exchangeCount}`);
  console.log(`   🎯 Classifications:`);
  console.log(`      - Coding-related: ${summary.classification.coding}`);
  console.log(`      - Project-specific: ${summary.classification.project}`);
  console.log(`      - Hybrid: ${summary.classification.hybrid}`);
  
  if (summary.logFiles.coding) {
    console.log(`   📂 Coding log: ${summary.logFiles.coding.split('/').pop()}`);
  }
  if (summary.logFiles.project) {
    console.log(`   📂 Project log: ${summary.logFiles.project.split('/').pop()}`);
  }
}

async function showLogFileComparison() {
  console.log('\n' + '='.repeat(60));
  console.log('📄 LOG FILE COMPARISON');
  console.log('='.repeat(60));
  
  console.log('\n❌ OLD FORMAT (uninformative):');
  console.log(`
## Exchange 1

**User:** *(9/2/2025, 3:04:37 PM)*
it seems that you are no longer writing the .specstory/history files

**Assistant:** *(9/2/2025, 3:04:42 PM)*
I'll analyze why the .specstory/history files are no longer being written.

**Assistant:** *(9/2/2025, 3:04:47 PM)*
[Tool: TodoWrite]

**Assistant:** *(9/2/2025, 3:04:52 PM)*
Let me start by checking the current .specstory/history directory

**Assistant:** *(9/2/2025, 3:04:53 PM)*
[Tool: Bash]
`);

  console.log('\n✅ NEW FORMAT (meaningful):');
  console.log(`
## Exchange 1: Task Management

**Time:** 9/2/2025, 3:04:47 PM
**Classification:** coding (confidence: 85%)

📋 **Task**: Updated todos: 0 completed, 1 in progress, 3 pending

**Details:**
🔄 Analyze why .specstory/history files are no longer being written
⏳ Check current .specstory/history directory structure  
⏳ Examine post-session logging scripts
⏳ Test session logging functionality

**Classification Reasons:**
- References concept: session logging
- Uses coding tool: TodoWrite
- Working in coding repository

**Context:** Knowledge management and system work

---

## Exchange 2: System Operation

**Time:** 9/2/2025, 3:04:53 PM  
**Classification:** project (confidence: 70%)

⚡ **Command**: \`ls\` ✅ - Lists files in current directory

**Details:**
.specstory/history/2025-06-16_10-30-45_session.md
.specstory/history/2025-06-16_11-15-22_session.md  
.specstory/history/2025-09-02_15-14-27_coding-session.md

**Context:** Local project context
`);

  console.log('\n🎯 KEY IMPROVEMENTS:');
  console.log('  ✅ Meaningful tool summaries instead of "[Tool: X]"');
  console.log('  ✅ Shows actual parameters, results, and file names');
  console.log('  ✅ Real-time classification with confidence scores');
  console.log('  ✅ Intelligent routing to appropriate log locations');
  console.log('  ✅ Context-aware exchange titles and descriptions');
  console.log('  ✅ Classification reasoning for transparency');
}

async function main() {
  await demonstrateOldVsNew();
  await showLogFileComparison();
  
  console.log('\n🌟 Enhanced Live Session Logging Demo Complete!');
  console.log('\n💡 To activate this system:');
  console.log('  1. Start Claude Code with: claude-mcp');
  console.log('  2. The system will automatically capture meaningful logs');
  console.log('  3. Check logs in both coding/.specstory/ and .specstory/ directories');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}