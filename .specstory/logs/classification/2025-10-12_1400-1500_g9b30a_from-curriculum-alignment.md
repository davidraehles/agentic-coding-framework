# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-12_1400-1500_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.073Z<br>
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

### Prompt Set: [ps_1760270411699](../../../history/2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1760270411699)

**Time Range**: 1760270411699 → 1761593228765<br>
**LSL File**: [2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1760270411699)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/test/constraint-analysis.md, /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/test/constraint-engine.test.js
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1760273283173](../../../history/2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1760273283173)

**Time Range**: 1760273283173 → 1761593228765<br>
**LSL File**: [2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1760273283173)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/.constraint-monitor.yaml, /Users/q284340/Agentic/curriculum-alignment/docs/constraint-pattern-fixes.md
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 7 matches, score: 23/1
- Processing Time: 0ms

---

