#!/bin/bash

# Export Live MCP Memory Data Script
# This script exports the current MCP memory to the visualizer

set -e

# Configuration
VISUALIZER_DIR="/Users/q284340/Agentic/memory-visualizer/dist"
OUTPUT_FILE="$VISUALIZER_DIR/memory.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Live MCP Memory Exporter${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  This script must be run from within a Claude Code session with MCP access${NC}"
echo -e "${BLUE}💡 The MCP memory data will be exported to: $OUTPUT_FILE${NC}"
echo ""

# Create a marker to signal Claude Code
echo "CLAUDE_CODE_MCP_EXPORT_REQUEST" > /tmp/mcp_export_request

echo -e "${GREEN}📋 To export live MCP memory data:${NC}"
echo -e "   1. Claude Code needs to read the current MCP memory graph"
echo -e "   2. Convert it to NDJSON format (one JSON object per line)"
echo -e "   3. Write it to: $OUTPUT_FILE"
echo ""
echo -e "${YELLOW}⏳ Waiting for Claude Code to process the request...${NC}"

# Clean up
rm -f /tmp/mcp_export_request

echo -e "${BLUE}✨ Once exported, run 'vkb' to visualize the updated knowledge base${NC}"