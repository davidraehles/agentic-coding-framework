#!/usr/bin/env node

/**
 * Fast Parallel LSL Processor
 * Processes transcript files in parallel chunks for maximum speed
 * Target: Complete processing in under 5 seconds
 */

import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import { parseTimestamp, formatTimestamp } from './timezone-utils.js';

// Load session duration from config
function loadConfig() {
  const configPath = '/Users/q284340/Agentic/coding/config/live-logging-config.json';
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.live_logging.session_duration || 3600000; // Default 60 minutes
  }
  return 3600000; // Fallback to 60 minutes
}

const MAX_WORKERS = 6; // Parallel processing limit
const CHUNK_SIZE = 20; // Files per worker
const TARGET_TIME = 5000; // 5 seconds max

// Get project configuration
function getProjectConfig() {
  const targetPath = process.env.CODING_TARGET_PROJECT || process.cwd();
  const projectName = targetPath.split('/').pop();
  return {
    name: projectName,
    path: targetPath,
    outputDir: `${targetPath}/.specstory/history`,
    codingPath: '/Users/q284340/Agentic/coding'
  };
}

// Find all transcript files
function findTranscriptFiles() {
  const baseDir = '/Users/q284340/.claude/projects';
  const transcriptFiles = [];
  
  if (fs.existsSync(baseDir)) {
    const dirs = fs.readdirSync(baseDir);
    for (const dir of dirs) {
      const dirPath = path.join(baseDir, dir);
      if (fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jsonl'));
        for (const file of files) {
          transcriptFiles.push(path.join(dirPath, file));
        }
      }
    }
  }
  
  return transcriptFiles;
}

// Fast path-based classification (no semantic analysis)
function fastClassifyExchange(exchange, codingPath) {
  // Quick tool-based detection
  if (exchange.toolCalls) {
    for (const tool of exchange.toolCalls) {
      const toolData = JSON.stringify(tool).toLowerCase();
      if (toolData.includes(codingPath.toLowerCase()) || 
          toolData.includes('/coding/') ||
          toolData.includes('scripts/') ||
          toolData.includes('.js') ||
          toolData.includes('.ts') ||
          toolData.includes('.py') ||
          toolData.includes('node_modules') ||
          toolData.includes('package.json')) {
        return true;
      }
    }
  }
  
  // Quick keyword detection
  const content = (exchange.userMessage + ' ' + exchange.assistantResponse).toLowerCase();
  const codingKeywords = ['function', 'class', 'import', 'export', 'const', 'let', 'var', 'async', 'await', 'npm', 'node', 'javascript', 'typescript', 'python', 'git', 'commit', 'pull request', 'debug', 'error', 'bug', 'code', 'script', 'api', 'database'];
  
  return codingKeywords.some(keyword => content.includes(keyword));
}

