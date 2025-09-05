#!/usr/bin/env node

/**
 * Centralized LSL Generation Script
 * Single source for generating Live Session Logs from transcript files
 * Supports both coding and nano-degree projects with proper timezone handling
 */

import fs from 'fs';
import path from 'path';
import { parseTimestamp, formatTimestamp } from './timezone-utils.js';

// Project configurations
const PROJECT_CONFIGS = {
  'coding': {
    outputDir: '/Users/q284340/Agentic/coding/.specstory/history',
    filenamePattern: (date, window) => `${date}_${window}_session-from-nano-degree.md`,
    shouldInclude: shouldIncludeInCoding
  },
  'nano-degree': {
    outputDir: '/Users/q284340/Agentic/nano-degree/.specstory/history', 
    filenamePattern: (date, window) => `${date}_${window}-session.md`,
    shouldInclude: shouldExcludeFromNanoDegree
  }
};

function extractTextContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(item => item && item.type === 'text')
      .map(item => item.text)
      .filter(text => text && text.trim())
      .join('\n');
  }
  return '';
}

function shouldIncludeInCoding(userMessage, assistantResponse = '') {
  // Check if the message involves manipulating (writing, modifying) or reading 
  // any artifact from within project coding
  const codingPaths = [
    '/Users/q284340/Agentic/coding/',
    '~/Agentic/coding/',
    'coding/',
    'coding/bin/',
    'coding/scripts/',
    'coding/.specstory/',
    'coding/lib/',
    'coding/docs/',
    'coding/integrations/'
  ];
  
  const fullText = (userMessage + ' ' + assistantResponse).toLowerCase();
  
  // Look for direct path references to coding project
  const hasCodePathReference = codingPaths.some(path => 
    fullText.includes(path.toLowerCase())
  );
  
  // Look for file operations in coding project context
  const hasCodeFileOperation = (
    fullText.includes('coding/') && (
      fullText.includes('read') ||
      fullText.includes('write') ||
      fullText.includes('edit') ||
      fullText.includes('create') ||
      fullText.includes('modify') ||
      fullText.includes('update') ||
      fullText.includes('delete') ||
      fullText.includes('move')
    )
  );
  
  return hasCodePathReference || hasCodeFileOperation;
}

function shouldExcludeFromNanoDegree(userMessage, assistantResponse = '') {
  // Inverse logic - exclude if it belongs to coding project
  return !shouldIncludeInCoding(userMessage, assistantResponse);
}

async function generateLSLForProject(projectName) {
  const config = PROJECT_CONFIGS[projectName];
  if (!config) {
    throw new Error(`Unknown project: ${projectName}`);
  }

  console.log(`\n🔄 Generating LSL files for project: ${projectName}`);

  const transcriptPaths = [
    // Most recent nano-degree transcript (contains today's conversations)
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/96b3c7de-16cb-48f3-90d2-f926452f9523.jsonl',
    // Coding transcript files
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/365ed86e-7959-4529-b50b-163f80cb556b.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/81a4c859-b5fc-4765-8c22-e4fa72269aa5.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/135ee593-e8ea-4f0c-b5d9-9622c4780349.jsonl'
  ];

  const sessions = new Map();
  const pendingExchanges = [];

  for (const transcriptPath of transcriptPaths) {
    if (!fs.existsSync(transcriptPath)) continue;
    
    console.log(`Processing: ${transcriptPath}`);
    
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    let exchangeCount = 0;
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        
        if (entry.type === 'user') {
          const timestampInfo = parseTimestamp(entry.timestamp);
          const userText = extractTextContent(entry.message?.content || entry.content);
          
          if (!userText || userText.trim().length === 0) continue;
          
          const exchange = {
            timestamp: timestampInfo,
            userMessage: userText,
            claudeResponse: '',
            window: timestampInfo.window,
            needsClassification: true
          };
          
          pendingExchanges.push(exchange);
          
        } else if (entry.type === 'assistant') {
          // Attach response to the most recent pending exchange
          if (pendingExchanges.length > 0) {
            const lastExchange = pendingExchanges[pendingExchanges.length - 1];
            const responseText = extractTextContent(entry.message?.content || entry.content);
            if (responseText) {
              lastExchange.claudeResponse = responseText;
              
              // Now check if this exchange should be included in this project
              const shouldInclude = config.shouldInclude(lastExchange.userMessage, lastExchange.claudeResponse);
              
              if (shouldInclude) {
                const window = lastExchange.window;
                if (!sessions.has(window)) {
                  sessions.set(window, []);
                }
                sessions.get(window).push(lastExchange);
                exchangeCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error parsing line in ${transcriptPath}:`, error.message);
      }
    }
    
    console.log(`Extracted ${exchangeCount} ${projectName}-related exchanges from ${path.basename(transcriptPath)}`);
  }

  // Generate LSL files for each session
  for (const [window, exchanges] of sessions.entries()) {
    if (exchanges.length === 0) continue;
    
    const [startTime, endTime] = window.split('-');
    const filename = config.filenamePattern('2025-09-05', window);
    const filepath = path.join(config.outputDir, filename);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    let content = `# WORK SESSION (${startTime}-${endTime})

**Generated:** ${new Date().toLocaleDateString('en-US', { 
  month: '2-digit', 
  day: '2-digit', 
  year: 'numeric' 
}).replace(/\//g, '/')}, ${new Date().toLocaleTimeString('en-US', { 
  hour12: false, 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit' 
})}
**Work Period:** ${startTime}-${endTime}
**Focus:** Live session logging from actual transcript data
**Duration:** ~60 minutes
**Project:** ${projectName}

---

## Session Overview

This session contains ${exchanges.length} user exchange${exchanges.length !== 1 ? 's' : ''} extracted from the actual Claude transcript.

---

## Key Activities

`;

    for (let i = 0; i < exchanges.length; i++) {
      const exchange = exchanges[i];
      const formattedTime = formatTimestamp(exchange.timestamp.utc.date);
      
      content += `### User Request ${i + 1} - ${formattedTime.combined}

**User Message:**

${exchange.userMessage}

**Claude Response:**

${exchange.claudeResponse || 'Response processing...'}

**Tool Calls:** ${exchange.claudeResponse && exchange.claudeResponse.includes('Tools Used:') ? 
  exchange.claudeResponse.match(/Tools Used:.*?\n\n/s)?.[0]?.replace('Tools Used:', '').trim() || 'Details in response' : 
  'Details in response'}

---

`;
    }

    fs.writeFileSync(filepath, content);
    console.log(`Created: ${filename} with ${exchanges.length} exchanges`);
  }
  
  console.log(`\n✅ LSL file generation complete for ${projectName}!`);
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const projectArg = args.find(arg => arg.startsWith('--project='));
  
  if (!projectArg) {
    console.error('Usage: node generate-lsl-for-project.js --project=<coding|nano-degree>');
    process.exit(1);
  }
  
  const projectName = projectArg.split('=')[1];
  
  if (!PROJECT_CONFIGS[projectName]) {
    console.error(`Unknown project: ${projectName}`);
    console.error('Available projects:', Object.keys(PROJECT_CONFIGS).join(', '));
    process.exit(1);
  }
  
  try {
    await generateLSLForProject(projectName);
  } catch (error) {
    console.error('❌ LSL generation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateLSLForProject };