# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-26_1100-1200_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.841Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 2
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 414ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758877411188](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758877411188)

**Time Range**: 1758877411188 → 1758878091943<br>
**LSL File**: [2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758877411188)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5525)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/views/DashboardView.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/App.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/layout/TopAppBar.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/auth/LoginModal.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/uiSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/authSlice.ts
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5525
- Reasoning: Keyword analysis: 1 matches, score: 4/1
- Processing Time: 2ms

---

## Layer 3: Embedding

**Decisions**: 2

### Prompt Set: [ps_1758878444083](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758878444083)

**Time Range**: 1758878444083 → 1758879550605<br>
**LSL File**: [2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758878444083)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7068321)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/.env.production
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 2ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7068321
- Reasoning: Semantic similarity favors coding (coding_lsl=0.699, curriculum_alignment=0.682, nano_degree=0.663, coding_infrastructure=0.627)
- Processing Time: 727ms

---

### Prompt Set: [ps_1758880736958](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758880736958)

**Time Range**: 1758880736958 → 1758881317169<br>
**LSL File**: [2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_1100-1200_g9b30a_from-curriculum-alignment.md#ps_1758880736958)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.697525425)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/public/manifest.json, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/authSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/views/DashboardView.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/index.html
- Processing Time: 10ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 2ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.697525425
- Reasoning: Semantic similarity favors coding (coding_lsl=0.693, nano_degree=0.684, curriculum_alignment=0.673, coding_infrastructure=0.622)
- Processing Time: 500ms

---

