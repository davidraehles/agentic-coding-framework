# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-27_1700-1800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.850Z<br>
**Decisions in Window**: 1

---

## Statistics

- **Total Prompt Sets**: 1
- **Classified as CODING**: 1 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758988374842](../../../history/2025-09-27_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1758988374842)

**Time Range**: 1758988374842 → 1758988563326<br>
**LSL File**: [2025-09-27_1700-1800_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1758988374842)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/ui/toast.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/ui/Avatar.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/analysisSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/curriculumSlice.ts
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 0ms

---

