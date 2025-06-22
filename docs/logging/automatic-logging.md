# Automatic Conversation Logging

![Claude MCP Auto-Logging](../images/claude-mcp-autologging.png)

## Overview

The Claude Code system includes **fully working** post-session automatic conversation logging that captures all interactions to `.specstory/history/` without any manual intervention. The system uses a robust Node.js post-processing script that analyzes completed Claude sessions to extract and save conversations, providing comprehensive logging with intelligent content routing.

**Status: ✅ FULLY OPERATIONAL** - Automatic conversation logging is working reliably across all Claude Code sessions.

## How It Works

### Architecture

1. **Automatic Trigger**: `claude-mcp` launcher automatically triggers post-session logging when Claude sessions end
2. **Post-Session Processing**: `post-session-logger.js` reliably processes Claude sessions after completion
3. **Session Data Analysis**: Robust analysis of session data to extract meaningful user/assistant exchanges  
4. **Post-Session Capture**: All conversations are captured and logged after Claude session termination
5. **Smart Content Routing**: Intelligent analysis determines routing to coding/.specstory/history/ vs current project
6. **Session Management**: Each session creates a properly timestamped log file in the appropriate repository
7. **Background Processing**: Silent background processing with no user intervention required

### Cross-Project Detection

The logging server automatically detects coding project work based on conversation content:

**Detection Keywords:**
- `ukb`, `vkb` - Knowledge management commands
- `shared-memory.json`, `knowledge-base` - Core knowledge files
- `mcp`, `claude-mcp` - MCP integration terms
- `specstory`, `claude-logger` - Logging system terms
- `coding project`, `claude tools` - Direct references
- `install.sh`, `knowledge management` - Setup and workflow terms
- `transferable pattern`, `shared knowledge`, `cross-project` - Knowledge concepts

### Dual Logging

When coding project work is detected in another project:
- **Primary Log**: Conversation logged to current project's `.specstory/history/`
- **Secondary Log**: Same conversation also logged to coding project's `.specstory/history/`
- **Metadata**: Secondary log includes cross-project source information

## Technical Implementation

### Post-Session Logger (`post-session-logger.js`)
- **Robust processing** of completed Claude session data to extract conversations
- **Reliable analysis** of session transcripts for conversation boundaries using pattern matching (`Human:`, `Assistant:`, etc.)
- **Comprehensive extraction** of meaningful exchanges between user and assistant
- **Structured logging** creates properly formatted conversation logs from session data
- **Intelligent routing** to appropriate `.specstory/history/` directories based on content analysis
- **Error handling** ensures logging continues even with partial session data

### Content-Aware Routing

The system intelligently routes conversations based on content analysis:

```javascript
// Enhanced content analysis for routing
function analyzeConversationContent(conversation) {
    const codingKeywords = [
        'ukb', 'vkb', 'shared-memory.json', 'mcp', 'claude-mcp',
        'knowledge management', 'transferable pattern', 'specstory'
    ];
    
    const hasCodeContent = codingKeywords.some(keyword => 
        conversation.toLowerCase().includes(keyword)
    );
    
    return {
        isPrimarilyCoding: hasCodeContent,
        shouldDualLog: hasCodeContent && !isInCodingProject()
    };
}
```

### Logging Workflow

```bash
# Start Claude session (logging automatically enabled)
claude-mcp

# Work on any project - logging happens transparently
# ... conversation with Claude ...

# Session ends - automatic post-processing begins
# 1. Session data extracted
# 2. Conversations parsed and formatted
# 3. Content analyzed for routing
# 4. Files written to appropriate .specstory/history/ directories
# 5. Cross-project copies created if needed
```

## File Naming Convention

### Standard Logs
```
.specstory/history/
├── 2024-12-16T15-30-45-claude-session.md
├── 2024-12-16T16-15-22-claude-session.md
└── 2024-12-16T17-45-10-claude-session.md
```

### Cross-Project Logs
```
# Primary location (current project)
current-project/.specstory/history/2024-12-16T15-30-45-claude-session.md

# Secondary location (coding project) 
coding/.specstory/history/2024-12-16T15-30-45-claude-session-from-other-project.md
```

