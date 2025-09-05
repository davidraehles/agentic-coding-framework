#!/usr/bin/env node

/**
 * Timezone Utilities for LSL and Session Logging
 * Single source of truth for timezone handling across all session logging scripts
 */

import fs from 'fs';
import path from 'path';

// Load timezone from central config
function getTimezone() {
  try {
    const envPath = path.join(process.env.CODING_TOOLS_PATH || '/Users/q284340/Agentic/coding', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const timezoneMatch = envContent.match(/TIMEZONE=(.+)/);
      if (timezoneMatch) {
        return timezoneMatch[1];
      }
    }
  } catch (error) {
    console.warn('Could not read timezone from .env, using default:', error.message);
  }
  
  // Default fallback
  return 'Europe/Berlin';
}

/**
 * Convert UTC timestamp to local timezone
 */
export function utcToLocalTime(utcTimestamp, timezone = null) {
  const tz = timezone || getTimezone();
  const utcDate = new Date(utcTimestamp);
  return new Date(utcDate.toLocaleString('en-US', { timeZone: tz }));
}

/**
 * Get time window for local time (XX:30 - XX+1:30 format)
 */
export function getTimeWindow(localDate) {
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  
  // Find the window start (XX:30 format)
  let windowStart;
  if (minutes < 30) {
    // Before XX:30, belongs to previous hour's XX:30 window
    windowStart = (hours - 1) * 60 + 30;
  } else {
    // After XX:30, belongs to this hour's XX:30 window
    windowStart = hours * 60 + 30;
  }
  
  const startHour = Math.floor(windowStart / 60);
  const endHour = Math.floor((windowStart + 60) / 60);
  const startMin = windowStart % 60;
  const endMin = (windowStart + 60) % 60;
  
  const formatTime = (h, m) => `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
  
  return `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
}

/**
 * Format timestamp for display with both UTC and local timezone
 */
export function formatTimestamp(utcTimestamp, timezone = null) {
  const tz = timezone || getTimezone();
  const utcDate = new Date(utcTimestamp);
  const localDate = utcToLocalTime(utcTimestamp, timezone);
  
  // Format UTC
  const utcFormatted = utcDate.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  
  // Format local time
  const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
  const day = localDate.getDate().toString().padStart(2, '0');
  const hours = localDate.getHours().toString().padStart(2, '0');
  const minutes = localDate.getMinutes().toString().padStart(2, '0');
  const tzShort = tz === 'Europe/Berlin' ? 'CEST' : tz.split('/').pop();
  
  const localFormatted = `${month}/${day}/2025, ${hours}:${minutes} ${tzShort}`;
  
  return {
    utc: utcFormatted,
    local: localFormatted,
    combined: `${localFormatted} (${utcFormatted})`
  };
}

/**
 * Parse timestamp and return both UTC and local info
 */
export function parseTimestamp(timestamp, timezone = null) {
  const utcDate = new Date(timestamp);
  const localDate = utcToLocalTime(timestamp, timezone);
  
  return {
    utc: {
      date: utcDate,
      hours: utcDate.getHours(),
      minutes: utcDate.getMinutes()
    },
    local: {
      date: localDate,
      hours: localDate.getHours(),
      minutes: localDate.getMinutes()
    },
    window: getTimeWindow(localDate)
  };
}

export default {
  getTimezone,
  utcToLocalTime,
  getTimeWindow,
  formatTimestamp,
  parseTimestamp
};