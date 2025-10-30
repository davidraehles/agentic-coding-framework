# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-17_1600-1700_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.023Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 0ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760711113142](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760711113142)

**Time Range**: 1760711113142 → 1761804566836<br>
**LSL File**: [2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760711113142)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/classification-logger.js, /Users/q284340/Agentic/coding/scripts/timezone-utils.js
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1760711043094](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760711043094)

**Time Range**: 1760711043094 → 1760711113142<br>
**LSL File**: [2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760711043094)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5525)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: No file operations detected
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5525
- Reasoning: Keyword analysis: 1 matches, score: 4/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1760712735202](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760712735202)

**Time Range**: 1760712735202 → 1761804566836<br>
**LSL File**: [2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1760712735202)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.64)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (78.7%) of file operations target local project: //, /Berlin, /Berlin', /Berlin',, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.jsonl, /dev/null, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a.jsonl, /Berlin\",, //api.x.ai/v1, //console.x.ai, //api.openai.com/v1, //platform.openai.com/usage, //api.anthropic.com/v1, //api.anthropic.com/v1/usage, //console.anthropic.com/settings/billing, /gpt-oss-20b, //api.groq.com/openai/v1, //console.groq.com/settings/billing, /all-MiniLM-L6-v2, /*.md, /README*, /CLAUDE.md, /**/*.js, /**/*, /**, /.DS_Store, /tmp/**, /temp/**, /CHANGELOG*, /trajectory, /v1/usage, /system-reminder, /5/2025,, /getTimezone, /timezone-utils.js, /TIMEZONE=(.+)/), /05/2025,
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.64
- Reasoning: Keyword analysis: 3 matches, score: 9/1
- Processing Time: 0ms

---

