#!/usr/bin/env node

/**
 * Pipeline debugger for Sept 13 data loss
 * Traces: Exchange Extraction → Classification → Prompt Set Determination → File Writing
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TRANSCRIPT_FILE = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';

class PipelineDebugger {
  constructor() {
    this.sept13Exchanges = [];
    this.sept13UserPrompts = [];
    this.classifications = [];
    this.promptSets = [];
    this.fileWrites = [];
    this.CODING_PATH = '/Users/q284340/Agentic/coding';
  }

  log(step, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${step}: ${message}`);
    if (data) {
      console.log(`   📊 Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  // Simulate the exact tranche logic from the real system
  getTrancheFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const hour = date.getUTCHours();
    const nextHour = (hour + 1) % 24;
    const timeString = `${hour.toString().padStart(2, '0')}00-${nextHour.toString().padStart(2, '0')}00`;
    
    return {
      date: dateStr,
      timeString,
      originalTimestamp: timestamp,
      trancheKey: `${dateStr}_${timeString}`
    };
  }

  // Simulate the exact classification logic
  simulateClassification(exchange) {
    this.log('CLASSIFICATION', `Checking exchange ${exchange.id}`, {
      timestamp: exchange.timestamp,
      userMessage: exchange.userMessage?.substring(0, 100)
    });

    const exchangeText = JSON.stringify(exchange).toLowerCase();
    
    // EXPLICIT PATH INDICATORS - the fast path logic
    const hasExplicitCodingPath = 
      exchangeText.includes(this.CODING_PATH.toLowerCase()) || 
      exchangeText.includes('/coding/') ||
      exchangeText.includes('coding infrastructure') ||
      exchangeText.includes('coding project');

    if (hasExplicitCodingPath) {
      this.log('CLASSIFICATION', '✅ EXPLICIT PATH MATCH - Should redirect to coding', {
        matchType: 'explicit_path',
        codingPath: this.CODING_PATH,
        result: 'CODING'
      });
      return { isCoding: true, reason: 'explicit_path' };
    }

    // Keyword-based detection (simplified)
    const codingKeywords = [
      'enhanced-transcript-monitor', 'lsl', 'live session logging', 
      'coding session', 'transcript parsing', 'session logs',
      'mcp__memory', 'coding infrastructure', 'post-session-logger'
    ];

    const hasKeywords = codingKeywords.some(keyword => exchangeText.includes(keyword));
    
    if (hasKeywords) {
      this.log('CLASSIFICATION', '✅ KEYWORD MATCH - Should redirect to coding', {
        matchType: 'keyword',
        result: 'CODING'
      });
      return { isCoding: true, reason: 'keyword_match' };
    }

    this.log('CLASSIFICATION', '❌ NO MATCH - Stays in nano-degree', {
      result: 'NON_CODING'
    });
    return { isCoding: false, reason: 'no_match' };
  }

  // Simulate prompt set determination logic
  simulatePromptSetDetermination(userPrompts) {
    this.log('PROMPT_SET', `Processing ${userPrompts.length} user prompts`);
    
    const promptSetsByTranche = new Map();
    
    for (const prompt of userPrompts) {
      const tranche = this.getTrancheFromTimestamp(prompt.timestamp);
      const key = tranche.trancheKey;
      
      if (!promptSetsByTranche.has(key)) {
        promptSetsByTranche.set(key, {
          tranche,
          prompts: [],
          targetProject: null
        });
      }
      
      promptSetsByTranche.get(key).prompts.push(prompt);
      
      this.log('PROMPT_SET', `Added to tranche ${key}`, {
        promptId: prompt.id,
        timestamp: prompt.timestamp,
        tranche: tranche.timeString
      });
    }

    // Determine target project for each prompt set
    for (const [key, promptSet] of promptSetsByTranche) {
      this.log('PROMPT_SET', `Determining target for tranche ${key}`);
      
      // For each prompt in the set, check classification
      let codingCount = 0;
      let totalCount = promptSet.prompts.length;
      
      for (const prompt of promptSet.prompts) {
        const classification = this.simulateClassification(prompt);
        if (classification.isCoding) {
          codingCount++;
        }
      }
      
      // Simple majority rule (this may be where the issue is)
      const shouldRedirect = codingCount > 0; // Changed from > totalCount/2 to be more permissive
      promptSet.targetProject = shouldRedirect ? 'coding' : 'nano-degree';
      
      this.log('PROMPT_SET', `Target determined for ${key}`, {
        codingCount,
        totalCount,
        targetProject: promptSet.targetProject,
        logic: `${codingCount} coding out of ${totalCount} total`
      });
      
      this.promptSets.push(promptSet);
    }
    
    return Array.from(promptSetsByTranche.values());
  }

  // Simulate file writing logic
  simulateFileWriting(promptSets) {
    this.log('FILE_WRITING', `Processing ${promptSets.length} prompt sets for file writing`);
    
    for (const promptSet of promptSets) {
      const { tranche, targetProject, prompts } = promptSet;
      
      if (prompts.length === 0) {
        this.log('FILE_WRITING', `⚠️ Skipping empty prompt set for ${tranche.trancheKey}`);
        continue;
      }
      
      const filename = `${tranche.date}_${tranche.timeString}_g9b30a${targetProject === 'coding' ? '_from-nano-degree' : ''}.md`;
      const targetPath = targetProject === 'coding' ? 
        `/Users/q284340/Agentic/coding/.specstory/history/${filename}` :
        `/Users/q284340/Agentic/nano-degree/.specstory/history/${filename}`;
      
      this.log('FILE_WRITING', `Would write file`, {
        tranche: tranche.trancheKey,
        filename,
        targetProject,
        targetPath,
        promptCount: prompts.length,
        firstPrompt: prompts[0]?.userMessage?.substring(0, 50)
      });
      
      this.fileWrites.push({
        tranche: tranche.trancheKey,
        filename,
        targetProject,
        targetPath,
        promptCount: prompts.length,
        actuallyWritten: false // We're simulating, not actually writing
      });
    }
  }

  // Extract user prompts using the same logic as the real system
  async extractUserPrompts() {
    this.log('EXTRACTION', 'Starting user prompt extraction');
    
    const fileStream = fs.createReadStream(TRANSCRIPT_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentExchange = null;
    let lineCount = 0;
    
    for await (const line of rl) {
      lineCount++;
      
      try {
        const message = JSON.parse(line.trim());
        const timestamp = message.timestamp ? new Date(message.timestamp) : null;
        
        if (!timestamp) continue;
        
        // Focus only on Sept 13
        if (!timestamp.toISOString().startsWith('2025-09-13')) continue;
        
        // Check if this is a tool result message
        const isToolResult = message.message?.content && 
          Array.isArray(message.message.content) &&
          message.message.content.some(item => item.type === 'tool_result' && item.tool_use_id);
        
        // Extract user message content
        const extractUserMessage = (msg) => {
          if (!msg.message?.content) return '';
          if (typeof msg.message.content === 'string') return msg.message.content;
          if (Array.isArray(msg.message.content)) {
            return msg.message.content
              .filter(item => item.type === 'text')
              .map(item => item.text)
              .join('\n');
          }
          return '';
        };
        
        // Process user messages that are NOT tool results
        if (message.type === 'user' && message.message?.role === 'user' && !isToolResult) {
          
          // Complete previous exchange
          if (currentExchange) {
            currentExchange.isUserPrompt = true;
            this.sept13Exchanges.push(currentExchange);
            this.sept13UserPrompts.push(currentExchange);
            
            this.log('EXTRACTION', '✅ User prompt extracted', {
              id: currentExchange.id,
              timestamp: currentExchange.timestamp,
              message: currentExchange.userMessage.substring(0, 100)
            });
          }
          
          // Start new exchange
          currentExchange = {
            id: message.uuid,
            timestamp: timestamp.toISOString(),
            userMessage: extractUserMessage(message) || '',
            claudeResponse: '',
            toolCalls: [],
            toolResults: [],
            isUserPrompt: true
          };
        }
        
      } catch (error) {
        this.log('EXTRACTION', `❌ Error parsing line ${lineCount}: ${error.message}`);
      }
    }
    
    // Complete final exchange
    if (currentExchange) {
      this.sept13Exchanges.push(currentExchange);
      this.sept13UserPrompts.push(currentExchange);
      
      this.log('EXTRACTION', '✅ Final user prompt extracted', {
        id: currentExchange.id,
        timestamp: currentExchange.timestamp
      });
    }
    
    this.log('EXTRACTION', 'Extraction complete', {
      totalExchanges: this.sept13Exchanges.length,
      userPrompts: this.sept13UserPrompts.length
    });
  }

  async debugPipeline() {
    console.log('🚀 Starting Pipeline Debugging for Sept 13 Data Loss\n');
    console.log('='.repeat(80));
    
    // Step 1: Extract user prompts
    await this.extractUserPrompts();
    
    if (this.sept13UserPrompts.length === 0) {
      console.log('❌ NO USER PROMPTS FOUND - Issue is in extraction phase');
      return;
    }
    
    // Step 2: Simulate classification for each prompt
    this.log('PIPELINE', 'Starting classification phase');
    for (const prompt of this.sept13UserPrompts) {
      const classification = this.simulateClassification(prompt);
      this.classifications.push({
        promptId: prompt.id,
        timestamp: prompt.timestamp,
        classification
      });
    }
    
    // Step 3: Simulate prompt set determination
    this.log('PIPELINE', 'Starting prompt set determination');
    const promptSets = this.simulatePromptSetDetermination(this.sept13UserPrompts);
    
    // Step 4: Simulate file writing
    this.log('PIPELINE', 'Starting file writing simulation');
    this.simulateFileWriting(promptSets);
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PIPELINE DEBUGGING SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📊 Extracted User Prompts: ${this.sept13UserPrompts.length}`);
    console.log(`📊 Classifications: ${this.classifications.length}`);
    console.log(`📊 Prompt Sets: ${this.promptSets.length}`);
    console.log(`📊 File Writes: ${this.fileWrites.length}`);
    
    console.log('\n📝 File Writes Summary:');
    for (const write of this.fileWrites) {
      console.log(`   ${write.tranche} → ${write.targetProject} (${write.promptCount} prompts)`);
    }
    
    // Check for Sept 13 file writes
    const sept13FileWrites = this.fileWrites.filter(w => w.tranche.startsWith('2025-09-13'));
    console.log(`\n🔍 Sept 13 File Writes: ${sept13FileWrites.length}`);
    
    if (sept13FileWrites.length === 0) {
      console.log('❌ PROBLEM IDENTIFIED: No Sept 13 files would be written!');
      console.log('🔍 Check prompt set determination and classification logic');
    } else {
      console.log('✅ Sept 13 files should be written - issue may be elsewhere');
      for (const write of sept13FileWrites) {
        console.log(`   📁 ${write.filename} → ${write.targetProject}`);
      }
    }
  }
}

async function main() {
  const pipelineDebugger = new PipelineDebugger();
  await pipelineDebugger.debugPipeline();
}

if (require.main === module) {
  main().catch(console.error);
}