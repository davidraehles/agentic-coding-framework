# Proposed Codebase Cleanup - Awaiting Approval

## Summary
This document proposes additional cleanup to improve organization without breaking functionality.

---

## 1. `.backups/` Folder - **REMOVE** ✅ Safe

**Current State**:
- Contains 1 file: `shared-memory-2025-07-01T14-23-08-956Z.json` (July 1st backup)
- **No code references found** in scripts or bin

**Proposal**:
- Move to `.obsolete/backups/dot-backups/`
- This is a leftover backup folder, superseded by proper git version control

**Risk**: None - no references found

---

## 2. `.embeddings/` Folder - **REMOVE** ✅ Safe

**Current State**:
- **Empty directory**
- **No code references found**

**Proposal**:
- Remove empty directory

**Risk**: None - empty and unreferenced

---

## 3. `.live-logging/` Folder - **INVESTIGATE** ⚠️

**Current State**:
- Contains `sessions.json` (83 bytes)
- **No direct code references found** but may be legacy

**Proposal**:
- Move to `.obsolete/legacy-logging/`
- Appears to be superseded by `.lsl/` system

**Risk**: Low - no active references, but verify sessions.json content first

**Content of sessions.json**:
```json
{
  "active_sessions": {},
  "last_cleanup": "2025-09-03T16:14:29.856Z"
}
```

**Decision**: Safe to move - no active sessions, last updated Sept 3

---

## 4. `.lsl/config.json` - **CONSOLIDATE** 🔄 Moderate

**Current State**:
- Used by: `lsl-file-manager.js`, `enhanced-transcript-monitor.js`, `classification-logger.js`
- Currently at `.lsl/config.json`

**Current References in Code**:
- `lsl-file-manager.js` uses `.lsl/logs`, `.lsl/archive`, `.lsl/temp` (subdirectories)
- Other files reference `.lslFormat` (property, not folder)

**Proposal**:
- Move `.lsl/config.json` → `config/lsl-config.json`
- Update 5 files that reference `.lsl` path
- Keep `.lsl/logs`, `.lsl/archive`, `.lsl/temp` as data directories

**Risk**: Moderate - requires code changes in 5 files

**Files to Update**:
1. `scripts/classification-logger.js` (lines 241-242) - only uses `.lslFormat` property ✅ no change
2. `scripts/enhanced-operational-logger.js` - needs verification
3. `scripts/enhanced-transcript-monitor.js` (line 1323, 1451, 1508) - only uses `.lslFormat` ✅ no change
4. `scripts/lsl-file-manager.js` (lines 68, 72, 76) - uses `.lsl/` subdirectories ✅ no change
5. `scripts/validate-lsl-config.js` - needs verification

**REVISED PROPOSAL**: After analysis, `.lsl/` is actually a **data directory**, not a config directory:
- `.lsl/config.json` - configuration
- `.lsl/logs/` - runtime log data
- `.lsl/archive/` - archived logs
- `.lsl/temp/` - temporary files

**Better approach**: Leave `.lsl/` as-is - it's a cohesive data directory, not just config.

---

## 5. `.versions/` Folder - **REMOVE** ✅ Safe

**Current State**:
- Contains 69 JSON files (UUIDs) - appears to be MCP memory versioning from July
- **No code references found**
- Last modified: July 3, 2025

**Proposal**:
- Move entire folder to `.obsolete/mcp-versions-archive/`
- Appears to be old MCP Memory server data before migration

**Risk**: None - no references, 3 months old

---

## 6. `scripts/config/` vs `config/` - **CONSOLIDATE** ✅ Safe

**Current State**:
- `scripts/config/transcript-formats.json` (last updated Sep 16)
- `config/transcript-formats.json` (last updated Sep 18) - **newer**
- Files are **almost identical** except timestamps

**Proposal**:
- Remove `scripts/config/` folder
- Update any references to use `config/transcript-formats.json`
- The `config/` folder is the canonical location

**Risk**: Low - just need to update references

---

## 7. Scripts Organization: `scripts/*.js` vs `src/` - **ANALYZE ONLY** 📊

**Current State**:
- 32 .js files in `scripts/`
- All 30 files have `#!/usr/bin/env node` shebang (executable scripts)

**Files Breakdown**:

**Executable Services** (should stay in scripts/):
- `enhanced-transcript-monitor.js` - LSL monitoring daemon
- `global-lsl-coordinator.js` - Multi-project coordinator
- `live-logging-coordinator.js` - Session logging service
- `statusline-health-monitor.js` - Health monitoring service
- `system-monitor-watchdog.js` - Watchdog service
- `violation-capture-service.js` - Constraint monitoring

**Library Modules** (candidates for `src/`):
- `lsl-file-manager.js` - File management library
- `enhanced-redaction-system.js` - Redaction library
- `reliable-classifier.js` - Classification library
- `timezone-utils.js` - Utility library
- `user-hash-generator.js` - Utility library

**One-off Utilities** (stay in scripts/):
- `auto-insight-trigger.js`
- `batch-lsl-processor.js`
- `claude-conversation-extractor.js`
- `find-latest-session.js`
- etc.

**Proposal**:
- **DO NOT MOVE** - All files have shebang and are designed as executable scripts
- The pattern is correct: `scripts/` for executable code, even if some are libraries
- Node.js convention allows library files in scripts/ if they're also executable

**Risk**: High if moved - would break many imports and execution paths

**Recommendation**: Leave as-is

---

## Summary of Recommendations

### ✅ SAFE TO PROCEED (No Risk)
1. **Remove `.backups/`** → move to `.obsolete/backups/dot-backups/`
2. **Remove `.embeddings/`** → delete empty directory
3. **Remove `.live-logging/`** → move to `.obsolete/legacy-logging/`
4. **Remove `.versions/`** → move to `.obsolete/mcp-versions-archive/`
5. **Consolidate config** → remove `scripts/config/`, use `config/`

### 🔄 SKIP (Better to Leave As-Is)
6. **`.lsl/` folder** → Keep as-is (cohesive data directory structure)
7. **`scripts/*.js` files** → Keep as-is (correctly organized as executable scripts)

---

## Proposed Actions Summary

```bash
# 1. Move .backups to .obsolete
mv .backups .obsolete/backups/dot-backups

# 2. Remove empty .embeddings
rmdir .embeddings

# 3. Move .live-logging to .obsolete
mv .live-logging .obsolete/legacy-logging

# 4. Move .versions to .obsolete
mv .versions .obsolete/mcp-versions-archive

# 5. Remove scripts/config (after updating references)
# First: update any code referencing scripts/config/transcript-formats.json
# Then: rm -rf scripts/config
```

**Estimated Impact**:
- Files moved/removed: 72 files
- Code changes needed: 0-2 files (only if scripts/config has references)
- Risk level: Very Low

---

## Decision Required

Please review and approve/reject each section. I will only proceed with changes you explicitly approve.
