# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-05_2000-2100_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.831Z<br>
**Decisions in Window**: 4

---

## Statistics

- **Total Prompt Sets**: 4
- **Classified as CODING**: 4 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 2
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 96ms

---

## Layer 1: Path

**Decisions**: 2

### Prompt Set: [ps_1759690001108](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690001108)

**Time Range**: 1759690001108 → 1759690548220<br>
**LSL File**: [2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690001108)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/combined-status-line.js
- Processing Time: 16ms

---

### Prompt Set: [ps_1759690605429](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690605429)

**Time Range**: 1759690605429 → 1761593206700<br>
**LSL File**: [2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690605429)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/combined-status-line.js
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759690787625](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690787625)

**Time Range**: 1759690787625 → 1761593206700<br>
**LSL File**: [2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690787625)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.64)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (57.1%) of file operations target local project: Users/q284340/Agentic/coding, Users/q284340/Agentic/coding/scripts/combined-status-line.js, /Users/q284340/Agentic/curriculum-alignment/.specstory/trajectory/, Users/q284340/Agentic/curriculum-alignment/.specstory/trajectory/, /Users/q284340/Agentic/curriculum-alignment/.specstory/trajectory/live-state.json, /combined-status-line.js, /system-reminder, /Users/q284340/Agentic/curriculum-alignment
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.64
- Reasoning: Keyword analysis: 3 matches, score: 9/1
- Processing Time: 0ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759690548249](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690548249)

**Time Range**: 1759690548249 → 1761593206700<br>
**LSL File**: [2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md#ps_1759690548249)<br>
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
- Processing Time: 367ms

---

