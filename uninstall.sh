#!/bin/bash
# Coding Tools System - Uninstall Script
# Removes installations but preserves data

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CODING_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}🗑️  Coding Tools System - Uninstaller${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""
echo -e "${RED}⚠️  WARNING: This will remove installed components${NC}"
echo -e "${GREEN}✅ Your knowledge data (shared-memory*.json) will be preserved${NC}"
echo ""
read -p "Continue with uninstall? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstall cancelled."
    exit 0
fi

echo -e "\n${BLUE}🔧 Removing shell configuration...${NC}"
# Remove from common shell configs
for rc_file in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.bash_profile"; do
    if [[ -f "$rc_file" ]]; then
        # Remove old Claude Knowledge Management System entries
        sed -i '/# Claude Knowledge Management System/,+3d' "$rc_file" 2>/dev/null || true
        # Remove new Coding Tools entries
        sed -i '/# Coding Tools - Start/,/# Coding Tools - End/d' "$rc_file" 2>/dev/null || true
        # Remove any CODING_TOOLS_PATH or CODING_REPO entries
        sed -i '/CODING_TOOLS_PATH/d' "$rc_file" 2>/dev/null || true
        sed -i '/CODING_REPO/d' "$rc_file" 2>/dev/null || true
        # Remove team configuration
        sed -i '/# Coding Tools - Team Configuration/,+1d' "$rc_file" 2>/dev/null || true
        sed -i '/CODING_TEAM/d' "$rc_file" 2>/dev/null || true
        # Remove any PATH additions for coding tools
        sed -i '/knowledge-management.*coding/d' "$rc_file" 2>/dev/null || true
        echo "  Cleaned $rc_file"
    fi
done

echo -e "\n${BLUE}🗑️  Removing installed components...${NC}"
# Remove bin directory
if [[ -d "$CODING_REPO/bin" ]]; then
    rm -rf "$CODING_REPO/bin"
    echo "  Removed bin directory"
fi

# Remove memory-visualizer (if installed by us)
if [[ -d "$CODING_REPO/memory-visualizer" ]]; then
    rm -rf "$CODING_REPO/memory-visualizer"
    echo "  Removed memory-visualizer"
fi

# Remove mcp-server-browserbase (if installed by us)
if [[ -d "$CODING_REPO/integrations/mcp-server-browserbase" ]]; then
    rm -rf "$CODING_REPO/integrations/mcp-server-browserbase"
    echo "  Removed mcp-server-browserbase"
fi

# Remove semantic analysis system (preserving knowledge data)
if [[ -d "$CODING_REPO/integrations/mcp-server-semantic-analysis" ]]; then
    echo "  Removing semantic analysis system..."
    
    # Remove Python virtual environment
    if [[ -d "$CODING_REPO/integrations/mcp-server-semantic-analysis/venv" ]]; then
        rm -rf "$CODING_REPO/integrations/mcp-server-semantic-analysis/venv"
        echo "    Removed Python virtual environment"
    fi
    
    # Remove Python cache directories
    find "$CODING_REPO/integrations/mcp-server-semantic-analysis" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$CODING_REPO/integrations/mcp-server-semantic-analysis" -name "*.pyc" -delete 2>/dev/null || true
    
    # Remove logs directory
    if [[ -d "$CODING_REPO/integrations/mcp-server-semantic-analysis/logs" ]]; then
        rm -rf "$CODING_REPO/integrations/mcp-server-semantic-analysis/logs"
        echo "    Removed semantic analysis logs"
    fi
    
    # Remove reports directory
    if [[ -d "$CODING_REPO/integrations/mcp-server-semantic-analysis/reports" ]]; then
        rm -rf "$CODING_REPO/integrations/mcp-server-semantic-analysis/reports"
        echo "    Removed analysis reports"
    fi
    
    # Note: We preserve the source code since it might be a local development environment
    echo "  Semantic analysis system cleaned (source code preserved)"
fi

# Clean up node_modules in MCP servers
for dir in "integrations/browser-access" "integrations/claude-logger-mcp" "mcp-memory-server"; do
    if [[ -d "$CODING_REPO/$dir/node_modules" ]]; then
        rm -rf "$CODING_REPO/$dir/node_modules"
        echo "  Removed $dir/node_modules"
    fi
    if [[ -d "$CODING_REPO/$dir/dist" ]]; then
        rm -rf "$CODING_REPO/$dir/dist"
        echo "  Removed $dir/dist"
    fi
done

# Remove .coding-tools directory
if [[ -d "$HOME/.coding-tools" ]]; then
    rm -rf "$HOME/.coding-tools"
    echo "  Removed ~/.coding-tools"
fi

# Remove logs
rm -f "$CODING_REPO/install.log" 2>/dev/null || true
rm -f /tmp/ukb-*.log 2>/dev/null || true
rm -f /tmp/vkb-server.* 2>/dev/null || true

echo -e "\n${GREEN}✅ Uninstall completed!${NC}"
echo -e "${GREEN}📊 Your knowledge data has been preserved:${NC}"
echo "   $CODING_REPO/shared-memory.json (if exists)"

# List team-specific knowledge files
TEAM_FILES=$(find "$CODING_REPO" -name "shared-memory-*.json" 2>/dev/null || true)
if [[ -n "$TEAM_FILES" ]]; then
    echo -e "${GREEN}📊 Team-specific knowledge files preserved:${NC}"
    echo "$TEAM_FILES" | while read -r file; do
        [[ -n "$file" ]] && echo "   $(basename "$file")"
    done
fi

echo ""
echo "To reinstall, run: ./install.sh"
echo "Your team configuration will need to be set up again during installation."