#!/usr/bin/env python3

import sys
import os
import asyncio
import json
from datetime import datetime
from pathlib import Path

# Add the project path
sys.path.insert(0, '/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis')

from agents.knowledge_graph import KnowledgeGraphAgent, Entity
from agents.synchronization import SynchronizationAgent

class MockSystem:
    def __init__(self):
        self.agents = {}
        self.coordinator = None

async def test_sync_direct():
    """Test sync directly without UKB integration"""
    print("🔄 Testing sync functionality directly...")
    
    # Create mock system
    system = MockSystem()
    
    # Initialize knowledge graph agent with UKB disabled
    kg_agent = KnowledgeGraphAgent(
        name="knowledge_graph", 
        config={
            "ukb_integration": {
                "ukb_path": "/nonexistent/ukb",  # Disable UKB
                "shared_memory_path": "/Users/q284340/Agentic/coding/shared-memory-coding.json",
                "auto_sync": False,  # Disable UKB auto-sync
                "batch_size": 10
            }
        }, 
        system=system
    )
    
    # Initialize sync agent
    sync_agent = SynchronizationAgent(
        name="synchronization",
        config={
            "sync_targets": {
                "shared_memory_files": {
                    "enabled": True,
                    "bidirectional": True,
                    "file_patterns": ["shared-memory-*.json"]
                }
            }
        },
        system=system
    )
    
    # Add agents to system
    system.agents["knowledge_graph"] = kg_agent
    system.agents["synchronization"] = sync_agent
    
    # Initialize agents
    await kg_agent.initialize()
    await sync_agent.initialize()
    
    print("✅ Agents initialized")
    
    # Create entities directly in the knowledge graph agent's internal storage
    print("📝 Creating entities directly in knowledge graph...")
    
    test_entities = [
        Entity(
            name="DirectSyncTestEntity",
            entity_type="TestPattern",
            significance=8,
            observations=[
                f"Direct sync test entity created at {datetime.now().isoformat()}",
                "Tests sync agent without UKB integration"
            ],
            metadata={
                "test_type": "direct_sync",
                "created_by": "test_script",
                "timestamp": datetime.now().isoformat()
            }
        ),
        Entity(
            name="SyncValidationEntity",
            entity_type="ValidationPattern",
            significance=7,
            observations=[
                "Entity for validating sync functionality",
                "Should appear in shared memory after sync"
            ],
            metadata={
                "test_type": "sync_validation",
                "created_by": "test_script",
                "timestamp": datetime.now().isoformat()
            }
        )
    ]
    
    # Add entities directly to knowledge graph storage
    for entity in test_entities:
        kg_agent.entities[entity.name] = entity
        print(f"  ➕ Added entity: {entity.name}")
    
    print(f"📊 Knowledge graph now has {len(kg_agent.entities)} entities")
    
    # Show entities in knowledge graph
    print("📋 Entities in knowledge graph:")
    for name, entity in kg_agent.entities.items():
        print(f"  - {name}: {entity.entity_type} (significance: {entity.significance})")
    
    # Trigger sync
    print("\n🔄 Triggering synchronization...")
    sync_result = await sync_agent.sync_all_targets()
    
    print(f"📋 Sync result: {sync_result}")
    
    # Check shared memory file
    shared_memory_path = "/Users/q284340/Agentic/coding/shared-memory-coding.json"
    
    if os.path.exists(shared_memory_path):
        print(f"\n📁 Checking {shared_memory_path}...")
        
        # Get file modification time
        mod_time = datetime.fromtimestamp(os.path.getmtime(shared_memory_path))
        print(f"📅 File last modified: {mod_time}")
        
        # Check if it was modified recently (within last 2 minutes)
        now = datetime.now()
        seconds_ago = (now - mod_time).total_seconds()
        print(f"⏱️  Modified {seconds_ago:.1f} seconds ago")
        
        if seconds_ago < 120:
            print("✅ File was recently modified - sync likely worked!")
        else:
            print("❌ File was not recently modified - sync may not have worked")
        
        # Check content
        with open(shared_memory_path, 'r') as f:
            data = json.load(f)
        
        entities_in_file = data.get('entities', {})
        print(f"📊 Total entities in shared memory file: {len(entities_in_file)}")
        
        # Check for our test entities
        test_entities_found = []
        for entity_name in ["DirectSyncTestEntity", "SyncValidationEntity"]:
            if entity_name in entities_in_file:
                test_entities_found.append(entity_name)
                print(f"  ✅ Found test entity: {entity_name}")
            else:
                print(f"  ❌ Missing test entity: {entity_name}")
        
        if test_entities_found:
            print(f"\n🎉 SUCCESS: {len(test_entities_found)}/2 test entities found in shared memory!")
            
            # Show details of found entities
            for entity_name in test_entities_found:
                entity = entities_in_file[entity_name]
                print(f"  📄 {entity_name}: {entity.get('entityType', 'unknown')} (significance: {entity.get('significance', 'unknown')})")
        else:
            print("\n❌ FAIL: No test entities found in shared memory")
        
        # Show most recent entities
        print("\n📋 Most recent entities in shared memory:")
        for name, entity in list(entities_in_file.items())[-5:]:
            print(f"  - {name}: {entity.get('entityType', 'unknown')} (significance: {entity.get('significance', 'unknown')})")
    
    else:
        print("❌ Shared memory file doesn't exist")
    
    return sync_result

if __name__ == "__main__":
    asyncio.run(test_sync_direct())