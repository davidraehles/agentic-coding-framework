# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-09_0800-0900_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.838Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 8ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1759990362880](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990362880)

**Time Range**: 1759990362880 → 1761593207501<br>
**LSL File**: [2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990362880)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/CONSTRAINT-SYSTEM-ROOT-CAUSE-ANALYSIS.md
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759990794314](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990794314)

**Time Range**: 1759990794314 → 1761593207501<br>
**LSL File**: [2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990794314)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7625)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /tmp/test-console-log.js, /tmp/test-var.js, /tmp/test-empty-catch.js, /tmp/test-secrets.js
- Processing Time: 7ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.7625
- Reasoning: Keyword analysis: 5 matches, score: 16/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759990340646](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990340646)

**Time Range**: 1759990340646 → 1761593207501<br>
**LSL File**: [2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-09_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759990340646)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6517212400000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: No file operations detected
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.6517212400000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.634, curriculum_alignment=0.600, nano_degree=0.600, coding_infrastructure=0.540)
- Processing Time: 16ms

---

