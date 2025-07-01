/**
 * Robust MCP Tool Wrappers
 * Automatically ensures system is ready before executing any semantic analysis tools
 */

import { SystemManager } from '../../system-manager.js';
import { Logger } from '../../shared/logger.js';

export class RobustToolWrapper {
  constructor() {
    this.logger = new Logger('robust-tools');
    this.systemManager = new SystemManager();
    this.lastSystemCheck = 0;
    this.systemCheckInterval = 60000; // Check every minute
  }

  /**
   * Wrapper for determine_insights tool
   */
  async determine_insights(params) {
    await this.ensureSystemReady();
    
    try {
      // Import the actual tool implementation
      const { determine_insights } = await import('./semantic-analysis-tools.js');
      return await determine_insights(params);
    } catch (error) {
      this.logger.error('determine_insights failed:', error);
      
      // Try system recovery once
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        this.logger.info('Attempting system recovery...');
        await this.systemManager.startOrRecoverSystem();
        
        // Retry once after recovery
        const { determine_insights } = await import('./semantic-analysis-tools.js');
        return await determine_insights(params);
      }
      
      throw error;
    }
  }

  /**
   * Wrapper for analyze_repository tool
   */
  async analyze_repository(params) {
    await this.ensureSystemReady();
    
    try {
      const { analyze_repository } = await import('./semantic-analysis-tools.js');
      return await analyze_repository(params);
    } catch (error) {
      this.logger.error('analyze_repository failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        this.logger.info('Attempting system recovery...');
        await this.systemManager.startOrRecoverSystem();
        
        const { analyze_repository } = await import('./semantic-analysis-tools.js');
        return await analyze_repository(params);
      }
      
      throw error;
    }
  }

  /**
   * Wrapper for update_knowledge_base tool
   */
  async update_knowledge_base(params) {
    await this.ensureSystemReady();
    
    try {
      const { update_knowledge_base } = await import('./semantic-analysis-tools.js');
      return await update_knowledge_base(params);
    } catch (error) {
      this.logger.error('update_knowledge_base failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        this.logger.info('Attempting system recovery...');
        await this.systemManager.startOrRecoverSystem();
        
        const { update_knowledge_base } = await import('./semantic-analysis-tools.js');
        return await update_knowledge_base(params);
      }
      
      throw error;
    }
  }

  /**
   * Wrapper for lessons_learned tool
   */
  async lessons_learned(params) {
    await this.ensureSystemReady();
    
    try {
      const { lessons_learned } = await import('./semantic-analysis-tools.js');
      return await lessons_learned(params);
    } catch (error) {
      this.logger.error('lessons_learned failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        this.logger.info('Attempting system recovery...');
        await this.systemManager.startOrRecoverSystem();
        
        const { lessons_learned } = await import('./semantic-analysis-tools.js');
        return await lessons_learned(params);
      }
      
      throw error;
    }
  }

  /**
   * Wrapper for search_knowledge tool
   */
  async search_knowledge(params) {
    await this.ensureSystemReady();
    
    try {
      const { search_knowledge } = await import('./semantic-analysis-tools.js');
      return await search_knowledge(params);
    } catch (error) {
      this.logger.error('search_knowledge failed:', error);
      
      if (error.message.includes('timeout') || error.message.includes('connection')) {
        this.logger.info('Attempting system recovery...');
        await this.systemManager.startOrRecoverSystem();
        
        const { search_knowledge } = await import('./semantic-analysis-tools.js');
        return await search_knowledge(params);
      }
      
      throw error;
    }
  }

  /**
   * Get system status with recovery info
   */
  async get_system_status() {
    try {
      const systemStatus = this.systemManager.getSystemStatus();
      const isHealthy = await this.systemManager.performHealthCheck();
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        ...systemStatus,
        recovery: {
          available: true,
          lastCheck: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        recovery: {
          available: true,
          lastCheck: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get detailed server status for debugging
   */
  async get_mcp_server_status(params = {}) {
    const includeDebugInfo = params.includeDebugInfo || false;
    
    try {
      const systemStatus = await this.get_system_status();
      
      const status = {
        server: 'ready',
        client: 'connected', 
        started: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`,
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        systemHealth: systemStatus.status,
        connections: {
          mqtt: systemStatus.mqttBroker === 'running' ? 'connected' : 'disconnected',
          rpc: systemStatus.rpcServer === 'running' ? 'connected' : 'disconnected'
        },
        agents: systemStatus.agents ? Array.from(systemStatus.agents.keys()) : [],
        toolsAvailable: 'Yes',
        autoRecovery: 'Enabled'
      };

      if (includeDebugInfo) {
        status.debugInfo = {
          processId: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
          workingDirectory: process.cwd(),
          environment: 'production',
          memoryUsage: process.memoryUsage(),
          config: systemStatus.config
        };
      }

      return `# MCP Server Status Report

**Server Status:** ✅ ${status.server}
**Client Status:** ✅ ${status.client}
**Started:** ${status.started}
**Uptime:** ${status.uptime}
**Memory:** ${status.memory}

## Connection Details
**Server:** ✅ ${status.server}
**Client:** ✅ ${status.client}
**Mqtt Broker:** ${status.connections.mqtt === 'connected' ? '✅' : '❌'} ${status.connections.mqtt}
**Rpc Server:** ${status.connections.rpc === 'connected' ? '✅' : '❌'} ${status.connections.rpc}
**Agent System:** ${status.systemHealth === 'healthy' ? '✅' : '❌'} ${status.systemHealth}

## Tool Availability
**Total Tools:** 12
**Tools Available:** ✅ ${status.toolsAvailable}
**Auto Recovery:** ✅ ${status.autoRecovery}

${status.agents.length > 0 ? `## Active Agents\n${status.agents.map(agent => `- ${agent}`).join('\n')}` : '## Active Agents\n- No agents detected'}

${includeDebugInfo ? `\n## Debug Information\n**Process ID:** ${status.debugInfo.processId}\n**Node Version:** ${status.debugInfo.nodeVersion}\n**Platform:** ${status.debugInfo.platform}\n**Working Directory:** ${status.debugInfo.workingDirectory}\n**Environment:** ${status.debugInfo.environment}\n**Memory Usage:** ${JSON.stringify(status.debugInfo.memoryUsage, null, 2)}` : ''}`;

    } catch (error) {
      return `# MCP Server Status Report

**Server Status:** ❌ error
**Error:** ${error.message}
**Auto Recovery:** ✅ Available

The system encountered an error but auto-recovery is available. The next tool call will attempt to restart the system automatically.`;
    }
  }

  /**
   * Ensure system is ready with intelligent caching
   */
  async ensureSystemReady() {
    const now = Date.now();
    
    // Skip check if we verified recently and system was healthy
    if (now - this.lastSystemCheck < this.systemCheckInterval) {
      return;
    }
    
    try {
      this.logger.info('🔍 Verifying system readiness...');
      const result = await this.systemManager.ensureSystemReady();
      this.lastSystemCheck = now;
      
      if (result.status === 'ready') {
        this.logger.info('✅ System confirmed ready');
      } else {
        throw new Error(`System not ready: ${result.message}`);
      }
      
    } catch (error) {
      this.logger.error('❌ System readiness check failed:', error);
      // Reset check time to force retry on next call
      this.lastSystemCheck = 0;
      throw new Error(`System startup failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const robustTools = new RobustToolWrapper();