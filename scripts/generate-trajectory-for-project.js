#!/usr/bin/env node

/**
 * Centralized Trajectory Generation Script
 * Single source for generating trajectory analysis from LSL session files
 * Uses semantic analyzer to create concise, evolving project summaries
 * Supports both coding and nano-degree projects
 */

import fs from 'fs';
import path from 'path';
import { parseTimestamp, formatTimestamp } from './timezone-utils.js';
import { SemanticAnalyzer } from '../src/live-logging/SemanticAnalyzer.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Project configurations
const PROJECT_CONFIGS = {
  'coding': {
    lslDir: '/Users/q284340/Agentic/coding/.specstory/history',
    outputDir: '/Users/q284340/Agentic/coding/.specstory/trajectory',
    filenamePattern: (date, window) => `${date}_${window}_trajectory-from-nano-degree.md`,
    projectPurpose: {
      mission: 'Live Session Logging Infrastructure & Transcript Monitoring',
      description: 'Real-time transcript monitoring system that automatically logs Claude Code sessions, routes content between projects, and generates trajectory analysis.',
      keyComponents: [
        'Transcript monitoring with automatic session boundary detection',
        'Cross-project intelligent content routing (nano-degree ↔ coding)',
        'Live Session Logging (LSL) with 60-minute time tranches',
        'Trajectory analysis with predecessor detection and cumulative learning'
      ],
      successMetrics: [
        'Real-time session file creation accuracy',
        'Content classification and routing precision',
        'Trajectory continuity across sessions and dates',
        'System reliability and automatic recovery'
      ]
    }
  },
  'nano-degree': {
    lslDir: '/Users/q284340/Agentic/nano-degree/.specstory/history',
    outputDir: '/Users/q284340/Agentic/nano-degree/.specstory/trajectory',
    filenamePattern: (date, window) => `${date}_${window}-trajectory.md`,
    projectPurpose: {
      mission: 'Comprehensive Agentic AI Educational Curriculum',
      description: 'A 6-week nanodegree covering advanced AI agent development, from core patterns through cutting-edge protocols (MCP, ACP, A2A) and production deployment.',
      keyComponents: [
        'Module 01: Agent Frameworks & Patterns (LangChain, CrewAI, PydanticAI, Atomic Agents, Agno)',
        'Module 02: RAG Systems (NodeRAG, reasoning-augmented retrieval, multimodal)',
        'Module 03: Agent Protocols (MCP, ACP, A2A for distributed architectures)',
        'Three-path learning system: Observer, Participant, Implementer'
      ],
      successMetrics: [
        'Course content quality and comprehensiveness',
        'Educational material accessibility and engagement',
        'Image attribution and copyright compliance',
        'Documentation site functionality and navigation'
      ]
    }
  }
};

function extractSessionContent(filePath) {
  // Extract just the core content from LSL file for semantic analysis
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract key activities section which contains the actual exchanges
  const activitiesMatch = content.match(/## Key Activities\n\n(.*?)(?=\n---\n|$)/s);
  if (activitiesMatch) {
    // Limit content to reasonable size for semantic analysis (max 4000 chars)
    const activities = activitiesMatch[1];
    return activities.length > 4000 ? activities.substring(0, 4000) + '...' : activities;
  }
  
  return 'No significant activities recorded';
}

function findPreviousTrajectory(currentWindow, outputDir, filenamePattern) {
  if (!fs.existsSync(outputDir)) {
    return null;
  }
  
  const files = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('-trajectory.md') && !f.includes(currentWindow))
    .sort();
    
  return files.length > 0 ? path.join(outputDir, files[files.length - 1]) : null;
}

