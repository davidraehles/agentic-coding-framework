#!/usr/bin/env node

/**
 * Proper LSL Generation Script
 * Correctly parses transcript conversation flows and creates detailed LSL files
 * Handles complex multi-message exchanges with tool calls and results
 */

import fs from 'fs';
import path from 'path';
import { parseTimestamp, formatTimestamp, generateLSLFilename } from './timezone-utils.js';
// Use the enhanced transcript monitor for consistent classification logic
import EnhancedTranscriptMonitor from './enhanced-transcript-monitor.js';

// Get the target project from environment or command line
function getTargetProject() {
  const targetPath = process.env.TRANSCRIPT_SOURCE_PROJECT || process.cwd();
  const projectName = targetPath.split('/').pop();
  
  // Validation: Ensure we have a valid target project path
  if (!targetPath) {
    throw new Error('TRANSCRIPT_SOURCE_PROJECT environment variable is required but not set');
  }
  
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Target project path does not exist: ${targetPath}`);
  }
  
  // Dynamic coding project path detection with multiple fallback strategies
  const codingProjectPath = detectCodingProjectPath();
  if (!codingProjectPath) {
    throw new Error(`Unable to detect coding project path. Please ensure:
1. CODING_TOOLS_PATH or CODING_REPO environment variable is set, OR
2. A 'coding' directory exists in the same parent as the current project, OR
3. A 'coding' directory exists in your home directory under Agentic/
4. Current working directory contains coding tools (CLAUDE.md + src/live-logging/)

Current environment:
- CODING_TOOLS_PATH: ${process.env.CODING_TOOLS_PATH || 'not set'}
- CODING_REPO: ${process.env.CODING_REPO || 'not set'}
- Current project: ${targetPath}
- Checked paths: ${getCodingPathCandidates().join(', ')}`);
  }
  
  return {
    name: projectName,
    path: targetPath,
    // Classification should always use the coding project path for proper detection
    classificationProjectPath: codingProjectPath,
    outputDir: `${targetPath}/.specstory/history`,
    // Foreign mode determines output location based on project relationship
    foreignOutputDir: `${codingProjectPath}/.specstory/history`,
    // Use consistent filename pattern with proper foreign mode support
    filenamePattern: (date, window, isFromOtherProject, originProject, timestamp) => {
      // Use the Enhanced filename generation with user hash
      const targetProj = targetPath;
      // When it's from other project, we need to determine the source project path
      const sourceProj = isFromOtherProject ? 
        (originProject === 'nano-degree' ? '/Users/q284340/Agentic/nano-degree' : 
         originProject === 'coding' ? codingProjectPath : targetPath) : targetPath;
      const projName = originProject || projectName;
      
      // Create a timestamp from date and window
      if (!timestamp) {
        const [year, month, day] = date.split('-');
        const [startTime] = window.split('-');
        const hours = startTime.slice(0, 2);
        const minutes = startTime.slice(2, 4);
        timestamp = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000Z`).getTime();
      }
      
      return generateLSLFilename(timestamp, projName, targetProj, sourceProj);
    },
    // Enhanced foreign mode filename pattern for cross-project scenarios
    foreignFilenamePattern: (date, window, sourceProject, timestamp) => {
      // Create a timestamp from date and window
      if (!timestamp) {
        const [year, month, day] = date.split('-');
        const [startTime] = window.split('-');
        const hours = startTime.slice(0, 2);
        const minutes = startTime.slice(2, 4);
        timestamp = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00.000Z`).getTime();
      }
      
      return generateLSLFilename(timestamp, sourceProject, codingProjectPath, targetPath);
    }
  };
}

/**
 * Detect the coding project path using multiple strategies
 * @returns {string|null} - The detected coding project path or null if not found
 */
function detectCodingProjectPath() {
  const candidates = getCodingPathCandidates();
  
  for (const candidatePath of candidates) {
    if (isValidCodingProject(candidatePath)) {
      console.log(`🔍 Detected coding project at: ${candidatePath}`);
      return candidatePath;
    }
  }
  
  console.error(`❌ No valid coding project found in any candidate path`);
  return null;
}

/**
 * Get list of potential coding project paths to check
 * @returns {string[]} - Array of potential paths
 */
function getCodingPathCandidates() {
  const targetPath = process.env.TRANSCRIPT_SOURCE_PROJECT || process.cwd();
  const targetParent = path.dirname(targetPath);
  
  return [
    // 1. Explicit environment variables (highest priority)
    process.env.CODING_TOOLS_PATH,
    process.env.CODING_REPO,
    
    // 2. Sibling directory to current project
    path.join(targetParent, 'coding'),
    
    // 3. Common development paths
    path.join(process.env.HOME, 'Agentic', 'coding'),
    path.join(process.env.HOME, 'Claude', 'coding'),
    path.join(process.env.HOME, 'Development', 'coding'),
    path.join(process.env.HOME, 'dev', 'coding'),
    path.join(process.env.HOME, 'coding'),
    
    // 4. Current working directory (if it's the coding project itself)
    process.cwd(),
    
    // 5. Parent directories search (up to 3 levels)
    path.join(targetParent, '..', 'coding'),
    path.join(targetParent, '..', '..', 'coding'),
    
    // 6. Fallback to original hardcoded path for backward compatibility
    '/Users/q284340/Agentic/coding'
  ].filter(Boolean); // Remove null/undefined values
}

/**
 * Validate if a path contains a valid coding project
 * @param {string} projectPath - Path to validate
 * @returns {boolean} - True if valid coding project
 */
function isValidCodingProject(projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) {
    return false;
  }
  
  // Check for required coding project markers
  const requiredMarkers = [
    'CLAUDE.md',                           // Project documentation
    'src/live-logging',                    // Live logging components
    'scripts/generate-proper-lsl-from-transcripts.js'  // This script itself
  ];
  
  return requiredMarkers.every(marker => {
    const markerPath = path.join(projectPath, marker);
    return fs.existsSync(markerPath);
  });
}

// Function to redact API keys and secrets from text
function redactSecrets(text) {
  if (!text) return text;
  
  // List of API key patterns to redact
  const apiKeyPatterns = [
    // Environment variable format: KEY=value
    /\b(ANTHROPIC_API_KEY|OPENAI_API_KEY|GROK_API_KEY|XAI_API_KEY|GROQ_API_KEY|GEMINI_API_KEY|CLAUDE_API_KEY|GPT_API_KEY|DEEPMIND_API_KEY|COHERE_API_KEY|HUGGINGFACE_API_KEY|HF_API_KEY|REPLICATE_API_KEY|TOGETHER_API_KEY|PERPLEXITY_API_KEY|AI21_API_KEY|GOOGLE_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AZURE_API_KEY|GCP_API_KEY|GITHUB_TOKEN|GITLAB_TOKEN|BITBUCKET_TOKEN|NPM_TOKEN|PYPI_TOKEN|DOCKER_TOKEN|SLACK_TOKEN|DISCORD_TOKEN|TELEGRAM_TOKEN|STRIPE_API_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|TWILIO_AUTH_TOKEN|FIREBASE_API_KEY|SUPABASE_API_KEY|MONGODB_URI|POSTGRES_PASSWORD|MYSQL_PASSWORD|REDIS_PASSWORD|DATABASE_URL|CONNECTION_STRING|JWT_SECRET|SESSION_SECRET|ENCRYPTION_KEY|PRIVATE_KEY|SECRET_KEY|CLIENT_SECRET|API_SECRET|WEBHOOK_SECRET)\s*=\s*["']?([^"'\s\n]+)["']?/gi,
    
    // JSON format: "apiKey": "sk-..." or "ANTHROPIC_API_KEY": "sk-..." or "xai-..."
    /"(apiKey|API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|XAI_API_KEY|GROK_API_KEY|api_key|anthropicApiKey|openaiApiKey|xaiApiKey|grokApiKey)":\s*"(sk-[a-zA-Z0-9-_]{20,}|xai-[a-zA-Z0-9-_]{20,}|[a-zA-Z0-9-_]{32,})"/gi,
    
    // sk- prefix (common for various API keys)
    /\bsk-[a-zA-Z0-9-_]{20,}/gi,
    
    // xai- prefix (XAI/Grok API keys)
    /\bxai-[a-zA-Z0-9-_]{20,}/gi,
    
    // Common API key formats
    /\b[a-zA-Z0-9]{32,}[-_][a-zA-Z0-9]{8,}/gi,
    
    // Bearer tokens
    /Bearer\s+[a-zA-Z0-9\-._~+\/]{20,}/gi,
    
    // JWT tokens (three base64 parts separated by dots)
    /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,
    
    // MongoDB connection strings
    /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^\s]+/gi,
    
    // PostgreSQL/MySQL connection strings
    /postgres(ql)?:\/\/[^:]+:[^@]+@[^\s]+/gi,
    /mysql:\/\/[^:]+:[^@]+@[^\s]+/gi,
    
    // Generic URL with credentials
    /https?:\/\/[^:]+:[^@]+@[^\s]+/gi,
    
    // Email addresses
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
    
    // Corporate user IDs (q followed by 6 digits/letters)
    /\bq[0-9a-zA-Z]{6}\b/gi,
    
    // Common corporate terms
    /\b(BMW|Mercedes|Audi|Tesla|Microsoft|Google|Apple|Amazon|Meta|Facebook|IBM|Oracle|Cisco|Intel|Dell|HP|Lenovo|Samsung|LG|Sony|Panasonic|Siemens|SAP|Accenture|Deloitte|McKinsey|BCG|Bain|Goldman|Morgan|JPMorgan|Deutsche Bank|Commerzbank|Allianz|Munich Re|BASF|Bayer|Volkswagen|Porsche|Bosch|Continental|Airbus|Boeing|Lockheed|Northrop|Raytheon|General Electric|Ford|General Motors|Chrysler|Fiat|Renault|Peugeot|Citroen|Volvo|Scania|MAN|Daimler|ThyssenKrupp|Siemens Energy|RWE|EON|Uniper|TUI|Lufthansa|DHL|UPS|FedEx|TNT|Deutsche Post|Telekom|Vodafone|Orange|BT|Telefonica|Verizon|ATT|Sprint|TMobile)\b/gi
  ];
  
  let redactedText = text;
  
  // Apply each pattern
  apiKeyPatterns.forEach(pattern => {
    if (pattern.source.includes('=')) {
      // For environment variable patterns, preserve the key name
      redactedText = redactedText.replace(pattern, (match, keyName) => {
        return `${keyName}=<SECRET_REDACTED>`;
      });
    } else if (pattern.source.includes('apiKey|API_KEY')) {
      // For JSON format API keys, preserve the key name
      redactedText = redactedText.replace(pattern, (match, keyName) => {
        return `"${keyName}": "<SECRET_REDACTED>"`;
      });
    } else if (pattern.source.includes('mongodb') || pattern.source.includes('postgres') || pattern.source.includes('mysql')) {
      // For connection strings, preserve the protocol
      redactedText = redactedText.replace(pattern, (match) => {
        const protocol = match.split(':')[0];
        return `${protocol}://<CONNECTION_STRING_REDACTED>`;
      });
    } else if (pattern.source.includes('Bearer')) {
      // For Bearer tokens
      redactedText = redactedText.replace(pattern, 'Bearer <TOKEN_REDACTED>');
    } else if (pattern.source.includes('@')) {
      // For email addresses
      redactedText = redactedText.replace(pattern, '<EMAIL_REDACTED>');
    } else if (pattern.source.includes('q[0-9a-zA-Z]')) {
      // For corporate user IDs
      redactedText = redactedText.replace(pattern, '<USER_ID_REDACTED>');
    } else if (pattern.source.includes('BMW|Mercedes')) {
      // For corporate terms
      redactedText = redactedText.replace(pattern, '<COMPANY_NAME_REDACTED>');
    } else {
      // For other patterns, replace with generic redaction
      redactedText = redactedText.replace(pattern, '<SECRET_REDACTED>');
    }
  });
  
  return redactedText;
}

