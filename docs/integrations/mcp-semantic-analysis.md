# MCP Semantic Analysis Integration

**Component**: [mcp-server-semantic-analysis](../../integrations/mcp-server-semantic-analysis/)
**Type**: MCP Server (Node.js)
**Purpose**: AI-powered code analysis with 11 specialized agents

---

## What It Provides

The MCP Semantic Analysis Server is a standalone Node.js application that provides comprehensive AI-powered code analysis through the Model Context Protocol.

### 11 Intelligent Agents

1. **GitHistoryAgent** - Analyzes git commits and architectural decisions
2. **VibeHistoryAgent** - Processes conversation files for context
3. **SemanticAnalysisAgent** - Deep code analysis correlating git and conversations
4. **WebSearchAgent** - External pattern research and reference gathering
5. **InsightGenerationAgent** - Generates insights with PlantUML diagrams
6. **ObservationGenerationAgent** - Creates structured UKB-compatible observations
7. **QualityAssuranceAgent** - Validates outputs with auto-correction
8. **PersistenceAgent** - Manages knowledge base persistence
9. **SynchronizationAgent** - Multi-source data synchronization
10. **DeduplicationAgent** - Semantic duplicate detection and merging
11. **CoordinatorAgent** - Workflow orchestration and agent coordination

### 12 MCP Tools

- `heartbeat` - Connection health monitoring
- `test_connection` - Server connectivity verification
- `determine_insights` - AI-powered content insight extraction
- `analyze_code` - Code pattern and quality analysis
- `analyze_repository` - Repository-wide architecture analysis
- `extract_patterns` - Reusable design pattern identification
- `create_ukb_entity_with_insight` - Knowledge base entity creation
- `execute_workflow` - Coordinated multi-agent workflows
- `generate_documentation` - Automated documentation generation
- `create_insight_report` - Detailed analysis reports
- `generate_plantuml_diagrams` - Architecture diagram generation
- `generate_lessons_learned` - Lessons learned document creation

---

## Integration with Coding

### How It Connects

The MCP server integrates with Claude Code through the Model Context Protocol:

```
Claude Code → MCP Protocol → Semantic Analysis Server → 11 Agents → Analysis Results
```

### Configuration

Configured in `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "semantic-analysis": {
      "command": "node",
      "args": ["/Users/<username>/Agentic/coding/integrations/mcp-server-semantic-analysis/build/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here",
        "OPENAI_API_KEY": "optional-fallback"
      }
    }
  }
}
```

### Usage in Workflows

**Within Claude Code session:**

```
# Analyze current repository
determine_insights {
  "repository": ".",
  "conversationContext": "Current refactoring work",
  "depth": 10
}

# Execute complete analysis workflow
execute_workflow {
  "workflow_name": "complete-analysis"
}

# Extract patterns from code
extract_patterns {
  "source": "authentication module",
  "pattern_types": ["design", "security"]
}
```

---

## Performance & Resources

- **Startup Time**: ~2s
- **Memory**: ~200MB
- **Analysis Time**: 1-5 minutes for full repository
- **LLM Provider**: Anthropic Claude (primary), OpenAI GPT (fallback)

---

## Full Documentation

For complete documentation, see:

**[integrations/mcp-server-semantic-analysis/README.md](../../integrations/mcp-server-semantic-analysis/README.md)**

Topics covered:
- Detailed agent descriptions
- Complete tool reference
- Configuration options
- Workflow examples
- Troubleshooting guide
- Development guide

---

## See Also

- [System Overview](../system-overview.md#mcp-semantic-analysis-server)
- [Knowledge Management](../knowledge-management/README.md)
- [Integration Overview](README.md)
