# Migration Guide: From Legacy UKB to UKB-CLI

## Overview

This guide helps you migrate from the legacy bash-based `ukb` script to the new Node.js-based `ukb-cli` system. The new system maintains full backwards compatibility while offering improved features and cross-platform support.

## Key Improvements

| Feature | Legacy UKB | UKB-CLI |
|---------|------------|---------|
| **Platform Support** | Linux/macOS only | Windows, macOS, Linux |
| **Architecture** | 3,827-line bash script | Modular Node.js API |
| **Testing** | No automated tests | Comprehensive test suite |
| **Extensibility** | Hard to extend | Plugin architecture |
| **Performance** | Slow for large datasets | Optimized operations |
| **Error Handling** | Basic | Detailed validation |
| **Documentation** | Limited | Full API docs |

## Migration Steps

### Step 1: Install UKB-CLI

```bash
# Navigate to the knowledge API directory
cd ~/Agentic/coding/lib/knowledge-api

# Install dependencies
npm install

# Verify installation
./bin/ukb-cli.js status
```

### Step 2: Verify Data Compatibility

Your existing `shared-memory.json` file is fully compatible:

```bash
# Check current data
ukb-cli status

# List existing entities
ukb-cli entity list

# Verify relations
ukb-cli relation list
```

### Step 3: Update Scripts and Aliases

#### Option A: Use the Compatibility Wrapper

```bash
# The refactored wrapper maintains legacy command compatibility
alias ukb='~/Agentic/coding/knowledge-management/ukb-refactored'
```

#### Option B: Direct CLI Usage

```bash
# Create new alias
alias ukb='~/Agentic/coding/bin/ukb-cli.js'

# Or add to PATH
export PATH="$PATH:~/Agentic/coding/bin"
```

### Step 4: Update Existing Workflows

#### Legacy Commands → New Commands

| Legacy Command | New Command |
|----------------|-------------|
| `ukb` | `ukb-cli status` or `ukb-cli interactive` |
| `ukb -i` | `ukb-cli interactive` |
| `ukb -a` | `ukb-cli insight --interactive` |
| `ukb --list-entities` | `ukb-cli entity list` |
| `ukb --add-entity` | `ukb-cli entity add` |
| `ukb --remove-entity` | `ukb-cli entity remove` |

#### Example Workflow Updates

**Before (Legacy):**
```bash
# Interactive capture
ukb -i

# Auto mode
ukb

# Agent mode
ukb -a
```

**After (UKB-CLI):**
```bash
# Interactive mode (improved UI)
ukb-cli interactive

# Direct entity creation
ukb-cli entity add -n "PatternName" -t "TechnicalPattern" -s 8

# Process insight
ukb-cli insight --interactive
```

### Step 5: Update CI/CD Integration

**Legacy CI Script:**
```bash
#!/bin/bash
# Extract from commits
git log --oneline -10 | while read line; do
    ukb <<< "$line"
done
```

**New CI Script:**
```bash
#!/bin/bash
# More reliable and testable
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ $COMMIT_MSG == *"[pattern]"* ]]; then
    PATTERN=$(echo "$COMMIT_MSG" | grep -oP '(?<=\[pattern\]).*?(?=\[/pattern\])')
    ukb-cli entity add -n "CI_Pattern_$(date +%s)" -t "TechnicalPattern" -o "$PATTERN"
fi
```

## Feature Comparison

### Entity Management

**Legacy:**
```bash
# Limited to interactive prompts
ukb -i
# Then navigate through menus
```

**UKB-CLI:**
```bash
# Direct commands
ukb-cli entity add -n "CachingPattern" -t "TechnicalPattern" -s 9

# Search capabilities
ukb-cli entity search "cache"

# Filtering
ukb-cli entity list --type "Problem" --min-significance 8
```

### Relation Management

**Legacy:**
```bash
# Only through interactive mode
ukb -i
# Complex menu navigation
```

