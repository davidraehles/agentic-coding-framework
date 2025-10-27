# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-28_1000-1100_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.036Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 23ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1759046946107](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759046946107)

**Time Range**: 1759046946107 → 1759047454662<br>
**LSL File**: [2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759046946107)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //curriculum-alignment-deployments", /tmp/build-artifacts/packaged-template.yaml, tmp/build-artifacts/packaged-template.yaml, /tmp/build-artifacts, //", tmp/build-artifacts, /update, //curriculum-alignment-deployments-dev/5f75d29c/3573c2c90dd103d5be3e41aebea9bbac, //curriculum-alignment-deployments-dev/5f75d29c/8a6236be3047183d5a0ec70a6c112404, //curriculum-alignment-deployments-dev/5f75d29c/99c988d8b9df4f6db55eede98f59f272, /build/template.yaml, /main, /settings.local.json, /change-log.json, /comprehensive-project-trajectory.md, /history/2025-09-27_2100-2200_g9b30a.md, /history/2025-09-27_2200-2300_g9b30a.md, /history/2025-09-28_0600-0700_g9b30a.md, /history/2025-09-28_0800-0900_g9b30a.md, /history/2025-09-28_0900-1000_g9b30a.md, /history/2025-09-28_1000-1100_g9b30a.md, /or, /main:, /curriculum-alignment.git, //github.com/fwornle/curriculum-alignment/actions/runs/18071540002, //curriculum-alignment-deployments-staging/103d7bb0/3573c2c90dd103d5be3e41aebea9bbac, //curriculum-alignment-deployments-staging/103d7bb0/8a6236be3047183d5a0ec70a6c112404, //curriculum-alignment-deployments-staging/103d7bb0/99c988d8b9df4f6db55eede98f59f272
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1759047454663](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759047454663)

**Time Range**: 1759047454663 → 1759047884006<br>
**LSL File**: [2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759047454663)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6224999999999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.6224999999999999
- Reasoning: Keyword analysis: 2 matches, score: 8/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759046934281](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759046934281)

**Time Range**: 1759046934281 → 1759046936533<br>
**LSL File**: [2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_1000-1100_g9b30a_from-curriculum-alignment.md#ps_1759046934281)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7776721500000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /update
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7776721500000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.754, curriculum_alignment=0.706, coding_infrastructure=0.601, nano_degree=0.586)
- Processing Time: 69ms

---

