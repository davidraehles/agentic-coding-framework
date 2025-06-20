# VKB Server

Node.js implementation of the VKB (View Knowledge Base) server management system.

## Overview

This module provides:
- HTTP server lifecycle management for the memory visualizer
- Data preparation and NDJSON conversion
- Cross-platform server management
- CLI interface for server control

## Architecture

```
vkb-server/
├── index.js          # Main VKBServer class
├── cli.js            # Commander-based CLI
├── server-manager.js # HTTP server lifecycle
├── data-processor.js # Memory data preparation
└── utils/
    └── logging.js    # Simple logging utility
```

## Usage

### As a Module

```javascript
import { VKBServer } from 'vkb-server';

const server = new VKBServer({
  port: 8080,
  projectRoot: '/path/to/coding'
});

// Start server
await server.start();

// Get status
const status = await server.status();

// Stop server
await server.stop();
```

### As a CLI

```bash
# Start server
vkb-cli server start

# Start in foreground
vkb-cli server start --foreground

# Stop server
vkb-cli server stop

# Get status
vkb-cli server status

# View logs
vkb-cli server logs -n 50
```

## Features

- **Automatic port management**: Detects and handles port conflicts
- **Process management**: Proper PID tracking and cleanup
- **Data synchronization**: Converts shared-memory.json to NDJSON format
- **Logging**: Structured logging with timestamps
- **Cross-platform**: Works on macOS, Linux, and Windows (with Python 3)

## Dependencies

- Node.js 14+
- Python 3 (for HTTP server)
- Commander (CLI framework)
- Chalk (terminal colors)
- Node-fetch (HTTP requests)

## Integration

This module is designed to work with:
- `knowledge-api`: For data access
- `memory-visualizer`: The React visualization app
- `ukb-cli`: For knowledge base updates