// Process transcript file chunks in parallel
async function processTranscriptChunk(files, config) {
  const results = [];
  
  for (const file of files) {
    try {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const exchanges = [];
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type === 'user' || entry.type === 'assistant') {
            exchanges.push(entry);
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
      
      // Group into conversation pairs
      const conversationPairs = [];
      for (let i = 0; i < exchanges.length - 1; i += 2) {
        if (exchanges[i] && exchanges[i + 1] && 
            exchanges[i].type === 'user' && exchanges[i + 1].type === 'assistant') {
          
          const userMsg = exchanges[i];
          const assistantMsg = exchanges[i + 1];
          
          // Extract content from Claude format
          let userContent = '';
          if (typeof userMsg.message?.content === 'string') {
            userContent = userMsg.message.content;
          } else if (Array.isArray(userMsg.message?.content)) {
            userContent = userMsg.message.content
              .filter(c => c.type === 'text')
              .map(c => c.text || '')
              .join('');
          }
          
          let assistantContent = '';
          let toolCalls = [];
          if (Array.isArray(assistantMsg.message?.content)) {
            for (const content of assistantMsg.message.content) {
              if (content.type === 'text') {
                assistantContent += content.text;
              } else if (content.type === 'tool_use') {
                toolCalls.push({
                  name: content.name,
                  function: { name: content.name },
                  input: content.input
                });
              }
            }
          } else if (typeof assistantMsg.message?.content === 'string') {
            assistantContent = assistantMsg.message.content;
          }
          
          // Skip /sl commands
          if (userContent && userContent.trim().startsWith('/sl')) continue;
          
          // Skip empty exchanges
          if (!userContent.trim() && !assistantContent.trim()) continue;
          
          conversationPairs.push({
            userMessage: userContent,
            assistantResponse: assistantContent,
            toolCalls: toolCalls,
            timestamp: new Date(userMsg.timestamp || Date.now()),
            isCoding: fastClassifyExchange({
              userMessage: userContent,
              assistantResponse: assistantContent,
              toolCalls: toolCalls
            }, config.codingPath)
          });
        }
      }
      
      if (conversationPairs.length > 0) {
        results.push({
          file: path.basename(file),
          exchanges: conversationPairs
        });
      }
      
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }
  
  return results;
}

// Group exchanges by time windows using full-hour marks
function groupByTimeWindows(exchanges) {
  const windows = new Map();
  const sessionDurationMs = loadConfig(); // Get duration from config
  const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60); // Convert to hours
  
  for (const exchange of exchanges) {
    const date = exchange.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
    const hour = exchange.timestamp.getHours();
    
    // Use full-hour marks: 10:00-11:00, 11:00-12:00, etc.
    const windowStartHour = hour;
    const windowEndHour = hour + sessionDurationHours;
    
    // Format as HHMM (e.g., 1000, 1100, 1200)
    const windowStart = windowStartHour * 100;
    const windowEnd = windowEndHour * 100;
    const windowKey = `${date}_${String(windowStart).padStart(4, '0')}-${String(windowEnd).padStart(4, '0')}`;
    
    if (!windows.has(windowKey)) {
      windows.set(windowKey, []);
    }
    windows.get(windowKey).push(exchange);
  }
  
  return windows;
}

// Write session files
function writeSessionFiles(windows, config) {
  const filesCreated = [];
  
  for (const [windowKey, exchanges] of windows) {
    // Skip windows with no exchanges
    if (!exchanges || exchanges.length === 0) {
      continue;
    }
    const isFromOtherProject = config.name !== 'nano-degree';
    let filename;
    
    if (config.name === 'coding') {
      filename = `${windowKey}-session-from-nano-degree.md`;
    } else {
      filename = `${windowKey}-session.md`;
    }
    
    const filePath = path.join(config.outputDir, filename);
    
    // Create directory if needed
    fs.mkdirSync(config.outputDir, { recursive: true });
    
    // Generate content
    let content = `# WORK SESSION (${windowKey.split('_')[1]})\n\n`;
    content += `**Generated:** ${new Date().toISOString()}\n`;
    content += `**Work Period:** ${windowKey.split('_')[1]}\n`;
    content += `**Focus:** ${exchanges.length > 0 && exchanges[0].isCoding ? 'Coding activities' : 'Live session logging'}\n`;
    content += `**Duration:** ~60 minutes\n`;
    if (isFromOtherProject) {
      content += `**Source Project:** ${config.path}\n`;
    }
    content += `\n---\n\n## Session Overview\n\n`;
    content += `This session captures ${exchanges.length > 0 && exchanges[0].isCoding ? 'coding-related activities' : 'real-time tool interactions and exchanges'}.\n\n`;
    content += `---\n\n## Key Activities\n\n`;
    
    // Add exchange summaries
    for (let i = 0; i < Math.min(exchanges.length, 10); i++) {
      const exchange = exchanges[i];
      const time = exchange.timestamp.toTimeString().split(' ')[0]; // HH:mm:ss format
      
      content += `### ${time} - Exchange ${i + 1}\n\n`;
      
      // Show full user message (up to 500 chars)
      if (exchange.userMessage) {
        const userMsg = exchange.userMessage.length > 500 
          ? exchange.userMessage.substring(0, 500) + '...'
          : exchange.userMessage;
        content += `**User:** ${userMsg}\n\n`;
      }
      
      // Show full assistant response (up to 800 chars)  
      if (exchange.assistantResponse) {
        const assistantMsg = exchange.assistantResponse.length > 800
          ? exchange.assistantResponse.substring(0, 800) + '...'
          : exchange.assistantResponse;
        content += `**Assistant:** ${assistantMsg}\n\n`;
      }
      
      // Show tools used
      if (exchange.toolCalls && exchange.toolCalls.length > 0) {
        const tools = exchange.toolCalls.map(t => t.name || t.function?.name).filter(Boolean);
        content += `**Tools:** ${tools.join(', ')}\n\n`;
      }
      
      content += `---\n\n`;
    }
    
    if (exchanges.length > 10) {
      content += `*... and ${exchanges.length - 10} more exchanges*\n\n`;
    }
    
    fs.writeFileSync(filePath, content);
    filesCreated.push(filename);
  }
  
  return filesCreated;
}

