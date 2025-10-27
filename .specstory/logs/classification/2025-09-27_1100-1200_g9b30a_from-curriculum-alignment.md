# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-27_1100-1200_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.848Z<br>
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
- **Average Processing Time**: 270ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758964112751](../../../history/2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758964112751)

**Time Range**: 1758964112751 → 1758965475674<br>
**LSL File**: [2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758964112751)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml, /Users/q284340/Agentic/curriculum-alignment/.github/workflows/test.yml
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 2ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1758963972200](../../../history/2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758963972200)

**Time Range**: 1758963972200 → 1758964112750<br>
**LSL File**: [2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758963972200)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7580436)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /workflows/README.md, /new-feature\n, /workflows/deploy.yml, /checkout@v4\n, /.github/workflows/test.yml, /workflows/test.yml
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7580436
- Reasoning: Semantic similarity favors coding (coding_lsl=0.744, curriculum_alignment=0.715, nano_degree=0.701, coding_infrastructure=0.655)
- Processing Time: 537ms

---

