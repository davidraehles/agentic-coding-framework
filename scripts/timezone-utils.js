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
 * Get time window for local time using full-hour marks (XX:00 - XX+1:00 format)
 * Load session duration from config to support configurable durations
 */
export function getTimeWindow(localDate) {
  const hours = localDate.getHours();
  
  // Load session duration from config (default 60 minutes)
  let sessionDurationMs = 3600000; // 60 minutes default
  try {
    const configPath = '/Users/q284340/Agentic/coding/config/live-logging-config.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      sessionDurationMs = config.live_logging.session_duration || 3600000;
    }
  } catch (error) {
    // Use default duration if config can't be read
  }
  
  const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);
  
  // Use full-hour marks: 10:00-11:00, 11:00-12:00, etc.
  const startHour = hours;
  const endHour = (hours + sessionDurationHours) % 24;
  
  const formatTime = (h) => `${Math.floor(h).toString().padStart(2, '0')}00`;
  
  return `${formatTime(startHour)}-${formatTime(endHour)}`;
}

/**
 * Get short time window format for status line (e.g., "11-12" instead of "1100-1200")
 */
export function getShortTimeWindow(localDate) {
  const hours = localDate.getHours();
  
  // Load session duration from config (default 60 minutes)
  let sessionDurationMs = 3600000; // 60 minutes default
  try {
    const configPath = '/Users/q284340/Agentic/coding/config/live-logging-config.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      sessionDurationMs = config.live_logging.session_duration || 3600000;
    }
  } catch (error) {
    // Use default duration if config can't be read
  }
  
  const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);
  
  // Use short format: 11-12, 22-23, etc.
  const startHour = hours;
  const endHour = (hours + sessionDurationHours) % 24;
  
  return `${Math.floor(startHour)}-${Math.floor(endHour)}`;
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

// Export getTimezone as named export
export { getTimezone };

export default {
  getTimezone,
  utcToLocalTime,
  getTimeWindow,
  formatTimestamp,
  parseTimestamp
};