**UKB-CLI:**
```bash
# Direct relation creation
ukb-cli relation add -f "Solution" -t "Problem" -r "solves"

# Query relations
ukb-cli relation list --from "MyPattern"

# Find paths
ukb-cli relation path "EntityA" "EntityB"
```

### Import/Export

**Legacy:**
```bash
# Manual file copying
cp shared-memory.json backup.json
```

**UKB-CLI:**
```bash
# Proper import/export
ukb-cli export backup-$(date +%Y%m%d).json
ukb-cli import team-patterns.json --merge
```

## Common Migration Scenarios

### Scenario 1: Team Migration

```bash
# 1. Export legacy data
cd ~/old-project
cp shared-memory.json ~/migration-backup.json

# 2. Install ukb-cli in new location
cd ~/Agentic/coding/lib/knowledge-api
npm install

# 3. Import existing data
./bin/ukb-cli.js import ~/migration-backup.json

# 4. Verify migration
./bin/ukb-cli.js status
./bin/ukb-cli.js entity list | wc -l  # Count entities
```

### Scenario 2: Gradual Migration

Keep both systems running in parallel:

```bash
# Use legacy for existing scripts
alias ukb-legacy='/path/to/old/ukb'

# Use new CLI for new workflows
alias ukb='/path/to/ukb-cli.js'

# Sync data periodically
ukb-cli export shared-memory.json
```

### Scenario 3: Script Updates

**Update shell scripts:**
```bash
# Find all scripts using ukb
grep -r "ukb" ~/scripts/

# Update each script to use new commands
sed -i 's/ukb -i/ukb-cli interactive/g' ~/scripts/*.sh
sed -i 's/ukb -a/ukb-cli insight --interactive/g' ~/scripts/*.sh
```

## Troubleshooting

### Issue: Command not found

```bash
# Check Node.js installation
node --version  # Should be 18+

# Check CLI location
ls -la ~/Agentic/coding/bin/ukb-cli.js

# Make executable
chmod +x ~/Agentic/coding/bin/ukb-cli.js
```

### Issue: Data not loading

```bash
# Check file path
ukb-cli status

# Verify JSON format
jq . shared-memory.json > /dev/null

# Use absolute path
KNOWLEDGE_API_STORAGE_PATH=/absolute/path/shared-memory.json ukb-cli status
```

### Issue: Import conflicts

```bash
# Backup first
ukb-cli export backup-before-import.json

# Try merge mode
ukb-cli import new-data.json --merge

# Or clean import
mv shared-memory.json shared-memory.old.json
ukb-cli import new-data.json
```

## Best Practices for Migration

1. **Backup First**: Always backup your data before migration
2. **Test Thoroughly**: Verify all workflows work correctly
3. **Update Documentation**: Document new commands for team
4. **Gradual Rollout**: Migrate one workflow at a time
5. **Monitor Usage**: Track any issues during transition

## New Features to Explore

After migration, take advantage of new features:

1. **Programmatic API**
   ```javascript
   const KnowledgeAPI = require('knowledge-api');
   const api = new KnowledgeAPI();
   await api.initialize();
   ```

2. **Advanced Search**
   ```bash
   ukb-cli entity search "error handling" --type "Solution"
   ```

3. **Path Finding**
   ```bash
   ukb-cli relation path "ProblemA" "SolutionZ"
   ```

4. **Batch Operations**
   ```bash
   ukb-cli import bulk-patterns.json
   ukb-cli process-insights conversation-log.json
   ```

5. **Export Formats**
   ```bash
   ukb-cli export --format graphml  # Future feature
   ```

## Support and Resources

- **Documentation**: `/docs/ukb/`
- **API Reference**: `/docs/ukb/api-reference.md`
- **Use Cases**: `/docs/ukb/use-cases.md`
- **Architecture**: `/docs/ukb/architecture.md`

## Rollback Plan

If you need to rollback:

1. Keep backup of original `ukb` script
2. Maintain data compatibility
3. Export from ukb-cli: `ukb-cli export rollback.json`
4. Use with legacy script if needed

The new system maintains full data compatibility, so rollback is always possible.