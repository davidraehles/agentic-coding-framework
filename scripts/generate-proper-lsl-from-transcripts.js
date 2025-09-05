#!/usr/bin/env node

/**
 * Proper LSL Generation Script
 * Correctly parses transcript conversation flows and creates detailed LSL files
 * Handles complex multi-message exchanges with tool calls and results
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
    shouldInclude: shouldIncludeInNanoDegree
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

function extractUserMessage(entry) {
  // Handle different user message structures
  if (entry.message?.content) {
    if (typeof entry.message.content === 'string') {
      return entry.message.content;
    }
    return extractTextContent(entry.message.content);
  }
  if (entry.content) {
    return extractTextContent(entry.content);
  }
  return '';
}

function isSlashCommandResponse(userMessage, responseText) {
  // Check if this is a response to /sl command (session log reading for continuity)
  const userMsg = userMessage.toLowerCase();
  const hasSlCommand = userMsg.includes('<command-name>/sl</command-name>') || 
                       userMsg.includes('/sl') ||
                       userMsg.includes('sl is running');
  
  const hasSlResponseContent = responseText.toLowerCase().includes('session continuity') ||
                               responseText.toLowerCase().includes('session log') ||
                               responseText.toLowerCase().includes('continuity context') ||
                               responseText.toLowerCase().includes('establishing continuity');
  
  return hasSlCommand && hasSlResponseContent;
}

function truncateSlashCommandResponse(responseText) {
  if (responseText.length <= 1000) {
    return responseText;
  }
  return responseText.substring(0, 1000) + '\n\n...\n\n*[Response truncated - /sl command output abbreviated for readability]*';
}

function shouldIncludeInCoding(userMessage, fullExchange = '') {
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
  
  const fullText = (userMessage + ' ' + fullExchange).toLowerCase();
  
  const hasCodePathReference = codingPaths.some(path => 
    fullText.includes(path.toLowerCase())
  );
  
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

function shouldIncludeInNanoDegree(userMessage, fullExchange = '') {
  // Content that specifically belongs to nano-degree project
  const nanoDegreePaths = [
    '/Users/q284340/Agentic/nano-degree/',
    '~/Agentic/nano-degree/',
    'nano-degree/',
    'docs-content/',
    'course-content/',
    'modules/',
    'nanodegree'
  ];
  
  const nanoDegreeKeywords = [
    'course', 'module', 'education', 'curriculum', 'student', 'learning',
    'lesson', 'tutorial', 'documentation site', 'docs site', 'course material',
    'agent frameworks', 'langchain', 'crewai', 'pydantic', 'rag systems',
    'mcp protocol', 'acp protocol', 'a2a protocol', 'observer path', 
    'participant path', 'implementer path', 'three-path learning'
  ];
  
  const fullText = (userMessage + ' ' + fullExchange).toLowerCase();
  
  const hasNanoDegreePath = nanoDegreePaths.some(path => 
    fullText.includes(path.toLowerCase())
  );
  
  const hasNanoDegreeKeyword = nanoDegreeKeywords.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  return hasNanoDegreePath || hasNanoDegreeKeyword;
}

function extractToolCalls(content) {
  if (Array.isArray(content)) {
    return content
      .filter(item => item && item.type === 'tool_use')
      .map(tool => {
        // Get more detailed tool information
        const description = tool.input?.description || 
                           tool.input?.command || 
                           tool.input?.file_path || 
                           tool.input?.pattern ||
                           'Tool executed';
        return `**${tool.name}**: ${description}`;
      })
      .join('\n');
  }
  return '';
}

async function generateLSLForProject(projectName) {
  const config = PROJECT_CONFIGS[projectName];
  if (!config) {
    throw new Error(`Unknown project: ${projectName}`);
  }

  console.log(`\n🔄 Generating LSL files for project: ${projectName}`);

  const transcriptPaths = [
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/96b3c7de-16cb-48f3-90d2-f926452f9523.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/365ed86e-7959-4529-b50b-163f80cb556b.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/81a4c859-b5fc-4765-8c22-e4fa72269aa5.jsonl',
    '/Users/q284340/.claude/projects/-Users-q284340-Agentic-coding/135ee593-e8ea-4f0c-b5d9-9622c4780349.jsonl'
  ];

  const sessions = new Map();

  for (const transcriptPath of transcriptPaths) {
    if (!fs.existsSync(transcriptPath)) continue;
    
    console.log(`Processing: ${transcriptPath}`);
    
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const entries = [];
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line));
      } catch (error) {
        console.error(`Error parsing line: ${error.message}`);
      }
    }

    // Process conversation flows properly
    let exchangeCount = 0;
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Only process actual user-initiated messages (not tool results or meta messages)
      if (entry.type === 'user' && !entry.message?.content?.[0]?.tool_use_id && !entry.isMeta) {
        const timestampInfo = parseTimestamp(entry.timestamp);
        const userText = extractUserMessage(entry);
        
        if (!userText || userText.trim().length === 0) continue;

        // Collect all related assistant responses and tool interactions
        let fullExchange = userText;
        const assistantResponses = [];
        const toolCalls = [];
        const toolResults = [];
        
        // Look ahead for all related assistant responses and tool interactions
        let j = i + 1;
        while (j < entries.length) {
          const nextEntry = entries[j];
          
          // Stop if we hit another real user message (not a tool result)
          if (nextEntry.type === 'user' && !nextEntry.message?.content?.[0]?.tool_use_id && !nextEntry.isMeta) {
            break;
          }
          
          if (nextEntry.type === 'assistant') {
            let responseText = extractTextContent(nextEntry.message?.content || nextEntry.content);
            if (responseText) {
              // Truncate /sl command responses for readability
              if (isSlashCommandResponse(userText, responseText)) {
                responseText = truncateSlashCommandResponse(responseText);
              }
              assistantResponses.push(responseText);
            }
            
            // Extract tool calls
            const tools = extractToolCalls(nextEntry.message?.content || nextEntry.content);
            if (tools) {
              toolCalls.push(tools);
            }
          } else if (nextEntry.type === 'user' && nextEntry.message?.content?.[0]?.tool_use_id) {
            // This is a tool result - capture FULL result, not truncated
            const toolResult = nextEntry.message.content[0].content;
            if (toolResult && typeof toolResult === 'string') {
              // Capture full tool result without truncation
              toolResults.push(toolResult);
            }
          }
          
          j++;
        }
        
        // Build complete exchange content
        fullExchange += '\n\n' + assistantResponses.join('\n\n');
        if (toolCalls.length > 0) {
          fullExchange += '\n\nTool Calls:\n' + toolCalls.join('\n');
        }
        if (toolResults.length > 0) {
          fullExchange += '\n\nTool Results:\n' + toolResults.join('\n');
        }
        
        // Check if this complete exchange should be included in this project
        const shouldInclude = config.shouldInclude(userText, fullExchange);
        
        if (shouldInclude) {
          const exchange = {
            timestamp: timestampInfo,
            userMessage: userText,
            claudeResponses: assistantResponses,
            toolCalls: toolCalls,
            toolResults: toolResults,
            window: timestampInfo.window
          };
          
          const window = exchange.window;
          if (!sessions.has(window)) {
            sessions.set(window, []);
          }
          sessions.get(window).push(exchange);
          exchangeCount++;
        }
        
        // Skip ahead past the processed entries
        i = j - 1;
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

${exchange.claudeResponses.join('\n\n')}

`;

      if (exchange.toolCalls.length > 0) {
        content += `**Tool Calls:**

${exchange.toolCalls.join('\n')}

`;
      }

      if (exchange.toolResults.length > 0) {
        content += `**Tool Results:**

${exchange.toolResults.join('\n')}

`;
      }

      content += `---

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
    console.error('Usage: node generate-proper-lsl-from-transcripts.js --project=<coding|nano-degree>');
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