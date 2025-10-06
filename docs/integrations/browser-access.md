# Browser Access Integration

**Component**: [browser-access](../../integrations/browser-access/)
**Type**: MCP Server (Stagehand browser automation)
**Purpose**: Browser automation for web research and testing

---

## What It Provides

Browser automation capabilities through the Stagehand MCP server, enabling Claude Code to interact with web pages, scrape data, and perform automated testing.

### Core Capabilities

- **Page Navigation** - Visit URLs, click links, fill forms
- **Data Extraction** - Scrape content from web pages
- **Web Interaction** - Submit forms, trigger actions
- **Screenshot Capture** - Visual documentation
- **Automated Testing** - E2E test execution

---

## Integration with Coding

### How It Connects

Browser Access integrates as an MCP server providing browser control tools to Claude Code.

### Configuration

Requires Chrome/Chromium with debugging enabled:

```bash
# Start Chrome with debugging port
chrome --remote-debugging-port=9222
```

Configure in `.env`:
```env
LOCAL_CDP_URL=ws://localhost:9222
ANTHROPIC_API_KEY=your-key-here
```

### Usage Examples

**Navigate and Extract:**
```
# Visit page and extract data
stagehand_navigate { "url": "https://example.com" }
stagehand_extract {}
```

**Interact with Page:**
```
# Click elements and submit forms
stagehand_act {
  "action": "Click the login button"
}
```

**Observe Elements:**
```
# Find specific elements
stagehand_observe {
  "instruction": "find the search input"
}
```

---

## Full Documentation

For complete documentation, see:

**[integrations/browser-access/README.md](../../integrations/browser-access/README.md)**

---

## See Also

- [System Overview](../system-overview.md#browser-access-stagehand)
- [Integration Overview](README.md)
