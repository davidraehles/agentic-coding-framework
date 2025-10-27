# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-28_2200-2300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.081Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 234ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759090082919](../../../history/2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759090082919)

**Time Range**: 1759090082919 → 1759090680845<br>
**LSL File**: [2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759090082919)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6925)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/authSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/hooks/useAuth.ts
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.6925
- Reasoning: Keyword analysis: 4 matches, score: 12/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759090740083](../../../history/2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759090740083)

**Time Range**: 1759090740083 → 1759090866855<br>
**LSL File**: [2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_2200-2300_g9b30a_from-curriculum-alignment.md#ps_1759090740083)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7434881200000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: <<'EOF', /prod, //claude.ai/code), dev/prod, ai/code), //localhost:3000/, /deployed-build/assets/index-C490UVz5.js, /deployed-build/assets/index-C490UVz5.js.map, /deployed-build/assets/index-D-zcPYa-.css, /deployed-build/assets/index-DvdD31NE.js, /deployed-build/assets/index-DvdD31NE.js.map, /deployed-build/assets/redux-FVhQweS5.js, /deployed-build/assets/redux-FVhQweS5.js.map, /deployed-build/assets/ui-cKPigW2o.js, /deployed-build/assets/ui-cKPigW2o.js.map, /deployed-build/assets/vendor-gH-7aFTg.js, /deployed-build/assets/vendor-gH-7aFTg.js.map, /deployed-build/index.html, /curriculum-alignment.git
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7434881200000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.740, curriculum_alignment=0.735, nano_degree=0.651, coding_infrastructure=0.648)
- Processing Time: 467ms

---

