# System Overview

## Architecture Components

### Core Components
- **UKB (Universal Knowledge Base)**: Knowledge management CLI
- **VKB (View Knowledge Base)**: Knowledge visualization server
- **MCP Servers**: Model Context Protocol servers for Claude integration
- **Fallback Services**: HTTP services for GitHub Copilot integration

### Agent Support
- **Claude Code**: Primary agent with MCP server integration
- **GitHub Copilot**: Secondary agent with HTTP fallback services

### Knowledge Management
- **Entity System**: Structured knowledge entities with observations
- **Relation System**: Relationships between entities
- **Multi-Team Support**: Team-specific knowledge bases

### Integration Points
- **VS Code Extension**: Copilot chat participant bridge
- **Post-Session Logging**: Automatic conversation capture
- **Git Integration**: Commit-based knowledge extraction

## Data Flow

1. **Knowledge Capture**: `ukb` extracts insights from git commits
2. **Knowledge Storage**: Entities and relations stored in JSON files
3. **Knowledge Visualization**: `vkb` provides web-based graph visualization
4. **Agent Integration**: MCP servers provide knowledge access to Claude

## Configuration

- **MCP Configuration**: `claude-code-mcp.json` template with placeholders
- **Environment Variables**: Auto-detection and configuration
- **Team Configuration**: `CODING_TEAM` environment variable

## Service Architecture

### Claude Code Path
1. `coding --claude` → `launch-claude.sh` → `start-services.sh` → `claude-mcp`
2. MCP servers auto-start with Claude
3. Memory service provides knowledge graph access

### GitHub Copilot Path
1. `coding --copilot` → `launch-copilot.sh` → fallback services
2. HTTP services provide knowledge access
3. VS Code extension bridges Copilot to services