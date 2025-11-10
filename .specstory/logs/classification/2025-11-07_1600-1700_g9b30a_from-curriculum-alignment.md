# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-11-07_1600-1700_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-11-07T16:00:00.000Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 2ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1762528923043](../../../history/2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1762528923043)

**Time Range**: 1762528923043 → 1762756507128<br>
**LSL File**: [2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1762528923043)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/agent-common-setup.sh
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1762528442129](../../../history/2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1762528442129)

**Time Range**: 1762528442129 → 1762756507128<br>
**LSL File**: [2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-11-07_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1762528442129)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/.claude/CLAUDE.md, /Users/q284340/Agentic/curriculum-alignment/CLAUDE.md
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 13 matches, score: 43/1
- Processing Time: 2ms

---

