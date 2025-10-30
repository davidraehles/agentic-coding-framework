# Classification Decision Log (Foreign/Coding)

**Time Window**: 2025-10-16_0800-0900_g9b30a<br>
**Project**: curriculum-alignment<br>
**Target**: CODING<br>
**Generated**: 2025-10-27T19:27:25.021Z<br>
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
- **Average Processing Time**: 2ms

---

## Layer 2: Keyword

**Decisions**: 1

### Prompt Set: [ps_1760594678109](../../../history/2025-10-16_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1760594678109)

**Time Range**: 1760594678109 → 1761804566835<br>
**LSL File**: [2025-10-16_0800-0900_g9b30a_from-curriculum-alignment.md](../../../history/2025-10-16_0800-0900_g9b30a_from-curriculum-alignment.md#ps_1760594678109)<br>
**LSL Lines**: 0-0<br>
**Target**: 🌍 FOREIGN (coding)<br>
**Final Classification**: ✅ CODING (confidence: 0.85)

#### Layer-by-Layer Trace

❌ **Layer 1 (path)**
- Decision: local
- Confidence: 0.02
- Reasoning: Majority (71.8%) of file operations target local project: /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-09-23_0900-1000_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-09-23_0900-1000_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-16_0700-0800_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment, /history/*.md, /logs/classification/*.md, /history/*_from-curriculum-alignment.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/*.md, /dev/null, /Users/q284340/.claude/projects/-Users-q284340-Agentic-curriculum-alignment, /tmp/lsl-regen-clean.log, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/, /Users/q284340/Agentic/curriculum-alignment/.specstory/history/2025-10-05_2100-2200_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/*.jsonl, /../history/2025-09-23_0900-1000_g9b30a.md#ps_2025-09-23T07:18:18.376Z), /../history/2025-09-23_0900-1000_g9b30a.md#ps_2025-09-23T07:00:38.598Z), /../history/2025-09-23_0900-1000_g9b30a.md#ps_2025-09-23T07:10:04.060Z), /../history/2025-09-23_0900-1000_g9b30a.md#ps_2025-09-23T07:00:13.711Z), /53, /system-reminder, /constructor, /classifyPromptSet, /classifyWithRetry, /createLSLFile, /createLSLFilesByTimeWindow, /createPromptSetFile, /delay, /extractContentFromEntry, /extractConversationWithRetry, /findExistingLSLFiles, /findRecentTranscripts, /findTranscriptFiles, /findTranscriptsForTimeWindow, /findTranscriptsInRange, /formatExchanges, /formatTimeRange, /generateExpectedLSLFiles, /generateLSLContent, /generateTimeWindows, /isSlCommand, /isToolResult, /parseIntoPromptSets, /parseTimeWindowFromFilename, /printStats, /process, /processConversationData, /processForeignOnly, /processFromTranscripts, /processInTimeWindows, /processPostSession, /processRetroactive, /processTranscriptFile, /rebuildLSLFile, /rebuildMissing, /recoverFromTranscript, /regenerateMarkdownFromJsonl, /batch-lsl-processor.js, /live-logging/EmbeddingClassifier.test.js, /live-logging/ReliableCodingClassifier.js, /usr/bin/env, /**, /src/live-logging/ReliableCodingClassifier.js, /SemanticAnalyzer.js, /PathAnalyzer.js, /SemanticAnalyzerAdapter.js, /KeywordMatcher.js, /OperationalLogger.js, /PerformanceMonitor.js, /non-coding, /dlq-handler/index.ts`, /agents/coordinator.test.ts`, /agents/mocks/aws-services.mock.ts`, /agents/mocks/llm-service.mock.ts`, /agents/qa-agent.test.ts`, /agents/communication.test.ts`, /agents/jest.config.js`, /setup.ts`, /deploy-agents.sh`, /update-agent.sh`, /rollback-deployment.sh`, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-15_0800-0900_g9b30a.md, /Users/q284340/Agentic/curriculum-alignment/.specstory/logs/classification/2025-10-16_0600-0700_g9b30a.md, /../history/2025-10-16_0700-0800_g9b30a.md#ps_2025-10-16T05:02:36.750Z)
- Processing Time: 1ms

✅ **Layer 2 (keyword)**
- Decision: coding
- Confidence: 0.85
- Reasoning: Keyword analysis: 15 matches, score: 54/1
- Processing Time: 1ms

---

