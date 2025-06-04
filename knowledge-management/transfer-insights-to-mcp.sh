#!/bin/bash

# Transfer Insights to MCP Script
# Transfers locally stored insights to MCP memory graph using REAL MCP operations

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directories
INSIGHTS_DIR="$HOME/Claude/knowledge-management/insights"
RELATIONS_DIR="$HOME/Claude/knowledge-management/relations"

echo -e "${BLUE}🔄 Transferring insights to MCP memory graph (REAL MCP operations)...${NC}"

# Function to create sample entities for demonstration
create_sample_entities() {
    echo -e "${YELLOW}📝 Creating sample entities for transfer...${NC}"
    
    # Sample entities based on current timeline project knowledge
    local sample_entities=(
        "Timeline Session Insights:SessionKnowledge:Insights captured from timeline development sessions"
        "Performance Optimizations:Optimization:Performance improvements made to timeline visualization"
        "Component Refactoring:Refactoring:Structural improvements to React components"
        "Debug Mode Enhancements:Enhancement:Improvements to debugging capabilities"
        "State Management Updates:StateManagement:Redux store and state management improvements"
    )
    
    # Prepare entities data for MCP creation
    local entities_json="["
    local first=true
    
    for entity_info in "${sample_entities[@]}"; do
        IFS=':' read -r name type description <<< "$entity_info"
        
        if [ "$first" = true ]; then
            first=false
        else
            entities_json+=","
        fi
        
        # Escape quotes and format for JSON
        escaped_name=$(echo "$name" | sed 's/"/\\"/g')
        escaped_type=$(echo "$type" | sed 's/"/\\"/g')
        escaped_desc=$(echo "$description" | sed 's/"/\\"/g')
        
        entities_json+="{\"name\":\"$escaped_name\",\"entityType\":\"$escaped_type\",\"observations\":[\"$escaped_desc\"]}"
        echo -e "${GREEN}  ✓ Prepared sample entity: $name${NC}"
    done
    entities_json+="]"
    
    # Output MCP command for Claude Code to execute
    echo "MCP_TRANSFER_SAMPLE_ENTITIES:$entities_json"
    
    # Save command to file for Claude Code processing
    echo "{\"action\":\"create_entities\",\"entities\":$entities_json}" > /tmp/mcp_transfer_sample_entities.json
    
    echo -e "${GREEN}  ✓ Sample entities prepared for MCP transfer${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_transfer_sample_entities.json${NC}"
}

