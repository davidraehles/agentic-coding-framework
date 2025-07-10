#!/usr/bin/env python3

import sys
import os
import asyncio
import json
from datetime import datetime
from pathlib import Path

# Add the project path
sys.path.insert(0, '/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis')

from agents.knowledge_graph import KnowledgeGraphAgent
from agents.synchronization import SynchronizationAgent

class MockSystem:
    def __init__(self):
        self.agents = {}
        self.coordinator = None

async def test_end_to_end():
    """Test the complete entity creation → sync → storage flow"""
    print("🔄 Testing complete end-to-end workflow...")
    
    # Create mock system
    system = MockSystem()
    
    # Initialize knowledge graph agent
    kg_agent = KnowledgeGraphAgent(
        name="knowledge_graph", 
        config={
            "ukb_integration": {
                "ukb_path": "/Users/q284340/Agentic/coding/bin/ukb",
                "shared_memory_path": "/Users/q284340/Agentic/coding/shared-memory-coding.json",
                "auto_sync": True,
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
    
    # Create test entities in knowledge graph
    print("📝 Creating test entities...")
    
    # Create entities using the knowledge graph agent
    entities = [
        {
            "name": "EndToEndTestPattern",
            "entityType": "TestPattern",
            "significance": 8,
            "observations": [
                f"End-to-end test pattern created at {datetime.now().isoformat()}",
                "Tests the complete workflow from entity creation to storage persistence"
            ],
            "metadata": {
                "test_type": "end_to_end",
                "created_by": "test_script",
                "timestamp": datetime.now().isoformat()
            }
        },
        {
            "name": "SyncValidationPattern",
            "entityType": "ValidationPattern", 
            "significance": 7,
            "observations": [
                "Pattern for validating sync agent functionality",
                "Ensures entities flow from knowledge graph to shared memory files"
            ],
            "metadata": {
                "test_type": "sync_validation",
                "created_by": "test_script",
                "timestamp": datetime.now().isoformat()
            }
        }
    ]
    
    # Add entities to knowledge graph
    for entity_data in entities:
        result = await kg_agent.create_entity(
            name=entity_data["name"],
            entity_type=entity_data["entityType"],
            significance=entity_data["significance"],
            observations=entity_data["observations"],
            metadata=entity_data["metadata"]
        )
        print(f"  ➕ Added entity: {entity_data['name']} - Success: {result.get('success', False)}")
    
    print(f"📊 Knowledge graph now has {len(kg_agent.entities)} entities")
    
    # Trigger sync
    print("🔄 Triggering synchronization...")
    sync_result = await sync_agent.sync_all_targets()
    
    print(f"📋 Sync result: {sync_result}")
    
    # Check shared memory file
    shared_memory_path = "/Users/q284340/Agentic/coding/shared-memory-coding.json"
    
    if os.path.exists(shared_memory_path):
        print(f"📁 Checking {shared_memory_path}...")
        
        # Get file modification time
        mod_time = datetime.fromtimestamp(os.path.getmtime(shared_memory_path))
        print(f"📅 File last modified: {mod_time}")
        
        # Check if it was modified recently (within last minute)
        now = datetime.now()
        if (now - mod_time).total_seconds() < 60:
            print("✅ File was recently modified - sync likely worked!")
        else:
            print("❌ File was not recently modified - sync may not have worked")
        
        # Check content
        with open(shared_memory_path, 'r') as f:
            data = json.load(f)
        
        entities_in_file = data.get('entities', {})
        print(f"📊 Entities in shared memory file: {len(entities_in_file)}")
        
        # Check for our test entities
        test_entities_found = []
        for entity_name in ["EndToEndTestPattern", "SyncValidationPattern"]:
            if entity_name in entities_in_file:
                test_entities_found.append(entity_name)
                print(f"  ✅ Found test entity: {entity_name}")
            else:
                print(f"  ❌ Missing test entity: {entity_name}")
        
        if test_entities_found:
            print(f"🎉 SUCCESS: {len(test_entities_found)}/2 test entities found in shared memory!")
        else:
            print("❌ FAIL: No test entities found in shared memory")
        
        # Show recent entities
        print("\n📋 Recent entities in shared memory:")
        for name, entity in list(entities_in_file.items())[-5:]:
            print(f"  - {name}: {entity.get('entityType', 'unknown')}")
    
    else:
        print("❌ Shared memory file doesn't exist")
    
    return sync_result

if __name__ == "__main__":
    asyncio.run(test_end_to_end())