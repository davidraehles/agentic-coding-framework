#!/bin/bash
# Setup script for new knowledge management system
# This replaces the old broken scripts with the new working system

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_REPO="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up new knowledge management system...${NC}"
echo -e "${BLUE}================================================${NC}"

# Backup old scripts
echo -e "${YELLOW}📦 Backing up old scripts...${NC}"
mkdir -p "$SCRIPT_DIR/old-system-backup"
mv "$SCRIPT_DIR/ukb" "$SCRIPT_DIR/old-system-backup/" 2>/dev/null || true
mv "$SCRIPT_DIR/vkb" "$SCRIPT_DIR/old-system-backup/" 2>/dev/null || true

# Install new scripts
echo -e "${GREEN}✨ Installing new scripts...${NC}"
cp "$SCRIPT_DIR/ukb-new" "$SCRIPT_DIR/ukb"
cp "$SCRIPT_DIR/vkb-new" "$SCRIPT_DIR/vkb"
chmod +x "$SCRIPT_DIR/ukb" "$SCRIPT_DIR/vkb"

# Initialize shared memory if empty
if [[ ! -s "$CLAUDE_REPO/shared-memory.json" ]]; then
    echo -e "${BLUE}🗄️  Initializing shared memory...${NC}"
    cat > "$CLAUDE_REPO/shared-memory.json" << EOF
{
  "metadata": {
    "version": "1.0.0",
    "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "contributors": ["$(whoami)"],
    "total_entities": 0,
    "total_relations": 0
  },
  "entities": [],
  "relations": []
}
EOF
fi

# Create team setup documentation
echo -e "${BLUE}📚 Creating team setup documentation...${NC}"
cat > "$CLAUDE_REPO/TEAM_KNOWLEDGE_SETUP.md" << 'EOF'
# Team Knowledge Management Setup

## Quick Start

After cloning this repository, the knowledge management system is ready to use:

```bash
# Update knowledge base (capture session insights)
ukb

# View knowledge base (start visualization server)
vkb
```

## Commands

### ukb (Update Knowledge Base)
- **Purpose**: One-stop shop for capturing session insights
- **Usage**: `ukb` (always runs in auto mode)
- **What it does**:
  - Analyzes git commits from current session
  - Extracts insights and classifies them
  - Creates entities and relationships
  - Links everything to the current project
  - Updates shared memory (`shared-memory.json`)

### vkb (View Knowledge Base) 
- **Purpose**: Visualization server management
- **Usage**: 
  - `vkb` or `vkb start` - Start server
  - `vkb stop` - Stop server
  - `vkb restart` - Restart server
  - `vkb status` - Check status
  - `vkb logs` - View logs
- **What it does**:
  - Checks if visualization server is already running
  - Converts shared memory to visualization format
  - Starts HTTP server on localhost:8080
  - Opens browser automatically
  - Runs in background

## Architecture

### Shared Memory (`shared-memory.json`)
- Central knowledge repository for the team
- Git-tracked and shared across all team members
- Contains entities, relations, and metadata
- Automatically updated by `ukb` command

### Entity Types
- **Project**: Software projects (timeline, knowledge-management, etc.)
- **CodingInsight**: Insights extracted from commits
- **Component**: React/software components
- **Architecture**: Architectural patterns and decisions
- **Feature**: Application features and capabilities

### Classification Rules
- `fix:` commits → bug-fix category
- `feat:` commits → feature category  
- `perf:` commits → performance category
- `refactor:` commits → refactoring category
- `test:` commits → testing category
- `docs:` commits → documentation category

### Relationships
- All insights automatically linked to their project
- Components linked to projects they belong to
- Architectural patterns linked to projects that use them
- No orphaned nodes - everything connects to project hierarchy

## Directory Structure
```
Claude/
├── shared-memory.json              # Shared knowledge base
├── knowledge-management/
│   ├── ukb                        # Update Knowledge Base
│   ├── vkb                        # View Knowledge Base  
│   ├── insights/                  # Local insight files
│   └── relations/                 # Pending relations
└── TEAM_KNOWLEDGE_SETUP.md       # This file
```

## Team Workflow

1. **Daily Development**: Just work normally with git commits
2. **End of Session**: Run `ukb` to capture insights
3. **Knowledge Review**: Run `vkb` to visualize and explore
4. **Team Sync**: Git push/pull shares knowledge automatically

## Troubleshooting

### Server Issues
```bash
vkb stop    # Stop any stuck servers
vkb start   # Start fresh
```

### Memory Issues  
- Shared memory is in git - just pull latest
- If corrupted, check git history for last good version

### Missing Dependencies
- Requires: `jq`, `python3`, `curl`, `lsof`
- Install via package manager (brew, apt, etc.)
EOF

echo -e "${GREEN}✅ New knowledge management system installed!${NC}"
echo -e "${GREEN}📊 Shared memory: $CLAUDE_REPO/shared-memory.json${NC}"
echo -e "${GREEN}📚 Team docs: $CLAUDE_REPO/TEAM_KNOWLEDGE_SETUP.md${NC}"
echo ""
echo -e "${BLUE}🚀 Try it out:${NC}"
echo -e "${BLUE}  ukb    # Capture current session insights${NC}"
echo -e "${BLUE}  vkb    # View knowledge base visualization${NC}"