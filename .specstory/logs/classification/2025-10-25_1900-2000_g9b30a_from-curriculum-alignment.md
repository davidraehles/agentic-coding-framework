# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-25_1900-2000_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-25T17:07:22.181Z<br>
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
- **Average Processing Time**: 541ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_2025-10-25T17:06:51.946Z](../../../history/2025-10-25_1900-2000_g9b30a_from-curriculum-alignment.md#ps_2025-10-25T17:06:51.946Z)

**Time Range**: 2025-10-25T17:06:51.946Z → 2025-10-25T17:06:57.736Z<br>
**LSL File**: [2025-10-25_1900-2000_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-25_1900-2000_g9b30a_from-curriculum-alignment.md#ps_2025-10-25T17:06:51.946Z)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7364769750000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /docs.
- Processing Time: 1ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7364769750000001
- Reasoning: Semantic similarity favors coding (coding_infrastructure=0.703, coding_lsl=0.659, nano_degree=0.635, curriculum_alignment=0.627)
- Processing Time: 539ms

---

