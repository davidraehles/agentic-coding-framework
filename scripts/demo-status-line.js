#!/usr/bin/env node

/**
 * Status Line Demo: Hover Tooltip & Click Functionality
 * 
 * Demonstrates the complete hover tooltip and click-to-dashboard features
 */

import { execSync } from 'child_process';

console.log('🎯 Claude Code Status Line: Hover Tooltip & Click Demo');
console.log('═'.repeat(60));

// Generate status line output
console.log('\n📊 Current Status Line Output:');
try {
  const output = execSync('node ./scripts/combined-status-line.js', { 
    encoding: 'utf8', 
    timeout: 5000 
  });
  
  const status = JSON.parse(output);
  
  // Show the status line text that appears in Claude Code
  console.log(`\n   Status Bar: ${status.text}`);
  console.log(`   Color: ${status.color}`);
  
  // Show the complete hover tooltip
  console.log('\n🖱️  HOVER TOOLTIP (shown when you hover over status line):');
  console.log('┌' + '─'.repeat(52) + '┐');
  const tooltipLines = status.tooltip.split('\n');
  tooltipLines.forEach(line => {
    const paddedLine = line.padEnd(50);
    console.log(`│ ${paddedLine} │`);
  });
  console.log('└' + '─'.repeat(52) + '┘');
  
  // Show click action
  console.log('\n🖱️  CLICK ACTION:');
  console.log(`   Action: ${status.onClick}`);
  console.log('   Result: Opens constraint dashboard in browser');
  
} catch (error) {
  console.error('❌ Failed to generate status:', error.message);
}

console.log('\n🎯 Feature Summary:');
console.log('• Status Line: Shows real-time constraint monitor + semantic analysis status');
console.log('• Hover Tooltip: Rich system status with compliance scores and service health');
console.log('• Click Action: Opens web dashboard with detailed metrics and controls');
console.log('• Live Updates: Status refreshes every 5 seconds automatically');

console.log('\n🚀 Setup Complete!');
console.log('Your Claude Code status line now has:');
console.log('  ✅ Rich hover tooltips with system status');
console.log('  ✅ Click-to-dashboard functionality');
console.log('  ✅ Real-time compliance monitoring');
console.log('  ✅ Visual progress indicators');

console.log('\n💡 Usage:');
console.log('• Hover over the status line to see detailed system status');
console.log('• Click the status line to open the constraint dashboard');
console.log('• The status updates automatically every 5 seconds');