import { Transform } from 'stream';
import { AutoLogger } from './auto-logger.js';

export class StdioInterceptor {
  private autoLogger: AutoLogger;
  private incomingBuffer: string = '';
  private outgoingBuffer: string = '';

  constructor(autoLogger: AutoLogger) {
    this.autoLogger = autoLogger;
  }

  createInputInterceptor(): Transform {
    return new Transform({
      transform: async (chunk, encoding, callback) => {
        const data = chunk.toString();
        this.incomingBuffer += data;

        // Try to parse complete JSON-RPC messages
        const messages = this.extractJsonRpcMessages(this.incomingBuffer);
        
        for (const msg of messages.complete) {
          await this.processIncomingMessage(msg);
        }
        
        this.incomingBuffer = messages.remaining;

        // Pass through unchanged
        callback(null, chunk);
      }
    });
  }

  createOutputInterceptor(): Transform {
    return new Transform({
      transform: async (chunk, encoding, callback) => {
        const data = chunk.toString();
        this.outgoingBuffer += data;

        // Try to parse complete JSON-RPC messages
        const messages = this.extractJsonRpcMessages(this.outgoingBuffer);
        
        for (const msg of messages.complete) {
          await this.processOutgoingMessage(msg);
        }
        
        this.outgoingBuffer = messages.remaining;

        // Pass through unchanged
        callback(null, chunk);
      }
    });
  }

  private extractJsonRpcMessages(buffer: string): { complete: any[], remaining: string } {
    const messages: any[] = [];
    let remaining = buffer;

    // Look for Content-Length headers (JSON-RPC over stdio format)
    const headerRegex = /Content-Length: (\d+)\r?\n\r?\n/;
    
    while (true) {
      const match = remaining.match(headerRegex);
      if (!match) break;

      const contentLength = parseInt(match[1]);
      const headerEnd = match.index! + match[0].length;
      const messageEnd = headerEnd + contentLength;

      if (remaining.length < messageEnd) break;

      const jsonStr = remaining.substring(headerEnd, messageEnd);
      
      try {
        const message = JSON.parse(jsonStr);
        messages.push(message);
        remaining = remaining.substring(messageEnd);
      } catch (e) {
        // Invalid JSON, skip this chunk
        break;
      }
    }

    return { complete: messages, remaining };
  }

  private async processIncomingMessage(message: any): Promise<void> {
    // Look for user prompts in tool calls or other message types
    if (message.method === 'tools/call' && message.params?.name) {
      // Extract conversation content from tool calls
      const args = message.params.arguments;
      
      if (args?.user_message) {
        await this.autoLogger.logMessage('user', args.user_message);
      }
    }
    
    // Check for other patterns that might contain user messages
    if (message.method === 'messages/create' && message.params?.messages) {
      for (const msg of message.params.messages) {
        if (msg.role === 'user' && msg.content) {
          await this.autoLogger.logMessage('user', msg.content);
        }
      }
    }
  }

  private async processOutgoingMessage(message: any): Promise<void> {
    // Look for assistant responses
    if (message.result?.content) {
      const content = this.extractTextContent(message.result.content);
      if (content) {
        const toolsUsed = this.extractToolsUsed(message);
        await this.autoLogger.logMessage('assistant', content, {
          tools_used: toolsUsed.length > 0 ? toolsUsed : undefined
        });
      }
    }

    // Also check for text in tool responses
    if (message.result && Array.isArray(message.result.content)) {
      for (const item of message.result.content) {
        if (item.type === 'text' && item.text) {
          await this.autoLogger.logMessage('assistant', item.text);
        }
      }
    }
  }

  private extractTextContent(content: any): string {
    if (typeof content === 'string') return content;
    
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => item.text || item.content || '')
        .join('\n');
    }

    if (content?.text) return content.text;
    if (content?.content) return content.content;

    return '';
  }

  private extractToolsUsed(message: any): string[] {
    const tools: string[] = [];
    
    // Check various places where tool usage might be recorded
    if (message.result?.tool_calls) {
      for (const call of message.result.tool_calls) {
        if (call.name) tools.push(call.name);
      }
    }

    if (message.params?.name) {
      tools.push(message.params.name);
    }

    return [...new Set(tools)]; // Remove duplicates
  }

  async shutdown(): Promise<void> {
    await this.autoLogger.shutdown();
  }
}