#!/usr/bin/env python3

import json
import sys

# This script is called by the vkb script to export live MCP memory data
# The data will be populated by Claude Code when it executes this script

def main():
    output_file = sys.argv[1] if len(sys.argv) > 1 else "/Users/q284340/Agentic/memory-visualizer/dist/memory.json"
    
    # MCP_MEMORY_DATA will be replaced by Claude Code with actual data
    memory_data = MCP_MEMORY_DATA
    
    # Convert to NDJSON format (one JSON object per line)
    with open(output_file, 'w') as f:
        # Write entities
        for entity in memory_data.get('entities', []):
            json.dump(entity, f)
            f.write('\n')
        
        # Write relations
        for relation in memory_data.get('relations', []):
            json.dump(relation, f)
            f.write('\n')
    
    print(f"✅ Exported {len(memory_data.get('entities', []))} entities and {len(memory_data.get('relations', []))} relations to {output_file}")

if __name__ == "__main__":
    main()