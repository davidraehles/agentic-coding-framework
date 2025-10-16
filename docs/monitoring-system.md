# Process Monitoring System

**Version**: 3.0
**Last Updated**: 2025-10-15
**Status**: Production

## Overview

The monitoring system provides unified process tracking, health monitoring, and automatic recovery for all coding project services. All process state is managed through the **Process State Manager (PSM)** as the single source of truth.

## Architecture

![Monitoring Architecture](images/monitoring-architecture.png)

### Core Components

#### 1. Process State Manager (PSM)
**File**: `scripts/process-state-manager.js`
**Purpose**: Centralized process registry with atomic operations and health tracking
**Registry**: `.live-process-registry.json`

**Features**:
- Atomic file operations with proper locking
- Session-aware service tracking (global, per-project, per-session)
- Automatic dead process cleanup
- Health check timestamp management

#### 2. Global Service Coordinator
**File**: `scripts/global-service-coordinator.js`
**Purpose**: Service lifecycle management (start/stop/restart/health checks)

**Features**:
- Spawns and manages service processes
- Automatic restart on failure with exponential backoff
- Integrates with PSM for all state tracking
- Self-registration with PSM for monitoring

#### 3. System Monitor Watchdog
**File**: `scripts/system-monitor-watchdog.js`
**Purpose**: Failsafe monitor for coordinator health
**Execution**: Via launchd every 60 seconds

**Features**:
- Monitors coordinator via PSM queries
- Restarts coordinator if dead or stale
- Registers restarts with PSM

#### 4. Session Management
**Files**: `scripts/launch-claude.sh`, `scripts/psm-register-session.js`, `scripts/psm-session-cleanup.js`
**Purpose**: Automatic service lifecycle tied to Claude sessions

**Features**:
- Session registration on Claude startup
- Trap handlers for cleanup (EXIT, INT, TERM)
- Automatic service termination on session end

## Service Types

| Type | Scope | Lifecycle | Examples |
|------|-------|-----------|----------|
| `global` | System-wide singleton | Managed by coordinator/watchdog | `vkb-server`, `constraint-dashboard`, `global-service-coordinator` |
| `per-project` | One instance per project | Managed by coordinator | `transcript-monitor`, `trajectory-generator` |
| `per-session` | Tied to Claude session | Auto-cleanup on session end | Custom session services |

## Health Check Flow

![Health Check Sequence](images/monitoring-health-check-sequence.png)

### Watchdog Health Check (Every 60s)
```
1. Watchdog → PSM: Query coordinator status
2. PSM → Registry: Read .live-process-registry.json with lock
3. PSM → Watchdog: Return service data
4. Watchdog: Verify PID alive + health age < 120s
5. If unhealthy: Kill stale → Spawn new → Register with PSM
```

### Coordinator Health Check (Every 15s)
```
For each managed service:
1. Coordinator → PSM: Check service health
2. PSM: Verify PID exists + health timestamp fresh
3. If healthy: Coordinator → PSM: Refresh health timestamp
4. If unhealthy: Attempt restart → Register new PID with PSM
```

## Service Lifecycle

![Service Lifecycle States](images/service-lifecycle-state.png)

### State Transitions

**Startup** (Unregistered → Running):
```javascript
// Spawn service
const child = spawn('node', [scriptPath, ...args]);

// Register with PSM
await psm.registerService({
  name: 'service-name',
  pid: child.pid,
  type: 'global', // or 'per-project', 'per-session'
  script: 'scripts/service.js'
});
```

**Health Monitoring** (Running ↔ Unhealthy):
- Health checks via port, health file, or PID verification
- Auto-restart with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
- Max 5 restart attempts before marking as failed

**Shutdown** (Running → Unregistered):
- Graceful shutdown unregisters from PSM
- Session cleanup terminates and unregisters all session services
- Coordinator registers/unregisters itself with PSM

## Session Management

![Service Startup Integration](images/service-startup-integration.png)

### Session Lifecycle

**1. Session Start** (`launch-claude.sh`):
```bash
SESSION_ID="claude-$$-$(date +%s)"
export CLAUDE_SESSION_ID="$SESSION_ID"

# Register session
node scripts/psm-register-session.js "$SESSION_ID" "$$" "$PROJECT_PATH"

# Setup cleanup
trap cleanup_session EXIT INT TERM
```

**2. Session End** (Automatic):
```bash
cleanup_session() {
  # PSM finds all services for session
  # Terminates them (SIGTERM → SIGKILL after 2s)
  # Unregisters from registry
  node scripts/psm-session-cleanup.js "$SESSION_ID"
}
```

## API Reference

### Process State Manager API

#### Service Registration
```javascript
await psm.registerService({
  name: 'my-service',
  pid: 12345,
  type: 'global', // or 'per-project', 'per-session'
  script: 'scripts/my-service.js',
  projectPath: '/path/to/project', // optional for per-project
  sessionId: 'session-123', // optional for per-session
  metadata: { ... } // optional custom metadata
});
```