function extractTextContent(content) {
  if (typeof content === 'string') return redactSecrets(content);
  if (Array.isArray(content)) {
    const text = content
      .filter(item => item && item.type === 'text')
      .map(item => item.text)
      .filter(text => text && text.trim())
      .join('\n');
    return redactSecrets(text);
  }
  return '';
}

// Helper function to extract date from LSL filename
function extractDateFromFilename(filename) {
  // Match both old and new patterns:
  // Old: 2025-08-12_1900-2000-session.md or 2025-08-12_1900-2000-session-from-nano-degree.md
  // New: 2025-08-12_1900-2000_g9b30a.md or 2025-08-12_1900-2000_g9b30a_from-nano-degree.md
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})_/);
  return match ? match[1] : null;
}

// Clean old files based on mode and date range
async function cleanOldFiles(mode, targetProject, earliestDate) {
  if (!earliestDate) {
    console.log('⚠️ No transcript date range available, skipping clean');
    return;
  }
  
  // For foreign mode from non-coding project, clean in coding project
  let outputDir = targetProject.outputDir;
  if (mode === 'foreign' && targetProject.name !== 'coding') {
    outputDir = targetProject.foreignOutputDir;
    console.log(`🔄 Foreign mode: cleaning redirected files in coding project at ${outputDir}`);
  }
  
  if (!fs.existsSync(outputDir)) {
    console.log('📁 Output directory does not exist, nothing to clean');
    return;
  }
  
  console.log(`\n🧹 Cleaning files in ${outputDir} (mode: ${mode}, from: ${earliestDate})`);
  
  const files = fs.readdirSync(outputDir);
  let deletedCount = 0;
  let preservedCount = 0;
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    // Extract date from filename
    const fileDate = extractDateFromFilename(file);
    if (!fileDate) {
      console.log(`⚠️ Cannot extract date from: ${file}, skipping`);
      continue;
    }
    
    // Preserve files older than transcript range
    if (fileDate < earliestDate) {
      preservedCount++;
      continue;
    }
    
    // Check file type based on mode
    const isRedirected = file.includes('-from-');
    
    if (mode === 'local' && isRedirected) {
      // Skip foreign files in local mode
      continue;
    }
    if (mode === 'foreign') {
      // In foreign mode, only clean redirected files
      if (targetProject.name === 'coding' && !isRedirected) {
        // In coding project, skip local files
        continue;
      }
      if (targetProject.name !== 'coding') {
        // From non-coding project, only clean files redirected from this project
        const expectedSuffix = `-from-${targetProject.name}.md`;
        if (!file.endsWith(expectedSuffix)) {
          continue;
        }
      }
    }
    
    // Delete the file
    const filepath = path.join(outputDir, file);
    fs.unlinkSync(filepath);
    deletedCount++;
    console.log(`  🗑️ Deleted: ${file}`);
  }
  
  console.log(`✅ Clean complete: ${deletedCount} deleted, ${preservedCount} preserved (before ${earliestDate})`);
}

