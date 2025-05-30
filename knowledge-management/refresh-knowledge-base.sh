#!/bin/bash

# Refresh Knowledge Base Data
# Updates the memory.json file in the visualizer directory

# Configuration
MEMORY_JSON="/Users/q284340/.npm/_npx/15b07286cbcc3329/node_modules/@modelcontextprotocol/server-memory/dist/memory.json"
VISUALIZER_DIR="/Users/q284340/Agentic/memory-visualizer/dist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Refreshing Knowledge Base Data${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if memory.json exists
if [ ! -f "$MEMORY_JSON" ]; then
    echo -e "${YELLOW}Warning: memory.json not found at expected location${NC}"
    echo "Looking for alternative locations..."
    
    # Try to find memory.json
    FOUND_MEMORY=$(find ~/.npm/_npx -name "memory.json" -path "*/server-memory/*" 2>/dev/null | head -1)
    
    if [ -n "$FOUND_MEMORY" ]; then
        MEMORY_JSON="$FOUND_MEMORY"
        echo -e "${GREEN}Found memory.json at: $MEMORY_JSON${NC}"
    else
        echo -e "${YELLOW}No memory.json found. The MCP server may not be initialized.${NC}"
        exit 1
    fi
fi

# Copy memory.json to visualizer directory
echo -e "${GREEN}Copying latest data to visualizer...${NC}"
cp "$MEMORY_JSON" "$VISUALIZER_DIR/memory.json"

echo -e "${GREEN}✓ Knowledge base data refreshed!${NC}"
echo -e "${YELLOW}Now refresh your browser at http://localhost:8080${NC}"