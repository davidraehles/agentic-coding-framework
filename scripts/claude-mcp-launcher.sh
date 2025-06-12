#!/bin/bash
# Claude MCP launcher - starts Claude with MCP config and loads shared knowledge

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the coding repo directory from environment or fallback to script location
if [[ -n "$CODING_REPO" ]]; then
    CODING_REPO_DIR="$CODING_REPO"
else
    # Fallback: assume script is in the repo root
    CODING_REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

# Export for Claude Code to know where the knowledge base is
export CODING_KNOWLEDGE_BASE="$CODING_REPO_DIR/shared-memory.json"
export CODING_TOOLS_PATH="$CODING_REPO_DIR"

# Path to the MCP config file
MCP_CONFIG="$CODING_REPO_DIR/claude-code-mcp-processed.json"
SHARED_MEMORY="$CODING_REPO_DIR/shared-memory.json"

# Check if the MCP config file exists
if [[ ! -f "$MCP_CONFIG" ]]; then
    echo "Error: MCP config file not found at $MCP_CONFIG"
    exit 1
fi

# Display startup information
echo -e "${BLUE}🚀 Starting Claude Code with MCP Integration${NC}"
echo -e "${GREEN}📋 MCP Config: $MCP_CONFIG${NC}"

# Check if shared memory exists and show summary
if [[ -f "$SHARED_MEMORY" ]]; then
    entity_count=$(jq '.entities | length' "$SHARED_MEMORY" 2>/dev/null || echo "0")
    relation_count=$(jq '.relations | length' "$SHARED_MEMORY" 2>/dev/null || echo "0")
    echo -e "${GREEN}🧠 Knowledge Base: $entity_count entities, $relation_count relations${NC}"
    
    # Show critical patterns that should be remembered
    echo -e "${YELLOW}📌 Key Patterns Available:${NC}"
    jq -r '.entities[] | select(.entityType == "TransferablePattern" or .entityType == "WorkflowPattern" or .entityType == "TransferableKnowledge") | "  • \(.name)"' "$SHARED_MEMORY" 2>/dev/null | head -10
    
    # Check for critical startup knowledge
    if jq -e '.entities[] | select(.name == "ClaudeCodeStartupPattern")' "$SHARED_MEMORY" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Startup pattern knowledge loaded${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No shared knowledge base found at: $SHARED_MEMORY${NC}"
fi

# Run knowledge sync preparation
SYNC_SCRIPT="$CODING_REPO_DIR/scripts/sync-shared-knowledge.sh"
if [[ -x "$SYNC_SCRIPT" ]]; then
    echo -e "${BLUE}🔄 Preparing shared knowledge sync...${NC}"
    "$SYNC_SCRIPT"
fi

# Create startup sync instructions for Claude
SYNC_INSTRUCTIONS="$CODING_REPO_DIR/.mcp-sync/auto-sync.md"
if [[ -f "$SYNC_INSTRUCTIONS" ]]; then
    echo -e "${GREEN}🔄 MCP memory sync instructions prepared${NC}"
    echo -e "${BLUE}💡 Claude will auto-load knowledge base into MCP memory${NC}"
fi

echo -e "${BLUE}📚 Cross-project knowledge ready${NC}"

# Start automatic conversation logging
LOGGER_SCRIPT="$CODING_REPO_DIR/scripts/start-auto-logger.sh"
if [[ -x "$LOGGER_SCRIPT" ]]; then
    echo -e "${BLUE}🔴 Starting automatic conversation logging...${NC}"
    echo -e "${GREEN}📁 Logs will be saved to appropriate .specstory/history/ directories${NC}"
    echo
    
    # Launch Claude with the logger intercepting streams
    # Pass the current directory, coding repo, and any Claude arguments
    exec "$LOGGER_SCRIPT" "$(pwd)" "$CODING_REPO_DIR" "$@"
else
    echo -e "${YELLOW}⚠️  Auto-logger script not found at: $LOGGER_SCRIPT${NC}"
    echo -e "${YELLOW}⚠️  Conversations will NOT be automatically logged${NC}"
    echo
    
    # Launch Claude without logging
    exec claude --mcp-config "$MCP_CONFIG" "$@"
fi