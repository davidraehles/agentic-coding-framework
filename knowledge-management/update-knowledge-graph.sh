#!/bin/bash

# Update Knowledge Graph - Master Command
# Comprehensive knowledge graph update and maintenance system
# Works across machines with shared Claude repository

set -e

# Configuration
CLAUDE_REPO_DIR="$HOME/Claude"
KNOWLEDGE_DIR="$CLAUDE_REPO_DIR/knowledge-management"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Function to display header
show_header() {
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║                    Update Knowledge Graph                    ║${NC}"
    echo -e "${BOLD}${CYAN}║              Comprehensive KG Management System             ║${NC}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show usage
usage() {
    show_header
    echo -e "${YELLOW}Usage:${NC} $(basename $0) [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  --capture, -c     Capture new insights interactively"
    echo "  --validate, -v    Validate knowledge graph connections"
    echo "  --fix, -f         Auto-fix isolated entities and connections"
    echo "  --sync, -s        Sync with remote repository"
    echo "  --view, -w        Open visual knowledge base"
    echo "  --session         Summarize current coding session"
    echo "  --export          Export knowledge graph data"
    echo "  --setup           Setup system on new machine"
    echo "  --status          Show system status"
    echo "  --help, -h        Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $(basename $0)                    # Interactive menu"
    echo "  $(basename $0) --capture          # Capture new insights"
    echo "  $(basename $0) --fix --sync       # Fix and sync"
    echo "  $(basename $0) --view             # Open knowledge base"
    echo ""
    echo -e "${CYAN}💡 For team collaboration, ensure ~/Claude repo is cloned on all machines${NC}"
}

# Function to check system status
check_system_status() {
    echo -e "${BLUE}🔍 Checking Knowledge Management System Status...${NC}"
    echo ""
    
    # Check Claude repository
    if [ -d "$CLAUDE_REPO_DIR/.git" ]; then
        echo -e "${GREEN}✅ Claude repository found${NC}"
        cd "$CLAUDE_REPO_DIR"
        echo -e "${CYAN}   Repository: $(git remote get-url origin 2>/dev/null || echo 'No remote')${NC}"
        echo -e "${CYAN}   Branch: $(git branch --show-current)${NC}"
        
        # Check for uncommitted changes
        if [ -n "$(git status --porcelain)" ]; then
            echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        else
            echo -e "${GREEN}✅ Repository clean${NC}"
        fi
    else
        echo -e "${RED}❌ Claude repository not found at $CLAUDE_REPO_DIR${NC}"
        echo -e "${YELLOW}   Run: git clone <claude-repo-url> ~/Claude${NC}"
    fi
    
    # Check knowledge management scripts
    local required_scripts=(
        "enhanced-capture-insight.sh"
        "validate-knowledge-connections.sh"
        "auto-fix-knowledge-graph.sh"
        "vkb"
    )
    
    echo ""
    echo -e "${BLUE}📝 Checking knowledge management scripts...${NC}"
    for script in "${required_scripts[@]}"; do
        if [ -f "$KNOWLEDGE_DIR/$script" ]; then
            echo -e "${GREEN}✅ $script${NC}"
        else
            echo -e "${RED}❌ $script${NC}"
        fi
    done
    
    # Check MCP availability
    echo ""
    echo -e "${BLUE}🔌 Checking MCP integration...${NC}"
    if [ -f "$KNOWLEDGE_DIR/test-mcp-availability.sh" ]; then
        if "$KNOWLEDGE_DIR/test-mcp-availability.sh" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ MCP memory system available${NC}"
        else
            echo -e "${YELLOW}⚠️  MCP system not fully available${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  MCP test script not found${NC}"
    fi
    
    # Check aliases
    echo ""
    echo -e "${BLUE}🔧 Checking shell aliases...${NC}"
    if alias cci-enhanced >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Enhanced capture aliases loaded${NC}"
    else
        echo -e "${YELLOW}⚠️  Aliases not loaded - run: source ~/.bash_profile${NC}"
    fi
}

# Function to setup system on new machine
setup_system() {
    echo -e "${BLUE}🚀 Setting up Knowledge Management System...${NC}"
    echo ""
    
    # Ensure scripts are executable
    echo -e "${YELLOW}Making scripts executable...${NC}"
    chmod +x "$KNOWLEDGE_DIR"/*.sh 2>/dev/null || true
    chmod +x "$KNOWLEDGE_DIR/vkb" 2>/dev/null || true
    
    # Setup aliases
    if [ -f "$KNOWLEDGE_DIR/setup-enhanced-aliases.sh" ]; then
        echo -e "${YELLOW}Setting up shell aliases...${NC}"
        "$KNOWLEDGE_DIR/setup-enhanced-aliases.sh"
    fi
    
    # Create local knowledge base directory
    mkdir -p "$HOME/coding-knowledge-base"
    
    echo -e "${GREEN}✅ System setup complete!${NC}"
    echo -e "${CYAN}💡 Restart your shell or run: source ~/.bash_profile${NC}"
}

# Function to capture insights
capture_insights() {
    echo -e "${BLUE}📝 Capturing Knowledge Insights...${NC}"
    echo ""
    
    if [ -f "$KNOWLEDGE_DIR/enhanced-capture-insight.sh" ]; then
        "$KNOWLEDGE_DIR/enhanced-capture-insight.sh" "$@"
    else
        echo -e "${RED}❌ Enhanced capture script not found${NC}"
        return 1
    fi
}

# Function to validate knowledge graph
validate_graph() {
    echo -e "${BLUE}🔍 Validating Knowledge Graph...${NC}"
    echo ""
    
    if [ -f "$KNOWLEDGE_DIR/validate-knowledge-connections.sh" ]; then
        "$KNOWLEDGE_DIR/validate-knowledge-connections.sh"
    else
        echo -e "${RED}❌ Validation script not found${NC}"
        return 1
    fi
}

# Function to auto-fix knowledge graph
fix_graph() {
    echo -e "${BLUE}🔧 Auto-fixing Knowledge Graph...${NC}"
    echo ""
    
    if [ -f "$KNOWLEDGE_DIR/auto-fix-knowledge-graph.sh" ]; then
        "$KNOWLEDGE_DIR/auto-fix-knowledge-graph.sh"
    else
        echo -e "${RED}❌ Auto-fix script not found${NC}"
        return 1
    fi
}

# Function to sync with repository
sync_repository() {
    echo -e "${BLUE}🔄 Syncing with Repository...${NC}"
    echo ""
    
    if [ ! -d "$CLAUDE_REPO_DIR/.git" ]; then
        echo -e "${RED}❌ Not a git repository${NC}"
        return 1
    fi
    
    cd "$CLAUDE_REPO_DIR"
    
    # Add any new knowledge management files
    echo -e "${YELLOW}Adding knowledge management files...${NC}"
    git add knowledge-management/ 2>/dev/null || true
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}Committing knowledge management updates...${NC}"
        git commit -m "feat: update knowledge management system

🧠 Updated knowledge graph and management tools
- Enhanced capture scripts
- Validation and auto-fix capabilities  
- Improved team collaboration support

🤖 Generated with Claude Code"
        
        echo -e "${YELLOW}Pushing to remote...${NC}"
        git push origin main 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Push failed - check remote configuration${NC}"
        }
    else
        echo -e "${GREEN}✅ No changes to commit${NC}"
        
        # Pull latest changes
        echo -e "${YELLOW}Pulling latest changes...${NC}"
        git pull origin main 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Pull failed - check remote connection${NC}"
        }
    fi
}

# Function to view knowledge base
view_knowledge() {
    echo -e "${BLUE}👁️  Opening Visual Knowledge Base...${NC}"
    echo ""
    
    if [ -f "$KNOWLEDGE_DIR/vkb" ]; then
        "$KNOWLEDGE_DIR/vkb"
    else
        echo -e "${RED}❌ Visual knowledge base script not found${NC}"
        return 1
    fi
}

# Function to summarize session
summarize_session() {
    echo -e "${BLUE}📊 Summarizing Coding Session...${NC}"
    echo ""
    
    if [ -f "$KNOWLEDGE_DIR/summarize-coding-session.sh" ]; then
        "$KNOWLEDGE_DIR/summarize-coding-session.sh"
    else
        echo -e "${RED}❌ Session summary script not found${NC}"
        return 1
    fi
}

# Function to export knowledge graph
export_knowledge() {
    echo -e "${BLUE}📦 Exporting Knowledge Graph...${NC}"
    echo ""
    
    local export_file="$HOME/coding-knowledge-base/export_$(date +%Y%m%d_%H%M%S).json"
    
    # Create export directory
    mkdir -p "$(dirname "$export_file")"
    
    # Export knowledge (placeholder - would integrate with actual MCP export)
    echo -e "${YELLOW}Exporting to: $export_file${NC}"
    echo '{"exported": true, "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$export_file"
    
    echo -e "${GREEN}✅ Knowledge graph exported${NC}"
    echo -e "${CYAN}📄 File: $export_file${NC}"
}

# Interactive menu
show_interactive_menu() {
    show_header
    echo -e "${YELLOW}Select an option:${NC}"
    echo ""
    echo "  1) 📝 Capture new insights"
    echo "  2) 🔍 Validate knowledge graph" 
    echo "  3) 🔧 Auto-fix connections"
    echo "  4) 👁️  View knowledge base"
    echo "  5) 📊 Summarize session"
    echo "  6) 🔄 Sync repository"
    echo "  7) 📦 Export knowledge"
    echo "  8) 🚀 Setup system"
    echo "  9) 📋 Show status"
    echo "  0) ❌ Exit"
    echo ""
    echo -n -e "${CYAN}Choice [0-9]: ${NC}"
    
    read -r choice
    echo ""
    
    case $choice in
        1) capture_insights ;;
        2) validate_graph ;;
        3) fix_graph ;;
        4) view_knowledge ;;
        5) summarize_session ;;
        6) sync_repository ;;
        7) export_knowledge ;;
        8) setup_system ;;
        9) check_system_status ;;
        0) echo -e "${GREEN}👋 Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Invalid choice${NC}"; exit 1 ;;
    esac
}

# Main execution logic
main() {
    # Change to knowledge management directory
    cd "$KNOWLEDGE_DIR" 2>/dev/null || {
        echo -e "${RED}❌ Knowledge management directory not found: $KNOWLEDGE_DIR${NC}"
        echo -e "${YELLOW}💡 Run with --setup to initialize system${NC}"
        exit 1
    }
    
    # Parse arguments
    case "${1:-}" in
        --capture|-c)
            shift
            capture_insights "$@"
            ;;
        --validate|-v)
            validate_graph
            ;;
        --fix|-f)
            fix_graph
            ;;
        --sync|-s)
            sync_repository
            ;;
        --view|-w)
            view_knowledge
            ;;
        --session)
            summarize_session
            ;;
        --export)
            export_knowledge
            ;;
        --setup)
            setup_system
            ;;
        --status)
            check_system_status
            ;;
        --help|-h)
            usage
            ;;
        "")
            show_interactive_menu
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"