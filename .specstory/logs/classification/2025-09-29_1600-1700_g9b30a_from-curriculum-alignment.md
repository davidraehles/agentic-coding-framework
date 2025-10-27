# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-29_1600-1700_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.086Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 3
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 605ms

---

## Layer 3: Embedding

**Decisions**: 3

### Prompt Set: [ps_1759154601069](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759154601069)

**Time Range**: 1759154601069 → 1759154822212<br>
**LSL File**: [2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759154601069)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.7370647100000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/modals/EnhancedProfileModal.tsx, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/ui/ImageCropper.tsx
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.7370647100000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.728, curriculum_alignment=0.710, nano_degree=0.695, coding_infrastructure=0.655)
- Processing Time: 482ms

---

### Prompt Set: [ps_1759155046276](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759155046276)

**Time Range**: 1759155046276 → 1759155062197<br>
**LSL File**: [2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759155046276)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6803061499999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //profile-pictures/1364a8f2-7091-7046-190c-12b1d22fe13a/1759148928755-Freya.jpg, //localhost:3000/, //goo.gl/9p2vKq), //profile-pictures/1364a8f2-7091-704…190c-12b1d22fe13a/1759154872064-cropped-image.jpg, //profile-pictures/1364a8f2-7091-7046-190c-12b1d22fe13a/1759154872064-cropped-image.jpg
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 7ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.6803061499999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.680, curriculum_alignment=0.679, nano_degree=0.661, coding_infrastructure=0.632)
- Processing Time: 673ms

---

### Prompt Set: [ps_1759156431976](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759156431976)

**Time Range**: 1759156431976 → 1759156454205<br>
**LSL File**: [2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759156431976)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6803061499999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //profile-pictures/1364a8f2-7091-7046-190c-12b1d22fe13a/1759148928755-Freya.jpg, //localhost:3000/, //goo.gl/9p2vKq), //profile-pictures/1364a8f2-7091-704…190c-12b1d22fe13a/1759154872064-cropped-image.jpg, //profile-pictures/1364a8f2-7091-7046-190c-12b1d22fe13a/1759154872064-cropped-image.jpg
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 7ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.6803061499999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.680, curriculum_alignment=0.679, nano_degree=0.661, coding_infrastructure=0.632)
- Processing Time: 646ms

---

