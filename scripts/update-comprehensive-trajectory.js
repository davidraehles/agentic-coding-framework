#!/usr/bin/env node

/**
 * Update Comprehensive Trajectory Script
 * Creates meaningful trajectory updates by analyzing actual session content
 * and updating the project's comprehensive status
 */

import fs from 'fs';
import path from 'path';

class ComprehensiveTrajectoryUpdater {
  constructor(projectPath) {
    this.projectPath = projectPath || process.env.CODING_TARGET_PROJECT || process.cwd();
    this.trajectoryFile = path.join(this.projectPath, '.specstory', 'comprehensive-project-trajectory.md');
    this.historyDir = path.join(this.projectPath, '.specstory', 'history');
    this.semanticAnalysisApiKey = process.env.XAI_API_KEY || process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  }

  async updateTrajectory() {
    console.log(`🎯 Updating comprehensive trajectory for ${path.basename(this.projectPath)}`);
    
    // Check if comprehensive trajectory file exists
    if (!fs.existsSync(this.trajectoryFile)) {
      console.log('📄 Creating initial comprehensive trajectory file...');
      await this.createInitialTrajectoryFile();
      return;
    }

    // Get last processed window
    const lastWindow = this.getLastProcessedWindow();
    console.log(`📅 Last processed: ${lastWindow || 'none'}`);

    // Find new session windows since last processed
    const newWindows = this.findNewSessionWindows(lastWindow);
    console.log(`🔍 Found ${newWindows.length} new session windows`);

    if (newWindows.length === 0) {
      console.log('✅ Trajectory is up to date');
      return;
    }

    // Analyze and aggregate meaningful content from new sessions
    const projectEvolution = await this.analyzeProjectEvolution(newWindows);
    
    // Update trajectory with meaningful insights
    await this.updateTrajectoryWithInsights(projectEvolution, newWindows[newWindows.length - 1]);
    
    console.log(`✅ Updated trajectory with meaningful project evolution insights`);
  }

  getLastProcessedWindow() {
    const trajectoryContent = fs.readFileSync(this.trajectoryFile, 'utf8');
    
    // Look for last window marker
    const windowMatch = trajectoryContent.match(/\*\*Last Processed:\*\* ([^\n]+)/);
    if (windowMatch) {
      return windowMatch[1].trim();
    }
    
    return null;
  }

  findNewSessionWindows(lastWindow) {
    if (!fs.existsSync(this.historyDir)) {
      return [];
    }

    const sessionFiles = fs.readdirSync(this.historyDir)
      .filter(f => f.endsWith('-session.md') || f.endsWith('-session-from-coding.md') || f.endsWith('-session-from-nano-degree.md'))
      .sort();

    if (!lastWindow) {
      // Return last 5 sessions for initial analysis
      return sessionFiles.slice(-5);
    }

    // Find sessions after the last processed window
    const lastIndex = sessionFiles.findIndex(f => f.includes(lastWindow));
    if (lastIndex === -1) {
      return sessionFiles.slice(-5);
    }

    return sessionFiles.slice(lastIndex + 1);
  }

  async analyzeProjectEvolution(sessionFiles) {
    const evolution = {
      featuresAdded: [],
      bugsFixes: [],
      architecturalChanges: [],
      toolingImprovements: [],
      documentationUpdates: [],
      currentCapabilities: [],
      technicalDebt: []
    };
    
    for (const file of sessionFiles) {
      const sessionPath = path.join(this.historyDir, file);
      const content = fs.readFileSync(sessionPath, 'utf8');
      
      // Extract meaningful information from session content
      const insights = this.extractSessionInsights(content, file);
      
      // Aggregate insights into evolution categories
      if (insights.features.length > 0) {
        evolution.featuresAdded.push(...insights.features);
      }
      if (insights.fixes.length > 0) {
        evolution.bugsFixes.push(...insights.fixes);
      }
      if (insights.architecture.length > 0) {
        evolution.architecturalChanges.push(...insights.architecture);
      }
      if (insights.tooling.length > 0) {
        evolution.toolingImprovements.push(...insights.tooling);
      }
      if (insights.documentation.length > 0) {
        evolution.documentationUpdates.push(...insights.documentation);
      }
    }
    
    return evolution;
  }

