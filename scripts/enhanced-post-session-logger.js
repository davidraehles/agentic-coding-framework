#!/usr/bin/env node

/**
 * Enhanced Post-Session Logger
 * Maintains compatibility with existing post-session logging while integrating with live logging
 * Acts as a fallback and supplement to the live logging system
 */

import fs from 'fs';
import path from 'path';
import { finalizeGlobalSession } from './live-logging-coordinator.js';

class EnhancedPostSessionLogger {
  constructor(projectPath, codingRepo, sessionId) {
    this.projectPath = projectPath;
    this.codingRepo = codingRepo;
    this.sessionId = sessionId;
    this.sessionFile = path.join(codingRepo, '.mcp-sync', 'current-session.json');
  }

  async captureConversation() {
    console.log('📋 Enhanced post-session logging started...');
    
    try {
      // 1. First, try to finalize the live logging session
      const liveSessionSummary = await this.finalizeLiveSession();
      
      // 2. Check if traditional session capture is needed
      if (!await this.shouldRunTraditionalCapture(liveSessionSummary)) {
        console.log('✅ Live logging handled the session - traditional capture skipped');
        return;
      }
      
      // 3. Run traditional capture as fallback/supplement
      console.log('🔄 Running traditional session capture as supplement...');
      await this.runTraditionalCapture(liveSessionSummary);
      
      console.log('✅ Enhanced post-session logging completed');
      
    } catch (error) {
      console.error('❌ Enhanced post-session logging failed:', error.message);
      // Fallback to basic logging
      await this.runBasicFallback();
    }
  }

  async finalizeLiveSession() {
    try {
      const summary = await finalizeGlobalSession();
      
      if (summary) {
        console.log(`✅ Live session finalized: ${summary.exchangeCount} exchanges processed`);
        console.log(`   📊 Classification: ${summary.classification.coding} coding, ${summary.classification.project} project, ${summary.classification.hybrid} hybrid`);
        return summary;
      }
      
      return null;
    } catch (error) {
      console.warn('Live session finalization failed:', error.message);
      return null;
    }
  }

  async shouldRunTraditionalCapture(liveSessionSummary) {
    // Always run traditional capture if:
    // 1. Live logging didn't capture anything
    // 2. We need to maintain compatibility
    // 3. There might be conversation parts not captured by live logging
    
    if (!liveSessionSummary) {
      console.log('💡 No live session data - traditional capture needed');
      return true;
    }
    
    if (liveSessionSummary.exchangeCount === 0) {
      console.log('💡 No exchanges captured live - traditional capture needed');
      return true;
    }
    
    // Check if session file indicates traditional capture is needed
    if (fs.existsSync(this.sessionFile)) {
      try {
        const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
        if (sessionData.needsLogging) {
          console.log('💡 Session file indicates traditional logging needed');
          return true;
        }
      } catch (error) {
        console.warn('Could not read session file:', error.message);
      }
    }
    
    // For now, always supplement with traditional capture for completeness
    console.log('💡 Running traditional capture as supplement to live logging');
    return true;
  }

  async runTraditionalCapture(liveSessionSummary) {
    // Import and run the existing simple post-session logger
    try {
      const { execSync } = await import('child_process');
      
      console.log('🔄 Executing traditional post-session logger...');
      const result = execSync('node scripts/simple-post-session-logger.js', {
        cwd: this.codingRepo,
        encoding: 'utf8',
        timeout: 30000
      });
      
      console.log('📄 Traditional logger output:', result);
      
      // If we have live session data, append it to the traditional log
      if (liveSessionSummary) {
        await this.appendLiveSessionSummary(liveSessionSummary);
      }
      
    } catch (error) {
      console.error('Traditional capture failed:', error.message);
      await this.createManualSessionLog(liveSessionSummary);
    }
  }

  async appendLiveSessionSummary(summary) {
    try {
      // Find the most recent session log files
      const timestamp = new Date().toISOString().split('T')[0] + '_' + 
        new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      
      // Check both coding and project directories for recent logs
      const potentialFiles = [
        path.join(this.codingRepo, '.specstory/history', `${timestamp.split('_')[0]}_*_coding-session.md`),
        path.join(this.projectPath, '.specstory/history', `${timestamp.split('_')[0]}_*_project-session.md`)
      ];
      
      const liveSessionAppendix = this.generateLiveSessionAppendix(summary);
      
      // Look for recent log files and append the live session summary
      const { glob } = await import('glob');
      
      for (const pattern of potentialFiles) {
        const files = await glob(pattern);
        const mostRecent = files.sort().pop();
        
        if (mostRecent && fs.existsSync(mostRecent)) {
          console.log(`📎 Appending live session summary to: ${path.basename(mostRecent)}`);
          fs.appendFileSync(mostRecent, liveSessionAppendix);
        }
      }
      
    } catch (error) {
      console.error('Failed to append live session summary:', error.message);
    }
  }

