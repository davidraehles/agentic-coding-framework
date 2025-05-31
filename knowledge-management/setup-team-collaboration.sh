#!/bin/bash

# Team Collaboration Setup Script
# Sets up shared knowledge management system across team machines

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
CLAUDE_REPO_URL="git@cc-github.bmwgroup.net:frankwoernle/claude.git"
CLAUDE_DIR="$HOME/Claude"

show_header() {
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║                  Team Collaboration Setup                   ║${NC}"
    echo -e "${BOLD}${CYAN}║            Shared Knowledge Management System               ║${NC}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to check if this is a new machine setup
check_machine_status() {
    if [ -d "$CLAUDE_DIR/.git" ]; then
        echo -e "${GREEN}✅ Claude repository already exists${NC}"
        return 1  # Not a new machine
    else
        echo -e "${YELLOW}📥 New machine detected - setting up from scratch${NC}"
        return 0  # New machine
    fi
}

# Function to clone or update Claude repository
setup_claude_repository() {
    echo -e "${BLUE}📦 Setting up Claude repository...${NC}"
    
    if [ ! -d "$CLAUDE_DIR" ]; then
        echo -e "${YELLOW}Cloning Claude repository...${NC}"
        git clone "$CLAUDE_REPO_URL" "$CLAUDE_DIR"
        echo -e "${GREEN}✅ Repository cloned successfully${NC}"
    else
        echo -e "${YELLOW}Updating existing repository...${NC}"
        cd "$CLAUDE_DIR"
        git pull origin main
        echo -e "${GREEN}✅ Repository updated${NC}"
    fi
}

# Function to setup system for team member
setup_team_member() {
    local member_name="$1"
    local member_email="$2"
    
    echo -e "${BLUE}👤 Setting up for team member: $member_name${NC}"
    
    # Configure git for this team member
    cd "$CLAUDE_DIR"
    git config user.name "$member_name"
    git config user.email "$member_email"
    
    echo -e "${GREEN}✅ Git configured for $member_name${NC}"
}

# Function to install knowledge management system
install_knowledge_system() {
    echo -e "${BLUE}🔧 Installing knowledge management system...${NC}"
    
    # Run the main setup
    if [ -f "$CLAUDE_DIR/knowledge-management/update-knowledge-graph.sh" ]; then
        "$CLAUDE_DIR/knowledge-management/update-knowledge-graph.sh" --setup
    else
        echo -e "${RED}❌ Update script not found - repository may be incomplete${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Knowledge management system installed${NC}"
}

# Function to create team collaboration documentation
create_team_docs() {
    echo -e "${BLUE}📝 Creating team collaboration documentation...${NC}"
    
    local readme_file="$CLAUDE_DIR/knowledge-management/TEAM_SETUP.md"
    
    cat > "$readme_file" << 'EOF'
# Team Knowledge Management Setup

## Quick Start for Team Members

### 1. Clone Repository
```bash
git clone git@cc-github.bmwgroup.net:frankwoernle/claude.git ~/Claude
```

### 2. Run Team Setup
```bash
~/Claude/knowledge-management/setup-team-collaboration.sh --member "Your Name" "your.email@company.com"
```

### 3. Start Using
```bash
# Update knowledge graph (master command)
ukb

# Quick commands
ukb --capture     # Capture insights
ukb --view        # View knowledge base
ukb --sync        # Sync with team
```

## Team Workflow

### Daily Usage
1. **Morning**: `ukb --sync` to get latest team insights
2. **During Work**: `ukb --capture` to add discoveries
3. **End of Day**: `ukb --sync` to share with team

### Knowledge Sharing
- All insights are automatically shared via git repository
- Visual knowledge base shows team's collective knowledge
- Each team member contributes to shared understanding

### Best Practices
- Always sync before major work sessions
- Capture insights immediately when discovered
- Use descriptive problem/solution descriptions
- Tag insights with relevant project and technology keywords

## Commands Reference

| Command | Description |
|---------|-------------|
| `ukb` | Interactive knowledge management menu |
| `ukb --capture` | Capture new coding insights |
| `ukb --view` | Open visual knowledge base |
| `ukb --sync` | Sync with team repository |
| `ukb --validate` | Validate knowledge graph connections |
| `ukb --fix` | Auto-fix graph issues |
| `ukb --status` | Show system status |

## Troubleshooting

### MCP Not Available
If MCP memory system is not available, insights are stored locally and can be imported later when MCP is available.

### Sync Conflicts
Knowledge management uses append-only operations, so conflicts are rare. If conflicts occur, run `ukb --fix` to resolve.

### Missing Dependencies
Run `ukb --setup` to reinstall system components.

## System Architecture

The knowledge management system consists of:
- **Capture Scripts**: Interactive insight collection
- **Validation System**: Ensures graph connectivity
- **Auto-fix Tools**: Maintains graph health
- **Visual Interface**: Browser-based knowledge exploration
- **Team Sync**: Git-based collaboration

All components are designed for team collaboration and cross-machine portability.
EOF

    echo -e "${GREEN}✅ Team documentation created: $readme_file${NC}"
}

# Function to show team setup summary
show_setup_summary() {
    echo ""
    echo -e "${BOLD}${GREEN}🎉 Team Collaboration Setup Complete!${NC}"
    echo ""
    echo -e "${CYAN}📋 What's been set up:${NC}"
    echo "  ✅ Claude repository cloned/updated"
    echo "  ✅ Knowledge management system installed"
    echo "  ✅ Shell aliases configured"
    echo "  ✅ Team documentation created"
    echo "  ✅ Git configured for team member"
    echo ""
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo "  1. Restart your shell: source ~/.bash_profile"
    echo "  2. Test the system: ukb --status"
    echo "  3. Start capturing: ukb --capture"
    echo "  4. View knowledge: ukb --view"
    echo ""
    echo -e "${CYAN}💡 Team Workflow:${NC}"
    echo "  • Start each day: ukb --sync"
    echo "  • Capture insights: ukb --capture"
    echo "  • End of day: ukb --sync"
    echo ""
    echo -e "${BLUE}📖 Documentation: ~/Claude/knowledge-management/TEAM_SETUP.md${NC}"
}

# Main function
main() {
    show_header
    
    # Parse arguments
    case "${1:-}" in
        --member)
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo -e "${RED}❌ Usage: $0 --member \"Name\" \"email@company.com\"${NC}"
                exit 1
            fi
            
            # Check if this is a new machine
            if check_machine_status; then
                setup_claude_repository
            fi
            
            setup_team_member "$2" "$3"
            install_knowledge_system
            create_team_docs
            show_setup_summary
            ;;
        --install-only)
            install_knowledge_system
            ;;
        --docs-only)
            create_team_docs
            ;;
        *)
            echo -e "${YELLOW}🤔 Interactive Setup Mode${NC}"
            echo ""
            
            # Check machine status
            if check_machine_status; then
                setup_claude_repository
            fi
            
            # Get team member info
            echo -n -e "${CYAN}Enter your name: ${NC}"
            read -r member_name
            echo -n -e "${CYAN}Enter your email: ${NC}"
            read -r member_email
            
            if [ -n "$member_name" ] && [ -n "$member_email" ]; then
                setup_team_member "$member_name" "$member_email"
            fi
            
            install_knowledge_system
            create_team_docs
            show_setup_summary
            ;;
    esac
}

# Execute main function
main "$@"