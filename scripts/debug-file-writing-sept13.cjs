#!/usr/bin/env node

/**
 * CRITICAL FILE WRITING DEBUGGER for Sept 13
 * 
 * Traces exactly what happens during the file writing process:
 * 1. Extract Sept 13 user prompts ✓ (we know this works)
 * 2. Group into prompt sets by tranche
 * 3. Trace each file write attempt step by step
 * 4. Identify where files fail to be created
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TRANSCRIPT_FILE = '/Users/q284340/.claude/projects/-Users-q284340-Agentic-nano-degree/e093980f-ac28-4a92-8677-687d7091930f.jsonl';

class FileWritingDebugger {
  constructor() {
    this.sept13UserPrompts = [];
    this.promptSets = [];
    this.fileWrites = [];
    this.actualFileChecks = [];
    this.CODING_PATH = '/Users/q284340/Agentic/coding';
    this.NANO_DEGREE_PATH = '/Users/q284340/Agentic/nano-degree';
  }

  log(step, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${step}: ${message}`);
    if (data) {
      console.log(`   📊 Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  // Generate tranche from timestamp - same logic as real system
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

  // Classification simulation - same as pipeline debugger
  simulateClassification(exchange) {
    const exchangeText = JSON.stringify(exchange).toLowerCase();
    
    // EXPLICIT PATH INDICATORS
    const hasExplicitCodingPath = 
      exchangeText.includes(this.CODING_PATH.toLowerCase()) || 
      exchangeText.includes('/coding/') ||
      exchangeText.includes('coding infrastructure') ||
      exchangeText.includes('coding project');

    if (hasExplicitCodingPath) {
      return { isCoding: true, reason: 'explicit_path' };
    }

    // Keyword-based detection
    const codingKeywords = [
      'enhanced-transcript-monitor', 'lsl', 'live session logging', 
      'coding session', 'transcript parsing', 'session logs',
      'mcp__memory', 'coding infrastructure', 'post-session-logger'
    ];

    const hasKeywords = codingKeywords.some(keyword => exchangeText.includes(keyword));
    
    if (hasKeywords) {
      return { isCoding: true, reason: 'keyword_match' };
    }

    return { isCoding: false, reason: 'no_match' };
  }

  // Extract user prompts - same as pipeline debugger
  async extractUserPrompts() {
    this.log('EXTRACTION', 'Starting user prompt extraction for Sept 13');
    
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
            this.sept13UserPrompts.push(currentExchange);
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
      this.sept13UserPrompts.push(currentExchange);
    }
    
    this.log('EXTRACTION', 'Extraction complete', {
      userPrompts: this.sept13UserPrompts.length
    });
  }

  // Create prompt sets grouped by tranche
  createPromptSets() {
    this.log('PROMPT_SETS', 'Creating prompt sets by tranche');
    
    const promptSetsByTranche = new Map();
    
    for (const prompt of this.sept13UserPrompts) {
      const tranche = this.getTrancheFromTimestamp(prompt.timestamp);
      const key = tranche.trancheKey;
      
      if (!promptSetsByTranche.has(key)) {
        promptSetsByTranche.set(key, {
          tranche,
          prompts: [],
          targetProject: null,
          shouldWriteFile: false
        });
      }
      
      promptSetsByTranche.get(key).prompts.push(prompt);
    }

    // Determine target project for each prompt set
    for (const [key, promptSet] of promptSetsByTranche) {
      this.log('PROMPT_SETS', `Determining target for tranche ${key}`);
      
      let codingCount = 0;
      let totalCount = promptSet.prompts.length;
      
      for (const prompt of promptSet.prompts) {
        const classification = this.simulateClassification(prompt);
        if (classification.isCoding) {
          codingCount++;
        }
      }
      
      // Simple majority rule
      const shouldRedirect = codingCount > 0;
      promptSet.targetProject = shouldRedirect ? this.CODING_PATH : this.NANO_DEGREE_PATH;
      promptSet.shouldWriteFile = totalCount > 0; // Should write if there are prompts
      
      this.log('PROMPT_SETS', `Target determined for ${key}`, {
        codingCount,
        totalCount,
        targetProject: path.basename(promptSet.targetProject),
        shouldWriteFile: promptSet.shouldWriteFile
      });
      
      this.promptSets.push(promptSet);
    }
    
    this.log('PROMPT_SETS', 'Prompt sets created', {
      totalSets: this.promptSets.length,
      setsToWrite: this.promptSets.filter(s => s.shouldWriteFile).length
    });
  }

  // Simulate exact file writing process
  simulateFileWriting() {
    this.log('FILE_WRITING', 'Starting file writing simulation');
    
    for (const promptSet of this.promptSets) {
      const { tranche, targetProject, prompts, shouldWriteFile } = promptSet;
      
      if (!shouldWriteFile || prompts.length === 0) {
        this.log('FILE_WRITING', `⚠️ Skipping prompt set ${tranche.trancheKey} - no prompts`);
        continue;
      }
      
      // Generate filename using same logic as real system
      const sourceProjectName = path.basename(this.NANO_DEGREE_PATH);
      const isRedirected = targetProject !== this.NANO_DEGREE_PATH;
      
      // Simulate generateLSLFilename logic
      const date = new Date(tranche.originalTimestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const userHash = 'g9b30a'; // Static hash for debugging
      
      let filename;
      if (isRedirected) {
        // Redirected to coding project
        filename = `${year}-${month}-${day}_${tranche.timeString}_${userHash}_from-${sourceProjectName}.md`;
      } else {
        // Local project
        filename = `${year}-${month}-${day}_${tranche.timeString}_${userHash}.md`;
      }
      
      const targetPath = path.join(targetProject, '.specstory', 'history', filename);
      
      this.log('FILE_WRITING', `Should write file for ${tranche.trancheKey}`, {
        filename,
        targetPath,
        targetProject: path.basename(targetProject),
        isRedirected,
        promptCount: prompts.length
      });
      
      // Check if directories exist
      const targetDir = path.dirname(targetPath);
      const dirExists = fs.existsSync(targetDir);
      
      // Check if file already exists
      const fileExists = fs.existsSync(targetPath);
      
      this.fileWrites.push({
        tranche: tranche.trancheKey,
        filename,
        targetPath,
        targetProject: path.basename(targetProject),
        isRedirected,
        promptCount: prompts.length,
        dirExists,
        fileExists,
        shouldCreate: !fileExists // Should create if doesn't exist
      });
      
      this.log('FILE_WRITING', `File check for ${filename}`, {
        dirExists,
        fileExists,
        shouldCreate: !fileExists
      });
    }
  }

  // Check actual file system state
  checkActualFileState() {
    this.log('FILE_CHECK', 'Checking actual file system state for Sept 13');
    
    // Check nano-degree history directory
    const nanoDegreeHistoryDir = path.join(this.NANO_DEGREE_PATH, '.specstory', 'history');
    const codingHistoryDir = path.join(this.CODING_PATH, '.specstory', 'history');
    
    const checkDirectory = (dir, projectName) => {
      if (!fs.existsSync(dir)) {
        this.log('FILE_CHECK', `❌ Directory doesn't exist: ${dir}`);
        return [];
      }
      
      const files = fs.readdirSync(dir);
      const sept13Files = files.filter(file => file.startsWith('2025-09-13'));
      
      this.log('FILE_CHECK', `${projectName} directory check`, {
        dir,
        totalFiles: files.length,
        sept13Files: sept13Files.length,
        sept13FilesList: sept13Files
      });
      
      return sept13Files.map(file => ({
        filename: file,
        fullPath: path.join(dir, file),
        project: projectName,
        size: fs.statSync(path.join(dir, file)).size
      }));
    };
    
    const nanoDegreeFiles = checkDirectory(nanoDegreeHistoryDir, 'nano-degree');
    const codingFiles = checkDirectory(codingHistoryDir, 'coding');
    
    this.actualFileChecks = [...nanoDegreeFiles, ...codingFiles];
    
    this.log('FILE_CHECK', 'Actual file system state', {
      nanoDegreeFiles: nanoDegreeFiles.length,
      codingFiles: codingFiles.length,
      totalSept13Files: this.actualFileChecks.length
    });
  }

  async debugFileWriting() {
    console.log('🚀 Starting Sept 13 File Writing Debugging\n');
    console.log('='.repeat(80));
    
    // Step 1: Extract user prompts
    await this.extractUserPrompts();
    
    if (this.sept13UserPrompts.length === 0) {
      console.log('❌ NO SEPT 13 USER PROMPTS - Issue is in extraction');
      return;
    }
    
    // Step 2: Create prompt sets
    this.createPromptSets();
    
    // Step 3: Simulate file writing
    this.simulateFileWriting();
    
    // Step 4: Check actual file state
    this.checkActualFileState();
    
    // Summary and analysis
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FILE WRITING DEBUG SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📊 Sept 13 User Prompts: ${this.sept13UserPrompts.length}`);
    console.log(`📊 Prompt Sets: ${this.promptSets.length}`);
    console.log(`📊 Files That Should Be Written: ${this.fileWrites.length}`);
    console.log(`📊 Files Actually Found: ${this.actualFileChecks.length}`);
    
    console.log('\n📝 Expected Files vs Actual Files:');
    for (const fileWrite of this.fileWrites) {
      const actualFile = this.actualFileChecks.find(f => 
        f.filename === fileWrite.filename || 
        f.fullPath === fileWrite.targetPath
      );
      
      const status = actualFile ? '✅ EXISTS' : '❌ MISSING';
      console.log(`   ${status} ${fileWrite.filename} → ${fileWrite.targetProject} (${fileWrite.promptCount} prompts)`);
      
      if (!actualFile) {
        console.log(`     Expected path: ${fileWrite.targetPath}`);
        console.log(`     Directory exists: ${fileWrite.dirExists}`);
      } else {
        console.log(`     Actual path: ${actualFile.fullPath}`);
        console.log(`     Size: ${actualFile.size} bytes`);
      }
    }
    
    // Key findings
    const missingFiles = this.fileWrites.filter(fw => 
      !this.actualFileChecks.find(f => f.filename === fw.filename)
    );
    
    console.log(`\n🔍 CRITICAL ANALYSIS:`);
    console.log(`   Expected files: ${this.fileWrites.length}`);
    console.log(`   Missing files: ${missingFiles.length}`);
    console.log(`   Files found: ${this.actualFileChecks.length}`);
    
    if (missingFiles.length > 0) {
      console.log('\n❌ FILES THAT SHOULD EXIST BUT DON\'T:');
      for (const missing of missingFiles) {
        console.log(`   📁 ${missing.filename}`);
        console.log(`      Path: ${missing.targetPath}`);
        console.log(`      Project: ${missing.targetProject}`);
        console.log(`      Prompts: ${missing.promptCount}`);
        console.log(`      Dir exists: ${missing.dirExists}`);
      }
      console.log('\n🔍 ROOT CAUSE: File writing logic is not executing or failing silently');
    } else {
      console.log('\n✅ All expected files exist - issue may be elsewhere');
    }
  }
}

async function main() {
  const fileWritingDebugger = new FileWritingDebugger();
  await fileWritingDebugger.debugFileWriting();
}

if (require.main === module) {
  main().catch(console.error);
}