#!/usr/bin/env node

/**
 * Auto-logging MCP Server for Claude Code
 * 
 * This server automatically logs all conversations to .specstory/history
 * without requiring manual tool calls.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { SpecStoryLogger } from './logger.js';
import * as fs from 'fs-extra';
import * as path from 'path';

interface ConversationMetadata {
  timestamp?: string;
  model?: string;
  tools_used?: string[];
  project_path?: string;
  branch?: string;
}

// Global state for auto-logging
const projectPath = process.env.PROJECT_PATH || process.cwd();
const logger = new SpecStoryLogger();
let currentSessionId: string | null = null;
let conversationBuffer: Array<{type: 'user' | 'assistant', content: string, timestamp: string}> = [];

// Generate session ID based on timestamp
function generateSessionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${dateStr}_${timeStr}_claude-code`;
}

// Extract a title from the first user message
function extractTitle(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    let title = lines[0].trim();
    // Remove common prefixes
    title = title.replace(/^(please|can you|help me|i need|i want)/i, '').trim();
    // Truncate if too long
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }
    return title || 'Claude Code Session';
  }
  return 'Claude Code Session';
}

const server = new Server(
  {
    name: 'claude-logger-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// Auto-logging tool that's called by Claude Code
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'auto_log_exchange',
        description: 'Automatically log conversation exchange (used internally)',
        inputSchema: {
          type: 'object',
          properties: {
            user_message: {
              type: 'string',
              description: 'The user message',
            },
            assistant_message: {
              type: 'string', 
              description: 'The assistant response',
            },
            tools_used: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tools used in this exchange',
            },
          },
          required: ['user_message', 'assistant_message'],
        },
      },
      {
        name: 'toggle_auto_logging',
        description: 'Enable or disable automatic conversation logging',
        inputSchema: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Whether to enable auto-logging',
            },
          },
          required: ['enabled'],
        },
      },
    ],
  };
});

// Intercept all messages to capture conversations
const originalSetRequestHandler = server.setRequestHandler.bind(server);

// Track recent messages
let recentUserMessage: string | null = null;
let recentAssistantMessage: string | null = null;
let recentToolsUsed: string[] = [];

// Override setRequestHandler to intercept all requests
server.setRequestHandler = function(schema: any, handler: any) {
  return originalSetRequestHandler(schema, async (request: any) => {
    // Log request details for debugging
    if (process.env.DEBUG_LOGGING) {
      console.error('Request:', JSON.stringify(request, null, 2));
    }
    
    // Track tool usage
    if (request.method === 'tools/call' && request.params?.name) {
      recentToolsUsed.push(request.params.name);
    }
    
    // Call original handler
    const result = await handler(request);
    
    // Log response for debugging
    if (process.env.DEBUG_LOGGING) {
      console.error('Response:', JSON.stringify(result, null, 2));
    }
    
    return result;
  });
};

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
  }

  try {
    switch (name) {
      case 'auto_log_exchange':
        // Start session if needed
        if (!currentSessionId) {
          currentSessionId = generateSessionId();
          const title = extractTitle(args.user_message as string);
          await logger.startSession(currentSessionId, projectPath, title);
        }

        // Log the conversation
        await logger.logConversation(
          currentSessionId,
          args.user_message as string,
          args.assistant_message as string,
          {
            timestamp: new Date().toISOString(),
            model: 'claude-opus-4-20250514',
            tools_used: args.tools_used as string[],
            project_path: projectPath,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: 'Exchange logged successfully',
            },
          ],
        };

      case 'toggle_auto_logging':
        const enabled = args.enabled as boolean;
        if (!enabled && currentSessionId) {
          await logger.endSession(currentSessionId, 'Session ended by user');
          currentSessionId = null;
        }
        return {
          content: [
            {
              type: 'text',
              text: `Auto-logging ${enabled ? 'enabled' : 'disabled'}`,
            },
          ],
        };

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Start initial session
  currentSessionId = generateSessionId();
  await logger.startSession(currentSessionId, projectPath, 'Auto-logged Claude Code Session');
  
  console.error('Claude Logger MCP server running with automatic logging enabled');
  console.error(`Logging to: ${projectPath}/.specstory/history/`);
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  if (currentSessionId) {
    await logger.endSession(currentSessionId, 'Session ended');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (currentSessionId) {
    await logger.endSession(currentSessionId, 'Session ended');
  }
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});