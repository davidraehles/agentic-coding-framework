# Live Session Logging (LSL) System v2.0 - Adaptive Architecture

A bulletproof conversation classification and routing system with **Adaptive Transcript Format Detection** that automatically learns and adapts to transcript format changes. The enhanced LSL system ensures all conversations are properly classified and routed to the correct `.specstory/history/` directories with zero data loss and automatic recovery from failures.

## Overview

The LSL v2.0 system introduces **Adaptive Learning** capabilities that automatically detect, learn, and adapt to changes in Claude Code transcript formats without requiring manual code updates. The system performs intelligent classification to determine whether content belongs to **coding infrastructure** work or **project-specific** work, while maintaining bulletproof reliability through health monitoring and automatic recovery.

![LSL Adaptive Architecture](images/lsl-adaptive-architecture.png)

### Core Principles

- **🤖 Self-Learning**: Automatically learns new transcript formats without code changes
- **🔄 Zero-Breaking Changes**: Seamless adaptation to format evolution  
- **🛡️ Bulletproof Reliability**: Global Coordinator ensures LSL never fails across any session
- **📦 No Data Loss**: Every conversation exchange is preserved and routed appropriately
- **⚡ Real-time Classification**: Decisions made during active conversations for immediate routing
- **🏥 Health Monitoring**: Automatic detection and recovery from failed processes
- **⚙️ Concurrent Processing**: Efficient bulk processing with 5 parallel workers
- **🎯 Three-Layer Analysis**: PathAnalyzer → KeywordMatcher → SemanticAnalyzer for accurate classification

## New Adaptive Features (v2.0)

### 🧠 Adaptive Transcript Format Detection

**Location**: `src/live-logging/AdaptiveTranscriptFormatDetector.js`

The core innovation that makes LSL future-proof against transcript format changes:

**Key Capabilities**:
- **Pattern Recognition**: Automatically analyzes message structure patterns
- **Schema Generation**: Creates extraction rules from detected patterns  
- **Confidence Scoring**: Calculates reliability metrics for detected formats
- **Persistent Storage**: Saves learned formats to JSON config file
- **Auto-Learning**: Detects and learns new formats without manual intervention

```javascript
// Automatic format detection
const formatResult = detector.detectFormat(messages);
if (formatResult) {
  console.log(`Format detected: ${formatResult.formatId}`);
  console.log(`Confidence: ${formatResult.matchScore.toFixed(2)}`);
}
```

![Adaptive Format Detection Sequence](images/lsl-adaptive-format-sequence.png)

### 🔧 Adaptive Exchange Extractor

**Location**: `src/live-logging/AdaptiveExchangeExtractor.js`

Dynamically applies appropriate extraction strategy based on detected format:

**Key Features**:
- **Strategy Selection**: Chooses extraction method based on format
- **Caching**: Avoids re-detecting formats for similar message batches (5-min TTL)
- **Fallback Handling**: Gracefully handles unknown formats with zero data loss
- **Performance Tracking**: Monitors extraction statistics and cache efficiency

```javascript
// Adaptive extraction with automatic fallback
const exchanges = AdaptiveExchangeExtractor.extractExchangesFromBatch(messages);
console.log(`Extracted ${exchanges.length} exchanges`);

// Get performance statistics
const stats = extractor.getStats();
console.log(`Cache hits: ${stats.cacheHits}, Formats: ${stats.knownFormats}`);
```

### 📊 Configuration-Driven Learning

**Location**: `config/transcript-formats.json`

Persistent storage of learned transcript format schemas:

