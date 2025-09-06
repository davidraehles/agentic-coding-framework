#!/usr/bin/env node

/**
 * Comprehensive Trajectory Updater V2
 * Creates meaningful project state summaries, not activity logs
 * Focuses on WHAT the project can do NOW, not WHEN things happened
 */

import fs from 'fs';
import path from 'path';

class ComprehensiveTrajectoryUpdater {
  constructor(projectPath) {
    this.projectPath = projectPath || process.env.CODING_TARGET_PROJECT || process.cwd();
    this.trajectoryFile = path.join(this.projectPath, '.specstory', 'comprehensive-project-trajectory.md');
    this.historyDir = path.join(this.projectPath, '.specstory', 'history');
  }

  async updateTrajectory() {
    const projectName = path.basename(this.projectPath);
    console.log(`🎯 Updating comprehensive trajectory for ${projectName}`);
    
    // Analyze current project state based on recent work
    const projectState = await this.analyzeCurrentProjectState();
    
    // Update or create trajectory with meaningful content
    await this.writeComprehensiveTrajectory(projectState);
    
    console.log(`✅ Updated trajectory with current project capabilities`);
  }

  async analyzeCurrentProjectState() {
    const projectName = path.basename(this.projectPath);
    
    // For known projects, provide accurate current state
    // This should ideally come from semantic analysis of the actual codebase
    // For now, we'll maintain accurate manual summaries
    
    if (projectName === 'coding') {
      return {
        purpose: "Development infrastructure and tooling ecosystem for AI-assisted coding",
        currentCapabilities: [
          "Live session logging (LSL) that captures real-time development activities",
          "Dynamic status line showing active sessions, redirects, and system health",
          "Intelligent transcript monitoring with automatic content classification",
          "Automatic routing of coding-related content to appropriate projects", 
          "Historical session reconstruction from transcript files",
          "PlantUML diagram generation with proper git tracking",
          "MCP server integration for semantic analysis and constraint monitoring",
          "Comprehensive trajectory tracking (this system)",
          "Portable configuration management across projects"
        ],
        recentImprovements: [
          "Fixed message extraction to use proven LSL generation logic",
          "Made redirect flag dynamic - only shows during active redirections",
          "Removed void session files and improved content routing",
          "Unified transcript parsing between live and historical processing",
          "Created meaningful trajectory updates instead of activity logs"
        ],
        architecture: {
          core: "Node.js-based tooling ecosystem with Docker support",
          monitoring: "Real-time transcript monitoring with classification engine",
          logging: "Dual-mode logging: live capture and historical reconstruction",
          visualization: "PlantUML integration for architectural diagrams",
          integration: "MCP protocol for semantic analysis and constraints"
        },
        technicalStack: [
          "Node.js for core tooling",
          "Docker for containerized services",
          "PlantUML for visualization",
          "MCP protocol for AI integration",
          "JSONL-based transcript processing"
        ]
      };
    } else if (projectName === 'nano-degree') {
      return {
        purpose: "Comprehensive AI agent development curriculum with production-ready patterns",
        currentCapabilities: [
          "Complete 6-week curriculum covering agent frameworks to deployment",
          "Three-path learning system: Observer, Participant, Implementer",
          "Module 01: Agent Frameworks (LangChain, CrewAI, PydanticAI, Atomic Agents)",
          "Module 02: RAG Systems and Cognitive Architectures",
          "Module 03: MCP Protocol Implementation and Integration",
          "Module 04: Production deployment strategies",
          "Hands-on exercises with real-world scenarios",
          "Integrated code examples and best practices"
        ],
        recentImprovements: [
          "Enhanced course material structure for better learning flow",
          "Added comprehensive MCP protocol documentation",
          "Integrated production deployment patterns",
          "Improved three-path system implementation"
        ],
        architecture: {
          structure: "Modular curriculum with progressive complexity",
          delivery: "Markdown-based content with integrated code examples",
          assessment: "Built-in exercises and practical projects",
          integration: "Links to live coding tools and MCP servers"
        },
        technicalStack: [
          "Markdown for content delivery",
          "Python for agent implementations", 
          "JavaScript/TypeScript for MCP protocols",
          "Docker for deployment scenarios"
        ]
      };
    } else {
      // For unknown projects, analyze recent sessions
      return this.analyzeFromRecentSessions();
    }
  }

  async analyzeFromRecentSessions() {
    // Fallback: analyze recent session files
    const recentSessions = this.getRecentSessions(5);
    
    return {
      purpose: "Project under active development",
      currentCapabilities: [
        "Core functionality as implemented",
        "Integration with coding infrastructure"
      ],
      recentImprovements: [
        "See session logs for detailed changes"
      ],
      architecture: {
        core: "Project-specific architecture"
      },
      technicalStack: [
        "Project-specific technology stack"
      ]
    };
  }

  getRecentSessions(count) {
    if (!fs.existsSync(this.historyDir)) {
      return [];
    }
    
    return fs.readdirSync(this.historyDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .slice(-count);
  }

  async writeComprehensiveTrajectory(projectState) {
    const projectName = path.basename(this.projectPath);
    const content = `# Comprehensive Project Trajectory - ${projectName}

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Repository:** ${this.projectPath}

---

## Project Purpose

${projectState.purpose}

---

## Current Capabilities

What this project can do RIGHT NOW:

${projectState.currentCapabilities.map(cap => `- ${cap}`).join('\n')}

---

## Recent Improvements

Latest enhancements to the codebase:

${projectState.recentImprovements.map(imp => `- ${imp}`).join('\n')}

---

## Architecture & Design

### Core Architecture

${projectState.architecture.core || 'Project-specific architecture'}

### Key Components

${Object.entries(projectState.architecture)
  .filter(([key]) => key !== 'core')
  .map(([component, description]) => `- **${component.charAt(0).toUpperCase() + component.slice(1)}**: ${description}`)
  .join('\n')}

---

## Technical Stack

${projectState.technicalStack.map(tech => `- ${tech}`).join('\n')}

---

## Project Maturity

Based on current capabilities and recent development:

- **Stability**: ${this.assessStability(projectState)}
- **Feature Completeness**: ${this.assessCompleteness(projectState)}
- **Documentation**: ${this.assessDocumentation(projectState)}
- **Test Coverage**: ${this.assessTesting(projectState)}

---

*This trajectory provides a comprehensive view of what the ${projectName} project IS and DOES,
not when activities occurred. It represents the current state of the codebase after all
accumulated changes and improvements.*
`;

    fs.writeFileSync(this.trajectoryFile, content);
  }

  assessStability(projectState) {
    if (projectState.recentImprovements.some(imp => imp.includes('Fixed') || imp.includes('fixed'))) {
      return "Stabilizing - recent fixes applied";
    }
    return "Stable for current features";
  }

  assessCompleteness(projectState) {
    const capCount = projectState.currentCapabilities.length;
    if (capCount >= 8) return "Comprehensive feature set";
    if (capCount >= 5) return "Core features complete";
    return "Under active development";
  }

  assessDocumentation(projectState) {
    if (projectState.currentCapabilities.some(cap => cap.includes('documentation'))) {
      return "Well documented";
    }
    return "Documentation in progress";
  }

  assessTesting(projectState) {
    if (projectState.currentCapabilities.some(cap => cap.includes('test'))) {
      return "Testing infrastructure in place";
    }
    return "Testing approach TBD";
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