# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-12_1500-1600_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.032Z<br>
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
- **Average Processing Time**: 132ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1760274783207](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274783207)

**Time Range**: 1760274783207 → 1761593226053<br>
**LSL File**: [2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274783207)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (82.6%) of file operations target local project: /dev/null, dev/null, /history/*.md, specstory/history/*.md, Users/q284340/Agentic/coding/.specstory/history/*_from-curriculum-alignment.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-12_1500-1600_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-12_1400-1500_g9b30a.md, /repo, /history, /.specstory/history/*_from-, /same:, /history/), /history/2025-10-12_1500-1600_g9b30a.md, /history/2025-10-12_1400-1500_g9b30a.md, ~60, /Users/q284340/Agentic/curriculum-alignment, /Users/, /Agentic/coding/.specstory/history/, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-12_1300-1400_g9b30a.md, /bin/coding):\, /After, /12, /sec, /system-reminder, /Agentic/curriculum-alignment/.constraint-monitor.yaml, /Users/q284340/Agentic/curriculum-alignment/.constraint-monitor.yaml, /bin/coding, /exit, /mcp, ~/.claude/local, /claude-code, /curriculum-alignment, /Agentic/curriculum-alignment, /Agentic/coding, /Agentic/coding/integrations/mcp-server-semantic-analysis, /Agentic/coding/.logs/monitoring-verification-report.json, /monitoring-verifier.js, /Users/q284340/Agentic/curriculum-alignment/live-state.json
- Processing Time: 11ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 11 matches, score: 37/1
- Processing Time: 2ms

---

### Prompt Set: [ps_1760274376909](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274376909)

**Time Range**: 1760274376909 → 1761593244674<br>
**LSL File**: [2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274376909)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (62.9%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment/live-state.json, /monitoring-verifier.js, Users/q284340/Agentic/coding, Users/q284340/Agentic/coding/bin/coding, /system-monitor-watchdog.js, /Users/q284340/Agentic/curriculum-alignment, Users/q284340/Agentic/curriculum-alignment, /bin/coding, /Users/q284340/Agentic/curriculum-alignment/.constraint-monitor.yaml, /exit, /mcp, ~/.claude/local, /claude-code, /curriculum-alignment, /system-reminder, /tool_use_error, /verifySystemWatchdog, /system-watchdog.js, /constructor, /dashboard-service.js, /global-service-coordinator.js, /path/to/project
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 11 matches, score: 37/1
- Processing Time: 1ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1760274201911](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274201911)

**Time Range**: 1760274201911 → 1761593227824<br>
**LSL File**: [2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1500-1600_g9b30a_from-curriculum-alignment.md#ps_1760274201911)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.8564847500000001)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/.constraint-monitor.yaml
- Processing Time: 0ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 0ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.8564847500000001
- Reasoning: Semantic similarity favors coding (coding_lsl=0.826, curriculum_alignment=0.766, coding_infrastructure=0.707, nano_degree=0.690)
- Processing Time: 383ms

---