  generateLiveSessionAppendix(summary) {
    return `

---

## Live Logging Session Summary

**Live Session Integration:** ✅ Enhanced logging was active during this session  
**Live Session ID:** ${summary.sessionId}  
**Exchanges Processed:** ${summary.exchangeCount}  
**Intelligent Classification:**
- 📊 Coding-related exchanges: ${summary.classification.coding}
- 🏗️ Project-specific exchanges: ${summary.classification.project}  
- 🔄 Hybrid (both) exchanges: ${summary.classification.hybrid}

**Enhanced Features Used:**
- ✅ Semantic tool interpretation (meaningful tool call summaries)
- ✅ Real-time exchange classification 
- ✅ Hybrid logging (intelligent routing to appropriate repositories)
- ✅ Live conversation capture during session

**Log Files Generated:**
${Object.entries(summary.logFiles).map(([type, file]) => 
  file ? `- **${type}**: \`${path.basename(file)}\`` : ''
).filter(Boolean).join('\n')}

---

*This session used the enhanced live logging system that captures and classifies exchanges in real-time, providing more meaningful and context-aware session documentation.*

`;
  }

  async createManualSessionLog(liveSessionSummary) {
    console.log('📝 Creating manual session log as fallback...');
    
    const timestamp = new Date().toISOString().split('T')[0] + '_' + 
      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const logContent = `# Enhanced Session Log (Fallback)

**Session Timestamp:** ${timestamp}
**Project:** ${path.basename(this.projectPath)}
**Session Type:** Enhanced Live Logging
**Logged At:** ${new Date().toISOString()}

---

## Session Summary

This session was processed by the enhanced live logging system.

${liveSessionSummary ? `
**Live Session Data:**
- Session ID: ${liveSessionSummary.sessionId}
- Exchanges: ${liveSessionSummary.exchangeCount}
- Classifications: ${JSON.stringify(liveSessionSummary.classification, null, 2)}
` : `
**Note:** Traditional conversation capture was used as live logging was not available.
`}

---

## Enhanced Logging Features

The enhanced logging system provides:
- 🔍 Semantic tool interpretation
- 🎯 Real-time exchange classification  
- 🔄 Hybrid logging with intelligent routing
- 📊 Meaningful tool call summaries instead of "[Tool: X]"

**Next Steps:** Check for corresponding log files in:
- \`coding/.specstory/history/\` (for coding-related exchanges)
- \`.specstory/history/\` (for project-specific exchanges)

`;

    // Write to project directory
    const logFile = path.join(this.projectPath, '.specstory/history', `${timestamp}_enhanced-session.md`);
    
    // Ensure directory exists
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(logFile, logContent);
    console.log(`✅ Manual session log created: ${path.basename(logFile)}`);
  }

  async runBasicFallback() {
    console.log('🆘 Running basic fallback logging...');
    
    const timestamp = new Date().toISOString().split('T')[0] + '_' + 
      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const fallbackContent = `# Session Log (Basic Fallback)

**Timestamp:** ${timestamp}
**Project:** ${path.basename(this.projectPath)}
**Status:** Basic fallback logging used

---

## Note

The enhanced live logging system encountered an error. This is a basic fallback log.

Check system status:
- Constraint monitor integration
- MCP server availability  
- Live logging coordinator status

**Recommendation:** Review the enhanced logging system configuration and restart claude-mcp.

`;

    const logFile = path.join(this.projectPath, '.specstory/history', `${timestamp}_fallback-session.md`);
    
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(logFile, fallbackContent);
    console.log(`⚠️ Fallback session log created: ${path.basename(logFile)}`);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || process.cwd();
  const codingRepo = args[1] || '/Users/q284340/Agentic/coding';
  const sessionId = args[2] || `session-${Date.now()}`;

  const logger = new EnhancedPostSessionLogger(projectPath, codingRepo, sessionId);
  await logger.captureConversation();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default EnhancedPostSessionLogger;