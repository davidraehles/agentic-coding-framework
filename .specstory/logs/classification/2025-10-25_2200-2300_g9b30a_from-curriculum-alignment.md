# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-25_2200-2300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-25T20:52:38.765Z<br>
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
- **Average Processing Time**: 2ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_2025-10-25T20:52:15.637Z](../../../history/2025-10-25_2200-2300_g9b30a_from-curriculum-alignment.md#ps_2025-10-25T20:52:15.637Z)

**Time Range**: 2025-10-25T20:52:15.637Z → 2025-10-25T20:52:17.674Z<br>
**LSL File**: [2025-10-25_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-25_2200-2300_g9b30a_from-curriculum-alignment.md#ps_2025-10-25T20:52:15.637Z)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.78)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /coding, /Users/, /Agentic/coding, /Agentic/coding/bin/../scripts/launch-claude.sh:, /start-services.sh
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.78
- Reasoning: Keyword analysis: 5 matches, score: 17/1
- Processing Time: 1ms

---

