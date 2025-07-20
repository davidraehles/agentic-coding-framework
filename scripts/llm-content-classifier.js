#!/usr/bin/env node

/**
 * LLM-based Content Classifier for Post-Session Logger
 * Uses semantic analysis to determine if content is coding-related
 */

import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';

class LLMContentClassifier {
  constructor() {
    this.claudeAvailable = this.checkClaudeAvailable();
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.customLLMEndpoint = process.env.CUSTOM_LLM_ENDPOINT;
    this.customLLMKey = process.env.CUSTOM_LLM_API_KEY;
  }

  checkClaudeAvailable() {
    try {
      const result = spawnSync('which', ['claude'], { encoding: 'utf8' });
      return result.status === 0 && result.stdout.trim() !== '';
    } catch {
      return false;
    }
  }

  async classifyContent(content) {
    // Extract a sample of the content for classification (first 2000 chars)
    const contentSample = content.substring(0, 2000);
    
    const classificationPrompt = `Analyze this conversation excerpt and determine if it's primarily about the "coding" project's INFRASTRUCTURE (knowledge management tools like ukb/vkb, MCP development, logging systems, semantic analysis systems) or about developing a specific application project.

CODING INFRASTRUCTURE includes:
- ukb, vkb commands and knowledge management
- MCP servers, semantic analysis systems  
- Logging infrastructure, post-session logging
- Knowledge base management, shared-memory files
- The /Agentic/coding repository tools

PROJECT-SPECIFIC includes:
- React/Vue/Angular applications
- Timeline, UI components, web apps
- Database schemas, API development
- Kotlin, Compose Multiplatform apps
- ANY specific business application

Conversation excerpt:
${contentSample}

Respond with ONLY one word: "coding" if this is about coding infrastructure/knowledge tools, or "project" if this is about developing a specific application.`;

    try {
      if (this.claudeAvailable) {
        return await this.classifyWithClaude(classificationPrompt);
      } else if (this.openAIKey) {
        return await this.classifyWithOpenAI(classificationPrompt);
      } else if (this.customLLMEndpoint && this.customLLMKey) {
        return await this.classifyWithCustomLLM(classificationPrompt);
      } else {
        // Fallback to pattern-based detection if no LLM available
        console.warn('⚠️  No LLM available for semantic analysis, using pattern-based fallback');
        return this.fallbackClassification(content);
      }
    } catch (error) {
      console.error('❌ LLM classification failed:', error.message);
      return this.fallbackClassification(content);
    }
  }

  async classifyWithClaude(prompt) {
    return new Promise((resolve, reject) => {
      const claudeProcess = spawn('claude', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      claudeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      claudeProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      claudeProcess.on('close', (code) => {
        if (code === 0) {
          const result = output.trim().toLowerCase();
          resolve(result === 'coding' ? 'coding' : 'project');
        } else {
          reject(new Error(`Claude process exited with code ${code}: ${error}`));
        }
      });

      // Send the prompt to Claude
      claudeProcess.stdin.write(prompt);
      claudeProcess.stdin.end();
    });
  }

  async classifyWithOpenAI(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a classifier that responds with only "coding" or "project".'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            const result = response.choices[0].message.content.trim().toLowerCase();
            resolve(result === 'coding' ? 'coding' : 'project');
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async classifyWithCustomLLM(prompt) {
    // Implementation depends on custom LLM endpoint format
    // This is a template that can be adjusted based on the actual endpoint
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        prompt: prompt,
        max_tokens: 10,
        temperature: 0.1
      });

      const url = new URL(this.customLLMEndpoint);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customLLMKey}`,
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            // Adjust based on actual response format
            const result = (response.text || response.content || '').trim().toLowerCase();
            resolve(result === 'coding' ? 'coding' : 'project');
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  fallbackClassification(content) {
    const lowerContent = content.toLowerCase();
    
    // VERY SPECIFIC coding infrastructure keywords - must be precise
    const codingKeywords = [
      'ukb command', 'vkb command', 'ukb --', 'vkb --',
      'mcp__memory__', 'mcp server', 'semantic-analysis system',
      'post-session-logger', 'claude-mcp command',
      'shared-memory-coding.json', 'knowledge-management/',
      'coding repo', '/agentic/coding', 'ukb.js', 'vkb.js'
    ];
    
    // Count occurrences
    const keywordCount = codingKeywords.reduce((count, keyword) => {
      return count + (lowerContent.split(keyword).length - 1);
    }, 0);
    
    // Require MULTIPLE specific infrastructure keywords to classify as coding
    // This prevents false positives from general programming discussions
    return keywordCount >= 3 ? 'coding' : 'project';
  }
}

// Export for use in other modules
export default LLMContentClassifier;

// CLI usage
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const classifier = new LLMContentClassifier();
  
  // Read content from stdin
  let content = '';
  process.stdin.on('data', (chunk) => {
    content += chunk;
  });
  
  process.stdin.on('end', async () => {
    try {
      const result = await classifier.classifyContent(content);
      console.log(result);
      process.exit(0);
    } catch (error) {
      console.error('Classification failed:', error.message);
      process.exit(1);
    }
  });
}