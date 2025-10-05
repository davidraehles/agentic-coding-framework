# Status Line Icons Reference

## Overview

The Claude Code status line displays real-time information about your coding environment using emoji icons and color coding. This reference explains what each icon means.

## Status Line Format

```
[GCM✅] [C🟢 CA🟢] [🛡️ 85% 🔍EX] [🧠API✅]
```

**Current Project Highlighting**: The abbreviation for the current project is underlined in the session status display. For example, when working in the `coding` project, "C" will be underlined. When working in `curriculum-alignment`, "CA" will be underlined.

## Status Line Components

The status line consists of four main components in brackets:

### [GCM✅] - Global Configuration Manager

**Purpose**: Global system configuration and service management
**Icon**: GCM (Global Configuration Manager)

**Status Indicators:**
- **[GCM✅]** - Configuration manager operational (green)
- **[GCM⚠️]** - Configuration warnings detected (yellow)
- **[GCM❌]** - Configuration manager offline (red)

### [C🟢 CA🟢] - Session Services Status

**Purpose**: Multi-project session monitoring across all active projects
**Icons**: C (Coding), CA (Curriculum-Alignment), ND (Nano-Degree), etc.

**Display Format:**
- Shows all monitored projects with their health status
- Current project is **underlined** (e.g., <u>C</u>🟢 CA🟢 when in coding project)
- Each project followed by its health icon

**Status Indicators:**
- **[C🟢]** - Project services operational (green)
- **[C🟡]** - Project services degraded (yellow)
- **[C🔴]** - Project services offline (red)

**Project Abbreviations:**
- **C** - coding (main development hub)
- **CA** - curriculum-alignment
- **ND** - nano-degree
- Additional projects use smart abbreviation (first letters of words)

### [🛡️ 85% 🔍EX] - Live Guardrails (Constraint Monitor)

**Icon**: 🛡️ (Shield)
**Meaning**: Constraint monitoring and compliance protection

**Status Format**: `[🛡️ {percentage} {trajectory}]`

**Compliance Percentage (0-100%):**
- **85%** - Percentage-based compliance score
- **⚠️** - Active violations detected
- **❌** - Constraint monitor offline

**Trajectory Indicators:**
- **🔍EX** - **Exploring**: Researching, understanding, analyzing
- **📈ON** - **On Track**: Focused implementation work
- **📉OFF** - **Off Track**: Diverged from planned work
- **⚙️IMP** - **Implementing**: Active coding/building
- **✅VER** - **Verifying**: Testing, validation, review
- **🚫BLK** - **Blocked**: Stuck, waiting, dependencies

**Colors:**
- 🟢 Green: Excellent compliance (90%+)
- 🔵 Cyan: Good compliance (70-89%)
- 🟡 Yellow: Warning compliance (<70%)
- 🔴 Red: Critical violations or offline

### [🧠API✅] - Semantic Analysis Engine

**Icon**: 🧠 (Brain)
**Meaning**: AI-powered code analysis and API health

**Status Indicators:**
- **[🧠API✅]** - Semantic analysis API operational (green)
- **[🧠API⚠️]** - API degraded performance (yellow)
- **[🧠API❌]** - API offline or failing (red)

## Example Status Lines

### All Systems Operational (in coding project)
```
[GCM✅] [C🟢 CA🟢] [🛡️ 92% 📈ON] [🧠API✅]
```
- Global configuration manager operational
- Coding project active (underlined) and healthy
- Curriculum-alignment project healthy
- Excellent compliance (92%)
- On track with focused work
- Semantic analysis API operational

### Warning State (in curriculum-alignment project)
```
[GCM✅] [C🟢 CA🟡] [🛡️ 68% 🔍EX] [🧠API⚠️]
```
- Configuration manager operational
- Coding project healthy
- Curriculum-alignment active (underlined) with degraded services
- Low compliance (68%) needs attention
- Exploring/researching phase
- Semantic analysis API degraded

