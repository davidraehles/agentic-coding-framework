import { EventEmitter } from 'events';
import { SpecStoryLogger } from './logger.js';
import * as path from 'path';
import * as os from 'os';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tools_used?: string[];
  };
}

export class AutoLogger extends EventEmitter {
  private logger: SpecStoryLogger;
  private currentSessionId: string | null = null;
  private messageBuffer: Message[] = [];
  private projectPath: string;
  private sessionStartTime: string | null = null;

  constructor(projectPath?: string) {
    super();
    this.logger = new SpecStoryLogger();
    this.projectPath = projectPath || process.env.PROJECT_PATH || process.cwd();
  }

  private generateSessionId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${dateStr}_${timeStr}_auto`;
  }

  private extractFirstLine(content: string): string {
    // Get first meaningful line for session title
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      let firstLine = lines[0].trim();
      // Truncate if too long
      if (firstLine.length > 100) {
        firstLine = firstLine.substring(0, 97) + '...';
      }
      return firstLine;
    }
    return 'Auto-logged session';
  }

  async startNewSession(firstMessage?: string): Promise<void> {
    if (this.currentSessionId) {
      await this.endCurrentSession();
    }

    this.currentSessionId = this.generateSessionId();
    this.sessionStartTime = new Date().toISOString();
    this.messageBuffer = [];

    const title = firstMessage ? this.extractFirstLine(firstMessage) : 'Auto-logged Claude Code session';
    
    await this.logger.startSession(
      this.currentSessionId,
      this.projectPath,
      title
    );
  }

  async endCurrentSession(): Promise<void> {
    if (!this.currentSessionId) return;

    // Generate summary based on conversation
    const messageCount = this.messageBuffer.length;
    const toolsUsed = new Set<string>();
    
    this.messageBuffer.forEach(msg => {
      if (msg.metadata?.tools_used) {
        msg.metadata.tools_used.forEach(tool => toolsUsed.add(tool));
      }
    });

    const summary = `Completed ${messageCount} exchanges. Tools used: ${Array.from(toolsUsed).join(', ') || 'none'}`;
    
    await this.logger.endSession(this.currentSessionId, summary);
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.messageBuffer = [];
  }

  async logMessage(role: 'user' | 'assistant', content: string, metadata?: any): Promise<void> {
    // Start a new session if needed
    if (!this.currentSessionId) {
      await this.startNewSession(role === 'user' ? content : undefined);
    }

    const message: Message = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.messageBuffer.push(message);

    // If we have a pair of user/assistant messages, log them
    if (this.messageBuffer.length >= 2) {
      const userMsg = this.messageBuffer.find(m => m.role === 'user');
      const assistantMsg = this.messageBuffer.find(m => m.role === 'assistant');

      if (userMsg && assistantMsg && this.currentSessionId) {
        await this.logger.logConversation(
          this.currentSessionId,
          userMsg.content,
          assistantMsg.content,
          {
            timestamp: assistantMsg.timestamp,
            model: assistantMsg.metadata?.model || 'claude-opus-4-20250514',
            tools_used: assistantMsg.metadata?.tools_used,
            project_path: this.projectPath,
            branch: await this.getGitBranch()
          }
        );

        // Clear processed messages
        this.messageBuffer = this.messageBuffer.filter(
          m => m !== userMsg && m !== assistantMsg
        );
      }
    }
  }

  private async getGitBranch(): Promise<string | undefined> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('git branch --show-current', {
        cwd: this.projectPath
      });
      
      return stdout.trim();
    } catch {
      return undefined;
    }
  }

  async shutdown(): Promise<void> {
    await this.endCurrentSession();
  }
}