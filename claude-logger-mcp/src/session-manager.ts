import { SpecStoryLogger } from './logger.js';
import * as fs from 'fs-extra';
import * as path from 'path';

export class SessionManager {
  private static instance: SessionManager;
  private logger: SpecStoryLogger;
  private currentSessionId: string | null = null;
  private projectPath: string;
  private autoLoggingEnabled: boolean = false;
  private messageQueue: Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: any;
  }> = [];

  private constructor() {
    this.logger = new SpecStoryLogger();
    this.projectPath = process.env.PROJECT_PATH || process.cwd();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateSessionId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${dateStr}_${timeStr}_claude-code`;
  }

  private extractTitle(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      let title = lines[0].trim();
      // Clean up common prefixes
      title = title.replace(/^(please|can you|help me|i need|i want|create|make|build)/i, '').trim();
      // Truncate if too long
      if (title.length > 80) {
        title = title.substring(0, 77) + '...';
      }
      return title || 'Claude Code Session';
    }
    return 'Claude Code Session';
  }

  async enableAutoLogging(): Promise<string> {
    this.autoLoggingEnabled = true;
    
    if (!this.currentSessionId) {
      this.currentSessionId = this.generateSessionId();
      const sessionPath = await this.logger.startSession(
        this.currentSessionId,
        this.projectPath,
        'Auto-logged Claude Code Session'
      );
      
      // Process any queued messages
      await this.processMessageQueue();
      
      return sessionPath;
    }
    
    return path.join(this.projectPath, '.specstory', 'history', `${this.currentSessionId}.md`);
  }

  async disableAutoLogging(): Promise<void> {
    this.autoLoggingEnabled = false;
    
    if (this.currentSessionId) {
      await this.logger.endSession(this.currentSessionId, 'Auto-logging disabled');
      this.currentSessionId = null;
      this.messageQueue = [];
    }
  }

  async queueMessage(type: 'user' | 'assistant', content: string, metadata?: any): Promise<void> {
    this.messageQueue.push({
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata
    });

    // If auto-logging is enabled, process immediately
    if (this.autoLoggingEnabled) {
      await this.processMessageQueue();
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (!this.currentSessionId || this.messageQueue.length === 0) {
      return;
    }

    // Look for user-assistant pairs
    while (this.messageQueue.length >= 2) {
      const userMsg = this.messageQueue.find(m => m.type === 'user');
      const assistantMsg = this.messageQueue.find(m => m.type === 'assistant');

      if (userMsg && assistantMsg) {
        // If this is the first exchange, update the session title
        if (this.currentSessionId && userMsg === this.messageQueue[0]) {
          const title = this.extractTitle(userMsg.content);
          // Update session title by re-reading and modifying the file
          const sessionFile = path.join(
            this.projectPath,
            '.specstory',
            'history',
            `${this.currentSessionId}.md`
          );
          
          if (await fs.pathExists(sessionFile)) {
            let content = await fs.readFile(sessionFile, 'utf-8');
            content = content.replace(
              /# Claude Code Session \([^)]+\)/,
              `# ${title} (${new Date().toISOString().split('T')[0]})`
            );
            await fs.writeFile(sessionFile, content);
          }
        }

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

        // Remove processed messages
        this.messageQueue = this.messageQueue.filter(
          m => m !== userMsg && m !== assistantMsg
        );
      } else {
        // No complete pair found, wait for more messages
        break;
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

  isAutoLoggingEnabled(): boolean {
    return this.autoLoggingEnabled;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  async endCurrentSession(summary?: string): Promise<void> {
    if (this.currentSessionId) {
      await this.logger.endSession(this.currentSessionId, summary);
      this.currentSessionId = null;
      this.messageQueue = [];
    }
  }
}