# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-28_1300-1400_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.037Z<br>
**Decisions in Window**: 1

---

## Statistics

- **Total Prompt Sets**: 1
- **Classified as CODING**: 1 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 1ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759058676124](../../../history/2025-09-28_1300-1400_g9b30a_from-curriculum-alignment.md#ps_1759058676124)

**Time Range**: 1759058676124 → 1759061143705<br>
**LSL File**: [2025-09-28_1300-1400_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_1300-1400_g9b30a_from-curriculum-alignment.md#ps_1759058676124)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (96.3%) of file operations target local project: /workflows/deploy.yml, /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml, /curriculum-alignment/${{, /db/host, /dev/null, /db/name, /db/username, /db/password, /migrations, /system-reminder, //github.com/fwornle/curriculum-alignment/actions/runs/18073003191, /smoke, /smoke[0m, /usr/bin/bash, //h7edwpo2lk.execute-api.eu-central-1.amazonaws.com/staging/, /smoke.test.js, /health, /health/database, /health/info, /api/programs, /api/universities, /api/analysis, /api/reports, /api/agents/status, /json, /home/runner/work/curriculum-alignment/curriculum-alignment/tests/smoke
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 1ms

---