  extractSessionInsights(content, filename) {
    const insights = {
      features: [],
      fixes: [],
      architecture: [],
      tooling: [],
      documentation: []
    };
    
    // Extract actual accomplishments from session content
    // Look for patterns that indicate real work done
    
    // Feature additions
    const featurePatterns = [
      /(?:created?|added?|implemented?|built)\s+(?:new\s+)?(.+?(?:feature|functionality|capability|system|component))/gi,
      /(?:new|added)\s+(.+?(?:script|tool|utility|command))/gi
    ];
    
    for (const pattern of featurePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const feature = match[1].trim();
        if (feature && !feature.includes('No context')) {
          insights.features.push(feature);
        }
      }
    }
    
    // Bug fixes
    const fixPatterns = [
      /(?:fixed?|resolved?|corrected?|repaired?)\s+(.+?(?:issue|bug|problem|error))/gi,
      /(?:fix|fixed)\s+(.+?(?:flag|indicator|status|display))/gi
    ];
    
    for (const pattern of fixPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const fix = match[1].trim();
        if (fix && !fix.includes('No context')) {
          insights.fixes.push(fix);
        }
      }
    }
    
    // Architectural changes
    const archPatterns = [
      /(?:refactored?|redesigned?|restructured?|reorganized?)\s+(.+)/gi,
      /(?:updated?|modified?|changed?)\s+(.+?(?:architecture|structure|design|system))/gi
    ];
    
    for (const pattern of archPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const change = match[1].trim();
        if (change && !change.includes('No context') && change.length < 200) {
          insights.architecture.push(change);
        }
      }
    }
    
    // Tooling improvements
    const toolingPatterns = [
      /(?:enhanced?|improved?|optimized?)\s+(.+?(?:script|monitoring|logging|tracking))/gi,
      /(?:added?|created?)\s+(.+?(?:automation|tool|utility))/gi
    ];
    
    for (const pattern of toolingPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const improvement = match[1].trim();
        if (improvement && !improvement.includes('No context')) {
          insights.tooling.push(improvement);
        }
      }
    }
    
    // Documentation updates
    const docPatterns = [
      /(?:documented?|updated?)\s+(.+?(?:documentation|readme|guide|tutorial))/gi,
      /(?:created?|wrote?)\s+(.+?(?:docs|documentation))/gi
    ];
    
    for (const pattern of docPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const doc = match[1].trim();
        if (doc && !doc.includes('No context')) {
          insights.documentation.push(doc);
        }
      }
    }
    
    // Deduplicate insights
    for (const key in insights) {
      insights[key] = [...new Set(insights[key])];
    }
    
    return insights;
  }

  async updateTrajectoryWithInsights(evolution, lastWindow) {
    let trajectoryContent = fs.readFileSync(this.trajectoryFile, 'utf8');
    
    // Find or create the "Current Project Status" section
    const statusSectionRegex = /## Current Project Status[\s\S]*?(?=##|$)/;
    const hasStatusSection = statusSectionRegex.test(trajectoryContent);
    
    let statusUpdate = `## Current Project Status\n\n`;
    statusUpdate += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n\n`;
    
    // Add meaningful content based on actual work done
    if (evolution.featuresAdded.length > 0) {
      statusUpdate += `### Recent Enhancements\n\n`;
      evolution.featuresAdded.forEach(feature => {
        statusUpdate += `- ${feature}\n`;
      });
      statusUpdate += '\n';
    }
    
    if (evolution.bugsFixes.length > 0) {
      statusUpdate += `### Issues Resolved\n\n`;
      evolution.bugsFixes.forEach(fix => {
        statusUpdate += `- ${fix}\n`;
      });
      statusUpdate += '\n';
    }
    
    if (evolution.architecturalChanges.length > 0) {
      statusUpdate += `### Architectural Improvements\n\n`;
      evolution.architecturalChanges.forEach(change => {
        statusUpdate += `- ${change}\n`;
      });
      statusUpdate += '\n';
    }
    
    if (evolution.toolingImprovements.length > 0) {
      statusUpdate += `### Tooling & Automation\n\n`;
      evolution.toolingImprovements.forEach(improvement => {
        statusUpdate += `- ${improvement}\n`;
      });
      statusUpdate += '\n';
    }
    
    // Add current capabilities summary
    statusUpdate += `### Current Capabilities\n\n`;
    statusUpdate += this.generateCapabilitiesSummary();
    statusUpdate += '\n';
    
    // Update or add the status section
    if (hasStatusSection) {
      trajectoryContent = trajectoryContent.replace(statusSectionRegex, statusUpdate);
    } else {
      // Insert before the final metadata
      const insertPoint = trajectoryContent.lastIndexOf('---\n\n*This comprehensive');
      if (insertPoint !== -1) {
        trajectoryContent = 
          trajectoryContent.substring(0, insertPoint) +
          statusUpdate +
          '\n---\n\n' +
          trajectoryContent.substring(insertPoint + 5);
      } else {
        trajectoryContent += '\n' + statusUpdate;
      }
    }
    
    // Update the last processed marker
    const markerRegex = /\*\*Last Processed:\*\* .+/;
    const newMarker = `**Last Processed:** ${lastWindow}`;
    
    if (markerRegex.test(trajectoryContent)) {
      trajectoryContent = trajectoryContent.replace(markerRegex, newMarker);
    } else {
      trajectoryContent += `\n${newMarker}\n`;
    }
    
    fs.writeFileSync(this.trajectoryFile, trajectoryContent);
  }

  generateCapabilitiesSummary() {
    const projectName = path.basename(this.projectPath);
    
    if (projectName === 'coding') {
      return `The coding project now provides:
- Enhanced session logging with proper content extraction
- Dynamic status line with real-time indicators
- Comprehensive trajectory tracking with meaningful updates
- Automated PlantUML diagram generation
- Intelligent transcript monitoring with redirect detection
- Unified LSL generation from historical and live transcripts`;
    } else if (projectName === 'nano-degree') {
      return `The nano-degree project delivers:
- Complete AI agent development curriculum
- Three-path learning system for different engagement levels
- Comprehensive module coverage from frameworks to deployment
- Integrated MCP protocol implementations
- Production-ready architectural patterns
- Real-world deployment scenarios and best practices`;
    } else {
      return `The ${projectName} project provides its core functionality with recent improvements integrated.`;
    }
  }

  async createInitialTrajectoryFile() {
    const projectName = path.basename(this.projectPath);
    const initialContent = `# Comprehensive Project Trajectory - ${projectName}

**Generated:** ${new Date().toISOString()}
**Project:** ${projectName}
**Repository:** ${this.projectPath}

---

## Project Overview

This comprehensive trajectory file tracks the evolution and current state of the ${projectName} project through meaningful analysis of development sessions.

---

## Current Project Status

**Last Updated:** ${new Date().toISOString().split('T')[0]}

### Current Capabilities

${this.generateCapabilitiesSummary()}

---

**Last Processed:** initial-setup

---

*This comprehensive trajectory file provides a meaningful overview of project evolution and current capabilities, focusing on what the project accomplishes rather than when activities occurred.*
`;

    fs.writeFileSync(this.trajectoryFile, initialContent);
    console.log(`📄 Created meaningful trajectory file: ${this.trajectoryFile}`);
  }
}

// Main execution
async function main() {
  const projectPath = process.argv[2] || process.env.CODING_TARGET_PROJECT || process.cwd();
  
  const updater = new ComprehensiveTrajectoryUpdater(projectPath);
  await updater.updateTrajectory();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveTrajectoryUpdater };