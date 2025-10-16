# Multi-Collection Classification Architecture

## Overview
The LSL classification system now supports multi-collection relative scoring to improve accuracy when distinguishing between coding infrastructure work and project-specific work that mentions coding tools.

## Problem Statement
Previously, the classifier used only the `coding_infrastructure` collection. This caused false positives when:
- Working on curriculum-alignment project while discussing deployment, status lines, or other coding tools
- LSL sessions mentioned technical infrastructure but were focused on project content
- Example: Oct 11 curriculum-alignment sessions were misclassified as `coding` because they mentioned AWS deployment

## Solution: Multi-Collection Relative Scoring

### Architecture
1. **Multiple Collections**: Each project has its own Qdrant collection
   - `coding_infrastructure`: Coding repo files (src, scripts, docs)
   - `curriculum_alignment`: Curriculum project LSL sessions
   - (Future: other projects can add their own collections)

2. **Parallel Queries**: Query all collections simultaneously with the same embedding vector

3. **Relative Scoring**: Compare similarity scores across collections
   ```javascript
   maxCodingScore = max(...codingCollections.map(c => c.maxScore))
   maxProjectScore = max(...projectCollections.map(c => c.maxScore))
   isCoding = maxCodingScore > maxProjectScore && maxCodingScore >= threshold
   ```

4. **Confidence Calculation**: Factor in score difference
   ```javascript
   scoreDifference = |maxCodingScore - maxProjectScore|
   confidence = min(baseConfidence + (scoreDifference * 0.5), 0.95)
   ```

## Implementation

### 1. Indexer Enhancement (`simple-reindex.js`)
```bash
# Index coding repository
node simple-reindex.js

# Index LSL sessions for a project
node simple-reindex.js --lsl /path/to/project project_collection_name
```

**Features:**
- Parses LSL filename format: `YYYY-MM-DD_HHMM-HHMM_<user-hash>[_from-<project>].md`
- Extracts metadata: date, start/end time, user hash, origin project
- Uses free local Transformers.js embeddings (384 dimensions)
- Stores in project-specific Qdrant collection

### 2. Classifier Enhancement (`ReliableCodingClassifier.js`)
```javascript
const collections = [
  { name: 'coding_infrastructure', type: 'coding' },
  { name: 'curriculum_alignment', type: 'project' }
];
```

**Changes:**
- Queries all collections in parallel (Promise.all)
- Groups collections by type (coding vs project)
- Calculates max scores per type
- Returns detailed scoring information for debugging

### 3. Test Results
```
Test 1: Coding content
  coding_infrastructure=0.583, curriculum_alignment=0.521
  ✅ Correctly classified as CODING

Test 2: Curriculum content
  coding_infrastructure=0.239, curriculum_alignment=0.224
  ✅ Correctly classified as NOT_CODING

Test 3: Mixed content (curriculum + coding tools)
  coding_infrastructure=0.453, curriculum_alignment=0.432
  ✅ Correctly classified as NOT_CODING (key improvement!)
```

## Usage

### Indexing New Project LSL Sessions
```bash
cd /Users/q284340/Agentic/coding/scripts
node simple-reindex.js --lsl /path/to/project project_name
```

### Adding New Collections to Classifier
Edit `ReliableCodingClassifier.js` line 197-200:
```javascript
const collections = options.collections || [
  { name: 'coding_infrastructure', type: 'coding' },
  { name: 'curriculum_alignment', type: 'project' },
  { name: 'new_project', type: 'project' }  // Add new collection
];
```

## Benefits

1. **Reduced False Positives**: Project work mentioning coding tools no longer misclassified
2. **Context-Aware**: Classification considers project-specific context
3. **Scalable**: Easy to add new projects/collections
4. **Transparent**: Detailed scoring info helps debug classification decisions
5. **Free**: Uses local Transformers.js embeddings (no API costs)

## Performance

- **Embedding Generation**: ~70ms (one-time model load), then ~10ms per query
- **Multi-Collection Query**: ~100ms for 2 collections (parallel queries)
- **Total Classification**: ~110ms (including path/keyword analysis)

## Maintenance

### Re-indexing After LSL Changes
```bash
# Delete existing collection (optional)
curl -X DELETE http://localhost:6333/collections/curriculum_alignment

# Re-index
node simple-reindex.js --lsl /Users/q284340/Agentic/curriculum-alignment curriculum_alignment
```

### Verifying Collection Contents
```bash
# Check collection stats
curl http://localhost:6333/collections/curriculum_alignment

# Search for specific content
# (Use Qdrant API or dashboard)
```

## Future Enhancements

1. **Dynamic Collection Discovery**: Auto-detect available collections
2. **Weighted Scoring**: Give more weight to recent sessions
3. **Temporal Analysis**: Consider session date in classification
4. **Cross-Project Patterns**: Learn common patterns across projects
5. **Collection Health Monitoring**: Track collection quality metrics
