# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-08_0700-0800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.835Z<br>
**Decisions in Window**: 1

---

## Statistics

- **Total Prompt Sets**: 1
- **Classified as CODING**: 1 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 2ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759903189670](../../../history/2025-10-08_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759903189670)

**Time Range**: 1759903189670 → 1761804566202<br>
**LSL File**: [2025-10-08_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-08_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759903189670)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (85.1%) of file operations target local project: /mcp-constraint-monitor, //localhost:3031/api/constraints?grouped=true", /mcp-constraint-monitor/src/status/constraint-status-line.js, //localhost:3031/api/violations?limit=30", /constraints)., /mcp-constraint-monitor/mcp-constraint-monitor.json, /mcp-constraint-monitor/.mcp.json, /mcp-constraint-monitor/node_modules/pkce-challenge/dist/index.node.js, /mcp-constraint-monitor/node_modules/pkce-challenge/dist/index.browser.js, /mcp-constraint-monitor/node_modules/pkce-challenge/package.json, /mcp-constraint-monitor/node_modules/queue-microtask/index.js, /mcp-constraint-monitor/node_modules/queue-microtask/package.json, /mcp-constraint-monitor/node_modules/is-plain-obj/index.js, /mcp-constraint-monitor/node_modules/is-plain-obj/package.json, /mcp-constraint-monitor/node_modules/yoctocolors-cjs/index.js, /mcp-constraint-monitor/node_modules/yoctocolors-cjs/package.json, /mcp-constraint-monitor/node_modules/callsites/index.js, /mcp-constraint-monitor/node_modules/callsites/package.json, /mcp-constraint-monitor/node_modules/stringify-object/index.js, /mcp-constraint-monitor/node_modules/stringify-object/package.json, /mcp-constraint-monitor/node_modules/triple-beam/config/npm.js, /mcp-constraint-monitor/node_modules/triple-beam/config/index.js, /mcp-constraint-monitor/node_modules/triple-beam/config/cli.js, /mcp-constraint-monitor/node_modules/triple-beam/config/syslog.js, /mcp-constraint-monitor/node_modules/triple-beam/index.js, /constraints.yaml, /system-reminder, /mcp-constraint-monitor/src/status/status-generator.js, /puml/, /puml/,, /images/, /images/).*\\.(png, /images/filename.png), /constructor, /buildStatusDisplay, /buildTooltip, /capitalizeFirst, /fetchFromService, /generateStatus, /getClickAction, /getComplianceLabel, /getCurrentProject, /getErrorStatus, /getRecentViolationsFromData, /getRiskIcon, /getScoreBar, /getServiceEndpoint, /getStatusColor, /getStatusData, /getTrajectoryIcon, /getTrajectoryText, /loadConfig, /loadLocalData, /transformConstraintDataToStatus, /truncateText, /config/status-line.json, /cached, /api/violations${projectParam}`,, /api/constraints${projectParam}`,, /Users/q284340/Agentic/nano-degree, /mcp-constraint-monitor/src/hooks/real-time-constraint-hook.js, /mcp-constraint-monitor/src/hooks/pre-prompt-hook-wrapper.js, /mcp-constraint-monitor/src/hooks/pre-tool-hook-wrapper.js
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 7 matches, score: 23/1
- Processing Time: 1ms

---

