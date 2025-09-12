#!/usr/bin/env node

/**
 * Optimized LSL Generation Script
 * Performance improvements:
 * - Filters out /sl commands
 * - Only classifies when needed (not from coding project)
 * - Batch processing with parallel execution
 * - File-level keyword pre-check to skip semantic analysis
 */

import fs from 'fs';
import path from 'path';
import { parseTimestamp, formatTimestamp } from './timezone-utils.js';

// Get the target project from environment or command line
function getTargetProject() {
  const targetPath = process.env.CODING_TARGET_PROJECT || process.cwd();
  const projectName = targetPath.split('/').pop();
  return {
    name: projectName,
    path: targetPath,
    outputDir: `${targetPath}/.specstory/history`,
    needsClassification: projectName !== 'coding', // Only classify if not coding project
    filenamePattern: (date, window, isFromOtherProject, originProject) => {
      if (projectName === 'coding') {
        if (isFromOtherProject) {
          return `${date}_${window}-session-from-${originProject}.md`;
        } else {
          return `${date}_${window}-session-from-coding.md`;
        }
      }
      return `${date}_${window}-session.md`;
    }
  };
}

// Simple fast keyword check (no API calls)
function hasAnyKeywords(text) {
  if (!text) return false;
  
  const keywords = [
    'ukb', 'vkb', 'ckb', 'knowledge_base', 'knowledge base',
    'semantic analysis', 'semantic-analysis', 
    'post-session-logger', 'session-logger',
    'conversation-analyzer', 'claude-conversation-analyzer',
    'classification', 'classifier',
    'coding infrastructure', 'coding agent',
    '/Users/q284340/Agentic/coding'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Function to filter out /sl commands from messages
function filterSlCommands(text) {
  if (!text) return text;
  
  // Remove /sl commands (including /sl n variants)
  // Pattern matches /sl at start of line or after newline, optionally followed by space and number
  return text.split('\n')
    .filter(line => !line.trim().match(/^\/sl(\s+\d+)?$/))
    .join('\n');
}

// Process a single transcript file
async function processTranscriptFile(transcriptPath, targetProject) {
  const exchanges = [];
  
  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Pre-check: If we need classification, check if ANY line has keywords
    let fileHasKeywords = false;
    if (targetProject.needsClassification) {
      const fullContent = lines.join(' ');
      fileHasKeywords = hasAnyKeywords(fullContent);
    }
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        // Skip summary and non-user/assistant messages
        if (data.type === 'summary' || !data.message?.role) continue;
        
        // Extract and filter content
        let messageContent = '';
        if (data.message.content) {
          if (Array.isArray(data.message.content)) {
            messageContent = data.message.content
              .map(item => item.text || item.content || '')
              .join('\n');
          } else {
            messageContent = data.message.content;
          }
        }
        
        // Filter out /sl commands and command messages
        messageContent = filterSlCommands(messageContent);
        
        // Skip command messages entirely
        if (data.message.role === 'user' && messageContent.includes('<command-message>')) {
          continue;
        }
        
        // Skip empty messages after filtering
        if (!messageContent.trim()) continue;
        
        // For nano-degree, we want ALL content since it's the main project
        // For coding project, we want only coding-infrastructure related content
        let shouldInclude = true;
        
        if (targetProject.name === 'nano-degree') {
          // Include everything for nano-degree (it's the main project)
          shouldInclude = true;
        } else {
          // For coding project: include only coding-related content
          shouldInclude = hasAnyKeywords(messageContent);
        }
        
        // Build exchange
        if (shouldInclude) {
          const timestamp = data.timestamp || data.created_at || new Date().toISOString();
          const timestampInfo = parseTimestamp(timestamp);
          
          exchanges.push({
            timestamp: timestampInfo,
            role: data.message.role,
            content: messageContent,
            window: timestampInfo.window
          });
        }
      } catch (err) {
        // Skip malformed lines
      }
    }
  } catch (error) {
    console.warn(`Error processing ${transcriptPath}: ${error.message}`);
  }
  
  return exchanges;
}

// Process files in batches
async function processInBatches(files, batchSize, targetProject) {
  const results = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchStartTime = Date.now();
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(file => processTranscriptFile(file, targetProject))
    );
    
    results.push(...batchResults);
    
    const batchTime = ((Date.now() - batchStartTime) / 1000).toFixed(1);
    console.log(`📊 Batch ${Math.floor(i/batchSize) + 1}: Processed ${batch.length} files in ${batchTime}s`);
  }
  
  return results;
}

async function generateLSL() {
  const targetProject = getTargetProject();
  console.log(`\n🔄 Optimized LSL Generation for: ${targetProject.path}`);
  console.log(`📋 Classification needed: ${targetProject.needsClassification ? 'Yes' : 'No (coding project)'}`);
  
  // Find all transcript files
  function findAllTranscriptFiles() {
    const projectsDir = '/Users/q284340/.claude/projects/';
    const transcriptPaths = [];
    
    const projectDirs = fs.readdirSync(projectsDir);
    for (const dirName of projectDirs) {
      if (dirName.startsWith('-Users-q284340-Agentic-')) {
        const projectPath = path.join(projectsDir, dirName);
        try {
          const files = fs.readdirSync(projectPath);
          for (const fileName of files) {
            if (fileName.endsWith('.jsonl')) {
              transcriptPaths.push(path.join(projectPath, fileName));
            }
          }
        } catch (error) {
          // Skip inaccessible directories
        }
      }
    }
    
    return transcriptPaths;
  }
  
  const transcriptFiles = findAllTranscriptFiles();
  console.log(`Found ${transcriptFiles.length} transcript files to process`);
  
  const startTime = Date.now();
  
  // Process in batches of 5
  const allExchanges = await processInBatches(transcriptFiles, 5, targetProject);
  
  // Flatten and group by time window
  const exchangesByWindow = {};
  let totalExchanges = 0;
  
  for (const fileExchanges of allExchanges) {
    for (const exchange of fileExchanges) {
      const window = exchange.window;
      if (!exchangesByWindow[window]) {
        exchangesByWindow[window] = [];
      }
      exchangesByWindow[window].push(exchange);
      totalExchanges++;
    }
  }
  
  // Write LSL files
  if (!fs.existsSync(targetProject.outputDir)) {
    fs.mkdirSync(targetProject.outputDir, { recursive: true });
  }
  
  let filesCreated = 0;
  for (const [window, exchanges] of Object.entries(exchangesByWindow)) {
    if (exchanges.length === 0) continue;
    
    // Generate filename
    const date = exchanges[0].timestamp.local.split(',')[0].replace(/\//g, '-');
    const filename = targetProject.filenamePattern(date, window, false, null);
    const outputPath = path.join(targetProject.outputDir, filename);
    
    // Generate content
    let content = `# Session Log: ${window}\n\n`;
    for (const exchange of exchanges) {
      content += `## ${exchange.timestamp.local}\n`;
      content += `**${exchange.role}**: ${exchange.content}\n\n`;
    }
    
    fs.writeFileSync(outputPath, content);
    filesCreated++;
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ LSL Generation Complete!`);
  console.log(`📊 Stats:`);
  console.log(`  - Files processed: ${transcriptFiles.length}`);
  console.log(`  - Exchanges found: ${totalExchanges}`);
  console.log(`  - LSL files created: ${filesCreated}`);
  console.log(`  - Total time: ${totalTime}s`);
  console.log(`  - Avg per file: ${(totalTime / transcriptFiles.length).toFixed(2)}s`);
}

// Run the generator
generateLSL().catch(console.error);