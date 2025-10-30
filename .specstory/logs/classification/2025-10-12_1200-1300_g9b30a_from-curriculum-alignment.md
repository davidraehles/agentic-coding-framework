# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-12_1200-1300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.031Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 1
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 1ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1760263397590](../../../history/2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1760263397590)

**Time Range**: 1760263397590 → 1760263613889<br>
**LSL File**: [2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1760263397590)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/docs/semantic-constraint-detection.md
- Processing Time: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1760263613890](../../../history/2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1760263613890)

**Time Range**: 1760263613890 → 1761804567686<br>
**LSL File**: [2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-12_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1760263613890)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (64.3%) of file operations target local project: /semantic-detection-design.md, /semantic-constraint-detection.md, /puml/, /images/, //claude.com/claude-code), /mcp-constraint-monitor, /guardrails)., /pngs, /semantic-detection-design.md`, /puml/semantic-detection-architecture.puml`, /puml/semantic-detection-flow.puml`, /misses,, /puml/`, /images/`, /images/`:, /semantic-constraint-detection.md`, /solution, /semantic-constraint-detection.md`,, /images/`,, /mcp-constraint-monitor`, /engines/semantic-validator.js`), /engines/constraint-engine.js`), /Allow, /v1/chat/completions, /llama-3.3-70b-versatile, /qwen-2.5-32b-instruct, /claude-3-haiku-20240307, /intent, /puml/_standard-style.puml`, /images/semantic-detection-architecture.png`, /images/semantic-detection-flow.png`, /images/semantic-detection-architecture.png, /images/semantic-detection-flow.png, /puml/_standard-style.puml, /puml/semantic-detection-architecture.puml, /puml/semantic-detection-flow.puml
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 7 matches, score: 23/1
- Processing Time: 1ms

---

