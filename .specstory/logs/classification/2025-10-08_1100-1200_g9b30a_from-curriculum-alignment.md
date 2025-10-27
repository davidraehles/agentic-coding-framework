# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-08_1100-1200_g9b30a<br>
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
- **Average Processing Time**: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759916123751](../../../history/2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1759916123751)

**Time Range**: 1759916123751 → 1761593207500<br>
**LSL File**: [2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1759916123751)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.71)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //localhost:3031/api/violations?constraint_id=no-console-log, 3031/api/violations?constraint_id=no-console-log, /curriculum-alignment/, /nano-degree/, /coding/, /real-time-constraint-hook.js, /mcp-constraint-monitor/src/hooks/pre-tool-hook-wrapper.js, /constructor, /checkConstraintsDirectly, /enforcePromptConstraints, /enforceToolConstraints, /findConstraintConfig, /formatViolationMessage, /getProjectName, /loadConfig, /logViolationsToStorage, /shouldBlockViolation, /mcp-constraint-monitor/src/hooks/real-time-constraint-hook.js, /Edit, /config/load-constraints.js, /engines/constraint-engine.js, /utils/config-manager.js, /mcp-constraint-monitor/src/engines/constraint-engine.js, /checkConstraints, /getFileWatcherStatus, /getViolationHistory, /initialize, /loadConstraintsFromConfig, /reloadConfiguration, /startFileWatcher, /stopFileWatcher, /updateConstraints, /docs/images/constraint-testing-architecture.png, /docs/puml/constraint-testing-architecture.puml, /integrations/mcp-constraint-monitor/comprehensive-constraint-test-report.md, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/tr.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/en.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/be.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/ru.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/index.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/mini/tests/computed.test.ts, /integrations/mcp-constraint-monitor/node_modules/zod/src/v4/mini/tests/index.test.ts
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.71
- Reasoning: Keyword analysis: 4 matches, score: 13/1
- Processing Time: 1ms

---

