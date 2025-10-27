# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-27_0900-1000_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.847Z<br>
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
- **Average Processing Time**: 250ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758958548798](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758958548798)

**Time Range**: 1758958548798 → 1758958718490<br>
**LSL File**: [2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758958548798)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5525)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/authSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/auth/LoginModal.tsx
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5525
- Reasoning: Keyword analysis: 1 matches, score: 4/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 2

### Prompt Set: [ps_1758959721339](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758959721339)

**Time Range**: 1758959721339 → 1758959753631<br>
**LSL File**: [2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758959721339)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7326433350000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /signUp, /src/services/auth/cognitoService.ts
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7326433350000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.717, curriculum_alignment=0.686, nano_degree=0.654, coding_infrastructure=0.613)
- Processing Time: 490ms

---

### Prompt Set: [ps_1758959801595](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758959801595)

**Time Range**: 1758959801595 → 1758959908985<br>
**LSL File**: [2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758959801595)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.746654575)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/services/auth/cognitoService.ts
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.746654575
- Reasoning: Semantic similarity favors coding (coding_lsl=0.728, curriculum_alignment=0.692, nano_degree=0.669, coding_infrastructure=0.643)
- Processing Time: 259ms

---

