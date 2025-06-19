#!/usr/bin/env python3

import json
from datetime import datetime

def consolidate_knowledge_base():
    with open('shared-memory.json', 'r') as f:
        data = json.load(f)

    # Remove duplicate entities
    entities_to_remove = ["ViewportCullingOptimizationPattern", "MVIReduxArchitecturePattern"]
    original_entity_count = len(data['entities'])
    data['entities'] = [e for e in data['entities'] if e['name'] not in entities_to_remove]

    # Update relations to point to consolidated entities
    for relation in data['relations']:
        if relation['from'] in entities_to_remove:
            if relation['from'] == "ViewportCullingOptimizationPattern":
                relation['from'] = "ViewportCullingPattern"
            elif relation['from'] == "MVIReduxArchitecturePattern":
                relation['from'] = "ReduxStateManagementPattern"
        
        if relation['to'] in entities_to_remove:
            if relation['to'] == "ViewportCullingOptimizationPattern":
                relation['to'] = "ViewportCullingPattern"
            elif relation['to'] == "MVIReduxArchitecturePattern":
                relation['to'] = "ReduxStateManagementPattern"

    # Remove duplicate relations that may result from consolidation
    seen_relations = set()
    unique_relations = []
    for rel in data['relations']:
        rel_key = (rel['from'], rel['to'], rel['relationType'])
        if rel_key not in seen_relations:
            seen_relations.add(rel_key)
            unique_relations.append(rel)

    original_relation_count = len(data['relations'])
    data['relations'] = unique_relations

    # Update metadata
    timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    data['metadata']['total_entities'] = len(data['entities'])
    data['metadata']['total_relations'] = len(data['relations'])
    data['metadata']['last_updated'] = timestamp
    data['metadata']['consolidation_performed'] = timestamp

    # Save the consolidated data
    with open('shared-memory.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✅ Knowledge base consolidated successfully!")
    print(f"   Entities: {original_entity_count} → {len(data['entities'])} (-{original_entity_count - len(data['entities'])})")
    print(f"   Relations: {original_relation_count} → {len(data['relations'])} (-{original_relation_count - len(data['relations'])})")
    print(f"   Removed duplicates: ViewportCullingOptimizationPattern, MVIReduxArchitecturePattern")
    print(f"   Enhanced patterns: ViewportCullingPattern, ReduxStateManagementPattern")
    
    return data

if __name__ == "__main__":
    consolidate_knowledge_base()