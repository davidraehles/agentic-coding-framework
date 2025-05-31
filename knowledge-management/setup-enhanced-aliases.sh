#!/bin/bash

# Setup Enhanced Knowledge Management Aliases
# Adds improved aliases with validation to shell configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect shell and config file
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
    # Also check for .bash_profile on macOS
    [ -f "$HOME/.bash_profile" ] && SHELL_CONFIG="$HOME/.bash_profile"
else
    echo -e "${YELLOW}⚠️  Unknown shell, defaulting to .bashrc${NC}"
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="unknown"
fi

echo -e "${BLUE}🔧 Setting up enhanced knowledge management aliases for $SHELL_NAME${NC}"
echo "Config file: $SHELL_CONFIG"
echo ""

# Backup existing config
if [ -f "$SHELL_CONFIG" ]; then
    cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✅ Backed up existing configuration${NC}"
fi

# Enhanced aliases
ALIASES_SECTION="
# ===============================================
# Enhanced Knowledge Management Aliases
# ===============================================

# Enhanced capture with validation
alias cci-enhanced='$HOME/Claude/knowledge-management/enhanced-capture-insight.sh'
alias cciv='$HOME/Claude/knowledge-management/enhanced-capture-insight.sh --validate'

# Original capture (legacy)
alias cci='$HOME/Claude/knowledge-management/capture-coding-insight.sh'

# Validation and maintenance
alias vkc='$HOME/Claude/knowledge-management/validate-knowledge-connections.sh'

# Session summary and knowledge base viewing
alias scs='$HOME/Claude/knowledge-management/summarize-coding-session.sh'
alias vkb='$HOME/Claude/knowledge-management/view-knowledge-base.sh'

# Quick capture with common categories
alias cci-bug='cci-enhanced -c bug-fix'
alias cci-feat='cci-enhanced -c feature'
alias cci-perf='cci-enhanced -c performance'
alias cci-arch='cci-enhanced -c architecture'
alias cci-refactor='cci-enhanced -c refactoring'

# Project-specific captures
alias cci-timeline='cci-enhanced -j timeline --relates-to \"TimelineProject,Redux Store Architecture\"'

echo \"📚 Enhanced Knowledge Management aliases loaded!\"
echo \"Use 'cci-enhanced' for validated captures or 'cciv' for capture + validation\"
"

# Add aliases to shell config
echo "$ALIASES_SECTION" >> "$SHELL_CONFIG"

echo -e "${GREEN}✅ Enhanced aliases added to $SHELL_CONFIG${NC}"
echo ""
echo -e "${YELLOW}📝 New commands available:${NC}"
echo "  cci-enhanced  - Enhanced capture with validation"
echo "  cciv          - Capture + immediate validation"
echo "  vkc           - Validate knowledge connections"
echo "  cci-timeline  - Quick timeline project capture"
echo "  cci-bug       - Quick bug fix capture"
echo "  cci-feat      - Quick feature capture"
echo "  cci-perf      - Quick performance capture"
echo ""
echo -e "${BLUE}🔄 Reload your shell or run: source $SHELL_CONFIG${NC}"