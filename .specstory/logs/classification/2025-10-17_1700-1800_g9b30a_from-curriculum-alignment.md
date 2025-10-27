# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-17_1700-1800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.024Z<br>
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
- **Average Processing Time**: 18ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760713535864](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760713535864)

**Time Range**: 1760713535864 → 1761593224254<br>
**LSL File**: [2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760713535864)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/scripts/batch-lsl-processor.js
- Processing Time: 10ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1760713379721](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760713379721)

**Time Range**: 1760713379721 → 1760713535864<br>
**LSL File**: [2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760713379721)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.675)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /tmp/lsl-final.log, tmp/lsl-final.log, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, /dev/null, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.jsonl, Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, dev/null, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.jsonl, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*2025-10-05*.md, Users/q284340/Agentic/curriculum-alignment/.specstory/history/*2025-10-05*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md, Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md, batch-lsl-processor, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.md, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a.jsonl, /Berlin\",, Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a.jsonl, Europe/Berlin\",, "^##", /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1000-1100_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1100-1200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1200-1300_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a.jsonl
- Processing Time: 35ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.675
- Reasoning: Keyword analysis: 3 matches, score: 11/1
- Processing Time: 0ms

---

### Prompt Set: [ps_1760716599760](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760716599760)

**Time Range**: 1760716599760 → 1761593226003<br>
**LSL File**: [2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-17_1700-1800_g9b30a_from-curriculum-alignment.md#ps_1760716599760)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (84.3%) of file operations target local project: /history/*.md, /dev/null, specstory/history/*.md, dev/null, Users/q284340/Agentic/coding/.specstory/history/*_from-curriculum-alignment.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-29_1700-1800_g9b30a.md, /history, /.specstory/history/*_from-, /same:, /Users/q284340/Agentic/nano-degree, /repo, /history/), /Users/q284340/Agentic/curriculum-alignment, /history/2025-09-29_1700-1800_g9b30a.md, /in), //localhost:3000/, /system-reminder, /Development, /tmp/lsl-final.log, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.jsonl, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*2025-10-05*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2000-2100_g9b30a_from-curriculum-alignment.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1000-1100_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1100-1200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1200-1300_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a.jsonl, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a.jsonl, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.md, /Berlin\\\, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-15_0700-0800_g9b30a.jsonl`), /Los_Angeles, /Berlin, /Los_Angeles., /Berlin,, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a.jsonl`, /05/2025,, /Los_Angeles`, /Berlin`, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-15_0700-0800_g9b30a.jsonl, /logs/classification, /history/`, /logs/classification/`, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-21_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-22_0600-0700_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-22_0700-0800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-22_0800-0900_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-22_1000-1100_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-22_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-23_0800-0900_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-23_1000-1100_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-23_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-23_2200-2300_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-24_0600-0700_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-24_1000-1100_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-24_1600-1700_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-24_1900-2000_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-24_2300-0000_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-25_0600-0700_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-25_0700-0800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-25_1700-1800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-25_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-26_0600-0700_g9b30a.md, /q284340/Agentic/coding,, /q284340/Agentic/coding/scripts/combined-status-line.js,, /q284340/Agentic/curriculum-alignment/.specstory/trajectory/,, /5/2025,, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2000-2100_g9b30a.jsonl:0, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-05_2100-2200_g9b30a.jsonl:0, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a_from-curriculum-alignment.md, /tool_use_error, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1900-2000_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/classification-status-curriculum-alignment.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1000-1100_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1100-1200_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1200-1300_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1400-1500_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1500-1600_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1600-1700_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1700-1800_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_1900-2000_g9b30a.md:**Session:**, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md:**Session:**, /batch-lsl-processor.js, /non-coding, /**, /usr/bin/env, /src/live-logging/ReliableCodingClassifier.js, /claude-conversation-extractor.js, /timezone-utils.js, /classification-logger.js, /user-hash-generator.js, /getTimeWindow, /tmp/lsl-regenerate-fixed.log, ~/.claude/projects/-Users-q284340-Agentic-curriculum-alignment
- Processing Time: 6ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 16 matches, score: 58/1
- Processing Time: 2ms

---