## Configuration

### Enable/Disable Logging
```bash
# Enable automatic logging (default)
export CLAUDE_AUTO_LOG=true

# Disable automatic logging
export CLAUDE_AUTO_LOG=false
```

### Configure Log Destinations
```bash
# Set custom coding project path
export CODING_TOOLS_PATH="/custom/path/to/coding"

# Set custom specstory directory name
export SPECSTORY_DIR=".conversation-logs"
```

### Debug Mode
```bash
# Enable debug logging
export CLAUDE_LOG_DEBUG=true

# Check post-session logs
tail -f ~/.claude/post-session.log
```

## Benefits

### For Individual Developers
1. **Complete Session History**: Every interaction preserved automatically
2. **Cross-Project Tracking**: Coding work tracked regardless of current directory
3. **Zero Manual Effort**: No commands to remember or workflows to follow
4. **Searchable Archive**: All conversations available for reference

### For Teams
1. **Knowledge Preservation**: Important discussions automatically saved
2. **Audit Trail**: Complete record of AI-assisted development
3. **Learning Resource**: Team can learn from each other's AI interactions
4. **Compliance**: Automated logging for process requirements

### For Knowledge Management
1. **Insight Mining**: Rich source material for UKB analysis
2. **Pattern Recognition**: Automated detection of recurring solutions
3. **Cross-Session Learning**: Connect insights across multiple sessions
4. **Documentation Source**: Conversations become reference material

## Troubleshooting

### Common Issues

#### Logs Not Appearing
```bash
# Check if logging is enabled
echo $CLAUDE_AUTO_LOG

# Check specstory directory exists
ls -la .specstory/history/

# Check post-session logger
ps aux | grep post-session-logger
```

#### Permission Issues
```bash
# Fix directory permissions
chmod 755 .specstory/
chmod 755 .specstory/history/

# Fix file permissions
chmod 644 .specstory/history/*.md
```

#### Cross-Project Detection Not Working
```bash
# Check environment variables
echo $CODING_TOOLS_PATH

# Test detection manually
node post-session-logger.js --test-detection "ukb pattern example"
```

### Debug Workflow
```bash
# Enable all debug options
export CLAUDE_LOG_DEBUG=true
export CLAUDE_LOG_VERBOSE=true

# Start Claude session
claude-mcp

# Check logs after session
cat ~/.claude/post-session.log
cat ~/.claude/detection.log
```

## Advanced Features

### Custom Content Filters
```javascript
// Add custom detection rules
const customFilters = {
    projectSpecific: ['my-framework', 'custom-tool'],
    teamWorkflows: ['standup', 'retrospective'],
    complianceKeywords: ['security-review', 'audit-trail']
};
```

### Integration with Other Tools
```bash
# Export logs for analysis
find .specstory/history -name "*.md" | xargs cat > all-conversations.md

# Feed into UKB for knowledge extraction
ukb --analyze-conversations .specstory/history/

# Generate summaries
node scripts/conversation-summarizer.js .specstory/history/
```

## Future Enhancements

### Planned Features
1. **Real-time Streaming**: Live conversation capture during sessions
2. **Semantic Tagging**: Automatic topic classification
3. **Team Dashboards**: Visualization of team AI usage patterns
4. **Integration APIs**: Webhooks for external systems
5. **Privacy Controls**: Fine-grained content filtering

### Integration Opportunities
1. **Slack Integration**: Summary reports to team channels
2. **Confluence Integration**: Automatic wiki updates
3. **JIRA Integration**: Link conversations to tickets
4. **Analytics Platform**: Usage metrics and insights

## Related Documentation

- **[MCP Logger](mcp-logger.md)** - Technical implementation details
- **[Specstory Integration](specstory-integration.md)** - VSCode extension integration
- **[UKB User Guide](../ukb/user-guide.md)** - Knowledge extraction from logs
- **[System Architecture](../architecture/system-overview.md)** - Overall system design