async function generateTrajectoryForProject(projectName) {
  const config = PROJECT_CONFIGS[projectName];
  if (!config) {
    throw new Error(`Unknown project: ${projectName}`);
  }

  // Initialize semantic analyzer with Grok
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  const analyzer = new SemanticAnalyzer(apiKey);
  console.log(`\\n🔄 Generating trajectory files for project: ${projectName} using semantic analysis`);

  // Find all LSL session files
  if (!fs.existsSync(config.lslDir)) {
    console.log(`LSL directory not found: ${config.lslDir}`);
    return;
  }

  const lslFiles = fs.readdirSync(config.lslDir)
    .filter(f => f.endsWith('-session.md') || f.includes('session-from-nano-degree.md'))
    .filter(f => f.includes('2025-09-04') || f.includes('2025-09-05'))
    .sort();

  console.log(`Found ${lslFiles.length} LSL session files to process`);

  // Create output directory if needed
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  let trajectoryCount = 0;

  for (const lslFile of lslFiles) {
    const lslPath = path.join(config.lslDir, lslFile);
    const sessionMatch = lslFile.match(/(\d{4}-\d{2}-\d{2})_(\d{4})-(\d{4})[-_]session.*\.md/);
    
    if (!sessionMatch) {
      console.log(`Skipping ${lslFile} - doesn't match filename pattern`);
      continue;
    }
    
    const [, date, startTime, endTime] = sessionMatch;
    const window = `${startTime}-${endTime}`;
    const trajectoryFilename = config.filenamePattern(date, window);
    const trajectoryPath = path.join(config.outputDir, trajectoryFilename);

    // Extract session content for semantic analysis
    const sessionContent = extractSessionContent(lslPath);
    
    if (sessionContent === 'No significant activities recorded') {
      console.log(`Skipping ${lslFile} - no valid activities found`);
      continue;
    }

    // Find previous trajectory to merge with
    const previousTrajectoryPath = findPreviousTrajectory(window, config.outputDir, config.filenamePattern);
    let previousTrajectory = '';
    
    if (previousTrajectoryPath) {
      try {
        const prevContent = fs.readFileSync(previousTrajectoryPath, 'utf8');
        // Extract just the summary content, not the full file
        const summaryMatch = prevContent.match(/# Trajectory Analysis:.*?\\n\\n(.+?)(?=\\n##|$)/s);
        previousTrajectory = summaryMatch ? summaryMatch[1].trim() : prevContent.substring(0, 2000);
      } catch (error) {
        console.error(`Error reading previous trajectory: ${error.message}`);
        previousTrajectory = config.projectPurpose.description; // fallback to project description
      }
    } else {
      // First trajectory - use project context as baseline
      previousTrajectory = `**Project:** ${config.projectPurpose.mission}\\n\\n${config.projectPurpose.description}`;
    }

    // Use semantic analyzer to merge trajectory with session
    console.log(`🧠 Analyzing session ${window} with semantic analyzer...`);
    
    try {
      const analysis = await analyzer.mergeTrajectoryWithSession(previousTrajectory, sessionContent, window);
      trajectoryCount++;

      // Generate structured trajectory file  
      const content = `# Project Trajectory Analysis: ${window}

**Generated:** ${analysis.timestamp}
**Session:** ${trajectoryCount}
**Date:** ${date}  
**Project:** ${config.projectPurpose.mission}

---

## Project Mission & Context

### What This Project Achieves
${config.projectPurpose.description}

### Core Components
${config.projectPurpose.keyComponents.map(c => `- ${c}`).join('\n')}

### Success Metrics
${config.projectPurpose.successMetrics.map(m => `- ${m}`).join('\n')}

---

## Current Session Analysis

### Session Evolution
${analysis.summary}

### Project Status Assessment
- **Current Phase:** ${analysis.status}
- **Primary Focus:** ${analysis.focus}
- **Development Momentum:** Active progression with semantic-driven evolution

---

## Strategic Project Advancement

### Session Impact on Overall Project
This session continued the project's evolution through focused work on ${analysis.focus.toLowerCase()}, building upon previous trajectory insights and advancing the core educational curriculum objectives.

### Long-term Project Development
The cumulative trajectory analysis shows consistent progress toward comprehensive agentic AI education delivery, with each session contributing to the overall mission of providing cutting-edge AI agent development training.

---

**Trajectory Continuity:** Session ${trajectoryCount} ${previousTrajectoryPath ? `(evolved from [${path.basename(previousTrajectoryPath, '.md')}](${path.basename(previousTrajectoryPath)}))` : '(baseline established)'}

---

*Project-focused trajectory analysis providing strategic insights into ${config.projectPurpose.mission}*
`;

      fs.writeFileSync(trajectoryPath, content);
      console.log(`✅ Created: ${trajectoryFilename} (semantic analysis complete)`);
      
    } catch (error) {
      console.error(`❌ Error analyzing session ${window}: ${error.message}`);
      continue;
    }
  }

  console.log(`\\n✅ Trajectory file generation complete for ${projectName}! Generated ${trajectoryCount} semantic-driven trajectory files.`);
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const projectArg = args.find(arg => arg.startsWith('--project='));
  
  if (!projectArg) {
    console.error('Usage: node generate-trajectory-for-project.js --project=<coding|nano-degree>');
    process.exit(1);
  }
  
  const projectName = projectArg.split('=')[1];
  
  if (!PROJECT_CONFIGS[projectName]) {
    console.error(`Unknown project: ${projectName}`);
    console.error('Available projects:', Object.keys(PROJECT_CONFIGS).join(', '));
    process.exit(1);
  }
  
  try {
    await generateTrajectoryForProject(projectName);
  } catch (error) {
    console.error('❌ Trajectory generation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateTrajectoryForProject };