# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-09_0700-0800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.835Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 1ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1759988864148](../../../history/2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759988864148)

**Time Range**: 1759988864148 → 1759990340625<br>
**LSL File**: [2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759988864148)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/test-real-claude-constraints.js
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759988756902](../../../history/2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759988756902)

**Time Range**: 1759988756902 → 1759988864148<br>
**LSL File**: [2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-09_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759988756902)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (78.6%) of file operations target local project: /mcp-constraint-monitor, /mcp-constraint-monitor/scripts/test-all-violations.js, /mcp-constraint-monitor/test-all-constraints-comprehensive.js, /mcp-constraint-monitor/collect-test-results.js, /usr/bin/env, /**, /LSL, /src/hooks/real-time-constraint-hook.js, /tmp/debug.js, /tmp/legacy.js, /system-reminder
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 8 matches, score: 27/1
- Processing Time: 0ms

---

