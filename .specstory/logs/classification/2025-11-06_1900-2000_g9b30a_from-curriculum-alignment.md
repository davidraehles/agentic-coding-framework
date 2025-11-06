# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-11-06_1900-2000_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-11-06T19:00:00.000Z<br>
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
- **Average Processing Time**: 685ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1762452414267](../../../history/2025-11-06_1900-2000_g9b30a_from-curriculum-alignment.md#ps_1762452414267)

**Time Range**: 2025-11-06T18:06:54.267Z → 2025-11-06T18:06:56.937Z<br>
**LSL File**: [2025-11-06_1900-2000_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-06_1900-2000_g9b30a_from-curriculum-alignment.md#ps_1762452414267)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.61720975)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: 11/3/2025, 11/4/2025, 11/5/2025, 11/6/2025
- Processing Time: 1ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.61720975
- Reasoning: Semantic similarity favors coding (coding_lsl=0.615, curriculum_alignment=0.611, nano_degree=0.605, coding_infrastructure=0.598)
- Processing Time: 683ms

---

