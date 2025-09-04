#!/usr/bin/env node

/**
 * Test script to demonstrate status line color coding
 * Shows how the status line will appear at different time intervals
 */

function calculateTimeRemaining(sessionTimeRange) {
  if (!sessionTimeRange) return null;
  
  const match = sessionTimeRange.match(/(\d{2})(\d{2})-(\d{2})(\d{2})/);
  if (!match) return null;
  
  const [, startHour, startMin, endHour, endMin] = match;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  
  // Calculate end time for today
  const endTime = new Date();
  endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
  
  // Calculate remaining minutes
  const currentTime = new Date();
  currentTime.setHours(currentHour, currentMin, 0, 0);
  
  const remainingMs = endTime.getTime() - currentTime.getTime();
  const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
  
  return remainingMinutes;
}

function formatSessionDisplay(timeRange, remainingMinutes) {
  let sessionDisplay = `${timeRange}-session`;
  if (remainingMinutes !== null && remainingMinutes <= 5 && remainingMinutes > 0) {
    // Orange warning for last 5 minutes with time display
    sessionDisplay = `🟠${timeRange}-session(${remainingMinutes}min)`;
  } else if (remainingMinutes !== null && remainingMinutes <= 0) {
    // Red if past session end
    sessionDisplay = `🔴${timeRange}-session(ended)`;
  }
  return sessionDisplay;
}

// Test current session
const currentSession = '1230-1330';
const remaining = calculateTimeRemaining(currentSession);

console.log('🧪 Status Line Color Coding Test');
console.log('═'.repeat(40));
console.log();

console.log(`📅 Current Time: ${new Date().toTimeString().split(' ')[0]}`);
console.log(`📋 Current Session: ${currentSession}`);
console.log(`⏱️  Remaining Minutes: ${remaining}`);
console.log();

console.log('🎨 Color Coding Examples:');
console.log('─'.repeat(30));
console.log(`Normal (>5 min):  📋${formatSessionDisplay(currentSession, 10)}`);
console.log(`Warning (≤5 min): 📋${formatSessionDisplay(currentSession, 3)}`);
console.log(`Ended (≤0 min):   📋${formatSessionDisplay(currentSession, -2)}`);
console.log();

console.log(`🔄 Current Status: 🛡️ 8.5 🔍EX 🧠 ✅ 📋${formatSessionDisplay(currentSession, remaining)}`);
console.log();

console.log('💡 The status line will automatically show:');
console.log('   • 🟠 Orange indicator 5 minutes before session end');
console.log('   • 🔴 Red indicator when session has ended');
console.log('   • Minutes remaining in parentheses during warnings');