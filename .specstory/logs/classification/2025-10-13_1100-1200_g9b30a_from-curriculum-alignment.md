# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-13_1100-1200_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-13T11:00:00.000Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 251ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760348843986](../../../history/2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1760348843986)

**Time Range**: 1760348843986 → 1762756508905<br>
**LSL File**: [2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1760348843986)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/docs/constraint-monitoring-validation.md
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1760348515736](../../../history/2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1760348515736)

**Time Range**: 1760348515736 → 1762756508905<br>
**LSL File**: [2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-13_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1760348515736)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7740357999999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (57.1%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment/.constraint-monitor.yaml, /*.test.js, /*.spec.js, /system-reminder
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7740357999999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.765, curriculum_alignment=0.747, nano_degree=0.723, coding_infrastructure=0.696)
- Processing Time: 500ms

---

