#!/bin/bash

# Stop semantic-analysis agent system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SEMANTIC_ANALYSIS_DIR="$PROJECT_DIR/semantic-analysis-system"

log() {
  echo "[Semantic-Analysis] $1"
}

if [ -f "$SEMANTIC_ANALYSIS_DIR/.agent.pid" ]; then
  PID=$(cat "$SEMANTIC_ANALYSIS_DIR/.agent.pid")
  if kill -0 $PID 2>/dev/null; then
    log "Stopping agent system (PID: $PID)..."
    kill $PID
    rm "$SEMANTIC_ANALYSIS_DIR/.agent.pid"
    log "Agent system stopped"
  else
    log "Agent system not running (stale PID file)"
    rm "$SEMANTIC_ANALYSIS_DIR/.agent.pid"
  fi
else
  # Try to find by process name
  PIDS=$(pgrep -f "semantic-analysis-system/index.js")
  if [ -n "$PIDS" ]; then
    log "Stopping agent system processes..."
    kill $PIDS
    log "Agent system stopped"
  else
    log "Agent system not running"
  fi
fi