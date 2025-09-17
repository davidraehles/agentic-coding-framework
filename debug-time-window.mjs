#!/usr/bin/env node

/**
 * Debug time window calculation for Sept 13 message
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTimestamp, formatTimestamp, getTimeWindow, getTimezone, utcToLocalTime, generateLSLFilename } from './scripts/timezone-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugTimeWindow() {
  console.log('🔍 Debugging time window calculation for Sept 13 message...\n');
  
  const sept13Timestamp = '2025-09-13T06:14:35.337Z';
  console.log(`🎯 Sept 13 timestamp: ${sept13Timestamp}`);
  
  // Test time zone conversion
  const timezone = getTimezone();
  console.log(`🌍 Timezone: ${timezone}`);
  
  const localTime = utcToLocalTime(sept13Timestamp, timezone);
  console.log(`🕐 Local time: ${localTime}`);
  
  // Test time window calculation
  const timeWindow = getTimeWindow(localTime);
  console.log(`⏰ Time window: ${timeWindow}`);
  
  // Test LSL filename generation
  const codingPath = '/Users/q284340/Agentic/coding';
  const sourcePath = '/Users/q284340/Agentic/nano-degree';
  
  console.log('\n📁 Testing LSL filename generation:');
  
  // Test for coding project (foreign mode) - redirected from nano-degree
  const codingFilename = generateLSLFilename(sept13Timestamp, 'g9b30a', codingPath, sourcePath);
  console.log(`   Coding project: ${codingFilename}`);
  
  // Test for source project (all mode) - local file
  const sourceFilename = generateLSLFilename(sept13Timestamp, 'g9b30a', sourcePath, sourcePath);
  console.log(`   Source project: ${sourceFilename}`);
  
  // Show expected file paths
  console.log('\n📂 Expected file paths:');
  const codingFilePath = path.join(codingPath, '.specstory', 'history', codingFilename);
  const sourceFilePath = path.join(sourcePath, '.specstory', 'history', sourceFilename);
  
  console.log(`   Coding: ${codingFilePath}`);
  console.log(`   Source: ${sourceFilePath}`);
  
  // Check if files exist
  console.log('\n🔍 File existence check:');
  console.log(`   Coding file exists: ${fs.existsSync(codingFilePath)}`);
  console.log(`   Source file exists: ${fs.existsSync(sourceFilePath)}`);
  
  // Show what files DO exist for Sept 13
  console.log('\n📋 Actual Sept 13 files in coding:');
  const codingHistoryDir = path.join(codingPath, '.specstory', 'history');
  if (fs.existsSync(codingHistoryDir)) {
    const files = fs.readdirSync(codingHistoryDir);
    const sept13Files = files.filter(f => f.includes('2025-09-13'));
    if (sept13Files.length > 0) {
      sept13Files.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('   (none found)');
    }
  }
  
  console.log('\n📋 Actual Sept 13 files in source:');
  const sourceHistoryDir = path.join(sourcePath, '.specstory', 'history');
  if (fs.existsSync(sourceHistoryDir)) {
    const files = fs.readdirSync(sourceHistoryDir);
    const sept13Files = files.filter(f => f.includes('2025-09-13'));
    if (sept13Files.length > 0) {
      sept13Files.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('   (none found)');
    }
  }
  
  console.log('\n✅ Time window debugging complete');
}

debugTimeWindow().catch(error => {
  console.error('❌ Debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});