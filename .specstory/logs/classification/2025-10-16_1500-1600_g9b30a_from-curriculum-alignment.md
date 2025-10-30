# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-16_1500-1600_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.021Z<br>
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
- **Average Processing Time**: 0ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760623080952](../../../history/2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760623080952)

**Time Range**: 1760623080952 → 1761804566835<br>
**LSL File**: [2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760623080952)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/docs/multi-collection-classification.md, /Users/q284340/Agentic/coding/docs/README.md
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1760622914230](../../../history/2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760622914230)

**Time Range**: 1760622914230 → 1760623080951<br>
**LSL File**: [2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760622914230)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (50.0%) of file operations target local project: /dev/null, /cleanup-aliases.sh`, /stdout, /claude-mcp, /claude-mcp`, /ukb`, /vkb`, /system-reminder
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 9 matches, score: 28/1
- Processing Time: 0ms

---