```json
{
  "version": "1.0",
  "lastUpdated": "2025-09-16T04:59:38.760Z",
  "formats": {
    "claude-code-v2": {
      "id": "claude-code-v2",
      "name": "Claude Code V2 Format",
      "patterns": {
        "userTurnStart": { "type": "human_turn_start", "required": ["uuid", "timestamp"] },
        "assistantTurnEnd": { "type": "claude_turn_end", "required": ["content"] }
      },
      "confidence": 1.0,
      "firstSeen": "2025-09-15T00:00:00.000Z"
    },
    "claude-legacy-v1": {
      "id": "claude-legacy-v1", 
      "name": "Claude Legacy V1 Format",
      "patterns": {
        "userMessage": { "type": "user", "required": ["uuid", "timestamp", "message"] },
        "assistantMessage": { "type": "assistant", "required": ["uuid", "timestamp", "message"] }
      },
      "confidence": 1.0,
      "firstSeen": "2025-09-13T00:00:00.000Z"
    }
  }
}
```

## System Architecture

### Enhanced Pipeline with Adaptive Components

![Concurrent Processing Data Flow](images/lsl-concurrent-processing.png)

The LSL v2.0 system consists of ten main components:

### 1. Enhanced Transcript Monitor (Updated)

**Location**: `scripts/enhanced-transcript-monitor.js`

**New Features**:
- **Adaptive Integration**: Seamlessly uses adaptive format detection
- **Prompt Set Generation**: Smart grouping of user prompts into logical sessions
- **Session Time Windows**: 60-minute boundaries with conversation continuity
- **Foreign File Routing**: Automatic `_from-X.md` file generation for coding content

```javascript
// Automatically uses adaptive extraction
const exchanges = StreamingTranscriptReader.extractExchangesFromBatch(messageBatch);
```

### 2. StreamingTranscriptReader (Updated)

**Location**: `src/live-logging/StreamingTranscriptReader.js`

**Enhanced Capabilities**:
- **Adaptive Integration**: Uses adaptive extraction by default
- **Backwards Compatibility**: Maintains legacy extraction as fallback
- **Memory Efficiency**: Streaming processing for large files (>10MB)
- **Concurrent Batching**: Configurable batch sizes for optimal performance

```javascript
// Adaptive extraction is enabled by default
static extractExchangesFromBatch(messages, options = {}) {
  if (options.useAdaptiveExtraction !== false) {
    return AdaptiveExchangeExtractor.extractExchangesFromBatch(messages, {
      debug: options.debug || false,
      configPath: options.formatConfigPath
    });
  }
  // Fallback to legacy extraction
  return StreamingTranscriptReader.legacyExtractExchangesFromBatch(messages);
}
```

### 3. ReliableCodingClassifier (Enhanced)

**Location**: `src/live-logging/ReliableCodingClassifier.js`

**Three-Layer Classification Architecture**:

1. **Layer 1: PathAnalyzer** - File operations analysis (100% accuracy for file-based detection)
2. **Layer 2: KeywordMatcher** - Fast keyword-based classification using coding dictionary
3. **Layer 3: SemanticAnalyzer** - LLM-powered semantic understanding (selective usage)

**Performance Optimizations**:
- **Fast-Path Processing**: Skip semantic analysis for 200x speed improvement
- **Confidence Thresholds**: Layer-specific confidence scoring
- **Performance Monitoring**: Real-time classification time tracking

### 4. Global LSL Coordinator (Unchanged)

**Location**: `scripts/global-lsl-coordinator.cjs`

Bulletproof coordination layer ensuring LSL reliability across all sessions.

### 5. LSL File Manager (Enhanced)

**Location**: `src/live-logging/LSLFileManager.js`

**New Features**:
- **Prompt Set Handling**: Intelligent grouping and file writing
- **Foreign File Management**: Automatic routing for coding infrastructure content
- **Archive Optimization**: Improved compression and cleanup strategies

## Prompt Set Processing

### Smart Session Boundaries

The LSL v2.0 system introduces **Prompt Set Processing** for logical conversation grouping:

**Key Features**:
- **User Prompt Boundaries**: Detect natural conversation breaks
- **Session Time Windows**: 60-minute default windows with overlap handling  
- **Tool Call Sequences**: Keep related tool calls within same prompt set
- **Conversation Continuity**: Maintain context across session boundaries

