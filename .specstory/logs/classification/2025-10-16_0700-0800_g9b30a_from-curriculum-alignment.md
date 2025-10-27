# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-16_0700-0800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.020Z<br>
**Decisions in Window**: 5

---

## Statistics

- **Total Prompt Sets**: 5
- **Classified as CODING**: 5 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 4
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 2ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760591209828](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760591209828)

**Time Range**: 1760591209828 → 1761593224252<br>
**LSL File**: [2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760591209828)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/fast-embedding-generator.js, /Users/q284340/Agentic/coding/scripts/test-embedding-upgrade.js, /Users/q284340/Agentic/coding/scripts/test-embedding-model.js, /Users/q284340/Agentic/coding/scripts/test-model-dimensions.js, /Users/q284340/Agentic/coding/scripts/simple-reindex.js
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 4

### Prompt Set: [ps_1760590956750](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760590956750)

**Time Range**: 1760590956750 → 1760591209827<br>
**LSL File**: [2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760590956750)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.78)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (98.1%) of file operations target local project: /constructor, /generate, /generateBatch, /getDimensions, /initialize, /**, /all-MiniLM-L6-v2, ~10-100x, ~500ms, ~50ms, /transformers, /system-reminder, /transformers.js, //github.com/xenova/transformers.js/releases, //www.npmjs.com/package/@xenova/transformers, //t.co/zEnbY88oEm\, //x.com/xenovacom/status/1753117449749217512, //js.langchain.com/docs/integrations/text_embedding/transformers/, //t.co/YuG1Mct0FS\, //x.com/xenovacom/status/1757798436009599413, //do-me.github.io/SemanticFinder/, //github.com/xenova/transformers.js/issues/3, /transformers.js:, //github.com/xenova/transformers.js/, /nomic-embed-text-v1, //github.com/xenova/transformers.js/issues/606, //simonwillison.net/tags/transformers-js/, /mxbai-embed-large-v1, //huggingface.co/mixedbread-ai/mxbai-embed-large-v1, //github.com/xenova/transformers.js/issues/203, //lancedb.github.io/lancedb/examples/transformerjs_embedding_search_nodejs/, /mxbai-embed-2d-large-v1, //huggingface.co/mixedbread-ai/mxbai-embed-2d-large-v1, //github.com/xenova/transformers.js/issues/108, /gte-small:, //github.com/koxy-ai/gte-small, /jina-embeddings-v2-base-en, //huggingface.co/Xenova/jina-embeddings-v2-base-en, //huggingface.co/blog/embeddinggemma, //www.aimodels.fyi/creators/huggingFace/Xenova, /bge-m3, //huggingface.co/Xenova/bge-m3, /Qwen3-Embedding-8B, //huggingface.co/Qwen/Qwen3-Embedding-8B, //huggingface.co/Xenova, //www.analyticsvidhya.com/blog/2024/12/top-open-source-models-on-hugging-face/, /bge-large-en-v1.5, //huggingface.co/Xenova/bge-large-en-v1.5, //www.aimodels.fyi/models/huggingFace/text-embedding-ada-002-xenova, /transformers`, /transformers`)
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.78
- Reasoning: Keyword analysis: 5 matches, score: 17/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1760592113863](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592113863)

**Time Range**: 1760592113863 → 1761593224253<br>
**LSL File**: [2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592113863)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (61.8%) of file operations target local project: simple-reindex, /tmp/reindex-coding-lsl.log, /tmp/reindex-curriculum.log, /tmp/reindex-nano.log, tmp/reindex-coding-lsl.log, tmp/reindex-curriculum.log, tmp/reindex-nano.log, /Users/q284340/Agentic/curriculum-alignment, /Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment/8a9d85f1-904b-43ea-8a7c-a404c7ca0123.jsonl, /tmp/test-classification.log, Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/coding, Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment/8a9d85f1-904b-43ea-8a7c-a404c7ca0123.jsonl, tmp/test-classification.log, Users/q284340/Agentic/coding/.specstory/logs/classification/*2025-10-11_1700-1800*, /569, /211, /305, /Users/q284340/Agentic/nano-degree/.specstory/history/2025-09-20_2200-2300_g9b30a.md:, /tool_use_error, /Coding), /../../history/2025-10-11_1700-1800_g9b30a_from-curriculum-alignment.md#ps_2025-10-11T15:10:26.286Z), /history/*.md,, /null,, /q284340/Agentic/coding/.specstory/history/*_from-curriculum-alignment.md,, ~60, /../../history/2025-10-11_1700-1800_g9b30a_from-curriculum-alignment.md#ps_2025-10-11T15:12:20.588Z), /q284340/Agentic/coding,, /q284340/Agentic/coding/.health/coding-transcript-monitor-health.json,, /q284340/Agentic/coding/.health/,, /q284340/Agentic/coding/.health/curriculum-alignment-transcript-monitor-health.json,, /monitoring-verifier.js,, /q284340/Agentic/curriculum-alignment,, /system-reminder
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 13 matches, score: 45/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1760592480290](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592480290)

**Time Range**: 1760592480290 → 1760592636343<br>
**LSL File**: [2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592480290)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7625)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (94.1%) of file operations target local project: simple-reindex, /tmp/reindex-coding-infra.log, /tmp/reindex-coding-lsl.log, /tmp/reindex-curriculum.log, /tmp/reindex-nano.log, tmp/reindex-coding-infra.log, tmp/reindex-coding-lsl.log, tmp/reindex-curriculum.log, tmp/reindex-nano.log, /Users/q284340/Agentic/curriculum-alignment, ~/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, /tmp/lsl-regen-all.log, Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/coding, claude/projects/-Users-q284340-Agentic-curriculum-alignment, tmp/lsl-regen-all.log
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.7625
- Reasoning: Keyword analysis: 4 matches, score: 16/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1760592636343](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592636343)

**Time Range**: 1760592636343 → 1761593224253<br>
**LSL File**: [2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1760592636343)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (70.9%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment, /Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/coding, Users/q284340/Agentic/coding/scripts/batch-lsl-processor.js, Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, /tmp/lsl-regenerate.log, /dev/null, tmp/lsl-regenerate.log, dev/null, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, Users/q284340/Agentic/coding/.specstory/history/*_from-curriculum-alignment.md, /sl`, /all-MiniLM-L6-v2, /nomic-embed-text-v1, /Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment/8a9d85f1-904b-43ea-8a7c-a404c7ca0123.jsonl, ~/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, /all-MiniLM-L6-v2`, /nomic-embed-text-v1`, /**, /src/live-logging/ReliableCodingClassifier.js, /history/*.md..., /fast-embedding-generator.js, //localhost:6333, /Users/q284340/Agentic/curriculum-alignment`, /status, /timestamp, /stdout, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1700-1800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1600-1700_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1500-1600_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1400-1500_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1300-1400_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-28_2200-2300_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-28_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-28_1800-1900_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-28_1700-1800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-28_1600-1700_g9b30a.md
- Processing Time: 7ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 12 matches, score: 43/1
- Processing Time: 1ms

---