### Critical Issues
```
[GCM❌] [C🔴 CA🔴] [🛡️ ❌] [🧠API❌]
```
- Configuration manager offline
- All project services failed
- Constraint monitor offline
- Semantic analysis API offline

## Color Coding

The entire status line is colored based on the worst status:

- **🟢 Green**: All systems healthy
- **🟡 Yellow**: Some degradation or warnings
- **🔴 Red**: Critical issues or systems offline

## Architecture & Configuration

### System Architecture

The status line system follows a layered architecture:

1. **Claude Code Integration**: `~/.claude/settings.json` defines the status line command
2. **Main Orchestrator**: `scripts/combined-status-line-wrapper.js` sets environment
3. **Status Aggregator**: `scripts/combined-status-line.js` collects data from all sources
4. **Component Services**: Individual services provide status data

### Configuration Files

**Global Settings**: `~/.claude/settings.json`
```json
{
  "statusLine": {
    "type": "command",
    "command": "node /Users/q284340/Agentic/coding/scripts/combined-status-line-wrapper.js"
  }
}
```

**Project Settings**: `.claude/settings.local.json`
```json
{
  "statusLine": {
    "updateInterval": 5000,
    "enableConstraintMonitor": true
  }
}
```

### Data Flow

1. **Claude Code** calls the status line wrapper every 5 seconds
2. **Wrapper** sets `CODING_REPO` environment and calls main script
3. **Main Script** queries multiple data sources:
   - Global Configuration Manager (port checking, service discovery)
   - Core Services (Docker, databases, key infrastructure)
   - Constraint Monitor API (`integrations/mcp-constraint-monitor`)
   - Semantic Analysis API (AI/LLM services)
4. **Aggregation** combines all status data into formatted brackets
5. **Output** returns colored status line to Claude Code

## Troubleshooting

### No Status Line Displayed
1. Check Claude settings: `~/.claude/settings.json`
2. Verify script permissions: `ls -la scripts/combined-status-line*`
3. Test manually: `node scripts/combined-status-line-wrapper.js`

### Component-Specific Issues

**[GCM❌] Global Configuration Manager**
- Check port availability conflicts
- Verify environment variables
- Restart configuration services

**[C🔴] Core Services**
- Check Docker is running: `docker ps`
- Verify databases: `docker logs <container-name>`
- Restart infrastructure: `./start-services.sh`

**[🛡️ ❌] Constraint Monitor**
- Check constraint monitor API: `curl localhost:3031/api/health`
- Verify MCP constraint monitor: `cd integrations/mcp-constraint-monitor && npm run api`
- Check logs: `cd integrations/mcp-constraint-monitor && npm run logs`

**[🧠API❌] Semantic Analysis**
- Check semantic analysis server status
- Verify API credentials and limits
- Check network connectivity to AI services

### Performance Issues

**Slow Status Updates**
- Default update interval: 5 seconds
- Heavy API calls may cause delays
- Check individual service response times

**Status Line Flickering**
- Usually indicates service instability
- Check logs for repeated start/stop cycles
- May need service restart or configuration fix

## Implementation Details

### Key Files

- **`scripts/combined-status-line-wrapper.js`** - Environment setup and execution wrapper
- **`scripts/combined-status-line.js`** - Main status aggregation logic
- **`integrations/mcp-constraint-monitor/src/status/constraint-status-line.js`** - Constraint data provider
- **`~/.claude/settings.json`** - Claude Code integration configuration

### Service Dependencies

- **Docker** - Container infrastructure
- **MCP Constraint Monitor** - Compliance monitoring (port 3031)
- **Semantic Analysis Server** - AI-powered insights
- **VKB Server** - Knowledge base (port 8080)

### Performance Characteristics

- **Update Frequency**: 5 seconds (configurable)
- **Response Time**: <500ms typical
- **Cache Duration**: 2-5 seconds per component
- **Failover**: Graceful degradation when services unavailable

---

*This status line provides real-time feedback about your complete development environment health, coding compliance, and system status.*