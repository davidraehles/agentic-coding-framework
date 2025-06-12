# Claude Logger MCP Server Documentation

An MCP (Model Context Protocol) server that provides SpecStory-compatible conversation logging for Claude Code sessions with automatic logging capabilities. The server automatically saves all Claude Code conversations to `.specstory/history/` directory when auto-logging is enabled.

**Enhanced Feature**: The server now includes cross-project logging detection - automatically dual-logs coding project work to both the current project and the coding project's history when relevant keywords are detected.

## Overview

The Claude Logger MCP server captures and stores Claude Code conversations in well-formatted Markdown files following the SpecStory format. It creates a persistent history of AI interactions that can be searched, referenced, and analyzed. The server now supports both manual and automatic logging modes.

## Architecture

```
claude-logger-mcp/
├── src/
│   ├── index.ts          # Main MCP server implementation
│   ├── index-auto.ts     # Auto-logging server with cross-project detection
│   └── logger.ts         # Core logging functionality
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
└── README.md            # Detailed usage documentation
```

## Installation & Configuration

### 1. Build the Server
```bash
cd claude-logger-mcp
npm install
npm run build
```

### 2. Configure Claude Code MCP
Add to `claude-code-mcp.json` (automatically done by install.sh):
```json
{
  "mcpServers": {
    "claude-logger": {
      "command": "node",
      "args": ["{{CLAUDE_PROJECT_PATH}}/claude-logger-mcp/dist/index-auto.js"],
      "env": {
        "PROJECT_PATH": "{{CLAUDE_PROJECT_PATH}}",
        "CLAUDE_TOOLS_PATH": "{{CLAUDE_PROJECT_PATH}}"
      }
    }
  }
}
```

Note: The server uses `index-auto.js` for automatic logging with cross-project detection.

## Available Tools

### Automatic Logging Tools
| Tool | Purpose | Required Parameters |
|------|---------|-------------------|
| `enable_auto_logging` | 🔴 Start automatic conversation logging | None |
| `disable_auto_logging` | ⏹️ Stop automatic logging | None |
| `auto_log_status` | 📊 Check auto-logging status | None |
| `log_message` | Queue message for auto-logging (internal) | `type`, `content` |

### Manual Logging Tools
| Tool | Purpose | Required Parameters |
|------|---------|-------------------|
| `start_session` | Begin new conversation session | `session_id` |
| `log_conversation` | Record user-assistant exchange | `session_id`, `user_message`, `assistant_message` |
| `end_session` | Close session with summary | `session_id` |
| `list_sessions` | Browse conversation history | None |
| `get_session` | Retrieve specific session | `session_id` |

## Output Format

Sessions are stored in `.specstory/history/` as markdown files with the naming convention:
`YYYY-MM-DD_HH-MM-descriptive-title.md`

```markdown
# Conversation Session: session-name

**Session ID:** unique-id  
**Started:** 2025-06-05T10:30:00.000Z  
**Project:** /Users/q284340/Claude  

---

## User
*2025-06-05T10:30:15.000Z*

User message content...

## Assistant
*2025-06-05T10:30:20.000Z*

Assistant response...

<details>
<summary>Metadata</summary>

Model: claude-opus-4-20250514  
Tools Used: read_file, write_file  
Branch: main  
</details>

---

**Session Ended:** 2025-06-05T10:45:00.000Z  
**Total Messages:** 2
```

### Cross-Project Logging
When coding project work is detected in another project context, the conversation is dual-logged:
- Primary log: Current project's `.specstory/history/`
- Secondary log: Coding project's `.specstory/history/` with `-cross-project` suffix
- Metadata includes: `project_path: "/original/project (cross-project from coding tools)"`

## Integration Points

### SpecStory Compatibility
- Stores logs in standard `.specstory/history` directory
- Compatible with SpecStory VS Code extension
- Follows SpecStory markdown format specification
- Maintains metadata for context references

### Claude Code Integration
- Captures conversation metadata (model, tools, timestamps)
- Tracks project context and Git branch information
- Designed for seamless Claude Code workflow integration
- Supports session-based conversation management

## Usage Examples

### Automatic Logging (Recommended)
To enable automatic logging of all conversations:

1. **Start auto-logging**:
   ```
   User: Please enable automatic logging
   Assistant: [Calls enable_auto_logging tool]
   🔴 Auto-logging enabled! Conversations will be saved to:
   /Users/q284340/Agentic/coding/.specstory/history/2025-06-05-Auto-logged Claude Code Session.md
   ```

2. **Check status**:
   ```
   User: Is auto-logging active?
   Assistant: [Calls auto_log_status tool]
   📊 Auto-logging is ENABLED
   🆔 Current session: 2025-06-05-Auto-logged Claude Code Session
   📁 Logs directory: /Users/q284340/Agentic/coding/.specstory/history/
   ```