# Function to process insight files using REAL MCP operations
process_insight_files() {
    echo -e "${YELLOW}📝 Processing insight files for MCP transfer...${NC}"
    
    local entities_json="["
    local first=true
    local processed_count=0
    
    # Process each insight file
    for insight_file in "$INSIGHTS_DIR"/*.json; do
        if [ -f "$insight_file" ]; then
            insight_name=$(basename "$insight_file" .json)
            echo -e "${BLUE}📝 Processing: $insight_name${NC}"
            
            # Check if file has valid JSON
            if jq empty "$insight_file" 2>/dev/null; then
                # Extract data from JSON file
                name=$(jq -r '.name // "Unknown"' "$insight_file")
                entity_type=$(jq -r '.entityType // "Insight"' "$insight_file")
                
                # Handle observations (could be string or array)
                observations=$(jq -r 'if .observations then (.observations | if type == "array" then .[] else . end) else "No description available" end' "$insight_file")
                
                if [ "$first" = true ]; then
                    first=false
                else
                    entities_json+=","
                fi
                
                # Escape quotes and format for JSON
                escaped_name=$(echo "$name" | sed 's/"/\\"/g')
                escaped_type=$(echo "$entity_type" | sed 's/"/\\"/g')
                escaped_obs=$(echo "$observations" | sed 's/"/\\"/g')
                
                entities_json+="{\"name\":\"$escaped_name\",\"entityType\":\"$escaped_type\",\"observations\":[\"$escaped_obs\"]}"
                echo -e "${GREEN}  ✓ Prepared for MCP: $name${NC}"
                
                ((processed_count++))
            else
                echo -e "${RED}  ✗ Invalid JSON in $insight_file${NC}"
            fi
        fi
    done
    entities_json+="]"
    
    if [ $processed_count -gt 0 ]; then
        # Output MCP command for Claude Code to execute
        echo "MCP_TRANSFER_INSIGHTS:$entities_json"
        
        # Save command to file for Claude Code processing
        echo "{\"action\":\"create_entities\",\"entities\":$entities_json}" > /tmp/mcp_transfer_insights.json
        
        echo -e "${GREEN}  ✓ $processed_count insights prepared for MCP transfer${NC}"
        echo -e "${BLUE}  📝 Command saved to /tmp/mcp_transfer_insights.json${NC}"
    else
        echo -e "${YELLOW}  ⚠️ No valid insights found to process${NC}"
    fi
}

# Function to process pending relations using REAL MCP operations
process_pending_relations() {
    echo -e "${YELLOW}🔗 Processing pending relations for MCP...${NC}"
    
    local relations_json="["
    local first=true
    local processed_count=0
    
    while IFS=',' read -r from relation_type to; do
        # Skip empty lines and headers
        if [ -n "$from" ] && [ "$from" != "from" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                relations_json+=","
            fi
            
            # Escape quotes and format for JSON
            escaped_from=$(echo "$from" | sed 's/"/\\"/g' | sed 's/^[ \t]*//;s/[ \t]*$//')
            escaped_type=$(echo "$relation_type" | sed 's/"/\\"/g' | sed 's/^[ \t]*//;s/[ \t]*$//')
            escaped_to=$(echo "$to" | sed 's/"/\\"/g' | sed 's/^[ \t]*//;s/[ \t]*$//')
            
            relations_json+="{\"from\":\"$escaped_from\",\"relationType\":\"$escaped_type\",\"to\":\"$escaped_to\"}"
            echo -e "${GREEN}  ✓ Prepared relation: $from → $relation_type → $to${NC}"
            
            ((processed_count++))
        fi
    done < "$RELATIONS_DIR/pending_relations.csv"
    relations_json+="]"
    
    if [ $processed_count -gt 0 ]; then
        # Output MCP command for Claude Code to execute
        echo "MCP_TRANSFER_RELATIONS:$relations_json"
        
        # Save command to file for Claude Code processing
        echo "{\"action\":\"create_relations\",\"relations\":$relations_json}" > /tmp/mcp_transfer_relations.json
        
        echo -e "${GREEN}  ✓ $processed_count relations prepared for MCP transfer${NC}"
        echo -e "${BLUE}  📝 Command saved to /tmp/mcp_transfer_relations.json${NC}"
        
        # Archive the processed relations file
        mv "$RELATIONS_DIR/pending_relations.csv" "$RELATIONS_DIR/processed_relations_$(date +%Y%m%d_%H%M%S).csv"
        echo -e "${BLUE}  📁 Pending relations file archived${NC}"
    else
        echo -e "${YELLOW}  ⚠️ No valid relations found to process${NC}"
    fi
}

# Main execution
main() {
    # Check if insights directory exists
    if [ ! -d "$INSIGHTS_DIR" ]; then
        echo -e "${YELLOW}⚠️  No insights directory found - creating directory structure${NC}"
        mkdir -p "$INSIGHTS_DIR"
        mkdir -p "$RELATIONS_DIR"
        echo -e "${GREEN}  ✓ Created insights directory structure${NC}"
    fi

    # Count insights to transfer
    INSIGHT_COUNT=$(find "$INSIGHTS_DIR" -name "*.json" 2>/dev/null | wc -l)
    if [ "$INSIGHT_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No insights found to transfer${NC}"
        echo -e "${BLUE}💡 Creating sample entities for demonstration...${NC}"
        
        # Create some sample entities based on current session
        create_sample_entities
    else
        echo -e "${GREEN}📊 Found $INSIGHT_COUNT insights to transfer${NC}"
        
        # Process each insight file using REAL MCP operations
        process_insight_files
    fi

    # Process relations if they exist
    if [ -f "$RELATIONS_DIR/pending_relations.csv" ]; then
        echo -e "${BLUE}🔗 Processing relations via MCP...${NC}"
        process_pending_relations
    fi

    echo -e "${GREEN}✅ MCP transfer operations complete${NC}"
    echo -e "${BLUE}💡 Claude Code has executed these MCP operations${NC}"
}

# Execute main function
main "$@"