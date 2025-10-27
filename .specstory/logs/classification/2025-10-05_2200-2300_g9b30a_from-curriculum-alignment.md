# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-05_2200-2300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.832Z<br>
**Decisions in Window**: 5

---

## Statistics

- **Total Prompt Sets**: 5
- **Classified as CODING**: 5 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 3
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 6ms

---

## Layer 1: Path

**Decisions**: 3

### Prompt Set: [ps_1759694485850](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759694485850)

**Time Range**: 1759694485850 → 1759694702578<br>
**LSL File**: [2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759694485850)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/classification-logger.js
- Processing Time: 7ms

---

### Prompt Set: [ps_1759694702578](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759694702578)

**Time Range**: 1759694702578 → 1759696408728<br>
**LSL File**: [2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759694702578)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/.specstory/trajectory/live-state.json
- Processing Time: 7ms

---

### Prompt Set: [ps_1759696481636](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759696481636)

**Time Range**: 1759696481636 → 1761593206700<br>
**LSL File**: [2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759696481636)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/combined-status-line.js
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759697036841](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759697036841)

**Time Range**: 1759697036841 → 1761593206700<br>
**LSL File**: [2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759697036841)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.71)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (66.7%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/coding, Users/q284340/Agentic/coding/scripts/batch-lsl-processor.js, /batch-lsl-processor.js, /Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.71
- Reasoning: Keyword analysis: 4 matches, score: 13/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759696408775](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759696408775)

**Time Range**: 1759696408775 → 1761593206700<br>
**LSL File**: [2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-05_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759696408775)<br>
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
- Processing Time: 13ms

---

