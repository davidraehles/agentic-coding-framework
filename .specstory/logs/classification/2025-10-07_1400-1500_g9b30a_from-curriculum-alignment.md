# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-07_1400-1500_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-07T14:00:00.000Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 2
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 0
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 164ms

---

## Layer 1: Path

**Decisions**: 2

### Prompt Set: [ps_1759838639299](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759838639299)

**Time Range**: 1759838639299 → 1762756507253<br>
**LSL File**: [2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759838639299)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/enhanced-transcript-monitor.js
- Processing Time: 0ms

---

### Prompt Set: [ps_1759839082667](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759839082667)

**Time Range**: 1759839082667 → 1762756507253<br>
**LSL File**: [2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759839082667)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/.gitignore, /Users/q284340/Agentic/coding/src/live-logging/RealTimeTrajectoryAnalyzer.js
- Processing Time: 0ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1759838574808](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759838574808)

**Time Range**: 1759838574808 → 1762756507253<br>
**LSL File**: [2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-07_1400-1500_g9b30a_from-curriculum-alignment.md#ps_1759838574808)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6517212400000001)

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
- Confidence: 0.6517212400000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.634, curriculum_alignment=0.600, nano_degree=0.600, coding_infrastructure=0.540)
- Processing Time: 492ms

---