function extractUserMessage(entry) {
  // Handle different user message structures
  if (entry.message?.content) {
    if (typeof entry.message.content === 'string') {
      return redactSecrets(entry.message.content);
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
  if (responseText.length <= 500) {
    return responseText;
  }
  return responseText.substring(0, 500) + '\n\n...\n\n*[Response truncated - /sl command output abbreviated for readability]*\n';
}

// Enhanced classification logging
function logClassificationDecision(exchange, result, exchangeText, logFile) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    classification: result.classification,
    isCoding: result.isCoding,
    confidence: result.confidence,
    layer: result.layer,
    processingTimeMs: result.processingTimeMs,
    exchangeLength: exchangeText.length,
    exchangePreview: redactSecrets(exchangeText.substring(0, 500)),
    decisionPath: result.decisionPath?.map(step => ({
      layer: step.layer,
      duration: step.duration,
      output: step.output
    })) || []
  };
  
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.warn(`Failed to write classification log: ${error.message}`);
  }
}

/**
 * Create a cache key for exchange classification
 * @param {string} exchangeText - The exchange text to create a key for
 * @returns {string} - A hash-based cache key
 */
function createCacheKey(exchangeText) {
  // Use a simple hash based on content length and first/last characters
  // This provides a good balance between collision avoidance and performance
  const length = exchangeText.length;
  const start = exchangeText.substring(0, 50);
  const end = exchangeText.substring(Math.max(0, length - 50));
  return `${length}-${start.replace(/\s+/g, '')}-${end.replace(/\s+/g, '')}`;
}

