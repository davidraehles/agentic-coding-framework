# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-06_1200-1300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.833Z<br>
**Decisions in Window**: 3

---

## Statistics

- **Total Prompt Sets**: 3
- **Classified as CODING**: 3 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 12ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1759748316875](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759748316875)

**Time Range**: 1759748316875 → 1759751120850<br>
**LSL File**: [2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759748316875)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/classification-logger.js
- Processing Time: 16ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1759747841362](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759747841362)

**Time Range**: 1759747841362 → 1761593206701<br>
**LSL File**: [2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759747841362)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (90.7%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*-summary.md, /dev/null, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*-summary.md, dev/null, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/classification-status_g9b30a.md, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/classification-status_g9b30a.md, Users/q284340/Agentic/coding/scripts/classification-logger.js, Users/q284340/Agentic/coding/scripts/batch-lsl-processor.js, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a*, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a*, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a-summary.md, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a-summary.md, Users/q284340/Agentic/coding/scripts/, Users/q284340/Agentic/coding/scripts/enhanced-transcript-monitor.js, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, "ps_2025-10-05T19:36:43.998Z", /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a.md, /system-reminder, /../../coding/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a_from-curriculum-alignment.md)**, /../../coding/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a_from-curriculum-alignment.md),, /../../history/${lslFileName}`, /.specstory/logs/classification,, /.specstory/history, /../history/${lslFileName}`, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2200-2300_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_0700-0800_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_0800-0900_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1200-1300_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a.jsonl, //${process.argv[1]}`), /classification-logger.js, /**, /Coding), /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a-summary.md:
- Processing Time: 20ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 8 matches, score: 27/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1759748231887](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759748231887)

**Time Range**: 1759748231887 → 1759748287242<br>
**LSL File**: [2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759748231887)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.8325)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (77.8%) of file operations target local project: Users/q284340/Agentic/coding/scripts/*.js, Users/q284340/Agentic/coding/scripts/enhanced-transcript-monitor.js, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*summary*, /dev/null, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*summary*, dev/null, /system-reminder, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2200-2300_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_0700-0800_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_0800-0900_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1200-1300_g9b30a-summary.md
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.8325
- Reasoning: Keyword analysis: 6 matches, score: 20/1
- Processing Time: 0ms

---

