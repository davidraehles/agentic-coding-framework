#!/usr/bin/env node

/**
 * Test script to simulate high API usage and verify statusLine display
 */

import fs from 'fs';
import path from 'path';

// Create temporary large content to simulate high API usage
const historyDir = path.join(process.cwd(), '.specstory/history');
const today = new Date().toISOString().split('T')[0];
const testFile = path.join(historyDir, `${today}_test-high-usage.md`);

// Create large test content (simulate 60% usage)
const largeContent = `# Test High Usage Session

${'## Large Content Block\n'.repeat(100)}
${'This is a test line with substantial content to simulate high API token usage. '.repeat(50)}

${'### More content to reach the threshold\n'.repeat(200)}
${'Additional content to simulate a very active development session with lots of tool interactions and extensive logging. '.repeat(100)}

## Summary
This file simulates high API usage to test the statusLine percentage display.
`.repeat(5);

console.log('Creating test file with large content...');
fs.writeFileSync(testFile, largeContent);
console.log(`Test file size: ${largeContent.length} characters`);

// Now run the status line
import('./combined-status-line.js').then(() => {
  console.log('Status line executed with simulated high usage');
  
  // Cleanup
  setTimeout(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
      console.log('Test file cleaned up');
    }
  }, 2000);
}).catch(err => {
  console.error('Error running status line:', err);
  // Still cleanup
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
});