// Use enhanced transcript monitor for consistent classification
async function isCodingInfrastructureExchange(exchangeText, monitor, targetProject, batchStats, cache = null) {
  try {
    // Performance optimization: Check cache first if enabled
    const cacheKey = createCacheKey(exchangeText);
    if (cache && cache.has(cacheKey)) {
      const cachedResult = cache.get(cacheKey);
      batchStats.cacheHits = (batchStats.cacheHits || 0) + 1;
      return cachedResult;
    }
    
    // Create exchange object in the format expected by the ReliableCodingClassifier
    const exchange = {
      timestamp: new Date().toISOString(),
      content: exchangeText,
      userMessage: exchangeText,
      claudeResponse: '', // Will be populated if found
      toolCalls: [], // Extract if needed
      fileOperations: [] // Extract if needed
    };
    
    // Use the ReliableCodingClassifier directly for accurate classification
    if (monitor.reliableCodingClassifier) {
      console.log(`🔍 Classifying exchange (${exchangeText.length} chars)...`);
      
      try {
        const result = await monitor.reliableCodingClassifier.classify(exchange);
        
        // Validate classification result
        if (!result || typeof result.isCoding !== 'boolean') {
          throw new Error(`Invalid classification result structure: ${JSON.stringify(result)}`);
        }
        
        console.log(`📊 Classification result: ${result.classification} (confidence: ${result.confidence}, layer: ${result.layer})`);
        
        // Update batch statistics
        if (batchStats) {
          batchStats.totalClassifications++;
          batchStats.classificationTimeTotal += result.processingTimeMs || 0;
          if (result.isCoding) {
            batchStats.codingExchanges++;
          } else {
            batchStats.nonCodingExchanges++;
          }
        }
        
        // Log detailed classification decision
        const logDir = path.join(targetProject.path, '.specstory', 'logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, `batch-classification-${new Date().toISOString().split('T')[0]}.jsonl`);
        logClassificationDecision(exchange, result, exchangeText, logFile);
        
        // Store result in cache for future use
        if (cache) {
          cache.set(cacheKey, result.isCoding);
          batchStats.cacheMisses = (batchStats.cacheMisses || 0) + 1;
        }
        
        return result.isCoding;
      } catch (classificationError) {
        // Enhanced error reporting with actionable guidance
        const errorMsg = `❌ CLASSIFICATION FAILED: ${classificationError.message}
        
🔧 TROUBLESHOOTING STEPS:
1. Check if ReliableCodingClassifier is properly initialized
2. Verify coding project path: ${targetProject.classificationProjectPath}
3. Ensure all classifier dependencies are available
4. Check system resources (memory, disk space)

📋 ERROR CONTEXT:
- Exchange length: ${exchangeText.length} chars
- Target project: ${targetProject.name}
- Classification project: ${targetProject.classificationProjectPath}
- Error type: ${classificationError.constructor.name}

💡 SUGGESTED ACTIONS:
- Restart the batch process with fresh initialization
- Check if coding project directory exists and is accessible
- Verify environment variables (TRANSCRIPT_SOURCE_PROJECT, CODING_REPO)
- Review recent changes to classification system`;

        console.error(errorMsg);
        throw new Error(`Classification system failure: ${classificationError.message}. This indicates a critical issue with the batch processing infrastructure that must be resolved before continuing.`);
      }
    } else {
      // Critical error: ReliableCodingClassifier should always be available
      const errorMsg = `❌ CRITICAL ERROR: ReliableCodingClassifier not initialized

🔧 REQUIRED ACTIONS:
1. Verify EnhancedTranscriptMonitor initialization completed successfully
2. Check coding project path exists: ${targetProject.classificationProjectPath}
3. Ensure all required dependencies are installed
4. Verify environment configuration

📋 SYSTEM STATE:
- Target project: ${targetProject.name} (${targetProject.path})
- Expected classification project: ${targetProject.classificationProjectPath}
- Monitor ready state: ${monitor.reliableCodingClassifierReady}

💡 This error indicates a fundamental configuration issue that prevents proper batch processing.`;

      console.error(errorMsg);
      throw new Error('ReliableCodingClassifier not available. Batch processing cannot continue without proper classification system. Please check system configuration and initialization.');
    }
  } catch (error) {
    // Re-throw classification errors - no silent fallbacks
    if (error.message.includes('Classification system failure') || 
        error.message.includes('ReliableCodingClassifier not available')) {
      throw error; // Critical classification errors should stop execution
    }
    
    // Handle unexpected errors with proper context
    const errorMsg = `❌ UNEXPECTED ERROR during classification: ${error.message}

🔧 ERROR ANALYSIS:
- Error type: ${error.constructor.name}
- Exchange length: ${exchangeText.length} chars
- Stack trace: ${error.stack}

💡 This indicates an unexpected system error that needs investigation.`;

    console.error(errorMsg);
    throw new Error(`Unexpected classification error: ${error.message}. Batch processing cannot continue reliably with classification failures.`);
  }
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
        // Redact secrets from tool descriptions
        const redactedDescription = redactSecrets(description);
        return `**${tool.name}**: ${redactedDescription}`;
      })
      .join('\n');
  }
  return '';
}

