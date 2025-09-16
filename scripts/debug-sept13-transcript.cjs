#!/usr/bin/env node

/**
 * Debug script to trace exactly what happens with the Sept 13-14 transcript
 * Focus: Find why LSL files are not being generated for Sept 13
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TRANSCRIPT_FILE = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';

class Sept13Debugger {
  constructor() {
    this.exchanges = [];
    this.userPrompts = [];
    this.tranches = new Map();
    this.sept13Exchanges = [];
  }

  // Extract timestamp from a message
  getTimestamp(message) {
    return message.timestamp ? new Date(message.timestamp) : null;
  }

  // Generate tranche string from timestamp
  getTrancheString(timestamp) {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const hour = date.getUTCHours();
    const nextHour = (hour + 1) % 24;
    const timeString = `${hour.toString().padStart(2, '0')}00-${nextHour.toString().padStart(2, '0')}00`;
    return { date: dateStr, timeString, originalTimestamp: timestamp };
  }

  // Check if this is a real user prompt (not tool result)
  isToolResultMessage(message) {
    if (!message.message?.content || !Array.isArray(message.message.content)) {
      return false;
    }
    return message.message.content.some(item => 
      item.type === 'tool_result' && item.tool_use_id
    );
  }

  // Extract user message content
  extractUserMessage(message) {
    if (!message.message?.content) return '';
    
    if (typeof message.message.content === 'string') {
      return message.message.content;
    }
    
    if (Array.isArray(message.message.content)) {
      return message.message.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    
    return '';
  }

  async analyzeTranscript() {
    console.log('🔍 Analyzing Sept 13-14 transcript for debugging...');
    console.log(`📁 File: ${TRANSCRIPT_FILE}`);
    
    const fileStream = fs.createReadStream(TRANSCRIPT_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let currentExchange = null;
    
    for await (const line of rl) {
      lineCount++;
      if (lineCount % 1000 === 0) {
        console.log(`📊 Processed ${lineCount} lines...`);
      }
      
      try {
        const message = JSON.parse(line.trim());
        const timestamp = this.getTimestamp(message);
        
        if (!timestamp) continue;
        
        const tranche = this.getTrancheString(timestamp);
        const trancheKey = `${tranche.date}_${tranche.timeString}`;
        
        // Track all tranches
        if (!this.tranches.has(trancheKey)) {
          this.tranches.set(trancheKey, {
            ...tranche,
            exchanges: [],
            userPrompts: []
          });
        }
        
        // Focus on Sept 13 specifically
        if (tranche.date === '2025-09-13') {
          this.sept13Exchanges.push({
            timestamp: timestamp.toISOString(),
            type: message.type,
            tranche: trancheKey,
            isToolResult: this.isToolResultMessage(message),
            userMessage: message.type === 'user' ? this.extractUserMessage(message) : null,
            uuid: message.uuid
          });
          
          console.log(`🔍 SEPT 13 MESSAGE: ${timestamp.toISOString()} | ${message.type} | Tool Result: ${this.isToolResultMessage(message)} | Tranche: ${trancheKey}`);
          if (message.type === 'user' && !this.isToolResultMessage(message)) {
            const userMsg = this.extractUserMessage(message);
            console.log(`   📝 USER PROMPT: "${userMsg.substring(0, 100)}..."`);
          }
        }
        
        // Extract exchanges using the same logic as the real system
        if (message.type === 'user' && message.message?.role === 'user' && 
            !this.isToolResultMessage(message)) {
          
          // Complete previous exchange
          if (currentExchange) {
            currentExchange.isUserPrompt = true;
            this.exchanges.push(currentExchange);
            this.tranches.get(this.getTrancheString(new Date(currentExchange.timestamp)).date + '_' + this.getTrancheString(new Date(currentExchange.timestamp)).timeString).exchanges.push(currentExchange);
            
            if (currentExchange.timestamp && new Date(currentExchange.timestamp).toISOString().startsWith('2025-09-13')) {
              this.userPrompts.push(currentExchange);
              console.log(`✅ SEPT 13 USER PROMPT EXTRACTED: ${new Date(currentExchange.timestamp).toISOString()} | "${currentExchange.userMessage.substring(0, 50)}..."`);
            }
          }
          
          // Start new exchange
          currentExchange = {
            id: message.uuid,
            timestamp: timestamp.toISOString(),
            userMessage: this.extractUserMessage(message) || '',
            claudeResponse: '',
            toolCalls: [],
            toolResults: [],
            isUserPrompt: true
          };
        }
        
      } catch (error) {
        console.error(`❌ Error parsing line ${lineCount}: ${error.message}`);
      }
    }
    
    // Complete final exchange
    if (currentExchange) {
      this.exchanges.push(currentExchange);
      if (currentExchange.timestamp && new Date(currentExchange.timestamp).toISOString().startsWith('2025-09-13')) {
        this.userPrompts.push(currentExchange);
        console.log(`✅ FINAL SEPT 13 USER PROMPT: ${new Date(currentExchange.timestamp).toISOString()}`);
      }
    }
    
    console.log(`\n📊 ANALYSIS COMPLETE:`);
    console.log(`📝 Total lines processed: ${lineCount}`);
    console.log(`🔄 Total exchanges: ${this.exchanges.length}`);
    console.log(`👤 Total user prompts: ${this.userPrompts.length}`);
    console.log(`📅 Sept 13 messages: ${this.sept13Exchanges.length}`);
    console.log(`📅 Sept 13 user prompts: ${this.userPrompts.filter(p => p.timestamp.startsWith('2025-09-13')).length}`);
    console.log(`🗓️ Total tranches: ${this.tranches.size}`);
    
    // Show Sept 13 tranches specifically
    const sept13Tranches = Array.from(this.tranches.keys()).filter(k => k.startsWith('2025-09-13'));
    console.log(`\n🕐 SEPT 13 TRANCHES FOUND: ${sept13Tranches.length}`);
    for (const tranche of sept13Tranches) {
      const data = this.tranches.get(tranche);
      console.log(`   ${tranche}: ${data.exchanges.length} exchanges`);
    }
    
    // Show first few Sept 13 user prompts
    const sept13UserPrompts = this.userPrompts.filter(p => p.timestamp.startsWith('2025-09-13'));
    console.log(`\n📝 FIRST 5 SEPT 13 USER PROMPTS:`);
    for (let i = 0; i < Math.min(5, sept13UserPrompts.length); i++) {
      const prompt = sept13UserPrompts[i];
      console.log(`   ${i + 1}. ${prompt.timestamp}: "${prompt.userMessage.substring(0, 80)}..."`);
    }
    
    return {
      totalExchanges: this.exchanges.length,
      userPrompts: this.userPrompts.length,
      sept13Messages: this.sept13Exchanges.length,
      sept13UserPrompts: sept13UserPrompts.length,
      sept13Tranches: sept13Tranches
    };
  }
}

async function main() {
  console.log('🚀 Starting Sept 13-14 transcript debugging...\n');
  
  const analyzer = new Sept13Debugger();
  const results = await analyzer.analyzeTranscript();
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 DEBUGGING SUMMARY:');
  console.log('='.repeat(80));
  console.log(`📊 Results: ${JSON.stringify(results, null, 2)}`);
  
  if (results.sept13UserPrompts === 0) {
    console.log('❌ PROBLEM IDENTIFIED: No Sept 13 user prompts found!');
    console.log('🔍 This explains why no LSL files are generated for Sept 13');
  } else {
    console.log('✅ Sept 13 user prompts found, issue may be elsewhere');
  }
}

if (require.main === module) {
  main().catch(console.error);
}