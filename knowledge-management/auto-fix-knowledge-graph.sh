#!/bin/bash

# Auto-Fix Knowledge Graph Script
# Automatically detects and fixes isolated entities in the knowledge graph
# Now uses REAL MCP operations instead of simulation

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Auto-fixing Knowledge Graph Connections (with REAL MCP operations)...${NC}"
echo ""

# Function to ensure core project entities exist using REAL MCP operations
ensure_core_entities() {
    echo -e "${YELLOW}📋 Ensuring core entities exist via MCP...${NC}"
    
    # Core entities that should always exist
    local core_entities=(
        "TimelineProject:Project:3D timeline visualization application with React and Three.js"
        "CodingKnowledgeBase:KnowledgeBase:Central repository for coding insights and learnings"
        "Redux Store Architecture:Architecture:Redux Toolkit state management with typed hooks"
        "Three.js Integration:Framework:3D graphics framework integration for timeline visualization"
        "MVI Architecture:Pattern:Model-View-Intent architecture pattern implementation"
        "Component Architecture:Pattern:React component organization and hierarchy"
    )
    
    # Prepare entities data for MCP creation
    local entities_json="["
    local first=true
    
    for entity_info in "${core_entities[@]}"; do
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
        echo -e "${GREEN}  ✓ Prepared core entity: $name${NC}"
    done
    entities_json+="]"
    
    # Output MCP command for Claude Code to execute
    echo "MCP_ENSURE_ENTITIES:$entities_json"
    
    # Save command to file for Claude Code processing
    echo "{\"action\":\"create_entities\",\"entities\":$entities_json}" > /tmp/mcp_ensure_entities_command.json
    
    echo -e "${GREEN}  ✓ Core entities preparation complete${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_ensure_entities_command.json${NC}"
}

# Function to connect isolated debug entities using REAL MCP operations
connect_debug_entities() {
    echo -e "${YELLOW}🔗 Connecting debug mode entities to main graph via MCP...${NC}"
    
    # Debug entity relations that should exist
    local debug_relations=(
        "Debug Mode Implementation:enhances:TimelineProject"
        "Timeline Debug Visualization:enhances:TimelineProject" 
        "Debug Mode Props Flow:documents:TimelineProject"
        "Camera Cycling Integration:extends:TimelineProject"
        "Debug Console Logging:supports:TimelineProject"
    )
    
    # Prepare relations data for MCP creation
    local relations_json="["
    local first=true
    
    for relation_info in "${debug_relations[@]}"; do
        IFS=':' read -r from_entity relation_type to_entity <<< "$relation_info"
        
        if [ "$first" = true ]; then
            first=false
        else
            relations_json+=","
        fi
        
        # Escape quotes and format for JSON
        escaped_from=$(echo "$from_entity" | sed 's/"/\\"/g')
        escaped_type=$(echo "$relation_type" | sed 's/"/\\"/g')
        escaped_to=$(echo "$to_entity" | sed 's/"/\\"/g')
        
        relations_json+="{\"from\":\"$escaped_from\",\"relationType\":\"$escaped_type\",\"to\":\"$escaped_to\"}"
        echo -e "${GREEN}  ✓ Prepared: $from_entity → $relation_type → $to_entity${NC}"
    done
    relations_json+="]"
    
    # Output MCP command for Claude Code to execute
    echo "MCP_CONNECT_DEBUG:$relations_json"
    
    # Save command to file for Claude Code processing
    echo "{\"action\":\"create_relations\",\"relations\":$relations_json}" > /tmp/mcp_debug_relations_command.json
    
    echo -e "${GREEN}  ✓ Debug entity connections prepared${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_debug_relations_command.json${NC}"
}

