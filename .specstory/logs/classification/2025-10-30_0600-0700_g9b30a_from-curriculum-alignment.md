# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-30_0600-0700_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-30T06:00:34.054Z<br>
**Decisions in Window**: 4

---

## Statistics

- **Total Prompt Sets**: 4
- **Classified as CODING**: 4 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 2
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 0ms

---

## Layer 1: Path

**Decisions**: 2

### Prompt Set: [ps_1761803010351](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803010351)

**Time Range**: 1761803010351 → 1761803542674<br>
**LSL File**: [2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803010351)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/docs/puml/lsl-architecture.puml, /Users/q284340/Agentic/coding/docs/puml/lsl-components.puml
- Processing Time: 1ms

---

### Prompt Set: [ps_1761803731550](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803731550)

**Time Range**: 1761803731550 → 1761804567740<br>
**LSL File**: [2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803731550)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/docs/puml/lsl-components.puml
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1761803557826](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803557826)

**Time Range**: 1761803557826 → 1761804567740<br>
**LSL File**: [2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803557826)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5525)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (59.3%) of file operations target local project: /puml/lsl-components.puml, /puml/lsl-components.png, /dev/null, /images/lsl-components.png, /puml/lsl-architecture.puml, /puml/lsl-architecture.png, /images/, /puml/*.png, /puml/LSL, /images/lsl-*.png, /images/lsl-components.png:, /images/lsl-5-layer-classification.png, /images/lsl-architecture.png, /images/lsl-classification-flow.png, /images/lsl-multi-project-architecture.png, /images/lsl-vector-db-indexing.png
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5525
- Reasoning: Keyword analysis: 1 matches, score: 4/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1761803917350](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803917350)

**Time Range**: 1761803917350 → 1761804567740<br>
**LSL File**: [2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-30_0600-0700_g9b30a_from-curriculum-alignment.md#ps_1761803917350)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (80.0%) of file operations target local project: /docs/images/lsl-architecture.png, /usr/bin/env, /**, /auto-insight-trigger.js, /system-reminder, /1000)}s`), /sl), /output
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 9 matches, score: 30/1
- Processing Time: 0ms

---

