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

    # Create startup reminder for Claude
    SYNC_DIR="$CODING_REPO_DIR/.mcp-sync"
    mkdir -p "$SYNC_DIR"
    cat > "$SYNC_DIR/startup-reminder.md" << 'STARTUP_EOF'
# 🚨 CLAUDE CODE STARTUP CHECKLIST 🚨

## MANDATORY FIRST STEPS:

1. **Query MCP Memory for patterns:**
   ```
   mcp__memory__search_nodes("ConditionalLoggingPattern")
   mcp__memory__search_nodes("ReduxStateManagementPattern") 
   mcp__memory__search_nodes("ClaudeCodeStartupPattern")
   ```

2. **Apply patterns immediately:**
   - ❌ NEVER use console.log 
   - ✅ ALWAYS use Logger class
   - ❌ NEVER use local React state
   - ✅ ALWAYS use Redux patterns

3. **Knowledge Management Rules:**
   - ❌ NEVER edit shared-memory.json directly
   - ✅ ALWAYS use: ukb --interactive or ukb --auto
   - ✅ Use vkb to visualize knowledge graph
   - ✅ ukb is in PATH and works from anywhere

4. **Verify logging is working:**
   - Check if today's session is being logged
   - Ensure appropriate .specstory/history location

## ⚠️ FAILURE TO FOLLOW = ARCHITECTURAL MISTAKES ⚠️

STARTUP_EOF

    echo -e "${YELLOW}📋 Startup reminder created for Claude${NC}"
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
echo -e "${GREEN}🔧 Knowledge Management Tools Available:${NC}"
echo -e "  • ${BLUE}ukb${NC} - Update Knowledge Base (captures insights)"
echo -e "  • ${BLUE}vkb${NC} - View Knowledge Base (visualizes knowledge graph)"
echo -e "  • ${BLUE}semantic-cli${NC} - Standalone semantic analysis system"
echo -e "  • ${GREEN}🤖 AI-Powered Tools (via MCP):${NC}"
echo -e "    - analyze_repository: Intelligent code analysis"
echo -e "    - analyze_conversation: Extract insights from discussions"
echo -e "    - search_web: Technical documentation search"
echo -e "    - start_workflow: Complex multi-agent workflows"
echo -e "    - sync_with_ukb: Integrate with knowledge base"
echo -e "  • ${YELLOW}CRITICAL: NEVER edit shared-memory.json directly${NC}"
echo -e "  • ${YELLOW}ALWAYS use: ukb --interactive or AI tools${NC}"
echo

# Set up post-session conversation logging
POST_SESSION_LOGGER="$CODING_REPO_DIR/scripts/simple-post-session-logger.js"
if [[ -f "$POST_SESSION_LOGGER" ]]; then
    echo -e "${BLUE}🔴 Post-session conversation logging enabled${NC}"
    echo -e "${GREEN}📁 Logs will be saved to appropriate .specstory/history/ directories after session${NC}"
    echo
    
    # Set up trap to trigger post-session logging on exit
    cleanup() {
        echo -e "${BLUE}🔄 Processing session for conversation logging...${NC}"
        
        # Clean up MCP processes first to prevent accumulation
        echo -e "${BLUE}🧹 Cleaning up MCP processes...${NC}"
        pkill -f "mcp-server-memory" 2>/dev/null || true
        pkill -f "browser-access/dist/index.js" 2>/dev/null || true  
        pkill -f "semantic-analysis-system/mcp-server" 2>/dev/null || true
        
        # Give processes a moment to terminate gracefully
        sleep 1
        
        # Force kill any remaining stubborn processes
        pkill -9 -f "mcp-server-memory" 2>/dev/null || true
        pkill -9 -f "browser-access/dist/index.js" 2>/dev/null || true
        pkill -9 -f "semantic-analysis-system/mcp-server" 2>/dev/null || true
        
        echo -e "${GREEN}✅ MCP processes cleaned up${NC}"
        
        node "$POST_SESSION_LOGGER" "$(pwd)" "$CODING_REPO_DIR"
        echo -e "${GREEN}✅ Session logged successfully${NC}"
    }
    trap cleanup EXIT
    
    # Launch Claude normally (without exec to preserve trap)
    claude --mcp-config "$MCP_CONFIG" "$@"
else
    echo -e "${YELLOW}⚠️  Post-session logger not found at: $POST_SESSION_LOGGER${NC}"
    echo -e "${YELLOW}⚠️  Conversations will NOT be automatically logged${NC}"
    echo
    
    # Launch Claude without logging
    exec claude --mcp-config "$MCP_CONFIG" "$@"
fi