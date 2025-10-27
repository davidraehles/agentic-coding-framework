# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-27_1200-1300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.849Z<br>
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
- **Average Processing Time**: 275ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758969235373](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758969235373)

**Time Range**: 1758969235373 → 1758970376476<br>
**LSL File**: [2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758969235373)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.5875)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/package.json, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/reportSlice.ts, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/ui/toast.tsx
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.5875
- Reasoning: Keyword analysis: 2 matches, score: 6/1
- Processing Time: 4ms

---

## Layer 3: Embedding

**Decisions**: 2

### Prompt Set: [ps_1758967651417](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758967651417)

**Time Range**: 1758967651417 → 1758967660907<br>
**LSL File**: [2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758967651417)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7745534599999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: No file operations detected
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7745534599999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.756, curriculum_alignment=0.718, nano_degree=0.683, coding_infrastructure=0.645)
- Processing Time: 82ms

---

### Prompt Set: [ps_1758967693792](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758967693792)

**Time Range**: 1758967693792 → 1758967747045<br>
**LSL File**: [2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-27_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758967693792)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.8015503500000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //github.com/fwornle/curriculum-alignment/actions/runs/18058364263, /workflows/blue-green-deploy.yml, /workflows/README.md, /workflows/deploy.yml
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.8015503500000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.784, curriculum_alignment=0.749, nano_degree=0.707, coding_infrastructure=0.675)
- Processing Time: 740ms

---