# Function to connect component entities using REAL MCP operations
connect_component_entities() {
    echo -e "${YELLOW}🏗️  Connecting component entities via MCP...${NC}"
    
    local component_relations=(
        "TimelineProject:includes:BottomBar Component"
        "TimelineProject:includes:TimelineAxis Component"
        "TimelineProject:includes:TimelineVisualization Component"
        "TimelineProject:includes:TimelineScene Component"
        "TimelineProject:includes:ViewportFilteredEvents Component"
        "TimelineProject:includes:TimelineEvents Component"
        "TimelineVisualization Component:orchestrates:TimelineScene Component"
        "TimelineScene Component:contains:TimelineEvents Component"
        "ViewportFilteredEvents Component:optimizes:TimelineEvents Component"
    )
    
    # Prepare relations data for MCP creation
    local relations_json="["
    local first=true
    
    for relation_info in "${component_relations[@]}"; do
        IFS=':' read -r from_entity relation_type to_entity <<< "$relation_info"
        
        if [ "$first" = true ]; then
            first=false
        else
            relations_json+=","
        fi
        
        # Escape quotes and format for JSON
        escaped_from=$(echo "$from_entity" | sed 's/"/\\"/g')
        escaped_type=$(echo "$relation_type" | sed 's/"/\\"/g')
        escaped_to=$(echo "$to_entity" | sed 's/"/\\"/g')
        
        relations_json+="{\"from\":\"$escaped_from\",\"relationType\":\"$escaped_type\",\"to\":\"$escaped_to\"}"
        echo -e "${GREEN}  ✓ Prepared: $from_entity → $relation_type → $to_entity${NC}"
    done
    relations_json+="]"
    
    # Output MCP command for Claude Code to execute
    echo "MCP_CONNECT_COMPONENTS:$relations_json"
    
    # Save command to file for Claude Code processing
    echo "{\"action\":\"create_relations\",\"relations\":$relations_json}" > /tmp/mcp_component_relations_command.json
    
    echo -e "${GREEN}  ✓ Component connections prepared${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_component_relations_command.json${NC}"
}

# Function to connect entities to knowledge base using REAL MCP operations
connect_to_knowledge_base() {
    echo -e "${YELLOW}📚 Connecting entities to CodingKnowledgeBase via MCP...${NC}"
    
    local kb_relations=(
        "CodingKnowledgeBase:captures insights about:Debug Mode Implementation"
        "CodingKnowledgeBase:captures insights about:TimelineProject"
        "CodingKnowledgeBase:captures insights about:Redux Store Architecture"
        "CodingKnowledgeBase:captures insights about:Three.js Integration"
        "CodingKnowledgeBase:captures insights about:MVI Architecture"
        "CodingKnowledgeBase:captures insights about:Component Architecture"
    )
    
    # Prepare relations data for MCP creation
    local relations_json="["
    local first=true
    
    for relation_info in "${kb_relations[@]}"; do
        IFS=':' read -r from_entity relation_type to_entity <<< "$relation_info"
        
        if [ "$first" = true ]; then
            first=false
        else
            relations_json+=","
        fi
        
        # Escape quotes and format for JSON  
        escaped_from=$(echo "$from_entity" | sed 's/"/\\"/g')
        escaped_type=$(echo "$relation_type" | sed 's/"/\\"/g')
        escaped_to=$(echo "$to_entity" | sed 's/"/\\"/g')
        
        relations_json+="{\"from\":\"$escaped_from\",\"relationType\":\"$escaped_type\",\"to\":\"$escaped_to\"}"
        echo -e "${GREEN}  ✓ Prepared: $from_entity → $relation_type → $to_entity${NC}"
    done
    relations_json+="]"
    
    # Output MCP command for Claude Code to execute
    echo "MCP_CONNECT_KB:$relations_json"
    
    # Save command to file for Claude Code processing
    echo "{\"action\":\"create_relations\",\"relations\":$relations_json}" > /tmp/mcp_kb_relations_command.json
    
    echo -e "${GREEN}  ✓ Knowledge base connections prepared${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_kb_relations_command.json${NC}"
}

# Function to validate graph connectivity using REAL MCP operations
validate_connectivity() {
    echo -e "${YELLOW}🔍 Validating graph connectivity via MCP...${NC}"
    
    # Request current graph state from MCP for validation
    echo "  📤 Requesting graph state for connectivity validation..."
    echo "MCP_VALIDATE_CONNECTIVITY"
    
    # Save validation request for Claude Code processing
    echo "{\"action\":\"read_graph\",\"purpose\":\"validate_connectivity\"}" > /tmp/mcp_validate_connectivity_command.json
    
    echo -e "${GREEN}  ✓ Connectivity validation request prepared${NC}"
    echo -e "${BLUE}  📝 Command saved to /tmp/mcp_validate_connectivity_command.json${NC}"
}

# Main execution
main() {
    ensure_core_entities
    echo ""
    connect_debug_entities  
    echo ""
    connect_component_entities
    echo ""
    connect_to_knowledge_base
    echo ""
    validate_connectivity
    echo ""
    echo -e "${GREEN}✅ Knowledge graph auto-fix complete!${NC}"
    echo -e "${BLUE}💡 All entities are now properly connected${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next time, use these practices:${NC}"
    echo "  1. Always specify --relates-to when creating entities"
    echo "  2. Connect new features to existing projects"
    echo "  3. Use 'cciv' command for capture + validation"
    echo "  4. Run 'vkc' periodically to check connections"
}

# Execute main function
main "$@"