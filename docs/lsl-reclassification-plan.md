# LSL Reclassification Plan

**Issue**: Many curriculum-alignment sessions incorrectly classified as "local" when they were actually coding infrastructure work

**Root Cause**: KeywordMatcher lacked keywords for discussing coding infrastructure topics (e.g., "architecture diagram", "PlantUML", "monitoring system", "legacy", "cleanup")

---

## ✅ Fixed: Enhanced Classification

### New Keyword Categories Added

**system_concepts** (weight: 3):
- architecture diagram, PlantUML, puml, monitoring system
- health monitoring, process monitoring, status line, watchdog
- PSM, Process State Manager, global service coordinator
- live guardrails, slash commands, /sl, /lg
- session logs, trajectory generation, constraint monitoring

**infrastructure_topics** (weight: 3):
- coding docs, coding documentation, coding project, coding repo
- bin/coding, install.sh, uninstall.sh, launch-claude
- MCP integration, MCP server, serena, semantic analysis
- knowledge base, knowledge graph, UKB, VKB

**meta_coding_activities** (weight: 2):
- legacy, deprecated, obsolete, evolutionary, cleanup, tidy up
- consolidate, archive, refactor, rename, reorganize
- all-caps, naming convention, file structure, documentation structure

**technical_infrastructure** (weight: 3):
- monitoring layers, health check, failsafe, auto-recovery
- service lifecycle, process registry, atomic operations, file locking
- redirect detection, classification, session continuity

### Classification Improvements

These keywords will now catch discussions like:
- ✅ "the main architecture diagram still talks about 'legacy' parts"
- ✅ "update the documentation to include this new feature"
- ✅ "the coding docs still include files with all-caps filenames"
- ✅ "PlantUML diagrams need updating"
- ✅ "monitoring system cleanup"
- ✅ "PSM integration issues"

---

## 🔄 Reclassification Strategy

### Sessions to Reclassify

Need to retroactively process sessions from Oct 8-15 where:
1. **Primary work topics** were coding infrastructure:
   - Architecture diagram updates
   - Monitoring system consolidation
   - Documentation cleanup (coding docs)
   - LSL system improvements
   - PlantUML diagram generation

2. **Indicators of misclassification**:
   - User messages about coding topics but no immediate file paths
   - Tool calls eventually operating on `/Users/.../Agentic/coding/` paths
   - Discussions about system architecture, monitoring, LSL

### Reclassification Process

**Option 1: Batch Reclassification** (Recommended)
```bash
# Use existing batch-lsl-processor with retroactive mode
cd /Users/q284340/Agentic/curriculum-alignment

# Process Oct 8-15 sessions
PROJECT_PATH=/Users/q284340/Agentic/curriculum-alignment \
CODING_REPO=/Users/q284340/Agentic/coding \
node /Users/q284340/Agentic/coding/scripts/batch-lsl-processor.js \
  retroactive 2025-10-08 2025-10-15
```

**Option 2: Manual Review & Move**
1. Review each session file individually
2. Determine if primary topic was coding infrastructure
3. Move to coding project with rename:
   ```bash
   # Example:
   mv 2025-10-14_1500-1600_g9b30a.md \
      /Users/q284340/Agentic/coding/.specstory/history/2025-10-14_1500-1600_g9b30a_from-curriculum-alignment.md
   ```

---

## 📊 Expected Impact

### Sessions Likely to be Reclassified

Based on log analysis, these sessions contain primarily coding work:

**Oct 12:**
- 2025-10-12_1000-1100 - Documentation updates (semantic analysis)
- 2025-10-12_1200-1300 - Constraint monitor integration
- 2025-10-12_1300-1400 - Session log system

**Oct 14:**
- 2025-10-14_1500-1600 - Documentation priorities
- 2025-10-14_1600-1700 - Architecture diagram cleanup
- 2025-10-14_1700-1800 - Monitoring system consolidation

**Oct 15:**
- 2025-10-15_0600-0700 - Session logs, diagram cleanup, docs tidying

### Post-Reclassification State

**Before**:
- CA .specstory/history/: ~76 files (many misclassified)
- coding .specstory/history/: ~44 `_from-curriculum-alignment.md` files

**After**:
- CA .specstory/history/: ~40-50 files (true CA work only)
- coding .specstory/history/: ~60-70 `_from-curriculum-alignment.md` files

**Classification Accuracy**: ~70-80% → ~95%+

---

## 🚀 Recommended Action

1. **Review this plan** for accuracy
2. **Run Option 1** (batch reclassification) for Oct 8-15
3. **Verify results** by spot-checking moved files
4. **Monitor future classifications** to ensure keywords are working

---

## ⚠️ Important Notes

- **Batch processor uses enhanced keywords**: Will reclassify with improved detection
- **Preserves transcript sources**: Original transcripts remain intact
- **Updates classification logs**: Regenerates JSONL and MD status files
- **Idempotent**: Safe to run multiple times on same date range
- **Non-destructive**: Creates new LSL files, doesn't delete originals until verified

---

*Generated: 2025-10-15*
*Classification Version: 2.2-enhanced*