#### Health Checks
```javascript
// Check if service is running
const isRunning = await psm.isServiceRunning('my-service', 'global');

// Get service details
const service = await psm.getService('my-service', 'global');
// Returns: { pid, script, type, startTime, lastHealthCheck, status, metadata }

// Refresh health timestamp
await psm.refreshHealthCheck('my-service', 'global');
```

#### Session Management
```javascript
// Register session
await psm.registerSession('claude-12345-1234567890', {
  pid: process.pid,
  projectPath: '/path/to/project'
});

// Cleanup session (kills and unregisters all session services)
const result = await psm.cleanupSession('claude-12345-1234567890');
// Returns: { cleaned: 3, terminated: [{name, pid}, ...] }
```

#### System Health
```javascript
// Get overall health status
const health = await psm.getHealthStatus();
// Returns: {
//   totalServices: 10,
//   healthyServices: 9,
//   unhealthyServices: 1,
//   byServiceType: { global: 3, 'per-project': 6, 'per-session': 1 },
//   details: [...]
// }

// Cleanup dead processes
const cleaned = await psm.cleanupDeadProcesses();
// Returns: number of processes cleaned
```

## Troubleshooting

### Services Not Showing in PSM

**Symptoms**: `psm status` shows 0 services but processes are running

**Solution**:
```bash
# Check running processes
ps aux | grep -E "(vkb-server|coordinator|dashboard)"

# Register manually
CODING_REPO=$(pwd) node scripts/psm-register.js <name> <pid> <type> <script>
```

### Coordinator Not Restarting

**Symptoms**: Watchdog reports dead coordinator but doesn't restart

**Solution**:
```bash
# Check watchdog logs
tail -50 .logs/system-watchdog.log

# Run watchdog manually
node scripts/system-monitor-watchdog.js

# Verify PSM access
CODING_REPO=$(pwd) node scripts/process-state-manager.js status
```

### Session Cleanup Not Working

**Symptoms**: Services remain after session ends

**Solution**:
```bash
# Check for orphaned processes
ps aux | grep -E "(transcript-monitor|custom-service)"

# Manual cleanup
CODING_REPO=$(pwd) node scripts/process-state-manager.js cleanup

# Verify session registration
cat .live-process-registry.json | jq '.sessions'
```

### Registry File Locked

**Symptoms**: "EEXIST: file already exists" errors

**Solution**:
```bash
# Check for stale locks
ls -la .live-process-registry.json.lock

# Remove ONLY if no PSM operations running
rm -f .live-process-registry.json.lock

# Verify no PSM processes active
ps aux | grep process-state-manager
```

## Registry Structure

**`.live-process-registry.json`**:
```json
{
  "version": "3.0.0",
  "lastChange": 1760456472581,
  "sessions": {
    "claude-12345-1234567890": {
      "pid": 12345,
      "projectPath": "/path/to/project",
      "startTime": 1760456400000
    }
  },
  "services": {
    "global": {
      "global-service-coordinator": {
        "pid": 24834,
        "script": "scripts/global-service-coordinator.js",
        "type": "global",
        "startTime": 1760456472581,
        "lastHealthCheck": 1760456472581,
        "status": "running",
        "metadata": { "managedBy": "watchdog" }
      }
    },
    "projects": {
      "/path/to/project": {
        "transcript-monitor": {
          "pid": 25001,
          "type": "per-project",
          "script": "scripts/enhanced-transcript-monitor.js",
          "projectPath": "/path/to/project",
          "lastHealthCheck": 1760456500000,
          "status": "running"
        }
      }
    }
  }
}
```

## Diagrams

All PlantUML source files and generated PNGs are located in:
- **Source**: `docs/puml/monitoring-*.puml`
- **Images**: `docs/images/monitoring-*.png`

Available diagrams:
- `monitoring-architecture.puml` - System architecture
- `monitoring-health-check-sequence.puml` - Health check flow
- `service-lifecycle-state.puml` - Service state transitions
- `service-startup-integration.puml` - Service startup and session management

## Key Files

| File | Purpose |
|------|---------|
| `scripts/process-state-manager.js` | Core PSM implementation |
| `scripts/global-service-coordinator.js` | Service lifecycle manager |
| `scripts/system-monitor-watchdog.js` | Failsafe coordinator monitor |
| `scripts/launch-claude.sh` | Session management entry point |
| `scripts/start-services.sh` | Service startup script |
| `scripts/monitoring-verifier.js` | Pre-startup health verification |
| `.live-process-registry.json` | Process state registry (gitignored) |

## Startup Sequence

1. **Pre-startup Verification**: `monitoring-verifier.js` checks system health
2. **Session Registration**: `launch-claude.sh` creates session in PSM
3. **Service Startup**: Coordinator ensures required services are running
4. **Health Monitoring**: Continuous health checks (15s coordinator, 60s watchdog)
5. **Session Cleanup**: Trap handlers clean up services on exit

---

**See Also**:
- [Process State Manager Source](../scripts/process-state-manager.js)
- [Global Service Coordinator Source](../scripts/global-service-coordinator.js)
