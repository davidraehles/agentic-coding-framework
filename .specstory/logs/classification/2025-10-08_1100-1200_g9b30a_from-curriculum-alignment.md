# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-08_1100-1200_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-08T11:00:00.000Z<br>
**Decisions in Window**: 1

---

## Statistics

- **Total Prompt Sets**: 1
- **Classified as CODING**: 1 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 0ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1759916123751](../../../history/2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1759916123751)

**Time Range**: 1759916123751 → 1762756507253<br>
**LSL File**: [2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-08_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1759916123751)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority (67.9%) of file operations target coding repo: 3031/api/violations?constraint_id=no-console-log, integrations/mcp-constraint-monitor/src/hooks/pre-tool-hook-wrapper.js, RealTimeConstraintEnforcer/constructor, RealTimeConstraintEnforcer/checkConstraintsDirectly, RealTimeConstraintEnforcer/enforcePromptConstraints, RealTimeConstraintEnforcer/enforceToolConstraints, RealTimeConstraintEnforcer/findConstraintConfig, RealTimeConstraintEnforcer/formatViolationMessage, RealTimeConstraintEnforcer/getProjectName, RealTimeConstraintEnforcer/loadConfig, RealTimeConstraintEnforcer/logViolationsToStorage, RealTimeConstraintEnforcer/shouldBlockViolation, integrations/mcp-constraint-monitor/src/hooks/real-time-constraint-hook.js, Write/Edit, config/load-constraints.js, engines/constraint-engine.js, utils/config-manager.js, integrations/mcp-constraint-monitor/src/engines/constraint-engine.js, ConstraintEngine/constructor, ConstraintEngine/checkConstraints, ConstraintEngine/getFileWatcherStatus, ConstraintEngine/getViolationHistory, ConstraintEngine/initialize, ConstraintEngine/loadConstraintsFromConfig, ConstraintEngine/reloadConfiguration, ConstraintEngine/startFileWatcher, ConstraintEngine/stopFileWatcher, ConstraintEngine/updateConstraints, docs/images/constraint-testing-architecture.png, docs/puml/constraint-testing-architecture.puml, integrations/mcp-constraint-monitor/comprehensive-constraint-test-report.md, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/tr.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/en.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/be.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/locales/ru.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/core/tests/index.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/mini/tests/computed.test.ts, integrations/mcp-constraint-monitor/node_modules/zod/src/v4/mini/tests/index.test.ts
- Processing Time: 0ms

---

