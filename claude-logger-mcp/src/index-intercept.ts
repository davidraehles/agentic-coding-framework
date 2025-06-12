#!/usr/bin/env node

/**
 * True Auto-logging MCP Server for Claude Code
 * 
 * This server intercepts stdio streams to automatically log all conversations
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
import { AutoLogger } from './auto-logger.js';
import { StdioInterceptor } from './stdio-interceptor.js';
import * as fs from 'fs-extra';
import * as path from 'path';

// Global state
const projectPath = process.env.PROJECT_PATH || process.cwd();
const autoLogger = new AutoLogger(projectPath);
const stdioInterceptor = new StdioInterceptor(autoLogger);

// Generate session ID based on timestamp
function generateSessionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${dateStr}_${timeStr}_claude-code`;
}

const server = new Server(
  {
    name: 'claude-logger-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Provide minimal tools for status checking
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'auto_log_status',
        description: 'Check automatic logging status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'auto_log_status':
        const sessionId = await autoLogger.getCurrentSessionId();
        return {
          content: [
            {
              type: 'text',
              text: `🔴 Auto-logging is ACTIVE\n🆔 Current session: ${sessionId || 'No active session'}\n📁 Logs directory: ${projectPath}/.specstory/history/`,
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

// Start the server with stdio interception
async function main() {
  console.error('🚀 Starting Claude Logger with true automatic interception...');
  
  // Create intercepted transport
  const originalTransport = new StdioServerTransport();
  
  // Intercept stdin and stdout
  const inputInterceptor = stdioInterceptor.createInputInterceptor();
  const outputInterceptor = stdioInterceptor.createOutputInterceptor();
  
  // Pipe through interceptors
  process.stdin.pipe(inputInterceptor).pipe(originalTransport.input);
  originalTransport.output.pipe(outputInterceptor).pipe(process.stdout);
  
  // Connect server
  await server.connect(originalTransport);
  
  // Start initial session
  await autoLogger.startNewSession('Auto-logged Claude Code Session');
  
  console.error('✅ Claude Logger MCP server running with TRUE automatic logging');
  console.error(`📁 Logging to: ${projectPath}/.specstory/history/`);
  console.error('🔍 Intercepting all stdio streams for automatic capture');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await autoLogger.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await autoLogger.shutdown();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});