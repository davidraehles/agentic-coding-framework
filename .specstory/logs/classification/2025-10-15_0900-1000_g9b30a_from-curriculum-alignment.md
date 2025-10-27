# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-15_0900-1000_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.018Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 2
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 6ms

---

## Layer 1: Path

**Decisions**: 2

### Prompt Set: [ps_1760512206538](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512206538)

**Time Range**: 1760512206538 → 1761593224252<br>
**LSL File**: [2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512206538)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/src/live-logging/ReliableCodingClassifier.js, /Users/q284340/Agentic/coding/scripts/simple-reindex.js, /Users/q284340/Agentic/coding/.constraint-monitor.yaml, /Users/q284340/Agentic/coding/scripts/test-multi-collection-classifier.js, /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/dashboard/components/system-health-indicator.tsx, /Users/q284340/Agentic/coding/docs/multi-collection-classification.md
- Processing Time: 6ms

---

### Prompt Set: [ps_1760512920558](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512920558)

**Time Range**: 1760512920558 → 1761593224252<br>
**LSL File**: [2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512920558)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/src/live-logging/ReliableCodingClassifier.js
- Processing Time: 11ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1760512026290](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512026290)

**Time Range**: 1760512026290 → 1760512206537<br>
**LSL File**: [2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-15_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1760512026290)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7625)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (90.6%) of file operations target local project: Users/q284340/Agentic/coding/scripts/index-project-embeddings.js, /inexpensive, /.env, /bin/coding, /install.sh)..., /simple-reindex.js, /index-project-embeddings.js, /usr/bin/env, /**, /js-client-rest, /fast-embedding-generator.js, //localhost:6333, /**/*.js, /**/*.cjs, /**/*.md, /**/*.json, /node_modules/**, /.git/**, /dist/**, /build/**, /*.test.js, /*.spec.js, /${files.length}, /system-reminder, /all-MiniLM-L6-v2, ~10-100x, ~500ms, ~50ms, /transformers
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.7625
- Reasoning: Keyword analysis: 5 matches, score: 16/1
- Processing Time: 0ms

---

