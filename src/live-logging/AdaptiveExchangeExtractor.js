/**
 * AdaptiveExchangeExtractor - Dynamically extracts exchanges using detected formats
 * 
 * Features:
 * - Uses AdaptiveTranscriptFormatDetector to learn formats
 * - Applies appropriate extraction strategy based on detected format
 * - Falls back gracefully for unknown formats
 * - Self-improving through format learning
 */

import AdaptiveTranscriptFormatDetector from './AdaptiveTranscriptFormatDetector.js';

class AdaptiveExchangeExtractor {
  constructor(options = {}) {
    this.config = {
      debug: options.debug || false,
      formatCacheTTL: options.formatCacheTTL || 300000, // 5 minutes
      minSampleSize: options.minSampleSize || 50
    };
    
    this.detector = new AdaptiveTranscriptFormatDetector({
      debug: this.config.debug,
      configPath: options.configPath
    });
    
    this.formatCache = new Map();
    this.stats = {
      formatsDetected: 0,
      exchangesExtracted: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Listen for new format detections
    this.detector.on('formatDetected', (data) => {
      this.debug(`New format detected: ${data.formatId}`);
      this.stats.formatsDetected++;
    });
  }

  /**
   * Extract exchanges from a batch of messages with adaptive format detection
   */
  static extractExchangesFromBatch(messages, options = {}) {
    const extractor = new AdaptiveExchangeExtractor(options);
    return extractor.extractExchanges(messages);
  }

  /**
   * Main extraction method - detects format and applies appropriate strategy
   */
  extractExchanges(messages) {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Check if we have enough data for format detection
    if (messages.length < this.config.minSampleSize) {
      this.debug(`Insufficient sample size (${messages.length}), using fallback extraction`);
      return this.extractWithFallback(messages);
    }

    // Try to get cached format or detect new one
    const formatResult = this.getOrDetectFormat(messages);
    
    if (!formatResult) {
      this.debug('Format detection failed, using fallback extraction');
      return this.extractWithFallback(messages);
    }

    // Apply extraction strategy based on detected format
    const strategy = this.detector.getExtractionStrategy(formatResult);
    const exchanges = this.extractWithStrategy(messages, strategy);
    
    this.debug(`Extracted ${exchanges.length} exchanges using format: ${formatResult.formatId}`);
    this.stats.exchangesExtracted += exchanges.length;
    
    return exchanges;
  }

  /**
   * Get cached format or detect new format for message batch
   */
  getOrDetectFormat(messages) {
    // Generate cache key based on message structure sample
    const cacheKey = this.generateCacheKey(messages.slice(0, 10));
    
    // Check cache first
    const cached = this.formatCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.config.formatCacheTTL) {
      this.stats.cacheHits++;
      return cached.formatResult;
    }
    
    // Detect format
    this.stats.cacheMisses++;
    const formatResult = this.detector.detectFormat(messages);
    
    // Cache result
    if (formatResult) {
      this.formatCache.set(cacheKey, {
        formatResult,
        timestamp: Date.now()
      });
    }
    
    return formatResult;
  }

  /**
   * Generate cache key from message sample
   */
  generateCacheKey(messageSample) {
    const types = messageSample
      .map(msg => msg?.type || 'unknown')
      .join(',');
    return `types:${types}`;
  }

  /**
   * Extract exchanges using detected format strategy
   */
  extractWithStrategy(messages, strategy) {
    const exchanges = [];
    let currentExchange = null;
    
    this.debug(`Using extraction strategy for format: ${strategy.formatId}`);
    
    for (const msg of messages) {
      if (!msg || !msg.type) continue;
      
      // Check for user turn start
      if (strategy.exchangeDetection.userTurnIndicators.includes(msg.type)) {
        // Complete previous exchange if exists
        if (currentExchange) {
          exchanges.push(currentExchange);
        }
        
        // Start new exchange
        currentExchange = {
          uuid: msg.uuid || this.generateUUID(),
          timestamp: msg.timestamp,
          humanMessage: this.extractContent(msg, strategy.messageExtraction.userContentPath),
          assistantMessage: null,
          toolCalls: [],
          toolResults: []
        };
        
        // For legacy format, user message is complete immediately
        if (strategy.formatId === 'claude-legacy-v1' && msg.message) {
          currentExchange.humanMessage = this.extractMessageContent(msg.message);
        }
      }
      
      // Check for user turn end (new format)
      else if (msg.type?.includes('turn_end') && msg.type?.includes('human') && currentExchange) {
        currentExchange.humanMessage = this.extractContent(msg, strategy.messageExtraction.userContentPath);
      }
      
      // Check for assistant turn start (new format)
      else if (strategy.exchangeDetection.assistantTurnIndicators.includes(msg.type)) {
        // Assistant response will be completed at turn end
      }
      
      // Check for assistant turn end or assistant message (legacy)
      else if (this.isAssistantMessage(msg, strategy) && currentExchange) {
        currentExchange.assistantMessage = this.extractContent(msg, strategy.messageExtraction.assistantContentPath);
        
        // For legacy format, extract tool calls from message content
        if (strategy.formatId === 'claude-legacy-v1' && msg.message?.content) {
          const toolCalls = this.extractToolCallsFromContent(msg.message.content);
          if (toolCalls.length > 0) {
            currentExchange.toolCalls.push(...toolCalls);
          }
        }
        
        // Complete exchange
        exchanges.push(currentExchange);
        currentExchange = null;
      }
      
      // Check for tool use (new format)
      else if (strategy.toolHandling.toolUseType && msg.type === strategy.toolHandling.toolUseType && currentExchange) {
        const toolCall = this.extractToolCall(msg, strategy.toolHandling);
        if (toolCall) {
          currentExchange.toolCalls.push(toolCall);
        }
      }
      
      // Check for tool result (new format)
      else if (strategy.toolHandling.toolResultType && msg.type === strategy.toolHandling.toolResultType && currentExchange) {
        const toolResult = this.extractToolResult(msg, strategy.toolHandling);
        if (toolResult) {
          currentExchange.toolResults.push(toolResult);
        }
      }
    }
    
    // Add final exchange if exists
    if (currentExchange) {
      exchanges.push(currentExchange);
    }
    
    return exchanges;
  }

