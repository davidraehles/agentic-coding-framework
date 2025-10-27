# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-26_0900-1000_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.840Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 1
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 1
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 407ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758870856153](../../../history/2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758870856153)

**Time Range**: 1758870856153 → 1758870998696<br>
**LSL File**: [2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758870856153)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.78)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (88.2%) of file operations target local project: /history/, /dev/null, /history, specstory/history/, dev/null, specstory/history, Users/q284340/Agentic/coding/.specstory/history/*curriculum-alignment*, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-26_0600-0700_g9b30a.md, /repo, /.specstory/history/*_from-, /same:, /history/), /Users/q284340/Agentic/curriculum-alignment, /curriculum-alignment.git, ~60, //curriculum.tanfra.com, ~10-15, /Users/q284340/Agentic/curriculum-alignment/deploy/simple-deployment.yaml, /Users/q284340/Agentic/curriculum-alignment/deploy/deploy-simple.sh, /Users/q284340/Agentic/curriculum-alignment/deploy/frontend-only.yaml, /index.html\n, /index.html, //${DomainName}\, //${CloudFrontDistribution.DomainName}\, /Users/q284340/Agentic/curriculum-alignment/deploy/deploy-frontend.sh, /hostedzone/, //${DOMAIN_NAME}${NC}\, //${DOMAIN_NAME}\, /system-reminder, /processing
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.78
- Reasoning: Keyword analysis: 5 matches, score: 17/1
- Processing Time: 0ms

---

## Layer 3: Embedding

**Decisions**: 1

### Prompt Set: [ps_1758871059189](../../../history/2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758871059189)

**Time Range**: 1758871059189 → 1758877334808<br>
**LSL File**: [2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_0900-1000_g9b30a_from-curriculum-alignment.md#ps_1758871059189)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.6624595299999999)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/deploy/frontend-only.yaml
- Processing Time: 1ms

❌ **Layer 2 (keyword)**
- Decision: local
- Confidence: 0.1
- Reasoning: Keyword analysis: 0 matches, score: 0/1
- Processing Time: 1ms

✅ **Layer 3 (embedding)**
- Decision: coding
- Confidence: 0.6624595299999999
- Reasoning: Semantic similarity favors coding (coding_lsl=0.659, curriculum_alignment=0.653, nano_degree=0.632, coding_infrastructure=0.618)
- Processing Time: 811ms

---