**File Naming Convention**:
```
2025-09-16_1400-1500_g9b30a.md           # Regular project content
2025-09-16_1400-1500_g9b30a_from-nano-degree.md  # Coding infrastructure content
```

### Concurrent Processing Architecture

**Parallel Workers**: 5 concurrent workers for batch processing
**Memory Management**: Streaming with configurable batch sizes
**Load Balancing**: Automatic work distribution across workers
**Error Recovery**: Per-worker error handling with session continuity

## Currently Supported Formats

### 1. Claude Legacy V1 (Sept 13-14, 2025)
- **Message Types**: `user`, `assistant`  
- **Structure**: `{ type: "user", message: { role: "user", content: "..." } }`
- **Tool Handling**: Tool calls embedded in message content arrays

### 2. Claude Code V2 (Sept 15+, 2025)
- **Message Types**: `human_turn_start`, `human_turn_end`, `claude_turn_start`, `claude_turn_end`
- **Structure**: Separate turn boundaries with content in `*_turn_end` messages
- **Tool Handling**: Dedicated `tool_use` and `tool_result` message types

### 3. Future Formats (Auto-Detected)
- **Automatic Learning**: New formats detected and learned automatically
- **Zero Code Changes**: No manual updates required
- **Graceful Evolution**: Seamless handling of format variations

## Migration to Other Coding Agents

![Migration Interfaces](images/lsl-migration-interfaces.png)

### Required Interfaces

To integrate LSL with other coding agents (Cursor, Aider, etc.), implement these interfaces:

#### 1. TranscriptReader Interface
```javascript
class AgentTranscriptReader {
  // Required methods:
  async processFile(path, processor) { }
  extractExchanges(messages) { }
  getTranscriptPaths() { }
  isValidFormat(content) { }
}
```

#### 2. FormatDetector Interface  
```javascript
class AgentFormatDetector {
  // Required methods:
  detectFormat(messages) { }
  saveFormatsConfig(format) { }
  getExtractionStrategy(format) { }
  calculateConfidence(analysis) { }
}
```

#### 3. Classifier Interface
```javascript
class AgentClassifier {
  // Required methods:
  classify(exchange) { }
  getConfidence() { }
  updateKeywords(keywords) { }
  getClassificationPath() { }
}
```

#### 4. FileWriter Interface
```javascript
class AgentFileWriter {
  // Required methods:
  writeSessionFile(path, content) { }
  appendToFile(path, content) { }
  rotateFile(path) { }
  getOutputDirectory() { }
}
```

### Agent-Specific Configuration

Create `config/agent-config.json` for each coding agent:

```json
{
  "agentName": "cursor",
  "transcriptLocation": "~/.cursor/conversations/",
  "outputDirectory": ".specstory/history/",
  "sessionWindowMinutes": 60,
  "fileNamingPattern": "YYYY-MM-DD_HHMM-HHMM_<session>",
  "supportedFormats": ["cursor-v1", "cursor-v2"],
  "classificationKeywords": [
    "refactor", "implement", "debug", "test"
  ]
}
```

### Migration Benefits

- **📈 Automatic Learning**: Each agent's formats learned automatically
- **🔄 Shared Configuration**: Common keyword and pattern databases  
- **🛡️ Zero Data Loss**: Robust fallback handling across all agents
- **⚡ High Performance**: Concurrent processing and caching
- **🎯 Consistent Classification**: Same three-layer analysis across agents

## Testing the Adaptive System

### Test Script

**Location**: `scripts/test-adaptive-extraction.js`

Comprehensive testing suite for adaptive format detection:

```bash
node scripts/test-adaptive-extraction.js
```

**Test Coverage**:
- ✅ Format detection accuracy  
- ✅ Extraction comparison (adaptive vs legacy)
- ✅ Performance statistics
- ✅ Config file generation
- ✅ Future format simulation

**Expected Results**:
```
🧪 Testing Adaptive Transcript Format Detection

✅ Format detected: claude-legacy-v1
✅ Extracted 1578 exchanges using adaptive method
✅ Both methods extracted the same number of exchanges
✅ Format config file generated successfully
📊 Formats in config: 2
```

## Benefits of Adaptive Architecture

### 1. **🔮 Future-Proof**
- ✅ Automatically handles format changes
- ✅ No manual code updates required
- ✅ Graceful fallback for edge cases

### 2. **🎯 Self-Improving**
- ✅ Learns from every transcript processed
- ✅ Improves accuracy over time
- ✅ Adapts to format variations

### 3. **⚡ High Performance**
- ✅ Caches format detection results (5-min TTL)
- ✅ Avoids redundant analysis
- ✅ Maintains extraction speed

### 4. **🛠️ Easy Maintenance**
- ✅ Reduces manual maintenance overhead
- ✅ Clear configuration management
- ✅ Comprehensive logging and debugging

## Configuration and Debugging

### Debug Mode

Enable comprehensive debugging across the adaptive system:

```javascript
// Enable debug logging
const extractor = new AdaptiveExchangeExtractor({ debug: true });
const detector = new AdaptiveTranscriptFormatDetector({ debug: true });
```

**Debug Output**:
```
[AdaptiveFormatDetector] Loaded 2 known formats from config
[AdaptiveExtractor] Using extraction strategy for format: claude-legacy-v1
[AdaptiveExtractor] Extracted 1578 exchanges using format: claude-legacy-v1
```

### Performance Monitoring

Track system performance with built-in statistics:

```javascript
const stats = extractor.getStats();
console.log({
  formatsDetected: stats.formatsDetected,
  exchangesExtracted: stats.exchangesExtracted,
  cacheHits: stats.cacheHits,
  cacheMisses: stats.cacheMisses,
  knownFormats: stats.knownFormats
});
```

### Configuration Options

#### AdaptiveTranscriptFormatDetector Options
```javascript
{
  configPath: '/path/to/transcript-formats.json',  // Config file location
  sampleSize: 100,                                // Messages to analyze  
  confidenceThreshold: 0.8,                       // Minimum confidence for detection
  debug: false                                     // Enable debug logging
}
```

#### AdaptiveExchangeExtractor Options
```javascript
{
  debug: false,                 // Enable debug logging
  formatCacheTTL: 300000,      // Cache TTL in milliseconds (5 min)
  minSampleSize: 50,           // Minimum messages for format detection
  configPath: '/custom/path'   // Custom config file path
}
```

## Integration with Existing LSL Components

The adaptive architecture seamlessly integrates with existing LSL components:

- **Enhanced Transcript Monitor**: Uses adaptive extraction by default
- **Global Coordinator**: Monitors adaptive components for health
- **Operational Logger**: Tracks adaptive system performance
- **LSL File Manager**: Handles output from adaptive extraction
- **Trajectory Generation**: Works with adaptively-extracted exchanges

## Backwards Compatibility

LSL v2.0 maintains 100% backwards compatibility:

- **Legacy Mode**: Available via `useAdaptiveExtraction: false` option
- **Fallback Extraction**: Automatic fallback when adaptive detection fails
- **Configuration Migration**: Existing configs work without changes
- **API Compatibility**: All existing LSL APIs unchanged

---

## See Also

- [Adaptive Transcript Format Detection](adaptive-transcript-format-detection.md) - Detailed technical documentation
- [LSL Troubleshooting](troubleshooting.md) - Common issues and solutions
- [LSL Performance Guide](performance-guide.md) - Optimization best practices
- [LSL Migration Guide](migration-guide.md) - Upgrading from LSL v1.x

---

*The LSL v2.0 Adaptive Architecture ensures your transcript processing remains robust and functional regardless of how coding agent formats evolve in the future.*