async function generateLSL() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const mode = args.includes('--mode=local') ? 'local' : 
               args.includes('--mode=foreign') ? 'foreign' : 'all';
  const cleanMode = args.includes('--clean');
  
  const targetProject = getTargetProject();
  console.log(`\n🔄 Generating LSL files for: ${targetProject.path}`);
  console.log(`📋 Mode: ${mode.toUpperCase()} | Clean: ${cleanMode ? 'YES' : 'NO (incremental)'}`);
  
  // Performance optimization configuration
  const performanceConfig = {
    batchSize: 10,           // Process files in batches
    cacheEnabled: true,      // Enable classification caching
    progressInterval: 5,     // Show progress every N files
    memoryOptimization: true, // Enable memory cleanup between batches
    maxConcurrentFiles: 8,   // Increased for faster processing (<1 minute)
    parallelEnabled: args.includes('--parallel') || args.includes('--fast') // Enable parallel processing
  };
  
  // Track earliest transcript date for clean mode
  let earliestTranscriptDate = null;
  
  // Batch processing statistics
  const batchStats = {
    totalClassifications: 0,
    codingExchanges: 0,
    nonCodingExchanges: 0,
    includedInForeignMode: 0,
    excludedFromForeignMode: 0,
    classificationTimeTotal: 0,
    // Performance optimization metrics
    cacheHits: 0,
    cacheMisses: 0,
    batchesProcessed: 0,
    memoryCleanups: 0
  };

  // Initialize enhanced transcript monitor for consistent classification logic
  console.log('🧠 Initializing enhanced classification system...');
  console.log(`📂 Target project: ${targetProject.name} (${targetProject.path})`);
  console.log(`🔧 Classification project: coding (${targetProject.classificationProjectPath})`);
  
  const monitor = new EnhancedTranscriptMonitor({ 
    projectPath: targetProject.classificationProjectPath, // Use coding project for classification
    skipSemanticAnalysis: performanceConfig.parallelEnabled  // Skip semantic analysis when fast/parallel mode is enabled
  });
  
  // Initialize classification cache for performance optimization (accessible throughout function scope)
  const classificationCache = new Map();
  if (performanceConfig.cacheEnabled) {
    console.log('🚀 Classification caching enabled for improved performance');
  }
  
  // Wait for reliable coding classifier to be ready
  let retries = 0;
  while (!monitor.reliableCodingClassifierReady && retries < 30) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (monitor.reliableCodingClassifierReady) {
    console.log('✅ Reliable coding classifier ready with three-layer architecture');
    
    // Validate classifier functionality
    try {
      const stats = monitor.reliableCodingClassifier?.getStats();
      if (!stats) {
        throw new Error('ReliableCodingClassifier getStats() returned null/undefined');
      }
      console.log('✅ Classifier validation passed');
    } catch (validationError) {
      const errorMsg = `❌ CLASSIFIER VALIDATION FAILED: ${validationError.message}

🔧 CRITICAL ISSUE DETECTED:
The ReliableCodingClassifier appears to be initialized but is not functioning correctly.

📋 DIAGNOSTIC INFO:
- Classifier ready state: ${monitor.reliableCodingClassifierReady}
- Validation error: ${validationError.message}
- Target project: ${targetProject.name}
- Classification project: ${targetProject.classificationProjectPath}

💡 REQUIRED ACTIONS:
1. Check ReliableCodingClassifier implementation for recent changes
2. Verify all classifier dependencies are properly installed
3. Review initialization logs for warnings or errors
4. Test classifier functionality in isolation

This error prevents reliable batch processing and must be resolved.`;

      console.error(errorMsg);
      throw new Error(`ReliableCodingClassifier validation failed: ${validationError.message}. Cannot proceed with batch processing until classifier is functioning properly.`);
    }
  } else {
    const errorMsg = `❌ CLASSIFIER INITIALIZATION TIMEOUT

🔧 INITIALIZATION FAILED:
ReliableCodingClassifier failed to initialize within 3 seconds (30 retries).

📋 SYSTEM STATE:
- Target project: ${targetProject.name} (${targetProject.path})
- Classification project: ${targetProject.classificationProjectPath}
- Retries attempted: ${retries}
- Monitor ready state: ${monitor.reliableCodingClassifierReady}

💡 POSSIBLE CAUSES:
1. Missing or corrupted coding project directory
2. Insufficient system resources (memory, CPU)
3. Network issues preventing dependency initialization
4. Configuration errors in environment variables

REQUIRED ACTIONS:
1. Verify coding project path exists: ${targetProject.classificationProjectPath}
2. Check system resources and availability
3. Review initialization logs for specific error messages
4. Restart with clean environment if needed

Batch processing cannot continue without proper classification system.`;

    console.error(errorMsg);
    throw new Error('ReliableCodingClassifier initialization timeout. Cannot proceed with batch processing without functional classification system.');
  }

  // Find all transcript files automatically - use imports since this is ES module
  
  function findAllTranscriptFiles() {
    const projectsDir = '/Users/q284340/.claude/projects/';
    const transcriptPaths = [];
    
    // Find all .jsonl files in projects directory
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
          // Skip if directory can't be read
          console.warn(`Could not read directory ${projectPath}: ${error.message}`);
        }
      }
    }
    
    return transcriptPaths.sort(); // Sort for consistent ordering
  }
  
  const transcriptPaths = findAllTranscriptFiles();
  console.log(`Found ${transcriptPaths.length} transcript files to process`);
  if (performanceConfig.parallelEnabled) {
    console.log(`🚀 Parallel processing enabled with ${performanceConfig.maxConcurrentFiles} concurrent files`);
  }

  // Convert paths to transcript file objects for parallel processing
  const transcriptFiles = transcriptPaths
    .filter(path => fs.existsSync(path))
    .map(path => {
      const stats = fs.statSync(path);
      return {
        path: path,
        filename: require('path').basename(path),
        size: stats.size
      };
    });

  console.log(`Found ${transcriptFiles.length} valid transcript files`);
  
  // Use proper parallel processing with streaming for large files
  const startTime = Date.now();
  let totalExchanges = 0;
  
  if (performanceConfig.parallelEnabled) {
    console.log(`🚀 Using parallel processing with ${performanceConfig.maxConcurrentFiles} concurrent files`);
    const results = await monitor.processTranscriptsInParallel(transcriptFiles, performanceConfig.maxConcurrentFiles);
    
    // Aggregate results
    for (const result of results) {
      totalExchanges += result.exchanges || 0;
      if (result.status === 'success') {
        console.log(`✅ ${result.file}: ${result.exchanges} exchanges processed in ${(result.duration / 1000).toFixed(1)}s`);
      } else {
        console.log(`❌ ${result.file}: ${result.error || 'Unknown error'}`);
      }
    }
  } else {
    console.log(`🔄 Using sequential processing`);
    for (const transcriptFile of transcriptFiles) {
      const result = await monitor.processSingleTranscript(transcriptFile, true); // Force streaming
      totalExchanges += result.exchanges || 0;
      if (result.status === 'success') {
        console.log(`✅ ${result.file}: ${result.exchanges} exchanges processed in ${(result.duration / 1000).toFixed(1)}s`);
      } else {
        console.log(`❌ ${result.file}: ${result.error || 'Unknown error'}`);
      }
    }
  }
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Track earliest transcript date for clean mode
      if (entry.timestamp) {
        const entryDate = entry.timestamp.split('T')[0];
        if (!earliestTranscriptDate || entryDate < earliestTranscriptDate) {
          earliestTranscriptDate = entryDate;
        }
      }
      
      // Only process actual user-initiated messages (not tool results or meta messages)
      const hasToolUseId = Array.isArray(entry.message?.content) 
        ? entry.message?.content?.[0]?.tool_use_id 
        : false;
      
      if (entry.type === 'user' && !hasToolUseId && !entry.isMeta) {
        const timestampInfo = parseTimestamp(entry.timestamp);
        const userText = extractUserMessage(entry);
        
        // Skip entries with no meaningful user message to prevent "No context" entries
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
          const nextHasToolUseId = Array.isArray(nextEntry.message?.content) 
            ? nextEntry.message?.content?.[0]?.tool_use_id 
            : false;
          if (nextEntry.type === 'user' && !nextHasToolUseId && !nextEntry.isMeta) {
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
          } else if (nextEntry.type === 'user' && Array.isArray(nextEntry.message?.content) && nextEntry.message?.content?.[0]?.tool_use_id) {
            // This is a tool result
            const toolResult = nextEntry.message.content[0].content;
            if (toolResult && typeof toolResult === 'string') {
              // Redact secrets from tool results
              const redactedResult = redactSecrets(toolResult);
              // For /sl commands, also abbreviate tool results like Claude responses
              if (isSlashCommandResponse(userText, redactedResult)) {
                toolResults.push(truncateSlashCommandResponse(redactedResult));
              } else {
                // Capture full tool result for non-/sl commands
                toolResults.push(redactedResult);
              }
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
        
        // Enhanced logic using the same classification as live monitoring
        // - If we're generating for coding project AND exchange is coding infrastructure → include
        // - If we're generating for any other project AND exchange is NOT coding infrastructure → include
        const touchesCoding = await isCodingInfrastructureExchange(fullExchange, monitor, targetProject, batchStats, performanceConfig.cacheEnabled ? classificationCache : null);
        // Determine inclusion based on mode and project
        let shouldInclude;
        if (mode === 'foreign') {
          // Foreign mode: include exchanges that should be redirected to the other project
          shouldInclude = (targetProject.name === 'coding') ? touchesCoding : touchesCoding;
        } else {
          // Local/All mode: include exchanges that belong to this project
          shouldInclude = (targetProject.name === 'coding') ? touchesCoding : !touchesCoding;
        }
        
        // Track foreign mode inclusion/exclusion statistics
        if (mode === 'foreign') {
          if (shouldInclude) {
            batchStats.includedInForeignMode++;
          } else {
            batchStats.excludedFromForeignMode++;
          }
        }
        
        if (shouldInclude) {
          // Determine if this exchange is redirected from another project
          const isFromNanoDegree = transcriptPath.includes('-Users-q284340-Agentic-nano-degree');
          const isFromCoding = transcriptPath.includes('-Users-q284340-Agentic-coding');
          // Foreign mode logic: exchanges are redirected when they belong in the other project
          // When running from nano-degree in foreign mode: redirect coding-related exchanges to coding project  
          // When running from coding in foreign mode: redirect exchanges that came from nano-degree
          const isRedirected = (targetProject.name === 'coding' && isFromNanoDegree && touchesCoding) ||
                               (targetProject.name === 'nano-degree' && touchesCoding && mode === 'foreign');
                               
          
          // Determine origin project name
          let originProject = null;
          if (isFromNanoDegree) originProject = 'nano-degree';
          else if (isFromCoding) originProject = 'coding';
          
          const exchange = {
            timestamp: timestampInfo,
            userMessage: userText,
            claudeResponses: assistantResponses,
            toolCalls: toolCalls,
            toolResults: toolResults,
            window: timestampInfo.window,
            isRedirected: isRedirected,
            originProject: originProject
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
    
    console.log(`Extracted ${exchangeCount} exchanges from ${path.basename(transcriptPath)}`);
    
    // Update progress tracking
    filesProcessed++;
    totalExchanges += exchangeCount;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const progress = ((filesProcessed / transcriptPaths.length) * 100).toFixed(1);
    console.log(`📊 Progress: ${filesProcessed}/${transcriptPaths.length} files (${progress}%) | ${totalExchanges} exchanges | ${elapsed}s elapsed`);
  }

  // Execute clean mode if requested
  if (cleanMode) {
    await cleanOldFiles(mode, targetProject, earliestTranscriptDate);
  }
  
  // Generate LSL files for each session
  let generatedCount = 0;
  let skippedCount = 0;
  
  for (const [window, exchanges] of sessions.entries()) {
    if (exchanges.length === 0) continue;
    
    const [startTime, endTime] = window.split('-');
    // Extract actual date from the first exchange in this session
    const firstExchange = exchanges[0];
    const actualDate = firstExchange.timestamp.utc.date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
    
    // Check if this session came from another project (for coding project only)
    const isFromOtherProject = targetProject.name === 'coding' && exchanges.some(e => e.isRedirected);
    const originProject = isFromOtherProject ? exchanges.find(e => e.isRedirected)?.originProject : null;
    
    // Apply mode filtering
    const isLocalSession = !exchanges.some(e => e.isRedirected);
    const isForeignSession = exchanges.some(e => e.isRedirected);
    
    
    if (mode === 'local' && !isLocalSession) {
      skippedCount++;
      continue; // Skip foreign sessions in local mode
    }
    if (mode === 'foreign' && !isForeignSession) {
      skippedCount++;
      continue; // Skip local sessions in foreign mode
    }
    // mode === 'all' generates everything
    
    // For foreign mode from non-coding project, write to coding project
    let outputDir = targetProject.outputDir;
    let filename = targetProject.filenamePattern(actualDate, window, isFromOtherProject, originProject, firstExchange.timestamp.utc.date.getTime());
    
    if (mode === 'foreign' && targetProject.name !== 'coding') {
      // Write foreign files to coding project using dynamic path
      outputDir = targetProject.foreignOutputDir;
      filename = targetProject.foreignFilenamePattern(actualDate, window, targetProject.name, firstExchange.timestamp.utc.date.getTime());
    }
    
    const filepath = path.join(outputDir, filename);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let content = `# WORK SESSION (${actualDate}_${startTime}-${endTime})

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
**Work Period:** ${actualDate}_${startTime}-${endTime}
**Focus:** Live session logging from actual transcript data
**Duration:** ~60 minutes
**Project:** ${targetProject.name}

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
    generatedCount++;
  }
  
  // Report mode-specific statistics
  console.log(`\n📊 Mode-specific statistics:`);
  console.log(`   Generated: ${generatedCount} files`);
  console.log(`   Skipped: ${skippedCount} sessions (filtered by mode: ${mode})`);
  
  if (mode === 'foreign' && targetProject.name !== 'coding') {
    console.log(`   Note: Foreign files were written to coding project at ${targetProject.foreignOutputDir}`);
  }
  
  // Final batch processing summary
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgTimePerFile = filesProcessed > 0 ? (totalElapsed / filesProcessed).toFixed(2) : 0;
  const avgTimePerExchange = totalExchanges > 0 ? ((totalElapsed * 1000) / totalExchanges).toFixed(1) : 0;
  
  console.log(`\n📊 BATCH PROCESSING SUMMARY:`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Total exchanges: ${totalExchanges}`);
  console.log(`   Session files generated: ${sessions.size}`);
  console.log(`   Total processing time: ${totalElapsed}s`);
  console.log(`   Average time per file: ${avgTimePerFile}s`);
  console.log(`   Average time per exchange: ${avgTimePerExchange}ms`);
  
  if (monitor.reliableCodingClassifierReady) {
    const stats = monitor.reliableCodingClassifier?.getStats();
    if (stats) {
      console.log(`\n🔬 CLASSIFICATION PERFORMANCE:`);
      console.log(`   Total classifications: ${stats.totalClassifications || 0}`);
      console.log(`   Average classification time: ${stats.avgClassificationTime?.toFixed(1) || 0}ms`);
      console.log(`   Path analysis hits: ${stats.pathAnalysisHits || 0}`);
      console.log(`   Semantic analysis hits: ${stats.semanticAnalysisHits || 0}`);
      console.log(`   Keyword analysis hits: ${stats.keywordAnalysisHits || 0}`);
      
      // Enhanced batch-specific statistics
      console.log(`\n📊 BATCH PROCESSING STATISTICS:`);
      console.log(`   Exchanges classified: ${batchStats.totalClassifications}`);
      console.log(`   Coding exchanges: ${batchStats.codingExchanges}`);
      console.log(`   Non-coding exchanges: ${batchStats.nonCodingExchanges}`);
      console.log(`   Average batch classification time: ${batchStats.totalClassifications > 0 ? (batchStats.classificationTimeTotal / batchStats.totalClassifications).toFixed(1) : 0}ms`);
      
      // Performance optimization statistics
      if (performanceConfig.cacheEnabled) {
        const totalCacheAttempts = batchStats.cacheHits + batchStats.cacheMisses;
        const cacheHitRate = totalCacheAttempts > 0 ? ((batchStats.cacheHits / totalCacheAttempts) * 100).toFixed(1) : 0;
        console.log(`\n⚡ PERFORMANCE OPTIMIZATION STATISTICS:`);
        console.log(`   Cache hits: ${batchStats.cacheHits}`);
        console.log(`   Cache misses: ${batchStats.cacheMisses}`);
        console.log(`   Cache hit rate: ${cacheHitRate}%`);
        console.log(`   Time saved by caching: ~${(batchStats.cacheHits * 800).toLocaleString()}ms (estimated)`);
      }
      
      if (mode === 'foreign') {
        const totalForeignEvaluated = batchStats.includedInForeignMode + batchStats.excludedFromForeignMode;
        const inclusionRate = totalForeignEvaluated > 0 ? ((batchStats.includedInForeignMode / totalForeignEvaluated) * 100).toFixed(1) : 0;
        console.log(`\n🌍 FOREIGN MODE STATISTICS:`);
        console.log(`   Exchanges included: ${batchStats.includedInForeignMode}`);
        console.log(`   Exchanges excluded: ${batchStats.excludedFromForeignMode}`);
        console.log(`   Inclusion rate: ${inclusionRate}%`);
      }
      
      // Log file information
      const logDir = path.join(targetProject.path, '.specstory', 'logs');
      const logFile = path.join(logDir, `batch-classification-${new Date().toISOString().split('T')[0]}.jsonl`);
      if (fs.existsSync(logFile)) {
        const logStats = fs.statSync(logFile);
        console.log(`   Classification log: ${logFile} (${(logStats.size / 1024).toFixed(1)}KB)`);
      }
    }
  }
  
  console.log(`\n✅ LSL file generation complete for ${targetProject.name}!`);
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 LSL Generation Script - Enhanced Batch Mode with ReliableCodingClassifier

Usage: node generate-proper-lsl-from-transcripts.js [options]

🎯 Processing Modes:
  --mode=all      Generate all session files (default)
  --mode=local    Generate only local project session files  
  --mode=foreign  Generate only foreign/redirected session files (coding-related content from other projects)

🧹 Processing Options:
  --clean         Delete existing session files before regenerating (within transcript date range only)
  --file=<path>   Process single transcript file instead of all files
  --parallel      Enable parallel processing for faster execution (<1 minute)
  --fast          Alias for --parallel (high-speed batch processing)

🔧 Environment Configuration:
  TRANSCRIPT_SOURCE_PROJECT    Target project path (current: ${process.env.TRANSCRIPT_SOURCE_PROJECT || 'not set'})
  CODING_TOOLS_PATH       Coding tools repository path (current: ${process.env.CODING_TOOLS_PATH || process.env.CODING_REPO || 'not set'})

📊 Classification System:
  - Uses ReliableCodingClassifier with 3-layer architecture
  - Path analysis → Keyword matching → Semantic analysis  
  - Comprehensive logging to .specstory/logs/batch-classification-<date>.jsonl
  - Performance metrics with timing and accuracy tracking

🌍 Foreign Mode Details:
  - Processes coding-related exchanges FROM other projects 
  - Writes TO coding project (.specstory/history/*-from-<project>.md)
  - Requires both TRANSCRIPT_SOURCE_PROJECT and CODING_TOOLS_PATH to be set
  - Classification always uses coding project context for accuracy

📋 Examples:
  # Standard processing (all modes)
  node generate-proper-lsl-from-transcripts.js
  
  # Foreign mode only (coding content from nano-degree → coding project)
  node generate-proper-lsl-from-transcripts.js --mode=foreign
  
  # Clean regeneration with local content only
  node generate-proper-lsl-from-transcripts.js --mode=local --clean
  
  # Process single transcript file
  node generate-proper-lsl-from-transcripts.js --file=/path/to/transcript.jsonl

📝 Output Files:
  - Session files: .specstory/history/<timestamp>-session.md
  - Foreign files: .specstory/history/<timestamp>-session-from-<project>.md  
  - Classification logs: .specstory/logs/batch-classification-<date>.jsonl
  - Performance stats displayed at completion

⚠️  Troubleshooting:
  - "0 hits, 0ms classification time" → Check if ReliableCodingClassifier is properly initialized
  - Classification errors → Check .specstory/logs/ for detailed decision paths
  - Environment issues → Verify TRANSCRIPT_SOURCE_PROJECT and CODING_TOOLS_PATH are set
  - Foreign mode failures → Ensure coding project exists and is writable
`);
    process.exit(0);
  }
  
  // Validate arguments
  const validModes = ['all', 'local', 'foreign'];
  const modeArg = args.find(arg => arg.startsWith('--mode='));
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const cleanArg = args.includes('--clean');
  
  if (modeArg) {
    const mode = modeArg.split('=')[1];
    if (!validModes.includes(mode)) {
      console.error(`❌ Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
      console.error('Use --help for usage information.');
      process.exit(1);
    }
  }
  
  // Validate environment for foreign mode
  if (modeArg && modeArg.includes('foreign')) {
    const targetProject = process.env.TRANSCRIPT_SOURCE_PROJECT;
    const codingPath = process.env.CODING_TOOLS_PATH || process.env.CODING_REPO;
    
    if (!targetProject || !codingPath) {
      console.error(`❌ Foreign mode requires environment variables:
  TRANSCRIPT_SOURCE_PROJECT (current: ${targetProject || 'not set'})
  CODING_TOOLS_PATH or CODING_REPO (current: ${codingPath || 'not set'})
  
Set these variables and try again.`);
      process.exit(1);
    }
  }
  
  // Validate file argument if provided
  if (fileArg) {
    const filePath = fileArg.split('=')[1];
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    if (!filePath.endsWith('.jsonl')) {
      console.error(`❌ File must be a .jsonl transcript file: ${filePath}`);
      process.exit(1);
    }
  }
  
  // Check for unknown arguments
  const knownArgs = ['--clean', '--help', '-h', '--parallel', '--fast'];
  const knownPrefixes = ['--mode=', '--file='];
  const unknownArgs = args.filter(arg => {
    return !knownArgs.includes(arg) && 
           !knownPrefixes.some(prefix => arg.startsWith(prefix));
  });
  
  if (unknownArgs.length > 0) {
    console.error(`❌ Unknown arguments: ${unknownArgs.join(', ')}`);
    console.error('Use --help for usage information.');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting LSL generation with ReliableCodingClassifier...');
    await generateLSL();
    process.exit(0); // Exit successfully after completion
  } catch (error) {
    console.error('❌ LSL generation failed:', error.message);
    
    // Provide context-specific troubleshooting
    if (error.message.includes('classifier')) {
      console.error('\n🔍 Troubleshooting classification issues:');
      console.error('1. Check if ReliableCodingClassifier is properly initialized');
      console.error('2. Verify environment variables TRANSCRIPT_SOURCE_PROJECT and CODING_TOOLS_PATH');
      console.error('3. Look for detailed logs in .specstory/logs/batch-classification-*.jsonl');
    }
    
    if (error.message.includes('foreign')) {
      console.error('\n🌍 Foreign mode troubleshooting:');
      console.error('1. Ensure TRANSCRIPT_SOURCE_PROJECT points to source project');
      console.error('2. Ensure CODING_TOOLS_PATH points to coding repository');
      console.error('3. Check write permissions on coding project .specstory/ directory');
    }
    
    console.error('\n📚 Use --help for complete usage information');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateLSL };