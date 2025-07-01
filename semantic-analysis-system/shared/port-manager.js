/**
 * Centralized Port Management System
 * Handles all port allocation, conflict detection, and resolution for the entire system
 */

import net from 'net';
import { spawn } from 'child_process';
import { Logger } from './logger.js';

const logger = new Logger('port-manager');

export class PortManager {
  constructor() {
    // Master port registry - single source of truth
    this.serviceRegistry = {
      'mqtt-broker-tcp': { preferred: 1883, current: null, type: 'listen', service: 'MQTT Broker (TCP)' },
      'mqtt-broker-ws': { preferred: 8883, current: null, type: 'listen', service: 'MQTT Broker (WebSocket)' },
      'json-rpc-server': { preferred: 8081, current: null, type: 'listen', service: 'JSON-RPC Server' },
      'mcp-server': { preferred: 3002, current: null, type: 'stdio', service: 'MCP Server' },
      'monitoring': { preferred: 9090, current: null, type: 'listen', service: 'System Health Monitor' },
      'memory-visualizer': { preferred: 8080, current: null, type: 'listen', service: 'Memory Visualizer' },
      'browser-access': { preferred: 8082, current: null, type: 'listen', service: 'Browser Access' },
      'knowledge-sync': { preferred: 3001, current: null, type: 'connect', service: 'Knowledge Graph Sync' }
    };

    // Port ranges for dynamic allocation
    this.portRanges = {
      system: { start: 8000, end: 8999 },  // System services
      mqtt: { start: 1880, end: 1889 },    // MQTT related
      mcp: { start: 3000, end: 3099 },     // MCP and knowledge services
      monitoring: { start: 9000, end: 9099 } // Monitoring and health
    };

    // Currently allocated ports (to avoid conflicts)
    this.allocatedPorts = new Set();
    
    // Services that are currently running (to kill if needed)
    this.runningServices = new Map();
  }

  /**
   * Initialize the port manager - check current allocations and resolve conflicts
   */
  async initialize() {
    logger.info('Initializing port manager...');

    // Load environment variables
    this.loadEnvironmentPorts();

    // Check all preferred ports for availability
    await this.checkAndResolveConflicts();

    // Update environment variables with resolved ports
    this.updateEnvironmentVariables();

    logger.info('Port manager initialized successfully');
    this.logPortAllocations();
  }

  /**
   * Load port preferences from environment variables
   */
  loadEnvironmentPorts() {
    const envMapping = {
      'mqtt-broker-tcp': 'MQTT_BROKER_PORT',
      'mqtt-broker-ws': 'MQTT_WS_PORT',
      'json-rpc-server': 'JSON_RPC_PORT',
      'mcp-server': 'MCP_SERVER_PORT',
      'monitoring': 'MONITORING_PORT',
      'memory-visualizer': 'MEMORY_VISUALIZER_PORT',
      'browser-access': 'BROWSER_ACCESS_PORT'
    };

    for (const [serviceId, envVar] of Object.entries(envMapping)) {
      if (process.env[envVar]) {
        const port = parseInt(process.env[envVar]);
        if (!isNaN(port)) {
          this.serviceRegistry[serviceId].preferred = port;
        }
      }
    }
  }

  /**
   * Check all services for port conflicts and resolve them
   */
  async checkAndResolveConflicts() {
    logger.info('Checking for port conflicts...');

    for (const [serviceId, config] of Object.entries(this.serviceRegistry)) {
      if (config.type === 'stdio') {
        // STDIO services don't use network ports
        config.current = 'stdio';
        continue;
      }

      const port = config.preferred;
      
      // Check if port is available
      const isAvailable = await this.isPortAvailable(port);
      
      if (isAvailable) {
        // Port is free - allocate it
        config.current = port;
        this.allocatedPorts.add(port);
        logger.info(`Allocated port ${port} for ${config.service}`);
      } else {
        // Port is in use - check if it's our own service
        const processInfo = await this.getPortProcess(port);
        
        if (this.isOurProcess(processInfo, serviceId)) {
          logger.info(`Port ${port} occupied by existing ${config.service} - killing old instance`);
          await this.killPortProcess(port);
          
          // Verify port is now free
          if (await this.isPortAvailable(port)) {
            config.current = port;
            this.allocatedPorts.add(port);
          } else {
            // Still occupied - find alternative
            config.current = await this.findAlternativePort(serviceId, port);
          }
        } else {
          // Port occupied by different service - find alternative
          logger.warn(`Port ${port} occupied by external service (${processInfo?.name || 'unknown'}) - finding alternative`);
          config.current = await this.findAlternativePort(serviceId, port);
        }
      }
    }
  }

