# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-29_0700-0800_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.082Z<br>
**Decisions in Window**: 2

---

## Statistics

- **Total Prompt Sets**: 2
- **Classified as CODING**: 2 (100%)
- **Classified as LOCAL**: 0 (0%)
- **[Layer 0 (Session Filter) Decisions](#layer-0-session-filter)**: 0
- **[Layer 1 (Path) Decisions](#layer-1-path)**: 0
- **[Layer 2 (Keyword) Decisions](#layer-2-keyword)**: 2
- **[Layer 3 (Embedding) Decisions](#layer-3-embedding)**: 0
- **[Layer 4 (Semantic) Decisions](#layer-4-semantic)**: 0
- **Average Processing Time**: 2ms

---

## Layer 2: Keyword

**Decisions**: 2

### Prompt Set: [ps_1759122571100](../../../history/2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759122571100)

**Time Range**: 1759122571100 → 1759122739244<br>
**LSL File**: [2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759122571100)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.675)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /*", /Users/q284340/Agentic/curriculum-alignment/deploy/infrastructure.yml, .., /Users/q284340/Agentic/curriculum-alignment/infrastructure/cloudfront-distribution.yaml, /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml, /prod, /index.html`, /TypeScript, /CD, /src/components/views/DashboardView.tsx`, /src/store/slices/authSlice.ts`, /src/services/auth/cognitoService.ts`, /src/hooks/useAuth.ts`, /workflows/deploy.yml`, //${{, /javascript, //ihqwce6c41.execute-api.eu-central-1.amazonaws.com/dev, /deployed-build/`, /dev, /reloading, /html, /logout,, //cloudfront.amazonaws.com/2020-05-31/distribution/E2DGUOYHQAA61E/invalidation/I1G04770OAFCQ9UIZLJOPTVFFB, /Users/q284340/Agentic/curriculum-alignment/frontend, /tool_use_error, /template.yaml, /frontend/packaged-template.yaml, /infrastructure/cloudfront-distribution.yaml, /infrastructure/roles.yaml, /infrastructure/api-gateway.yaml, /public, /static/*, /docs/*, /sw.js, /index.html, /CloudFront, /${CloudFrontDistribution}, //${DomainName}, //${CloudFrontDistribution.DomainName}, /system-reminder, /tags/*, /heads/main, /checkout@v4, /setup-node@v4, /setup-sam@v2, /configure-aws-credentials@v4, /build/template.yaml, /dist, /../frontend-${{, /.., /upload-artifact@v4, /build/, /download-artifact@v4, /deploy-monitoring.sh, /{}, /dev/null, /curriculum-alignment/${{, /db/host, /db/name, /db/username, /db/password, /migrations, /smoke, /health), /health/database), /github-script@v6, /hostedzone/Z0723384SK5JNYHFTSGW, /hostedzone/Z10408201T9N5H4NEPYDT, //sqs.eu-central-1.amazonaws.com/930500114053/curriculum-alignment-dlq-staging, //h7edwpo2lk.execute-api.eu-central-1.amazonaws.com/staging/, //sqs.eu-central-1.amazonaws.com/930500114053/curriculum-alignment-messages-staging, //0w3justrb2.execute-api.eu-central-1.amazonaws.com/staging
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.675
- Reasoning: Keyword analysis: 3 matches, score: 11/1
- Processing Time: 2ms

---

### Prompt Set: [ps_1759123678519](../../../history/2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759123678519)

**Time Range**: 1759123678519 → 1759126005659<br>
**LSL File**: [2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-29_0700-0800_g9b30a_from-curriculum-alignment.md#ps_1759123678519)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.535)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority of write operations target local project: /Users/q284340/Agentic/curriculum-alignment/infrastructure/curriculum-cloudfront.yaml, /Users/q284340/Agentic/curriculum-alignment/frontend/index.html, /Users/q284340/Agentic/curriculum-alignment/frontend/public/manifest.json, /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml
- Processing Time: 0ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.535
- Reasoning: Keyword analysis: 1 matches, score: 3/1
- Processing Time: 2ms

---

