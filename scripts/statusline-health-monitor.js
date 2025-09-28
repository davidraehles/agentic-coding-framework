#!/usr/bin/env node

/**
 * StatusLine Health Monitor
 * 
 * Aggregates health data from the Global Coding Monitor (GCM) ecosystem and
 * displays real-time status in Claude Code's status line.
 * 
 * Monitors:
 * - Global Coding Monitor (renamed from Global Service Coordinator)
 * - Active project sessions with Enhanced Transcript Monitors
 * - MCP Constraint Monitor (guardrails)
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class StatusLineHealthMonitor {
  constructor(options = {}) {
    this.codingRepoPath = options.codingRepoPath || path.resolve(__dirname, '..');
    this.updateInterval = options.updateInterval || 15000; // 15 seconds
    this.isDebug = options.debug || false;
    
    this.registryPath = path.join(this.codingRepoPath, '.global-service-registry.json');
    this.logPath = path.join(this.codingRepoPath, '.logs', 'statusline-health.log');
    
    this.lastStatus = null;
    this.updateTimer = null;
    
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] [StatusLineHealth] ${message}\n`;
    
    if (this.isDebug || level === 'ERROR') {
      console.log(logEntry.trim());
    }
    
    try {
      fs.appendFileSync(this.logPath, logEntry);
    } catch (error) {
      console.error(`Failed to write log: ${error.message}`);
    }
  }

  /**
   * Get Global Coding Monitor health status
   */
  async getGlobalCodingMonitorHealth() {
    try {
      // Check if coordinator is running via status command
      const { stdout } = await execAsync(`node "${path.join(this.codingRepoPath, 'scripts/global-service-coordinator.js')}" --status`);
      
      // Extract JSON from the output (it may have headers)
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in coordinator response');
      }
      
      const status = JSON.parse(jsonMatch[0]);
      
      if (status.coordinator && status.coordinator.healthy) {
        return {
          status: 'healthy',
          icon: '✅',
          details: `${status.services} services, ${status.projects} projects`
        };
      } else {
        return {
          status: 'unhealthy',
          icon: '🔴',
          details: 'Coordinator unhealthy'
        };
      }
    } catch (error) {
      this.log(`GCM health check error: ${error.message}`, 'DEBUG');
      return {
        status: 'down',
        icon: '❌',
        details: 'Coordinator not responding'
      };
    }
  }

  /**
   * Get active project sessions health
   */
  /**
   * Get active project sessions health
   */
  async getProjectSessionsHealth() {
    const sessions = {};
    
    try {
      // Method 1: Registry-based discovery (preferred when available)
      if (fs.existsSync(this.registryPath)) {
        const registry = JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
        
        for (const [projectName, projectInfo] of Object.entries(registry.projects || {})) {
          const sessionHealth = await this.getProjectSessionHealth(projectName, projectInfo);
          sessions[projectName] = sessionHealth;
        }
      }
      
      // Method 2: Dynamic discovery via Claude transcript files (discovers unregistered sessions)
      const claudeProjectsDir = path.join(process.env.HOME || '/Users/q284340', '.claude', 'projects');
      
      if (fs.existsSync(claudeProjectsDir)) {
        const projectDirs = fs.readdirSync(claudeProjectsDir).filter(dir => dir.startsWith('-Users-q284340-Agentic-'));
        
        for (const projectDir of projectDirs) {
          const projectDirPath = path.join(claudeProjectsDir, projectDir);
          const transcriptFiles = fs.readdirSync(projectDirPath)
            .filter(file => file.endsWith('.jsonl'))
            .map(file => ({
              path: path.join(projectDirPath, file),
              stats: fs.statSync(path.join(projectDirPath, file))
            }))
            .filter(file => Date.now() - file.stats.mtime.getTime() < 3600000) // Active within 1 hour
            .sort((a, b) => b.stats.mtime - a.stats.mtime);
          
          if (transcriptFiles.length > 0) {
            // Extract project name from directory: "-Users-q284340-Agentic-curriculum-alignment" -> "curriculum-alignment"
            const projectName = projectDir.replace(/^-Users-q284340-Agentic-/, '');
            
            // Skip if already found via registry
            if (sessions[projectName]) continue;
            
            // Check if this project has a health file
            const projectPath = `/Users/q284340/Agentic/${projectName}`;
            const healthFile = path.join(projectPath, '.transcript-monitor-health');
            
            if (fs.existsSync(healthFile)) {
              // Has monitor running
              sessions[projectName] = await this.getProjectSessionHealthFromFile(healthFile);
            } else {
              // Active session but no monitor - unmonitored session
              const mostRecent = transcriptFiles[0];
              const age = Date.now() - mostRecent.stats.mtime.getTime();
              
              if (age < 300000) { // Active within 5 minutes
                sessions[projectName] = {
                  status: 'unmonitored',
                  icon: '🟡',
                  details: 'No transcript monitor'
                };
              } else {
                sessions[projectName] = {
                  status: 'inactive',
                  icon: '⚫',
                  details: 'Session idle'
                };
              }
            }
          }
        }
      }
      
      // Method 3: Fallback hardcoded check for known project directories
      const commonProjectDirs = [
        this.codingRepoPath, // Current coding directory
        '/Users/q284340/Agentic/curriculum-alignment',
        '/Users/q284340/Agentic/nano-degree'
      ];
      
      for (const projectDir of commonProjectDirs) {
        const projectName = path.basename(projectDir);
        
        // Skip if already found
        if (sessions[projectName]) continue;
        
        if (fs.existsSync(projectDir)) {
          const healthFile = path.join(projectDir, '.transcript-monitor-health');
          if (fs.existsSync(healthFile)) {
            sessions[projectName] = await this.getProjectSessionHealthFromFile(healthFile);
          }
        }
      }
      
    } catch (error) {
      this.log(`Error getting project sessions: ${error.message}`, 'ERROR');
    }
    
    return sessions;
  }

  /**
   * Generate smart abbreviations for project names
   */
  getProjectAbbreviation(projectName) {
    // Handle common patterns and generate readable abbreviations
    const name = projectName.toLowerCase();
    
    // Known project mappings
    const knownMappings = {
      'coding': 'C',
      'curriculum-alignment': 'CA', 
      'nano-degree': 'ND',
      'curriculum': 'CU',
      'alignment': 'AL',
      'nano': 'N'
    };
    
    // Check for exact match first
    if (knownMappings[name]) {
      return knownMappings[name];
    }
    
    // Smart abbreviation generation
    if (name.includes('-')) {
      // Multi-word projects: take first letter of each word
      const parts = name.split('-');
      return parts.map(part => part.charAt(0).toUpperCase()).join('');
    } else if (name.includes('_')) {
      // Underscore separated: take first letter of each word  
      const parts = name.split('_');
      return parts.map(part => part.charAt(0).toUpperCase()).join('');
    } else if (name.length <= 3) {
      // Short names: just uppercase
      return name.toUpperCase();
    } else {
      // Long single words: take first 2-3 characters intelligently
      if (name.length <= 6) {
        return name.substring(0, 2).toUpperCase();
      } else {
        // For longer words, try to find vowels/consonants pattern
        const consonants = name.match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
        if (consonants.length >= 2) {
          return consonants.slice(0, 2).join('').toUpperCase();
        } else {
          return name.substring(0, 3).toUpperCase();
        }
      }
    }
  }

  /**
   * Get health for a specific project session
   */
  async getProjectSessionHealth(projectName, projectInfo) {
    try {
      const healthFile = path.join(projectInfo.projectPath, '.transcript-monitor-health');
      return await this.getProjectSessionHealthFromFile(healthFile);
    } catch (error) {
      return {
        status: 'unknown',
        icon: '❓',
        details: 'Health check failed'
      };
    }
  }

  /**
   * Get health from a health file
   */
  async getProjectSessionHealthFromFile(healthFile) {
    try {
      if (!fs.existsSync(healthFile)) {
        return {
          status: 'inactive',
          icon: '⚫',
          details: 'No health file'
        };
      }

      const healthData = JSON.parse(fs.readFileSync(healthFile, 'utf8'));
      const age = Date.now() - healthData.timestamp;
      
      // Determine health based on age and status
      if (age < 90000) { // < 90 seconds
        if (healthData.status === 'running' && healthData.streamingActive) {
          return {
            status: 'healthy',
            icon: '🟢',
            details: `${healthData.activity?.exchangeCount || 0} exchanges`
          };
        } else {
          return {
            status: 'warning',
            icon: '🟡',
            details: 'Not streaming'
          };
        }
      } else if (age < 120000) { // 90s - 2min
        return {
          status: 'warning',
          icon: '🟡',
          details: 'Stale health data'
        };
      } else {
        return {
          status: 'unhealthy',
          icon: '🔴',
          details: 'Health data too old'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        icon: '❌',
        details: 'Health file corrupted'
      };
    }
  }

  /**
   * Get MCP Constraint Monitor (guardrails) health
   */
  async getConstraintMonitorHealth() {
    try {
      // Check if constraint monitor is responding
      // Note: This would need to integrate with the actual MCP constraint monitor
      // For now, we'll check if the constraint monitor process is running
      const { stdout } = await execAsync('ps aux | grep "constraint-monitor" | grep -v grep');
      
      if (stdout.trim().length > 0) {
        return {
          status: 'healthy',
          icon: '✅',
          details: 'Guardrails active'
        };
      } else {
        return {
          status: 'inactive',
          icon: '⚫',
          details: 'Guardrails offline'
        };
      }
    } catch (error) {
      return {
        status: 'unknown',
        icon: '❓',
        details: 'Unable to check'
      };
    }
  }

  /**
   * Format status line display
   */
  /**
   * Format status line display
   */
  formatStatusLine(gcmHealth, sessionHealth, constraintHealth) {
    let statusLine = '';
    
    // Global Coding Monitor
    statusLine += `[GCM:${gcmHealth.icon}]`;
    
    // Project Sessions - show individual session statuses with abbreviations
    const sessionEntries = Object.entries(sessionHealth);
    if (sessionEntries.length > 0) {
      const sessionStatuses = sessionEntries
        .map(([projectName, health]) => {
          const abbrev = this.getProjectAbbreviation(projectName);
          return `${abbrev}:${health.icon}`;
        })
        .join(' ');
      statusLine += ` [Sessions: ${sessionStatuses}]`;
    }
    
    // Constraint Monitor
    statusLine += ` [Guards:${constraintHealth.icon}]`;
    
    return statusLine;
  }

  /**
   * Update status line
   */
  async updateStatusLine() {
    try {
      // Gather health data from all components
      const [gcmHealth, sessionHealth, constraintHealth] = await Promise.all([
        this.getGlobalCodingMonitorHealth(),
        this.getProjectSessionsHealth(),
        this.getConstraintMonitorHealth()
      ]);

      // Format status line
      const statusLine = this.formatStatusLine(gcmHealth, sessionHealth, constraintHealth);
      
      // Only update if changed to avoid unnecessary updates
      if (statusLine !== this.lastStatus) {
        this.lastStatus = statusLine;
        
        // Write to status file for Claude Code integration
        const statusFile = path.join(this.codingRepoPath, '.logs', 'statusline-health-status.txt');
        fs.writeFileSync(statusFile, statusLine);
        
        this.log(`Status updated: ${statusLine}`);
        
        // Emit status for any listeners
        if (this.isDebug) {
          console.log('\n' + '='.repeat(80));
          console.log('STATUS LINE UPDATE');
          console.log('='.repeat(80));
          console.log(`Display: ${statusLine}`);
          console.log('\nDetails:');
          console.log(`  GCM: ${gcmHealth.status} - ${gcmHealth.details}`);
          console.log('  Sessions:');
          for (const [project, health] of Object.entries(sessionHealth)) {
            console.log(`    ${project}: ${health.status} - ${health.details}`);
          }
          console.log(`  Constraints: ${constraintHealth.status} - ${constraintHealth.details}`);
          console.log('='.repeat(80) + '\n');
        }
      }
      
    } catch (error) {
      this.log(`Error updating status line: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Start monitoring
   */
  async start() {
    this.log('🚀 Starting StatusLine Health Monitor...');
    
    // Initial update
    await this.updateStatusLine();
    
    // Set up periodic updates
    this.updateTimer = setInterval(() => {
      this.updateStatusLine().catch(error => {
        this.log(`Update error: ${error.message}`, 'ERROR');
      });
    }, this.updateInterval);
    
    this.log(`✅ StatusLine Health Monitor started (update interval: ${this.updateInterval}ms)`);
    
    // Keep process alive
    process.stdin.resume();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    this.log('🛑 StatusLine Health Monitor stopped');
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    this.log('📴 Shutting down StatusLine Health Monitor...');
    this.stop();
    process.exit(0);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const isDebug = args.includes('--debug');
  const isDaemon = args.includes('--daemon');
  
  if (args.includes('--help')) {
    console.log(`
StatusLine Health Monitor

Usage:
  node statusline-health-monitor.js [options]

Options:
  --daemon    Run in daemon mode
  --debug     Enable debug output
  --help      Show this help

The monitor aggregates health data from:
  - Global Coding Monitor (GCM)
  - Active project sessions
  - MCP Constraint Monitor

Status Line Format:
  [GCM:✅] [Sessions: coding:🟢 curriculum-alignment:🟡] [Guards:✅]

Health Indicators:
  🟢 Healthy    🟡 Warning    🔴 Unhealthy    ❌ Failed    ⚫ Inactive
`);
    process.exit(0);
  }

  const monitor = new StatusLineHealthMonitor({
    debug: isDebug
  });

  // Setup signal handlers
  process.on('SIGTERM', () => monitor.gracefulShutdown());
  process.on('SIGINT', () => monitor.gracefulShutdown());

  if (isDaemon) {
    await monitor.start();
  } else {
    // Single update mode
    await monitor.updateStatusLine();
    console.log(`Status: ${monitor.lastStatus}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
}

export default StatusLineHealthMonitor;