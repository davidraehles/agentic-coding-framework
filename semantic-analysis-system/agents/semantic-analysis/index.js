/**
 * Semantic Analysis Agent
 * Main agent for semantic analysis of code, conversations, and patterns
 */

import { BaseAgent } from '../../framework/base-agent.js';
import { ClaudeProvider } from './providers/claude-provider.js';
import { OpenAIProvider } from './providers/openai-provider.js';
import { CodeAnalyzer } from './analyzers/code-analyzer.js';
import { EventTypes } from '../../infrastructure/events/event-types.js';
import { Logger } from '../../shared/logger.js';

export class SemanticAnalysisAgent extends BaseAgent {
  constructor(config) {
    super({
      id: 'semantic-analysis',
      ...config
    });
    
    this.llmProvider = null;
    this.fallbackProvider = null;
    this.codeAnalyzer = null;
    this.analysisCache = new Map();
  }

  async onInitialize() {
    this.logger.info('Initializing Semantic Analysis Agent...');
    
    // Initialize LLM providers
    await this.initializeLLMProviders();
    
    // Initialize analyzers
    this.codeAnalyzer = new CodeAnalyzer(this.llmProvider, this.config.analysis);
    
    // Register request handlers
    this.registerRequestHandlers();
    
    // Subscribe to events
    await this.subscribeToEvents();
    
    this.logger.info('Semantic Analysis Agent initialized successfully');
  }

