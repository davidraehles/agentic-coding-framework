# Coding Repository Project Structure

## Purpose
Unified Semantic Analysis & Knowledge Management System - A comprehensive AI-powered development toolkit with Live Session Logging (LSL) capabilities.

## Architecture
- **Entry Point**: `bin/coding` - unified launcher that auto-detects Claude vs CoPilot
- **Core Systems**: Enhanced LSL, Global Coordinator, MCP servers, Semantic Analysis
- **Key Flow**: bin/coding → launch-claude.sh → global-lsl-coordinator.js → enhanced-transcript-monitor.js

## Key Directories
- `/bin/` - Entry point scripts
- `/scripts/` - Core processing scripts including LSL system  
- `/src/` - Source code including live-logging system
- `/lib/` - Library code
- `/integrations/` - MCP and other integrations
- `/.specstory/` - LSL generated files

## Critical Scripts
- `bin/coding` - Main entry point
- `scripts/launch-claude.sh` - Claude launcher with LSL setup
- `scripts/global-lsl-coordinator.js` - Multi-project LSL management
- `scripts/enhanced-transcript-monitor.js` - Core LSL processing (supports --reprocess)
- `src/live-logging/` - Core LSL processing classes

## Tech Stack
- Node.js (ES modules)
- Live Session Logging system
- MCP (Model Context Protocol) servers
- Semantic analysis with multiple LLM providers