  /**
   * Check if message is an assistant message
   */
  isAssistantMessage(msg, strategy) {
    // Check for assistant turn end
    if (msg.type?.includes('turn_end') && msg.type?.includes('claude')) {
      return true;
    }
    
    // Check for legacy assistant message
    if (strategy.exchangeDetection.assistantTurnIndicators.includes(msg.type)) {
      return true;
    }
    
    return false;
  }

  /**
   * Extract content from message using specified path
   */
  extractContent(msg, contentPath) {
    if (!contentPath || !msg) return '';
    
    if (contentPath === 'content') {
      return msg.content || '';
    }
    
    if (contentPath === 'message.content') {
      return this.extractMessageContent(msg.message);
    }
    
    return '';
  }

  /**
   * Extract content from message.content field (handles string or array)
   */
  extractMessageContent(messageObj) {
    if (!messageObj?.content) return '';
    
    if (typeof messageObj.content === 'string') {
      return messageObj.content;
    }
    
    if (Array.isArray(messageObj.content)) {
      return messageObj.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    
    return '';
  }

  /**
   * Extract tool calls from message content array (legacy format)
   */
  extractToolCallsFromContent(content) {
    if (!Array.isArray(content)) return [];
    
    return content
      .filter(item => item.type === 'tool_use')
      .map(item => ({
        id: item.id,
        name: item.name,
        input: item.input
      }));
  }

  /**
   * Extract tool call from tool_use message (new format)
   */
  extractToolCall(msg, toolHandling) {
    return {
      id: msg.tool_use_id,
      name: msg.tool_name,
      input: msg.input_json
    };
  }

  /**
   * Extract tool result from tool_result message (new format)
   */
  extractToolResult(msg, toolHandling) {
    return {
      tool_use_id: msg.tool_use_id,
      output: msg.output_json,
      is_error: msg.is_error || false
    };
  }

  /**
   * Fallback extraction for unknown or insufficient formats
   */
  extractWithFallback(messages) {
    this.debug('Using fallback exchange extraction');
    
    const exchanges = [];
    let currentExchange = null;
    
    for (const msg of messages) {
      if (!msg || !msg.type) continue;
      
      // Handle user messages (both formats)
      if ((msg.type === 'user' && msg.message?.role === 'user') || 
          msg.type === 'human_turn_start') {
        
        // Complete previous exchange
        if (currentExchange) {
          exchanges.push(currentExchange);
        }
        
        // Start new exchange
        currentExchange = {
          uuid: msg.uuid || this.generateUUID(),
          timestamp: msg.timestamp,
          humanMessage: this.extractFallbackUserMessage(msg),
          assistantMessage: null,
          toolCalls: [],
          toolResults: []
        };
      }
      
      // Handle user turn end (new format)
      else if (msg.type === 'human_turn_end' && currentExchange) {
        if (msg.content) {
          currentExchange.humanMessage = msg.content;
        }
      }
      
      // Handle assistant messages (both formats)
      else if ((msg.type === 'assistant' && msg.message?.role === 'assistant') ||
               msg.type === 'claude_turn_end') {
        
        if (currentExchange) {
          currentExchange.assistantMessage = this.extractFallbackAssistantMessage(msg);
          
          // Extract tool calls for legacy format
          if (msg.message?.content && Array.isArray(msg.message.content)) {
            const toolCalls = this.extractToolCallsFromContent(msg.message.content);
            currentExchange.toolCalls.push(...toolCalls);
          }
          
          exchanges.push(currentExchange);
          currentExchange = null;
        }
      }
      
      // Handle tool use/results (new format)
      else if (msg.type === 'tool_use' && currentExchange) {
        currentExchange.toolCalls.push({
          id: msg.tool_use_id,
          name: msg.tool_name,
          input: msg.input_json
        });
      }
      else if (msg.type === 'tool_result' && currentExchange) {
        currentExchange.toolResults.push({
          tool_use_id: msg.tool_use_id,
          output: msg.output_json,
          is_error: msg.is_error || false
        });
      }
    }
    
    // Add final exchange
    if (currentExchange) {
      exchanges.push(currentExchange);
    }
    
    return exchanges;
  }

  /**
   * Extract user message for fallback mode
   */
  extractFallbackUserMessage(msg) {
    if (msg.content) return msg.content;
    if (msg.message) return this.extractMessageContent(msg.message);
    return '';
  }

  /**
   * Extract assistant message for fallback mode
   */
  extractFallbackAssistantMessage(msg) {
    if (msg.content) return msg.content;
    if (msg.message) return this.extractMessageContent(msg.message);
    return '';
  }

  /**
   * Generate a UUID for exchanges without one
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get extraction statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.formatCache.size,
      knownFormats: this.detector.knownFormats.size
    };
  }

  debug(message) {
    if (this.config.debug) {
      console.log(`[AdaptiveExtractor] ${message}`);
    }
  }
}

export default AdaptiveExchangeExtractor;