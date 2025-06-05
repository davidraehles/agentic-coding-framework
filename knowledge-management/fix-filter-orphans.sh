#!/bin/bash
# Fix filter orphan issue by adding keyword tags to project entities
# This ensures projects appear in filtered results when their related entities are shown

set -euo pipefail

SHARED_MEMORY="/Users/q284340/Claude/shared-memory.json"
BACKUP_FILE="/Users/q284340/Claude/knowledge-management/.backups/shared-memory-backup-$(date +%Y%m%d_%H%M%S).json"

echo -e "🔧 Fixing filter orphan issue..."

# Create backup
cp "$SHARED_MEMORY" "$BACKUP_FILE"

# Python script to add searchable tags to project entities
python3 << 'EOF' > /tmp/fixed-filter-orphans.json
import json

with open("/Users/q284340/Claude/shared-memory.json", "r") as f:
    data = json.load(f)

# Get all entities that connect to each project
project_related_entities = {
    "timeline": [],
    "knowledge-management": [], 
    "Claude": []
}

# Collect entities by project
for entity in data["entities"]:
    if entity.get("entityType") == "CodingInsight" or entity.get("entityType") == "DeepInsight":
        for obs in entity.get("observations", []):
            if obs.startswith("Project:"):
                project_name = obs.split("Project:", 1)[1].strip()
                if project_name in project_related_entities:
                    project_related_entities[project_name].append(entity["name"])

# Extract common keywords from related entities
def extract_keywords(entity_names):
    keywords = set()
    for name in entity_names:
        parts = name.replace("-", "_").split("_")
        for part in parts:
            if len(part) > 2:  # Skip very short parts
                keywords.add(part.lower())
    return list(keywords)

# Update project entities with searchable observations
for entity in data["entities"]:
    if entity.get("entityType") == "Project":
        project_name = entity["name"]
        if project_name in project_related_entities:
            related_entities = project_related_entities[project_name]
            keywords = extract_keywords(related_entities)
            
            # Add comprehensive observations to make projects findable
            new_observations = [
                f"Software project: {project_name}",
                f"Contains {len(related_entities)} coding insights",
                f"Keywords: {', '.join(keywords[:10])}",  # Limit to top 10 keywords
                "Project hub for related insights and features"
            ]
            
            # Add specific tags based on project
            if "feature" in keywords:
                new_observations.append("Contains feature implementations")
            if "bug" in keywords or "fix" in keywords:
                new_observations.append("Contains bug fixes and improvements") 
            if "refactor" in keywords:
                new_observations.append("Contains refactoring work")
            if "management" in keywords:
                new_observations.append("Contains management and organizational work")
            
            entity["observations"] = new_observations

print(json.dumps(data, indent=2))

# Stats
total_projects = sum(1 for e in data["entities"] if e.get("entityType") == "Project")
print(f"Enhanced {total_projects} project entities for better filtering", file=__import__('sys').stderr)
EOF

mv /tmp/fixed-filter-orphans.json "$SHARED_MEMORY"
echo "✅ Fixed filter orphan issue"
echo "📝 Project entities now include searchable keywords from their related insights"