  async initializeLLMProviders() {
    const llmConfig = this.config.llm || {};
    
    // Runtime API key validation - check if ANY API keys are available
    const hasAnthropicKey = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key');
    const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key');
    const hasCustomOpenAIKey = !!(process.env.OPENAI_BASE_URL || llmConfig.openai?.baseURL);
    
    if (!hasAnthropicKey && !hasOpenAIKey && !hasCustomOpenAIKey) {
      this.logger.warn('⚠️  No LLM API keys available - will fallback to standalone UKB-cli mode');
      this.llmProvider = null;
      this.fallbackProvider = null;
      this.useFallbackMode = true;
      return;
    }
    
    this.useFallbackMode = false;
    
    try {
      // Initialize primary provider with runtime validation
      if (llmConfig.primary === 'claude' && hasAnthropicKey) {
        this.llmProvider = new ClaudeProvider(llmConfig.claude);
      } else if ((llmConfig.primary === 'openai' || llmConfig.primary === 'custom-openai') && (hasOpenAIKey || hasCustomOpenAIKey)) {
        this.llmProvider = new OpenAIProvider(llmConfig.openai);
      } else {
        // Primary provider not available, try alternatives
        if (hasAnthropicKey) {
          this.llmProvider = new ClaudeProvider(llmConfig.claude);
          this.logger.info('🔄 Using Claude as primary (original primary not available)');
        } else if (hasOpenAIKey || hasCustomOpenAIKey) {
          this.llmProvider = new OpenAIProvider(llmConfig.openai);
          this.logger.info('🔄 Using OpenAI as primary (original primary not available)');
        }
      }
      
      if (this.llmProvider && this.llmProvider.validateConfig()) {
        this.logger.info(`✅ Primary LLM provider initialized: ${this.llmProvider.constructor.name}`);
      } else {
        throw new Error('Primary LLM provider validation failed');
      }
      
      // Initialize fallback provider
      if (hasAnthropicKey && !(this.llmProvider instanceof ClaudeProvider)) {
        try {
          this.fallbackProvider = new ClaudeProvider(llmConfig.claude);
          if (this.fallbackProvider.validateConfig()) {
            this.logger.info('✅ Fallback LLM provider initialized: Claude');
          } else {
            this.fallbackProvider = null;
          }
        } catch (error) {
          this.logger.warn('Failed to initialize Claude fallback:', error.message);
          this.fallbackProvider = null;
        }
      } else if ((hasOpenAIKey || hasCustomOpenAIKey) && !(this.llmProvider instanceof OpenAIProvider)) {
        try {
          this.fallbackProvider = new OpenAIProvider(llmConfig.openai);
          if (this.fallbackProvider.validateConfig()) {
            this.logger.info('✅ Fallback LLM provider initialized: OpenAI');
          } else {
            this.fallbackProvider = null;
          }
        } catch (error) {
          this.logger.warn('Failed to initialize OpenAI fallback:', error.message);
          this.fallbackProvider = null;
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize LLM providers:', error);
      this.logger.warn('🔄 Falling back to standalone UKB-cli mode');
      this.llmProvider = null;
      this.fallbackProvider = null;
      this.useFallbackMode = true;
    }
  }

  /**
   * Perform analysis with runtime fallback handling
   */
  async performAnalysis(type, data) {
    if (this.useFallbackMode) {
      return await this.performFallbackAnalysis(type, data);
    }
    
    try {
      // Try primary provider
      if (this.llmProvider) {
        return await this.llmProvider.analyze(type, data);
      }
    } catch (error) {
      this.logger.warn(`Primary provider failed, trying fallback: ${error.message}`);
      
      // Try fallback provider
      if (this.fallbackProvider) {
        try {
          return await this.fallbackProvider.analyze(type, data);
        } catch (fallbackError) {
          this.logger.warn(`Fallback provider also failed: ${fallbackError.message}`);
        }
      }
      
      // Both providers failed, fall back to UKB-cli
      this.logger.warn('🔄 All LLM providers failed, falling back to standalone UKB-cli mode');
      return await this.performFallbackAnalysis(type, data);
    }
  }

  /**
   * Fallback analysis using standalone UKB-cli (when no API keys available)
   */
  async performFallbackAnalysis(type, data) {
    this.logger.info('🛠️  Using standalone UKB-cli fallback mode');
    
    // Import UKB integration for standalone operation
    const { UkbIntegration } = await import('../knowledge-graph/integrations/ukb-integration.js');
    
    try {
      const ukbIntegration = new UkbIntegration({
        ukbPath: process.env.CODING_TOOLS_PATH + '/bin/ukb',
        sharedMemoryPath: process.env.CODING_TOOLS_PATH + '/shared-memory-coding.json'
      });
      
      // Convert analysis request to UKB format
      const ukbData = this.convertToUkbFormat(type, data);
      
      // Execute UKB command
      const result = await ukbIntegration.syncEntity(ukbData);
      
      return {
        success: true,
        result: result,
        fallbackMode: true,
        message: 'Analysis completed using standalone UKB-cli (no LLM API keys available)'
      };
      
    } catch (error) {
      this.logger.error('Fallback UKB analysis failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackMode: true,
        message: 'Analysis failed - no LLM providers available and UKB fallback failed'
      };
    }
  }

  /**
   * Convert analysis data to UKB format for fallback mode
   */
  convertToUkbFormat(type, data) {
    const timestamp = new Date().toISOString();
    
    return {
      name: `${type}_${timestamp.replace(/[:.]/g, '-')}`,
      entityType: 'FallbackAnalysis',
      significance: 5,
      observations: [
        `Analysis type: ${type}`,
        `Data preview: ${JSON.stringify(data).substring(0, 200)}...`,
        `Processed in fallback mode (no LLM API keys available)`,
        `Timestamp: ${timestamp}`
      ],
      metadata: {
        source: 'semantic-analysis-fallback',
        analysisType: type,
        fallbackMode: true,
        created: timestamp
      }
    };
  }

  registerRequestHandlers() {
    // Code analysis
    this.registerRequestHandler(EventTypes.CODE_ANALYSIS_REQUESTED, 
      this.handleCodeAnalysisRequest.bind(this));
    
    // Conversation analysis
    this.registerRequestHandler(EventTypes.CONVERSATION_ANALYSIS_REQUESTED,
      this.handleConversationAnalysisRequest.bind(this));
    
    // General analysis
    this.registerRequestHandler(EventTypes.ANALYSIS_REQUESTED,
      this.handleAnalysisRequest.bind(this));
    
    // Pattern extraction
    this.registerRequestHandler('semantic/extract-patterns',
      this.handlePatternExtractionRequest.bind(this));
    
    // Significance scoring
    this.registerRequestHandler('semantic/score-significance',
      this.handleSignificanceScoringRequest.bind(this));
  }

  async subscribeToEvents() {
    // Subscribe to git commit events
    await this.subscribe('git/commit/new', this.handleNewCommit.bind(this));
    
    // Subscribe to general analysis requests
    await this.subscribe('analysis/#', (data, topic) => {
      this.logger.debug(`Received analysis event: ${topic}`);
    });
  }

  async handleCodeAnalysisRequest(data) {
    try {
      this.logger.info('Processing code analysis request:', data);
      
      const { repository, depth = 10, branch = 'main', significanceThreshold = 7 } = data;
      
      if (!repository) {
        throw new Error('Repository path is required for code analysis');
      }
      
      // Check cache first
      const cacheKey = `code:${repository}:${depth}:${branch}`;
      const cached = this.analysisCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
        this.logger.debug('Returning cached code analysis result');
        return cached.result;
      }
      
      const startTime = Date.now();
      
      // Publish progress event
      await this.publish(EventTypes.ANALYSIS_PROGRESS, {
        requestId: data.requestId,
        status: 'analyzing',
        message: 'Analyzing repository commits...'
      });
      
      const result = await this.codeAnalyzer.analyzeRecentCommits(repository, {
        numCommits: depth,
        branch,
        significanceThreshold
      });
      
      const duration = Date.now() - startTime;
      
      // Cache the result
      this.analysisCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      // Publish completion event
      await this.publish(EventTypes.CODE_ANALYSIS_COMPLETED, {
        requestId: data.requestId,
        result,
        duration,
        status: 'completed'
      });
      
      this.logger.info(`Code analysis completed in ${duration}ms`);
      return result;
      
    } catch (error) {
      this.logger.error('Code analysis failed:', error);
      
      await this.publish(EventTypes.ANALYSIS_FAILED, {
        requestId: data.requestId,
        error: error.message,
        status: 'failed'
      });
      
      throw error;
    }
  }

  async handleConversationAnalysisRequest(data) {
    try {
      this.logger.info('Processing conversation analysis request:', data);
      
      const { conversationPath, extractInsights = true } = data;
      
      if (!conversationPath) {
        throw new Error('Conversation path is required');
      }
      
      const startTime = Date.now();
      
      await this.publish(EventTypes.ANALYSIS_PROGRESS, {
        requestId: data.requestId,
        status: 'analyzing',
        message: 'Analyzing conversation content...'
      });
      
      const result = await this.analyzeConversation(conversationPath, { extractInsights });
      
      const duration = Date.now() - startTime;
      
      await this.publish(EventTypes.CONVERSATION_ANALYSIS_COMPLETED, {
        requestId: data.requestId,
        result,
        duration,
        status: 'completed'
      });
      
      this.logger.info(`Conversation analysis completed in ${duration}ms`);
      return result;
      
    } catch (error) {
      this.logger.error('Conversation analysis failed:', error);
      
      await this.publish(EventTypes.ANALYSIS_FAILED, {
        requestId: data.requestId,
        error: error.message,
        status: 'failed'
      });
      
      throw error;
    }
  }

  async handleAnalysisRequest(data) {
    const { analysisType } = data;
    
    switch (analysisType) {
      case 'code':
        return await this.handleCodeAnalysisRequest(data.params);
      case 'conversation':
        return await this.handleConversationAnalysisRequest(data.params);
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  }

  async handlePatternExtractionRequest(data) {
    try {
      const { content, patterns, options = {} } = data;
      
      const result = await this.extractPatterns(content, patterns, options);
      
      await this.publish('semantic/patterns/extracted', {
        requestId: data.requestId,
        patterns: result,
        status: 'completed'
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Pattern extraction failed:', error);
      throw error;
    }
  }

  async handleSignificanceScoringRequest(data) {
    try {
      const { content, context = {} } = data;
      
      const score = await this.scoreSignificance(content, context);
      
      await this.publish('semantic/significance/scored', {
        requestId: data.requestId,
        score,
        status: 'completed'
      });
      
      return score;
      
    } catch (error) {
      this.logger.error('Significance scoring failed:', error);
      throw error;
    }
  }

  async handleNewCommit(data) {
    try {
      const { repository, commitHash } = data;
      
      this.logger.debug(`Analyzing new commit: ${commitHash}`);
      
      // Analyze the commit
      const analysis = await this.codeAnalyzer.analyzeCommit(repository, { hash: commitHash });
      
      // If significant, publish pattern detected event
      if (analysis.significance >= this.config.analysis?.significanceThreshold || 7) {
        await this.publish(EventTypes.PATTERN_DETECTED, {
          type: 'commit-analysis',
          repository,
          commit: commitHash,
          analysis,
          significance: analysis.significance
        });
      }
      
    } catch (error) {
      this.logger.error(`Failed to analyze new commit ${data.commitHash}:`, error);
    }
  }

  async analyzeConversation(conversationPath, options = {}) {
    const fs = await import('fs/promises');
    
    try {
      const content = await fs.readFile(conversationPath, 'utf8');
      
      const prompt = this.buildConversationAnalysisPrompt(options);
      const analysis = await this.analyzeWithFallback(prompt, content, {
        analysisType: 'conversation',
        maxTokens: 3000
      });
      
      let insights = [];
      if (options.extractInsights) {
        insights = await this.extractInsights(analysis);
      }
      
      return {
        conversationPath,
        analysis,
        insights,
        significance: await this.scoreSignificance(content, { type: 'conversation' }),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.logger.error('Conversation analysis failed:', error);
      throw error;
    }
  }

  buildConversationAnalysisPrompt(options) {
    return `Analyze this conversation for technical insights, decisions, and patterns.

Focus on:
1. Key technical decisions made
2. Problem-solution patterns discussed
3. Architectural considerations
4. Learning outcomes and insights
5. Actionable recommendations
6. Technology mentions and evaluations

Extract:
- Main topics and themes
- Decision rationales
- Technical patterns
- Future implications
- Knowledge transfer value

Provide structured analysis with clear categorization of insights.`;
  }

  async extractPatterns(content, patterns, options = {}) {
    return await this.analyzeWithFallback(
      `Extract the following patterns: ${patterns.join(', ')}`,
      content,
      { analysisType: 'pattern-extraction', ...options }
    );
  }

  async extractInsights(analysis) {
    return await this.llmProvider.generateInsights(analysis, {
      maxInsights: 5,
      minSignificance: 6
    });
  }

  async scoreSignificance(content, context = {}) {
    return await this.analyzeWithFallback(
      'Score the significance of this content',
      content,
      { analysisType: 'significance-scoring', context }
    );
  }

  async analyzeWithFallback(prompt, content, options = {}) {
    try {
      return await this.llmProvider.analyze(prompt, content, options);
    } catch (error) {
      this.logger.warn('Primary LLM provider failed, trying fallback:', error.message);
      
      if (this.fallbackProvider) {
        try {
          return await this.fallbackProvider.analyze(prompt, content, options);
        } catch (fallbackError) {
          this.logger.error('Fallback LLM provider also failed:', fallbackError.message);
          throw new Error(`Both primary and fallback LLM providers failed: ${error.message} | ${fallbackError.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  getCapabilities() {
    return [
      'code-analysis',
      'conversation-analysis',
      'pattern-extraction',
      'significance-scoring',
      'commit-analysis',
      'file-analysis',
      'insight-generation'
    ];
  }

  getMetadata() {
    return {
      llmProvider: this.llmProvider?.getInfo(),
      fallbackProvider: this.fallbackProvider?.getInfo(),
      cacheSize: this.analysisCache.size,
      config: this.config
    };
  }

  async onStop() {
    // Clear cache
    this.analysisCache.clear();
    
    this.logger.info('Semantic Analysis Agent stopped');
  }
}