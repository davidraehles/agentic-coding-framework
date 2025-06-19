#!/usr/bin/env node
/**
 * UKB CLI Wrapper - Delegates to the Knowledge API CLI
 * 
 * Simple wrapper that calls the proper Knowledge API CLI implementation
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the actual CLI implementation
const cliPath = path.join(__dirname, '..', 'lib', 'knowledge-api', 'cli.js');

// Forward all arguments to the real CLI
const args = process.argv.slice(2);

// Spawn the actual CLI process from the main coding directory
const child = spawn('node', [cliPath, ...args], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')  // Run from coding directory, not knowledge-api
});

// Forward exit code
child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
child.on('error', (error) => {
  console.error('Failed to start UKB CLI:', error.message);
  process.exit(1);
});