#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTimestamp, formatTimestamp, getTimeWindow } from './timezone-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Timezone utilities are now imported from timezone-utils.js

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

async function processTranscriptFiles() {
  const transcriptPaths = [
    // Most recent nano-degree transcript (contains today's conversations)
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/96b3c7de-16cb-48f3-90d2-f926452f9523.jsonl',
    // Coding transcript files
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/365ed86e-7959-4529-b50b-163f80cb556b.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/81a4c859-b5fc-4765-8c22-e4fa72269aa5.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/135ee593-e8ea-4f0c-b5d9-9622c4780349.jsonl'
  ];

  const sessions = new Map();
  const pendingExchanges = []; // Store exchanges waiting for responses

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
              
              // Now check if this exchange should be included in coding
              const includeInCoding = shouldIncludeInCoding(lastExchange.userMessage, lastExchange.claudeResponse);
              
              if (includeInCoding) {
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
    
    console.log(`Extracted ${exchangeCount} coding-related exchanges from ${path.basename(transcriptPath)}`);
  }

  // Generate LSL files for each session
  for (const [window, exchanges] of sessions.entries()) {
    if (exchanges.length === 0) continue;
    
    const [startTime, endTime] = window.split('-');
    // Use new filename pattern for sessions redirected from nano-degree project
    const filename = `2025-09-05_${startTime}-${endTime}_session-from-nano-degree.md`;
    const filepath = `/Users/q284340/Agentic/coding/.specstory/history/${filename}`;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
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
  
  console.log('\nLSL file generation complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processTranscriptFiles().catch(console.error);
}

export { processTranscriptFiles };