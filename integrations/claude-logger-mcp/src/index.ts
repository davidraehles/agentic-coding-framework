#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { SpecStoryLogger } from './logger.js';
import { SessionManager } from './session-manager.js';

interface ConversationMetadata {
  timestamp?: string;
  model?: string;
  tools_used?: string[];
  project_path?: string;
  branch?: string;
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

const logger = new SpecStoryLogger();
const sessionManager = SessionManager.getInstance();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'enable_auto_logging',
        description: '🔴 Start automatic logging of all Claude Code conversations to .specstory/history',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'disable_auto_logging',
        description: '⏹️ Stop automatic logging of conversations',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'auto_log_status',
        description: '📊 Check if automatic logging is currently enabled',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'log_message',
        description: 'Queue a message for logging (internal use)',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Message type',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            metadata: {
              type: 'object',
              description: 'Optional metadata',
            },
          },
          required: ['type', 'content'],
        },
      },
      {
        name: 'log_conversation',
        description: 'Manually log a conversation exchange',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Unique identifier for the conversation session',
            },
            user_message: {
              type: 'string',
              description: 'User message content',
            },
            assistant_message: {
              type: 'string',
              description: 'Assistant message content',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata about the conversation',
              properties: {
                timestamp: { type: 'string' },
                model: { type: 'string' },
                tools_used: { type: 'array', items: { type: 'string' } },
                project_path: { type: 'string' },
                branch: { type: 'string' },
              },
            },
          },
          required: ['session_id', 'user_message', 'assistant_message'],
        },
      },
      {
        name: 'start_session',
        description: 'Manually start a new conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Unique identifier for the new session',
            },
            project_path: {
              type: 'string',
              description: 'Path to the project directory',
            },
            title: {
              type: 'string',
              description: 'Optional title for the session',
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'end_session',
        description: 'End a conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session identifier to end',
            },
            summary: {
              type: 'string',
              description: 'Optional summary of the session',
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'list_sessions',
        description: 'List all logged conversation sessions',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of sessions to return (default: 10)',
            },
            project_path: {
              type: 'string',
              description: 'Filter by project path',
            },
          },
        },
      },
      {
        name: 'get_session',
        description: 'Get a specific conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session identifier to retrieve',
            },
          },
          required: ['session_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
  }

  try {
    switch (name) {
      case 'enable_auto_logging':
        const sessionPath = await sessionManager.enableAutoLogging();
        return {
          content: [
            {
              type: 'text',
              text: `🔴 Auto-logging enabled! Conversations will be saved to:\n${sessionPath}\n\nIMPORTANT: You must now call the log_message tool after EACH message exchange to capture conversations.`,
            },
          ],
        };

      case 'disable_auto_logging':
        await sessionManager.disableAutoLogging();
        return {
          content: [
            {
              type: 'text',
              text: '⏹️ Auto-logging disabled. Conversations will no longer be automatically saved.',
            },
          ],
        };

      case 'auto_log_status':
        const isEnabled = sessionManager.isAutoLoggingEnabled();
        const sessionId = sessionManager.getCurrentSessionId();
        return {
          content: [
            {
              type: 'text',
              text: isEnabled 
                ? `📊 Auto-logging is ENABLED\n🆔 Current session: ${sessionId}\n📁 Logs directory: ${process.env.PROJECT_PATH || process.cwd()}/.specstory/history/`
                : '📊 Auto-logging is DISABLED',
            },
          ],
        };

      case 'log_message':
        await sessionManager.queueMessage(
          args.type as 'user' | 'assistant',
          args.content as string,
          args.metadata
        );
        return {
          content: [
            {
              type: 'text',
              text: `Message queued for logging`,
            },
          ],
        };

      case 'log_conversation':
        await logger.logConversation(
          args.session_id as string,
          args.user_message as string,
          args.assistant_message as string,
          args.metadata as ConversationMetadata
        );
        return {
          content: [
            {
              type: 'text',
              text: `Conversation logged for session ${args.session_id}`,
            },
          ],
        };

      case 'start_session':
        const startPath = await logger.startSession(
          args.session_id as string,
          args.project_path as string,
          args.title as string
        );
        return {
          content: [
            {
              type: 'text',
              text: `Session ${args.session_id} started. Log file: ${startPath}`,
            },
          ],
        };

      case 'end_session':
        await logger.endSession(args.session_id as string, args.summary as string);
        return {
          content: [
            {
              type: 'text',
              text: `Session ${args.session_id} ended`,
            },
          ],
        };

      case 'list_sessions':
        const sessions = await logger.listSessions(args.limit as number, args.project_path as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sessions, null, 2),
            },
          ],
        };

      case 'get_session':
        const session = await logger.getSession(args.session_id as string);
        return {
          content: [
            {
              type: 'text',
              text: session || `Session ${args.session_id} not found`,
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
  console.error('Claude Logger MCP server running on stdio');
  console.error('Use enable_auto_logging tool to start automatic conversation logging');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await sessionManager.endCurrentSession('Process interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await sessionManager.endCurrentSession('Process terminated');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});