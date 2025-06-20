#!/usr/bin/env node

import CoPilotAdapter from './adapters/copilot.js';

async function startServices() {
  try {
    console.log('Initializing CoPilot fallback services...');
    
    const adapter = new CoPilotAdapter();
    await adapter.initialize();
    
    console.log('✓ All fallback services started successfully');
    console.log('Services running in background...');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\nShutting down fallback services...');
      await adapter.cleanup();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\nShutting down fallback services...');
      await adapter.cleanup();
      process.exit(0);
    });
    
    // Keep alive
    setInterval(() => {}, 1000);
    
  } catch (error) {
    console.error('Failed to start fallback services:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServices();
}

export { startServices };
