# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-27_2100-2200_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.851Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 44ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759001197681](../../../history/2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md#ps_1759001197681)

**Time Range**: 1759001197681 → 1759001892944<br>
**LSL File**: [2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md#ps_1759001197681)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/infrastructure/deploy-monitoring.sh
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759001171385](../../../history/2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md#ps_1759001171385)

**Time Range**: 1759001171385 → 1759001173435<br>
**LSL File**: [2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_2100-2200_g9b30a_from-curriculum-alignment.md#ps_1759001171385)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.8510537549999999)

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
- Confidence: 0.8510537549999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.792, curriculum_alignment=0.675, coding_infrastructure=0.638, nano_degree=0.623)
- Processing Time: 86ms

---

