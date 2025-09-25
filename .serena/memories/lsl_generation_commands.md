# LSL Generation Commands

## Safe LSL Generation for External Projects

### Primary Method (Recommended)
```bash
TRANSCRIPT_SOURCE_PROJECT="/Users/q284340/Agentic/nano-degree" \
CODING_TOOLS_PATH="/Users/q284340/Agentic/coding" \
node /Users/q284340/Agentic/coding/scripts/enhanced-transcript-monitor.js --reprocess
```

### With Parallel Processing (Faster)
```bash
TRANSCRIPT_SOURCE_PROJECT="/Users/q284340/Agentic/nano-degree" \
CODING_TOOLS_PATH="/Users/q284340/Agentic/coding" \
node /Users/q284340/Agentic/coding/scripts/enhanced-transcript-monitor.js --reprocess --parallel
```

### Key Environment Variables
- `TRANSCRIPT_SOURCE_PROJECT` - Target project directory for LSL generation
- `CODING_TOOLS_PATH` - Path to coding repository with LSL scripts

### How It Works
1. Reads Claude transcripts from `~/.claude/projects/` directories
2. Processes them using the enhanced transcript monitor
3. Generates LSL files in target project's `.specstory/history/` directory
4. Uses existing production-ready classification and security systems

### Safety
- Does NOT modify any existing scripts
- Uses the same system that runs during normal Claude sessions  
- Respects all existing security and classification layers