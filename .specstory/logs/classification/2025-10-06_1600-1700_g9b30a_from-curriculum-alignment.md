# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-06_1600-1700_g9b30a<br>
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
- **Average Processing Time**: 1ms

---

## Layer 1: Path

**Decisions**: 1

### Prompt Set: [ps_1759762255218](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759762255218)

**Time Range**: 1759762255218 → 1761804565435<br>
**LSL File**: [2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759762255218)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.95)

#### Layer-by-Layer Trace

✅ **Layer 1 (path)**
- Decision: coding
- Confidence: 0.98
- Reasoning: Majority of write operations target coding repo: /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/README.md, /Users/q284340/Agentic/coding/integrations/mcp-constraint-monitor/install.sh, /Users/q284340/Agentic/coding/install.sh
- Processing Time: 1ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1759760764442](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759760764442)

**Time Range**: 1759760764442 → 1759760929323<br>
**LSL File**: [2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759760764442)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (65.6%) of file operations target local project: /integrations/mcp-server-browserbase/browserbase, /integrations/mcp-server-browserbase/stagehand, /integrations/mcp-server-semantic-analysis, /../../integrations/mcp-server-semantic-analysis/docs/installation/README.md)**, //macas-staging.ceu.edu\n-, /api/v1/documents/upload\n-, /api/v1/users/profile\n-, /api/v1/analysis/{id}\n\nTechnical, //macas-staging.ceu.edu/api/v1/documents/upload\, /form-data\, /form, //macas_user:***@db.internal:5432/macas, /app/src/database/connection.js:42:15\, /1.21.6\nX-Powered-By:, /15, /tcp:, /TLS, /integration/auth.test.js\n//, /middleware/errorHandler.js\n//, /services/reportService.js, /middleware/uploadMiddleware.js\n//
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 9 matches, score: 27/1
- Processing Time: 1ms

---

### Prompt Set: [ps_1759760929324](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759760929324)

**Time Range**: 1759760929324 → 1761804565435<br>
**LSL File**: [2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-06_1600-1700_g9b30a_from-curriculum-alignment.md#ps_1759760929324)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (78.5%) of file operations target local project: /dev/null, /../../coding/.specstory/logs/classification/WINDOW_from-curriculum-alignment.md`, /../../coding/`, /../../../coding/`, /mcp-constraint-monitor/install.sh`, /history/`, /timezone-utils.js, /../history, /../../history/${lslFileName}`, /../history/${lslFileName}`, /../../../coding/`:, /../../../coding/.specstory/logs/classification/${window}_from-${this.projectName}.md`, /classification-logger.js`, /.specstory/logs/classification/, /.specstory/logs/classification/`, /../../coding/.specstory/logs/classification/${window}_from-${this.projectName}.md`, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/classification-status_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-06_1100-1200_g9b30a-summary.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-21_2100-2200_g9b30a.md, /times, /install.sh, /install.sh`, /bin/bash, /toolkit, /react-redux, /mcp-constraint-monitor), /.., /.claude/settings.local.json, /.claude, /integrations/mcp-constraint-monitor/src/hooks/pre-prompt-hook-wrapper.js, /integrations/mcp-constraint-monitor/src/hooks/pre-tool-hook-wrapper.js, /integrations/mcp-constraint-monitor/src/hooks/pre-prompt-hook-wrapper.js\, /integrations/mcp-constraint-monitor/src/hooks/pre-tool-hook-wrapper.js\, /system-reminder, /Git, /install.log, /VPN, /memory-visualizer, /integrations/mcp-server-browserbase, /integrations/mcp-server-semantic-analysis, /memory-visualizer.git, //cc-github.bmwgroup.net/frankwoernle/memory-visualizer.git, //github.com/fwornle/memory-visualizer.git, /mcp-server-browserbase.git, //github.com/browserbase/mcp-server-browserbase.git, /mcp-server-semantic-analysis.git, //cc-github.bmwgroup.net/frankwoernle/mcp-server-semantic-analysis.git, //github.com/fwornle/mcp-server-semantic-analysis.git, /.zshrc, /.bashrc, /.bash_profile, //cc-github.bmwgroup.net, /integrations/mcp-constraint-monitor, /integrations/mcp-constraint-monitor/dashboard-new, /ui, //github.com/fwornle/mcp-server-constraint-monitor, /integrations/serena/pyproject.toml, /integrations/shadcn-mcp, /.claude/settings.json, /scripts/tool-interaction-hook-wrapper.js, //json.schemastore.org/claude-code-settings.json
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 13 matches, score: 45/1
- Processing Time: 1ms

---

