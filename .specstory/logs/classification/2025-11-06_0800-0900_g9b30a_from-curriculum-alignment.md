# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-11-06_0800-0900_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-11-06T08:00:00.000Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 3
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 0ms

---

## Layer 1: Path

**Decisions**: 3

### Prompt Set: [ps_1762412572380](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762412572380)

**Time Range**: 1762412572380 → 1762413099564<br>
**LSL File**: [2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762412572380)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/start-services-robust.js
- Processing Time: 0ms

---

### Prompt Set: [ps_1762413526835](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762413526835)

**Time Range**: 1762413526835 → 1762756509916<br>
**LSL File**: [2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762413526835)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority (84.9%) of file operations target coding repo: /Users/q284340/Agentic/coding/bin/coding, /Users/q284340/Agentic/coding/scripts/launch-claude.sh, /Users/q284340/Agentic/coding/start-services.sh, /Users/q284340/Agentic/coding/scripts/monitoring-verifier.js, /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/package.json, /Users/q284340/Agentic/coding/scripts/global-service-coordinator.js, /Users/q284340/Agentic/coding/.env.ports, /Users/q284340/Agentic/coding/scripts/dashboard-service.js, /Users/q284340/Agentic/coding/scripts, Users/q284340/Agentic/coding/scripts, dev/null, slower/faster, coding/bin/coding, integrations/memory-visualizer/api-server.py, bin/coding, bin/mcp-status, bin/clean-knowledge-base, bin/vkb-cli.js, bin/status, bin/ckb, bin/log-session, bin/claude-mcp, bin/fix-knowledge-base, bin/ukb, bin/ukb-cli.js, bin/graph-sync, bin/vkb, bin/bash, path/to/project, docs/agent-agnostic-implementation-plan.md, SCRIPT_DIR/../lib/services/stop-services.js, SCRIPT_DIR/../scripts/live-logging-coordinator.js, SCRIPT_DIR/../tests/integration/final-system-security-validation.js, SCRIPT_DIR/../lib/agent-detector.js, SCRIPT_DIR/../scripts/launch-claude.sh, SCRIPT_DIR/../scripts/launch-copilot.sh, scripts/launch-claude.sh, SCRIPT_DIR/agent-common-setup.sh, SCRIPT_DIR/psm-register-session.js, SCRIPT_DIR/psm-session-cleanup.js, SCRIPT_DIR/monitoring-verifier.js, scripts/monitoring-verifier.js, CODING_REPO/.env, CODING_REPO/.env.ports, CODING_REPO/start-services.sh, CODING_REPO/.mcp-sync/sync-required.json, CODING_REPO/claude-code-mcp-processed.json, HOME/.config/claude/claude_desktop_config.json, HOME/Library/Application, Support/Claude/claude_desktop_config.json, CODING_REPO/bin/claude-mcp, SCRIPT_DIR/scripts/start-services-robust.js, SCRIPT_DIR/.env, SCRIPT_DIR/.env.ports, CODING_DIR/integrations/mcp-constraint-monitor, CODING_DIR/integrations, CODING_DIR/mcp-constraint-monitor, i/12, scripts/setup-databases.js, qdrant/qdrant, integrations/constraint-monitor, learning/persistence, scripts/psm-register.js, scripts/enhanced-transcript-monitor.js, scripts/live-logging-coordinator.js, logs/live-logging.log, lib/vkb-server/cli.js, CODING_DIR/integrations/mcp-server-semantic-analysis, CODING_DIR/integrations/mcp-server-semantic-analysis/dist/index.js, dist/index.js, scripts/process-state-manager.js, usr/bin/env, headers/emojis, src/server.js, src/dashboard-server.js, scripts/setup.js, bin/demo, anthropic-ai/sdk, google/generative-ai, modelcontextprotocol/sdk, qdrant/js-client-rest, xenova/transformers, types/node, integrations/mcp-constraint-monitor/src/databases, integrations/mcp-constraint-monitor/src/config, integrations/mcp-constraint-monitor/src/utils, integrations/mcp-constraint-monitor/src/status, integrations/mcp-constraint-monitor/src/engines, integrations/mcp-constraint-monitor/src/hooks, integrations/mcp-constraint-monitor/src/server.js, integrations/mcp-constraint-monitor/src/dashboard-server.js, integrations/mcp-constraint-monitor/src/constraint-monitor-service.js, scripts/global-service-coordinator.js, GlobalServiceCoordinator/constructor, GlobalServiceCoordinator/checkHealthFile, GlobalServiceCoordinator/checkPort, GlobalServiceCoordinator/cleanupStaleService, GlobalServiceCoordinator/debug, GlobalServiceCoordinator/ensureGlobalServices, GlobalServiceCoordinator/ensureLogDirectory, GlobalServiceCoordinator/ensureProjectServices, GlobalServiceCoordinator/ensureService, GlobalServiceCoordinator/error, GlobalServiceCoordinator/getServiceDefinition, GlobalServiceCoordinator/getStatus, GlobalServiceCoordinator/gracefulShutdown, GlobalServiceCoordinator/isServiceHealthy, GlobalServiceCoordinator/log, GlobalServiceCoordinator/performHealthCheck, GlobalServiceCoordinator/registerProject, GlobalServiceCoordinator/registerSelfWithPSM, GlobalServiceCoordinator/setupSignalHandlers, GlobalServiceCoordinator/startDaemon, GlobalServiceCoordinator/startService, GlobalServiceCoordinator/warn, scripts/dashboard-service.js, api/health, integrations/mcp-constraint-monitor/dashboard
- Processing Time: 0ms

---

### Prompt Set: [ps_1762414529674](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762414529674)

**Time Range**: 1762414529674 → 1762756509916<br>
**LSL File**: [2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-06_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1762414529674)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/api-service.js, /Users/q284340/Agentic/coding/scripts/global-service-coordinator.js, /Users/q284340/Agentic/coding/scripts/start-services-robust.js
- Processing Time: 1ms

---

