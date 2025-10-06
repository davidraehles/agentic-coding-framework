# Architecture Documentation

**Purpose**: Technical architecture documentation for the Coding system

---

## Overview

This section contains architectural documentation for developers who need to understand or modify the Coding system's internal structure.

> **Note**: Most system architecture is already covered in other sections:
> - [System Overview](../system-overview.md) - High-level architecture
> - [Core Systems](../core-systems/) - Individual system architectures
> - [Integrations](../integrations/) - Integration component architectures

---

## Architecture Topics

### Core Architecture Concepts

Already documented in other sections:

- **[4-Layer Monitoring](../core-systems/status-line.md#architecture)** - System health monitoring architecture
- **[LSL Classification](../core-systems/live-session-logging.md#architecture)** - Conversation classification and routing
- **[Constraint Monitoring](../core-systems/constraint-monitoring.md#architecture)** - Real-time constraint enforcement
- **[Trajectory Generation](../core-systems/trajectory-generation.md#architecture)** - Project analysis system

### Legacy Architecture Docs

The following architecture files are preserved for reference but have been superseded by the consolidated documentation:

- **agent-agnostic.md** - Agent-agnostic design (see [System Overview](../system-overview.md))
- **agent-detection.md** - Agent detection implementation details
- **cross-project-knowledge.md** - Cross-project knowledge sharing (see [Knowledge Management](../knowledge-management/README.md))
- **fallback-services.md** - Fallback services for CoPilot integration
- **unified-knowledge-flow.md** - Knowledge flow architecture
- **unified-memory-systems.md** - Multi-database synchronization
- **unified-system-overview.md** - Unified system architecture

These files will be moved to `.obsolete/docs/architecture/` during Phase 2H cleanup.

---

## Key Architectural Principles

### 1. Agent-Agnostic Design

The system supports multiple AI coding assistants through a unified adapter pattern:

```
Claude Code → MCP Servers → Unified Interface
CoPilot → Fallback Services → Unified Interface
                              ↓
                      Knowledge Management
                      Browser Automation
                      Session Logging
```

**Benefits**:
- No vendor lock-in
- Consistent features across agents
- Team flexibility

### 2. Knowledge Persistence

Multi-tier knowledge storage for reliability and performance:

```
Runtime (Fast):
- MCP Memory (Claude)
- Graphology Graph (CoPilot)

Persistence (Reliable):
- shared-memory-*.json (git-tracked)
- .specstory/history/*.md (session logs)
```

### 3. Real-Time Quality Enforcement

PreToolUse hooks intercept tool calls BEFORE execution:

```
Claude attempts tool → PreToolUse Hook → Constraint Monitor
                                        ↓
                                    Violation? → Block
                                        ↓
                                       No → Allow
```

### 4. Monitoring & Observability

4-layer health monitoring with progressive escalation:

```
Layer 4: Service-Level Health (ukb, vkb, semantic-analysis)
Layer 3: System Verifier (LSL, constraints, trajectory)
Layer 2: System Coordinator (overall health, metrics)
Layer 1: System Watchdog (critical failures, alerts)
```

---

## Development Patterns

### Pattern: Constraint-Based Development

Define constraints before implementation:

```yaml
constraints:
  - id: no-parallel-versions
    pattern: /(v\d+|enhanced|improved|new|fixed)_/
    severity: CRITICAL
    message: Never create parallel versions - edit originals
```

### Pattern: Agent Detection

Automatic detection with fallback:

```javascript
const detector = new AgentDetector();
const available = await detector.detectAll();
// { claude: true, copilot: false }

const best = await detector.getBest();
// 'claude'
```

### Pattern: Knowledge Capture

Structured insight capture:

```bash
# Auto-analysis from git commits
ukb

# Structured interactive capture
ukb --interactive

# Visualization
vkb
```

---

## Architecture Diagrams

Key architecture diagrams are located in `docs/images/`:

- **4-layer-monitoring-architecture.png** - Health monitoring layers
- **lsl-4-layer-classification.png** - LSL classification system
- **constraint-monitor-components.png** - Constraint monitoring architecture
- **status-line-system.png** - Status line architecture
- **statusline-architecture.png** - Detailed status line flow

All diagrams have corresponding PlantUML sources in `docs/puml/`.

---

## See Also

- [System Overview](../system-overview.md) - High-level system architecture
- [Core Systems](../core-systems/) - Individual system documentation
- [Integrations](../integrations/) - Integration component architectures
- [Getting Started](../getting-started.md) - Installation and configuration
