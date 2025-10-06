# VSCode CoPilot Integration

**Component**: [vscode-km-copilot](../../integrations/vscode-km-copilot/)
**Type**: VSCode Extension
**Purpose**: Enhanced GitHub CoPilot with knowledge management

---

## What It Provides

VSCode extension that enhances GitHub CoPilot with knowledge management capabilities, providing seamless access to UKB/VKB from within the editor.

### Core Features

- **Command Palette Integration** - View/Update KB commands
- **CoPilot Chat Commands** - `@KM` agent for knowledge access
- **Knowledge Base Access** - Query accumulated patterns from CoPilot
- **Insight Capture** - Add insights directly from VSCode
- **Web Visualization** - Open VKB in browser from VSCode

---

## Integration with Coding

### How It Connects

The extension communicates with the Coding system through:
1. HTTP API (port 8765) for knowledge management operations
2. Shared knowledge base files (shared-memory.json)
3. Command-line tools (ukb/vkb)

### Installation

```bash
# Build extension
cd integrations/vscode-km-copilot
npm install
npm run package

# Install in VSCode
code --install-extension km-copilot-bridge-*.vsix
```

### Configuration

Start fallback services first:
```bash
coding --copilot
```

This starts the HTTP API that the extension communicates with.

### Usage Examples

**Command Palette:**
- `Ctrl+Shift+P` → `View Knowledge Base`
- `Ctrl+Shift+P` → `Update Knowledge Base`

**CoPilot Chat:**
```
@KM vkb
@KM ukb Problem: X, Solution: Y
@KM search authentication patterns
```

---

## Full Documentation

For complete documentation, see:

**[integrations/vscode-km-copilot/README.md](../../integrations/vscode-km-copilot/README.md)**

Topics covered:
- Installation guide
- Command reference
- Configuration options
- Troubleshooting
- Development guide

---

## See Also

- [System Overview](../system-overview.md#vscode-copilot-integration)
- [Knowledge Management](../knowledge-management/README.md)
- [Integration Overview](README.md)
