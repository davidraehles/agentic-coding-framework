# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-28_1200-1300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.036Z<br>
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
- **Average Processing Time**: 0ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1759055437783](../../../history/2025-09-28_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759055437783)

**Time Range**: 1759055437783 → 1759057071431<br>
**LSL File**: [2025-09-28_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-28_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1759055437783)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: //github.com/fwornle/curriculum-alignment/actions/runs/18072192487, ///, /index.html, ///index.html, ///{}, /usr/bin/bash, /:][a-zA-Z0-9\-.]{1,63}$, /:][a-zA-Z0-9\-]{1,63}[/:]accesspoint[/:][a-zA-Z0-9\-]{1,63}$, /curriculum-alignment/staging/db/host, /curriculum-alignment/staging/db/name, /curriculum-alignment/staging/db/username, /curriculum-alignment/staging/db/password, /migrations[0m, /github-script@v6, /github-script, /home/runner/work/_actions/actions/github-script/v6/dist/index.js:6842:21, /process/task_queues:95:5), /home/runner/work/_actions/actions/github-script/v6/dist/index.js:15143:16),, /home/runner/work/_actions/actions/github-script/v6/dist/index.js:15236:20), //api.github.com/repos/fwornle/curriculum-alignment/deployments, /json, //docs.github.com/rest/deployments/deployments#create-a-deployment, /vnd.github.v3+json, /3.6.0, /20.19.4
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 0ms

---

