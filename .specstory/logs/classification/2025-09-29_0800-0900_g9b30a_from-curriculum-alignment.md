# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-29_0800-0900_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.083Z<br>
**Decisions in Window**: 4

---

## Statistics

- **Total Prompt Sets**: 4
- **Classified as CODING**: 4 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 2
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 166ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1759128273981](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128273981)

**Time Range**: 1759128273981 → 1759128557308<br>
**LSL File**: [2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128273981)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6224999999999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/updated-cloudfront-config-oac.json
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.6224999999999999
- Reasoning: Keyword analysis: 2 matches, score: 8/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1759128752711](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128752711)

**Time Range**: 1759128752711 → 1759133589617<br>
**LSL File**: [2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128752711)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/index.html, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/layout/TopAppBar.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/auth/LoginModal.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/views/DashboardView.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/public/manifest.json
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 2

### Prompt Set: [ps_1759127249801](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759127249801)

**Time Range**: 1759127249801 → 1759127321578<br>
**LSL File**: [2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759127249801)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7194864249999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: frontend, /status, //localhost:3001/, /stdout, /timestamp, /exit_code, //localhost:3000/, /src/components/views/DashboardView.tsx,, /src/index.css, /services/auth/cognitoService.ts, /store/slices/authSlice.ts, /src/App.tsx,, /Users/q284340/Agentic/curriculum-alignment/frontend, /stderr
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7194864249999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.716, curriculum_alignment=0.710, nano_degree=0.642, coding_infrastructure=0.617)
- Processing Time: 335ms

---

### Prompt Set: [ps_1759128012427](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128012427)

**Time Range**: 1759128012427 → 1759128273981<br>
**LSL File**: [2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1759128012427)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7625097900000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /dev/null, dev/null, /*",, /E2DGUOYHQAA61E", 930500114053/*",, distribution/E2DGUOYHQAA61E", /html, //curriculum.tanfra.com/icon-144x144.png
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7625097900000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.742, curriculum_alignment=0.701, nano_degree=0.644, coding_infrastructure=0.587)
- Processing Time: 325ms

---

