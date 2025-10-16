#!/usr/bin/env node

/**
 * Process State Manager Session Cleanup
 *
 * Cleans up a session and terminates all its associated services
 *
 * Usage: psm-session-cleanup.js <sessionId>
 */

import ProcessStateManager from './process-state-manager.js';

const manager = new ProcessStateManager();
const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: psm-session-cleanup.js <sessionId>');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🧹 Cleaning up session: ${sessionId}`);
    const result = await manager.cleanupSession(sessionId);

    if (result.cleaned > 0) {
      console.log(`✅ Cleaned up ${result.cleaned} service(s)`);

      if (result.terminated.length > 0) {
        console.log('   Terminated:');
        result.terminated.forEach(({ name, pid }) => {
          console.log(`   - ${name} (PID: ${pid})`);
        });
      }
    } else {
      console.log('ℹ️  No services to clean up');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
