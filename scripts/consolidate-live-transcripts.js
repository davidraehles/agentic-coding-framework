#!/usr/bin/env node

/**
 * Consolidate Live Transcript Files
 * Merges multiple small live transcript files into 60-minute sessions
 */

import fs from 'fs';
import path from 'path';

class LiveTranscriptConsolidator {
  constructor() {
    this.historyDir = path.join(process.cwd(), '.specstory', 'history');
  }

  async consolidateToday() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📋 Consolidating live transcripts for ${today}...`);

    // Get all today's live transcript files
    const files = fs.readdirSync(this.historyDir)
      .filter(f => f.includes(today) && f.includes('live-transcript'))
      .map(f => {
        const filePath = path.join(this.historyDir, f);
        const stats = fs.statSync(filePath);
        return { 
          file: f, 
          path: filePath, 
          mtime: stats.mtime,
          size: stats.size 
        };
      })
      .sort((a, b) => a.mtime - b.mtime); // Chronological order

    console.log(`📊 Found ${files.length} live transcript files to consolidate`);

    if (files.length <= 1) {
      console.log('ℹ️  Nothing to consolidate');
      return;
    }

    // Group files into 60-minute sessions
    const sessions = this.groupIntoSessions(files, 60 * 60 * 1000); // 60 minutes

    for (const session of sessions) {
      await this.createConsolidatedSession(session, today);
    }

    console.log(`✅ Consolidation complete: ${sessions.length} sessions created`);
  }

  groupIntoSessions(files, sessionDuration) {
    const sessions = [];
    let currentSession = [];
    let sessionStart = null;

    for (const file of files) {
      if (!sessionStart) {
        sessionStart = file.mtime;
        currentSession = [file];
      } else {
        const timeDiff = file.mtime.getTime() - sessionStart.getTime();
        
        if (timeDiff <= sessionDuration) {
          // Add to current session
          currentSession.push(file);
        } else {
          // Start new session
          if (currentSession.length > 0) {
            sessions.push([...currentSession]);
          }
          currentSession = [file];
          sessionStart = file.mtime;
        }
      }
    }

    // Add final session
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  async createConsolidatedSession(sessionFiles, date) {
    if (sessionFiles.length <= 1) {
      console.log(`⏭️  Skipping single file session: ${sessionFiles[0].file}`);
      return;
    }

    const firstFile = sessionFiles[0];
    const lastFile = sessionFiles[sessionFiles.length - 1];
    
    // Extract start time from first file
    const startTimeMatch = firstFile.file.match(/(\d{2}-\d{2}-\d{2})/);
    const startTime = startTimeMatch ? startTimeMatch[1] : 'unknown';
    
    // Create consolidated filename
    const consolidatedName = `${date}_${startTime}_consolidated-live-session.md`;
    const consolidatedPath = path.join(this.historyDir, consolidatedName);

    console.log(`🔗 Consolidating ${sessionFiles.length} files into: ${consolidatedName}`);

    // Build consolidated content
    let content = `# Consolidated Live Session\n\n`;
    content += `**Generated:** ${new Date().toISOString()}\n`;
    content += `**Session Period:** ${firstFile.mtime.toISOString()} - ${lastFile.mtime.toISOString()}\n`;
    content += `**Source Files:** ${sessionFiles.length} live transcript files\n`;
    content += `**Total Size:** ${Math.round(sessionFiles.reduce((sum, f) => sum + f.size, 0) / 1024)}KB\n\n`;
    content += `---\n\n`;

    // Merge all exchanges from all files
    let exchangeCount = 0;
    for (const file of sessionFiles) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        
        // Extract exchanges from this file
        const exchanges = this.extractExchangesFromFile(fileContent);
        
        for (const exchange of exchanges) {
          exchangeCount++;
          content += `## Exchange ${exchangeCount} (from ${file.file})\n\n`;
          content += exchange + '\n\n';
        }
        
      } catch (error) {
        console.warn(`⚠️  Error reading ${file.file}: ${error.message}`);
      }
    }

    // Add summary
    content += `---\n\n## Consolidation Summary\n\n`;
    content += `- **Original Files:** ${sessionFiles.length}\n`;
    content += `- **Total Exchanges:** ${exchangeCount}\n`;
    content += `- **Session Duration:** ${Math.round((lastFile.mtime - firstFile.mtime) / (1000 * 60))} minutes\n`;
    content += `- **Consolidated:** ${new Date().toLocaleString()}\n`;
    
    content += `\n### Original Files:\n`;
    for (const file of sessionFiles) {
      content += `- ${file.file} (${Math.round(file.size / 1024)}KB, ${file.mtime.toLocaleString()})\n`;
    }

    // Write consolidated file
    fs.writeFileSync(consolidatedPath, content);
    
    // Remove original files
    for (const file of sessionFiles) {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Removed: ${file.file}`);
    }

    console.log(`✅ Created consolidated session: ${consolidatedName}`);
  }

  extractExchangesFromFile(content) {
    const exchanges = [];
    
    // Split by ### headers (tool interactions)
    const sections = content.split(/###\s+/);
    
    for (let i = 1; i < sections.length; i++) { // Skip first empty section
      const section = sections[i].trim();
      if (section) {
        exchanges.push(section);
      }
    }
    
    return exchanges;
  }
}

// Main execution
async function main() {
  try {
    const consolidator = new LiveTranscriptConsolidator();
    await consolidator.consolidateToday();
  } catch (error) {
    console.error('❌ Consolidation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}

export default LiveTranscriptConsolidator;