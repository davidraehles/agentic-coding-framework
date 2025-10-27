# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-09-26_1200-1300_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:24.843Z<br>
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
- **Average Processing Time**: 3ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1758881900650](../../../history/2025-09-26_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758881900650)

**Time Range**: 1758881900650 → 1758882114023<br>
**LSL File**: [2025-09-26_1200-1300_g9b30a_from-curriculum-alignment.md](../../../history/2025-09-26_1200-1300_g9b30a_from-curriculum-alignment.md#ps_1758881900650)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.57)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (100.0%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment/.github/workflows/deploy.yml, /registration, /CD, /in?, /Users/q284340/Agentic/curriculum-alignment/frontend/src/services/api/apiClient.ts`, //localhost:3000/api, //ihqwce6c41.execute-api.eu-central-1.amazonaws.com/dev, /Users/q284340/Agentic/curriculum-alignment/frontend/.env.production`, //ihqwce6c41.execute-api.eu-central-1.amazonaws.com/dev`, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/curriculumSlice.ts`, /Users/q284340/Agentic/curriculum-alignment/frontend/src/store/slices/authSlice.ts`, /Users/q284340/Agentic/curriculum-alignment/frontend/public/manifest.json`, /Users/q284340/Agentic/curriculum-alignment/frontend/index.html`, /Users/q284340/Agentic/curriculum-alignment/frontend/src/components/views/DashboardView.tsx`, /Users/q284340/Agentic/curriculum-alignment/frontend/src/services/auth/cognitoService.ts`, /configure, /deployment, /deployment?, /lastName, /config/environment.ts, /**\n, /\n, /auth/cognito-config.ts, /client-cognito-identity-provider, /client-cognito-identity, //${environment}.curriculum-alignment.ceu.edu/auth/callback`\n, //localhost:3000/auth/callback, //${environment}.curriculum-alignment.ceu.edu/auth/logout`\n, //localhost:3000/auth/logout, //${config.userPoolDomain}.auth.${config.region}.amazoncognito.com`, /login?client_id=${config.userPoolWebClientId}, /signup?client_id=${config.userPoolWebClientId}, /logout?client_id=${config.userPoolWebClientId}, /forgotPassword?client_id=${config.userPoolWebClientId}, /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(attributes.email)), /admin\n, /^[A-Z0-9]{8}$/.test(attributes[, /services/auth.service.ts, /config/environment, /database, /database/models, /project.yml, /workflows/test.yml, /workflows/blue-green-deploy.yml, /workflows/deploy.yml, /tags/*, /heads/main, /checkout@v4, /.github/workflows/test.yml, /setup-node@v4, /setup-sam@v2, /configure-aws-credentials@v4, /build/template.yaml, /dist, /../frontend-${{, /.., /upload-artifact@v3, /build/, /download-artifact@v3, /deploy-monitoring.sh, //${{, /index.html, /{}, /curriculum-alignment/${{, /db/host, /db/name, /db/username, /db/password, /migrations, /smoke, /health, /health/database, /github-script@v6, /system-reminder, //localhost:3000, //localhost:3001, /aws/lambda/curriculum-alignment, /src/hooks/useSettings.ts, /src/services/api/settingsService.ts, /integration/api/auth.test.ts, /load/k6-scripts/volume-test.js, /load/k6-scripts/soak-test.js, /test-database.ts, /init-qdrant.ts, /semantic-search/vector-engine.ts, /browser/stagehand-integration.ts, /browser/index.ts, /middleware/auth.middleware.ts, /database/index.ts, /config/database.ts, /agents/monitoring.ts, /utils/optimization.ts, /services/websocket.service.ts, /ws, /services/logging.service.ts, /services/llm-config.service.ts, /services/secrets.service.ts, /migrations/001_initial_schema.sql, /mapUserAttributes, /src/services/auth/cognitoService.ts, /constructor, /confirmResetPassword, /confirmSignUp, /ensureConfigured, /extractTokens, /forgotPassword, /getCurrentAuthenticatedUser, /getIsConfigured, /isConfigured, /refreshAuthSession, /resendConfirmationCode, /signIn, /signOut, /signUp
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.57
- Reasoning: Keyword analysis: 2 matches, score: 5/1
- Processing Time: 2ms

---

