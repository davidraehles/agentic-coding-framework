#!/bin/bash

# Memory Visualizer Launcher for Coding Knowledge Base
# This script launches the memory-visualizer with LIVE MCP memory data

# Configuration
VISUALIZER_DIR="/Users/q284340/Agentic/memory-visualizer/dist"
PORT=8080

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Coding Knowledge Base Visualizer${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if visualizer exists
if [ ! -d "$VISUALIZER_DIR" ]; then
    echo -e "${YELLOW}Error: Memory visualizer not found at $VISUALIZER_DIR${NC}"
    exit 1
fi

# Function to get fresh memory data from live MCP
get_live_memory_data() {
    echo -e "${GREEN}Fetching live MCP memory data...${NC}"
    
    local output_file="$1"
    if [ -z "$output_file" ]; then
        output_file="$VISUALIZER_DIR/memory.json"
    fi
    
    # Create a marker file to signal we want live MCP data
    touch /tmp/vkb_requesting_live_mcp_export
    
    echo -e "${BLUE}💡 To export live MCP data, Claude Code needs to run the export${NC}"
    echo -e "${YELLOW}⚠️  For now, using the most recent memory data available${NC}"
    
    # The actual live export would be done by Claude Code when it detects our request
    # For immediate use, we'll use whatever memory.json is currently available
    
    rm -f /tmp/vkb_requesting_live_mcp_export
    return 1
}

# Function to check if existing server is our viewer
check_existing_viewer() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        # Check if the process is serving our visualizer
        local response=$(curl -s "http://localhost:$port" 2>/dev/null | head -1)
        if [[ "$response" == *"Memory"* ]] || [[ "$response" == *"Anthropic"* ]] || [[ "$response" == *"html"* ]]; then
            echo -e "${GREEN}✅ Knowledge base viewer already running on port $port${NC}"
            echo -e "${BLUE}🌐 View at: http://localhost:$port${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Port $port in use by different service${NC}"
            return 1
        fi
    else
        return 1
    fi
}

# Check if viewer is already running on default port
if check_existing_viewer $PORT; then
    echo -e "${BLUE}💡 Refreshing data and opening in browser...${NC}"
    open "http://localhost:$PORT" 2>/dev/null || echo "Open http://localhost:$PORT in your browser"
    exit 0
fi

# Try to get live memory data, fallback to cached
get_live_memory_data "$VISUALIZER_DIR/memory.json"
if [ $? -ne 0 ]; then
    # Fallback to finding cached memory.json
    MEMORY_JSON="/Users/q284340/.npm/_npx/15b07286cbcc3329/node_modules/@modelcontextprotocol/server-memory/dist/memory.json"
    
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
    
    echo -e "${YELLOW}⚠️  Using cached memory data (may be stale)${NC}"
    echo -e "${BLUE}📄 Source: $MEMORY_JSON${NC}"
fi

# Prepare data for visualizer
echo -e "${GREEN}Preparing data...${NC}"
cd "$VISUALIZER_DIR"

# Check if we have live data export
if [ -f "$VISUALIZER_DIR/memory.json" ]; then
    entity_count=$(grep -c '"type": "entity"' "$VISUALIZER_DIR/memory.json" 2>/dev/null || echo "0")
    relation_count=$(grep -c '"type": "relation"' "$VISUALIZER_DIR/memory.json" 2>/dev/null || echo "0")
    
    if [ "$entity_count" -gt 0 ] || [ "$relation_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Using MCP memory data: ${entity_count} entities, ${relation_count} relations${NC}"
        echo -e "${BLUE}💡 Data freshness: Check Claude Code session for live updates${NC}"
    fi
elif [ -n "$MEMORY_JSON" ] && [ -f "$MEMORY_JSON" ]; then
    # Copy memory data if using cached file
    cp "$MEMORY_JSON" "$VISUALIZER_DIR/memory.json"
    echo -e "${YELLOW}⚠️  Using cached data (may be stale)${NC}"
fi

# Find available port
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    echo -e "${YELLOW}Port $PORT in use, trying $((PORT + 1))...${NC}"
    PORT=$((PORT + 1))
    
    # Prevent infinite loop
    if [ $PORT -gt 8090 ]; then
        echo -e "${RED}Error: Could not find available port${NC}"
        exit 1
    fi
done

# Start the visualizer
echo -e "${GREEN}Starting visualizer on http://localhost:$PORT${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Open in browser automatically
(sleep 2 && open "http://localhost:$PORT" 2>/dev/null) &

# Start HTTP server
if command -v python3 &> /dev/null; then
    echo -e "${BLUE}Using Python 3 HTTP server...${NC}"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo -e "${BLUE}Using Python 2 SimpleHTTPServer...${NC}"
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo -e "${BLUE}Using npx http-server...${NC}"
    npx -y http-server -p $PORT
else
    echo -e "${YELLOW}No suitable HTTP server found. Please install Python or Node.js.${NC}"
    exit 1
fi