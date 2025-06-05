# Team Knowledge Management Setup

> **📚 For complete documentation, see [docs/documentation.md](docs/documentation.md)**

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
├── README.md                      # Main documentation entry point
├── TEAM_KNOWLEDGE_SETUP.md       # This quick setup guide
├── docs/                          # Complete documentation
│   ├── documentation.md           # Comprehensive system docs
│   └── imag/                      # Architecture diagrams
├── shared-memory.json             # Shared knowledge base
└── knowledge-management/
    ├── ukb                        # Update Knowledge Base
    ├── vkb                        # View Knowledge Base
    ├── browser                    # Browser integration
    └── dist/                      # Visualization files
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