  /**
   * Check if a port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      
      server.on('error', () => resolve(false));
    });
  }

  /**
   * Get information about the process using a port
   */
  async getPortProcess(port) {
    return new Promise((resolve) => {
      const lsof = spawn('lsof', ['-ti', `:${port}`]);
      let output = '';

      lsof.stdout.on('data', (data) => {
        output += data.toString();
      });

      lsof.on('close', (code) => {
        if (code === 0 && output.trim()) {
          const pid = output.trim().split('\n')[0];
          // Get process name
          const ps = spawn('ps', ['-p', pid, '-o', 'comm=']);
          let name = '';
          
          ps.stdout.on('data', (data) => {
            name += data.toString();
          });
          
          ps.on('close', () => {
            resolve({ pid: parseInt(pid), name: name.trim() });
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Check if a process belongs to our system
   */
  isOurProcess(processInfo, serviceId) {
    if (!processInfo) return false;
    
    // Check for common process patterns that indicate our services
    const ourPatterns = [
      'node',
      'semantic-analysis',
      'mcp-server',
      'mqtt',
      'jayson'
    ];

    return ourPatterns.some(pattern => 
      processInfo.name.toLowerCase().includes(pattern)
    );
  }

  /**
   * Kill the process using a specific port
   */
  async killPortProcess(port) {
    return new Promise((resolve) => {
      const lsof = spawn('lsof', ['-ti', `:${port}`]);
      let output = '';

      lsof.stdout.on('data', (data) => {
        output += data.toString();
      });

      lsof.on('close', (code) => {
        if (code === 0 && output.trim()) {
          const pids = output.trim().split('\n');
          
          let killed = 0;
          for (const pid of pids) {
            try {
              process.kill(parseInt(pid), 'SIGTERM');
              killed++;
              logger.info(`Killed process ${pid} on port ${port}`);
            } catch (error) {
              logger.warn(`Failed to kill process ${pid}: ${error.message}`);
            }
          }
          
          // Wait a bit for processes to die
          setTimeout(resolve, 1000);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Find an alternative port for a service
   */
  async findAlternativePort(serviceId, preferredPort) {
    const config = this.serviceRegistry[serviceId];
    
    // Determine which port range to use
    let range;
    if (serviceId.includes('mqtt')) range = this.portRanges.mqtt;
    else if (serviceId.includes('mcp') || serviceId.includes('knowledge')) range = this.portRanges.mcp;
    else if (serviceId.includes('monitoring')) range = this.portRanges.monitoring;
    else range = this.portRanges.system;

    // Try ports in range
    for (let port = range.start; port <= range.end; port++) {
      if (this.allocatedPorts.has(port)) continue;
      
      if (await this.isPortAvailable(port)) {
        this.allocatedPorts.add(port);
        logger.info(`Allocated alternative port ${port} for ${config.service} (preferred was ${preferredPort})`);
        return port;
      }
    }

    throw new Error(`No available ports found for ${config.service} in range ${range.start}-${range.end}`);
  }

  /**
   * Update environment variables with resolved ports
   */
  updateEnvironmentVariables() {
    const envMapping = {
      'mqtt-broker-tcp': 'MQTT_BROKER_PORT',
      'mqtt-broker-ws': 'MQTT_WS_PORT',
      'json-rpc-server': 'JSON_RPC_PORT',
      'mcp-server': 'MCP_SERVER_PORT',
      'monitoring': 'MONITORING_PORT',
      'memory-visualizer': 'MEMORY_VISUALIZER_PORT',
      'browser-access': 'BROWSER_ACCESS_PORT'
    };

    for (const [serviceId, envVar] of Object.entries(envMapping)) {
      const port = this.serviceRegistry[serviceId].current;
      if (port && port !== 'stdio') {
        process.env[envVar] = port.toString();
      }
    }

    logger.info('Environment variables updated with resolved ports');
  }

  /**
   * Get port for a specific service
   */
  getPort(serviceId) {
    const config = this.serviceRegistry[serviceId];
    if (!config) {
      throw new Error(`Unknown service: ${serviceId}`);
    }
    return config.current;
  }

  /**
   * Get MQTT broker URL for clients
   */
  getMqttBrokerUrl() {
    const port = this.getPort('mqtt-broker-tcp');
    return `mqtt://localhost:${port}`;
  }

  /**
   * Get JSON-RPC server URL
   */
  getJsonRpcUrl() {
    const port = this.getPort('json-rpc-server');
    return `http://localhost:${port}`;
  }

  /**
   * Register a running service (for cleanup)
   */
  registerRunningService(serviceId, process) {
    this.runningServices.set(serviceId, process);
  }

  /**
   * Log current port allocations
   */
  logPortAllocations() {
    logger.info('Current port allocations:');
    
    for (const [serviceId, config] of Object.entries(this.serviceRegistry)) {
      const status = config.current === config.preferred ? '✅' : '⚠️';
      logger.info(`  ${status} ${config.service}: ${config.current} (${config.type})`);
    }
  }

  /**
   * Cleanup - kill all registered services
   */
  async cleanup() {
    logger.info('Cleaning up running services...');
    
    for (const [serviceId, process] of this.runningServices) {
      try {
        if (process.kill) {
          process.kill('SIGTERM');
          logger.info(`Stopped ${serviceId}`);
        }
      } catch (error) {
        logger.warn(`Failed to stop ${serviceId}: ${error.message}`);
      }
    }
    
    this.runningServices.clear();
  }
}

// Singleton instance
export const portManager = new PortManager();