// Main processing function
async function main() {
  const startTime = Date.now();
  console.log(`🚀 Fast parallel LSL processing started`);
  
  const config = getProjectConfig();
  console.log(`📁 Processing for project: ${config.name}`);
  
  // Find all transcript files
  const transcriptFiles = findTranscriptFiles();
  console.log(`📄 Found ${transcriptFiles.length} transcript files`);
  
  if (transcriptFiles.length === 0) {
    console.log('No transcript files found');
    return;
  }
  
  // Process files in parallel chunks
  const chunkSize = Math.ceil(transcriptFiles.length / MAX_WORKERS);
  const chunks = [];
  for (let i = 0; i < transcriptFiles.length; i += chunkSize) {
    chunks.push(transcriptFiles.slice(i, i + chunkSize));
  }
  
  console.log(`⚡ Processing in ${chunks.length} parallel chunks`);
  
  // Process all chunks in parallel
  const promises = chunks.map(chunk => processTranscriptChunk(chunk, config));
  const results = await Promise.all(promises);
  
  // Flatten results
  const allExchanges = [];
  for (const result of results) {
    for (const fileResult of result) {
      for (const exchange of fileResult.exchanges) {
        // Only include coding-related exchanges for coding project
        if (config.name === 'coding' && exchange.isCoding) {
          allExchanges.push(exchange);
        } else if (config.name !== 'coding' && !exchange.isCoding) {
          allExchanges.push(exchange);
        }
      }
    }
  }
  
  console.log(`🔍 Found ${allExchanges.length} relevant exchanges`);
  
  // Group by time windows
  const windows = groupByTimeWindows(allExchanges);
  console.log(`📅 Created ${windows.size} time windows`);
  
  // Write session files
  const filesCreated = writeSessionFiles(windows, config);
  
  const processingTime = Date.now() - startTime;
  
  console.log(`\n📊 FAST PROCESSING SUMMARY:`);
  console.log(`   Files processed: ${transcriptFiles.length}`);
  console.log(`   Total exchanges found: ${allExchanges.length}`);
  console.log(`   Session files generated: ${filesCreated.length}`);
  console.log(`   Total processing time: ${(processingTime / 1000).toFixed(1)}s`);
  console.log(`   Average time per file: ${(processingTime / transcriptFiles.length).toFixed(1)}ms`);
  
  if (processingTime > TARGET_TIME) {
    console.log(`⚠️ Processing took ${(processingTime / 1000).toFixed(1)}s (target: ${TARGET_TIME / 1000}s)`);
  } else {
    console.log(`✅ Processing completed within target time!`);
  }
  
  console.log(`\n🎯 Session files created:`);
  filesCreated.forEach(file => console.log(`   - ${file}`));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;