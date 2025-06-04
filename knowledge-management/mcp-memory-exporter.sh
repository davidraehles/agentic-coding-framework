#!/bin/bash

# MCP Memory Exporter
# This script exports live MCP memory data when called from within a Claude Code session

set -e

# Check if we're being called to export MCP memory
if [ -f "/tmp/vkb_mcp_export_request" ]; then
    request=$(cat /tmp/vkb_mcp_export_request)
    if [[ "$request" == EXPORT_MCP_MEMORY:* ]]; then
        output_file="${request#EXPORT_MCP_MEMORY:}"
        
        echo "🔄 Exporting live MCP memory to: $output_file"
        
        # Create a marker for Claude Code to recognize this request
        touch /tmp/claude_code_mcp_export_marker
        
        # Signal Claude Code to perform the export
        echo "CLAUDE_CODE_ACTION: Export MCP memory graph to $output_file in NDJSON format"
        
        # Clean up request file
        rm -f /tmp/vkb_mcp_export_request
    fi
fi