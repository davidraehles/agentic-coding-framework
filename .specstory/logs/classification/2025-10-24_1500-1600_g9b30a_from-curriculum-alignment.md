# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-24_1500-1600_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-24T13:23:39.813Z<br>
**Decisions in Window**: 1

---

## Statistics

- **Total Prompt Sets**: 1
- **Classified as CODING**: 1 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 532ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_2025-10-24T13:23:13.177Z](../../../history/2025-10-24_1500-1600_g9b30a_from-curriculum-alignment.md#ps_2025-10-24T13:23:13.177Z)

**Time Range**: 2025-10-24T13:23:13.177Z → 2025-10-24T13:23:15.252Z<br>
**LSL File**: [2025-10-24_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-24_1500-1600_g9b30a_from-curriculum-alignment.md#ps_2025-10-24T13:23:13.177Z)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6813315)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /docs/images/statusline-architecture.png\, /docs/images/trajectory-system-architecture.png\, /docs/images/storage-evolution.png
- Processing Time: 2ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.6813315
- Reasoning: Semantic similarity favors coding (coding_infrastructure=0.653, coding_lsl=0.618, nano_degree=0.598, curriculum_alignment=0.581)
- Processing Time: 529ms

---

