#!/bin/bash

# Launch Claude Code with MCP configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODING_REPO="$(dirname "$SCRIPT_DIR")"

log() {
  echo "[Claude] $1"
}

# Use target project directory if specified, otherwise use coding repo
if [ -n "$CODING_PROJECT_DIR" ]; then
  TARGET_PROJECT_DIR="$CODING_PROJECT_DIR"
  log "Target project: $TARGET_PROJECT_DIR"
  log "Coding services from: $CODING_REPO"
else
  TARGET_PROJECT_DIR="$CODING_REPO"
  log "Working in coding repository: $TARGET_PROJECT_DIR"
fi

show_session_reminder() {
  # Check target project directory first
  local target_specstory_dir="$TARGET_PROJECT_DIR/.specstory/history"
  local coding_specstory_dir="$CODING_REPO/.specstory/history"
  
  local latest_session=""
  local session_location=""
  
  # Look for recent sessions in target project
  if [ -d "$target_specstory_dir" ]; then
    latest_session=$(ls -t "$target_specstory_dir"/*.md 2>/dev/null | head -1)
    if [ -n "$latest_session" ]; then
      session_location="target project"
    fi
  fi
  
  # Also check coding repo for comparison
  if [ -d "$coding_specstory_dir" ]; then
    local coding_session=$(ls -t "$coding_specstory_dir"/*.md 2>/dev/null | head -1)
    if [ -n "$coding_session" ]; then
      # Compare timestamps if both exist
      if [ -n "$latest_session" ]; then
        if [ "$coding_session" -nt "$latest_session" ]; then
          latest_session="$coding_session"
          session_location="coding repo"
        fi
      else
        latest_session="$coding_session"
        session_location="coding repo"
      fi
    fi
  fi
  
  if [ -n "$latest_session" ] && [ -f "$latest_session" ]; then
    local session_file=$(basename "$latest_session")
    echo "📋 Latest session log: $session_file ($session_location)"
    echo "💡 Reminder: Ask Claude to read the session log for continuity"
    echo ""
  fi
}

# Check for MCP sync requirement (always from coding repo)
if [ -f "$CODING_REPO/.mcp-sync/sync-required.json" ]; then
  log "MCP memory sync required, will be handled by Claude on startup"
fi

# Load environment configuration (from coding repo)
if [ -f "$CODING_REPO/.env" ]; then
  set -a
  source "$CODING_REPO/.env"
  set +a
fi

if [ -f "$CODING_REPO/.env.ports" ]; then
  set -a
  source "$CODING_REPO/.env.ports"
  set +a
fi

# Start all services using simple startup script
log "Starting coding services for Claude..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  log "Error: Node.js is required but not found in PATH"
  exit 1
fi

# Start services using the simple startup script (from coding repo)
if ! "$CODING_REPO/start-services.sh"; then
  log "Error: Failed to start services"
  exit 1
fi

# Show session summary for continuity
show_session_reminder

# Find MCP config (always from coding repo)
MCP_CONFIG=""
if [ -f "$CODING_REPO/claude-code-mcp-processed.json" ]; then
  MCP_CONFIG="$CODING_REPO/claude-code-mcp-processed.json"
elif [ -f "$HOME/.config/claude/claude_desktop_config.json" ]; then
  MCP_CONFIG="$HOME/.config/claude/claude_desktop_config.json"
elif [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
  MCP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
fi

if [ -z "$MCP_CONFIG" ]; then
  log "Warning: No MCP configuration found. Some features may not work."
  log "Run './install.sh' to configure MCP servers."
fi

# Set environment variables
export CODING_AGENT="claude"
export CODING_TOOLS_PATH="$CODING_REPO"
export CODING_TARGET_PROJECT="$TARGET_PROJECT_DIR"

# Change to target project directory before launching Claude
cd "$TARGET_PROJECT_DIR"
log "Changed working directory to: $(pwd)"

# Launch Claude with MCP config
if [ -n "$MCP_CONFIG" ]; then
  log "Using MCP config: $MCP_CONFIG"
  exec "$CODING_REPO/bin/claude-mcp" "$@"
else
  log "Launching Claude without MCP config"
  exec claude "$@"
fi