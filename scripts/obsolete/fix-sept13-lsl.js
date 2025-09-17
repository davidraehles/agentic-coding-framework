#!/usr/bin/env node

/**
 * Generate missing Sept 13 LSL files using the fixed StreamingTranscriptReader
 */

import StreamingTranscriptReader from '../src/live-logging/StreamingTranscriptReader.js';
import fs from 'fs';
import path from 'path';

const TRANSCRIPT_FILE = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';
const NANO_DEGREE_PATH = '/Users/q284340/Agentic/nano-degree';
const CODING_PATH = '/Users/q284340/Agentic/coding';

// Simple classification for coding content
function isCodingContent(exchange) {
  const text = JSON.stringify(exchange).toLowerCase();
  const codingKeywords = [
    'enhanced-transcript-monitor', 'lsl', 'live session logging',
    'coding session', 'transcript parsing', 'session logs',
    'mcp__memory', 'coding infrastructure', 'post-session-logger'
  ];
  
  return codingKeywords.some(keyword => text.includes(keyword)) ||
         text.includes('/coding/') ||
         text.includes('coding infrastructure');
}

// Generate tranche from timestamp
function getTrancheFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split('T')[0];
  const hour = date.getUTCHours();
  const nextHour = (hour + 1) % 24;
  const timeString = `${hour.toString().padStart(2, '0')}00-${nextHour.toString().padStart(2, '0')}00`;
  
  return {
    date: dateStr,
    timeString,
    trancheKey: `${dateStr}_${timeString}`
  };
}

// Generate LSL filename
function generateLSLFilename(tranche, targetProject, sourceProject) {
  const [year, month, day] = tranche.date.split('-');
  const userHash = 'g9b30a';
  const isRedirected = targetProject !== sourceProject;
  
  if (isRedirected) {
    return `${year}-${month}-${day}_${tranche.timeString}_${userHash}_from-${path.basename(sourceProject)}.md`;
  } else {
    return `${year}-${month}-${day}_${tranche.timeString}_${userHash}.md`;
  }
}

// Generate LSL content
function generateLSLContent(exchanges, tranche) {
  let content = `# Session Log ${tranche.date} ${tranche.timeString}\n\n`;
  content += `Generated: ${new Date().toISOString()}\n`;
  content += `Exchanges: ${exchanges.length}\n\n`;
  
  for (const exchange of exchanges) {
    content += `## Exchange ${exchange.uuid}\n\n`;
    content += `**Timestamp:** ${exchange.timestamp}\n\n`;
    
    if (exchange.humanMessage) {
      content += `**User:**\n${exchange.humanMessage}\n\n`;
    }
    
    if (exchange.assistantMessage) {
      content += `**Assistant:**\n${exchange.assistantMessage}\n\n`;
    }
    
    if (exchange.toolCalls && exchange.toolCalls.length > 0) {
      content += `**Tool Calls:**\n`;
      for (const tool of exchange.toolCalls) {
        content += `- ${tool.name}: ${JSON.stringify(tool.input, null, 2)}\n`;
      }
      content += '\n';
    }
    
    content += '---\n\n';
  }
  
  return content;
}

async function main() {
  console.log('🔧 Generating missing Sept 13-14 LSL files...');
  
  const reader = new StreamingTranscriptReader({ debug: true });
  const allExchanges = [];
  
  // Extract all exchanges
  console.log('📖 Reading transcript file...');
  await reader.processFile(TRANSCRIPT_FILE, async (messageBatch) => {
    const exchanges = StreamingTranscriptReader.extractExchangesFromBatch(messageBatch);
    allExchanges.push(...exchanges);
  });
  
  console.log(`✅ Extracted ${allExchanges.length} exchanges`);
  
  // Filter for Sept 13 and 14 exchanges
  const sept13Exchanges = allExchanges.filter(exchange => 
    exchange.timestamp?.startsWith('2025-09-13')
  );
  
  const sept14Exchanges = allExchanges.filter(exchange => 
    exchange.timestamp?.startsWith('2025-09-14')
  );
  
  console.log(`📅 Found ${sept13Exchanges.length} Sept 13 exchanges`);
  console.log(`📅 Found ${sept14Exchanges.length} Sept 14 exchanges`);
  
  const targetExchanges = [...sept13Exchanges, ...sept14Exchanges];
  
  if (targetExchanges.length === 0) {
    console.log('❌ No Sept 13-14 exchanges found');
    return;
  }
  
  // Group by tranche
  const trancheGroups = new Map();
  
  for (const exchange of targetExchanges) {
    const tranche = getTrancheFromTimestamp(exchange.timestamp);
    const key = tranche.trancheKey;
    
    if (!trancheGroups.has(key)) {
      trancheGroups.set(key, {
        tranche,
        exchanges: []
      });
    }
    
    trancheGroups.get(key).exchanges.push(exchange);
  }
  
  console.log(`📊 Found ${trancheGroups.size} tranches for Sept 13-14`);
  
  // Generate files for each tranche
  for (const [key, group] of trancheGroups) {
    const { tranche, exchanges } = group;
    
    // Determine target project based on coding content
    let codingCount = 0;
    for (const exchange of exchanges) {
      if (isCodingContent(exchange)) {
        codingCount++;
      }
    }
    
    const targetProject = codingCount > 0 ? CODING_PATH : NANO_DEGREE_PATH;
    const filename = generateLSLFilename(tranche, targetProject, NANO_DEGREE_PATH);
    const targetPath = path.join(targetProject, '.specstory', 'history', filename);
    
    console.log(`📝 Creating ${filename} (${exchanges.length} exchanges, ${codingCount} coding)`);
    
    // Ensure directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Generate content
    const content = generateLSLContent(exchanges, tranche);
    
    // Write file
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Created: ${targetPath}`);
  }
  
  console.log('🎉 Sept 13-14 LSL files generation complete!');
}

main().catch(console.error);