3. **Disable when done**:
   ```
   User: Stop logging
   Assistant: [Calls disable_auto_logging tool]
   ⏹️ Auto-logging disabled.
   ```

### Manual Logging
```typescript
// Start session
await startSession("feature-implementation", "/project/path", "Add new API endpoint");

// Log conversation
await logConversation(
  "feature-implementation",
  "Create a new REST endpoint for user profiles",
  "I'll create the endpoint with proper validation...",
  {
    timestamp: "2025-06-05T10:30:00.000Z",
    model: "claude-sonnet-4-20250514",
    tools_used: ["write_file", "read_file"],
    branch: "feature/user-profiles"
  }
);

// End session
await endSession("feature-implementation", "Successfully implemented user profile endpoint with tests");
```

## Technical Implementation

### Core Components

**index.ts** - Manual MCP Server (`claude-logger-mcp/src/index.ts`)
- Implements MCP protocol handlers
- Provides manual logging tools
- Manages tool request routing and error handling

**index-auto.ts** - Auto-logging MCP Server (`claude-logger-mcp/src/index-auto.ts`)
- Automatic conversation capture without manual tool calls
- Cross-project detection using keyword matching
- Dual logging for coding project work from other contexts
- Filename normalization to YYYY-MM-DD_HH-MM format

**logger.ts** - SpecStory Logger
- Handles file system operations for `.specstory/history`
- Formats conversations into SpecStory markdown
- Manages session lifecycle and metadata
- Consistent filename generation and sanitization

**Cross-Project Detection Keywords**:
- `ukb`, `vkb`, `shared-memory.json`, `knowledge-base`
- `mcp`, `claude-mcp`, `specstory`, `claude-logger`
- `coding project`, `claude tools`, `install.sh`
- `knowledge management`, `transferable pattern`

### Dependencies
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `fs-extra`: Enhanced file system operations
- `sanitize-filename`: Safe filename generation

## Directory Structure

```
project-root/
├── .specstory/
│   ├── .gitignore
│   ├── .what-is-this.md      # SpecStory documentation
│   └── history/
│       ├── 2025-06-05-session-1.md
│       ├── 2025-06-05-session-2.md
│       └── ...
```

## Configuration Options

### Environment Variables
- `PROJECT_PATH`: Base directory for logging (default: current working directory)

### Session Management
- Automatic timestamp generation
- Unique session ID validation
- Project path filtering for multi-project setups
- Branch tracking for Git-based workflows

## Best Practices

1. **Session Naming**: Use descriptive session IDs that reflect the task
2. **Metadata Capture**: Include relevant context (branch, tools, model)
3. **Regular Sessions**: Start/end sessions for logical conversation boundaries
4. **Summary Writing**: Provide meaningful session summaries for future reference
5. **Cross-Project Work**: When working on coding tools from other projects, logs are automatically dual-saved
6. **Filename Convention**: All files follow `YYYY-MM-DD_HH-MM-descriptive-title.md` format

## How to Use Auto-Logging

### Step 1: Enable the MCP Server
The server is already configured in your `claude-code-mcp.json`. Claude Code will start it automatically.

### Step 2: Start Auto-Logging
Simply tell Claude Code to enable auto-logging:
```
"Please enable automatic logging"
```

### Step 3: Continue Conversations
Once enabled, ALL your conversations will be automatically saved to `.specstory/history/` without any additional commands needed.

### Step 4: View Your Logs
Your conversations are saved as markdown files in:
```
/Users/q284340/Agentic/coding/.specstory/history/
```

Each file is named with timestamp and contains the full conversation with metadata.

## Troubleshooting

### Common Issues
- **Auto-logging not working**: The auto-logging feature requires the `log_message` tool to be called after each message exchange. When auto-logging is enabled, Claude Code will automatically handle this for you.
- **Server hangs on stdio**: Expected MCP behavior - server waits for protocol messages
- **Permission errors**: Ensure write access to project directory
- **Session not found**: Verify session was properly started before logging

### Debugging
```bash
# Check if server builds correctly
npm run build

# Verify MCP configuration
cat claude-code-mcp.json

# Check log directory
ls -la .specstory/history/

# Enable debug logging
DEBUG_LOGGING=1 node /path/to/dist/index.js
```

## Related Documentation

- [Main System Documentation](./documentation.md)
- [Enhanced Cross-Project Logging](./enhanced-cross-project-logging.md)
- [SpecStory Format Reference](../.specstory/.what-is-this.md)
- [MCP Configuration](../claude-code-mcp.json)
- [Cross-Project Logging Pattern](../knowledge-management/insights/CrossProjectLoggingPattern.md)
