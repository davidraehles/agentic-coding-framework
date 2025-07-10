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

async def test_sync_fixed():
    """Test that sync only affects the coding project file"""
    print("🔄 Testing fixed sync agent - should only sync to coding project...")
    
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
    
    # Get modification times of all shared memory files BEFORE sync
    files_to_check = [
        "/Users/q284340/Agentic/coding/shared-memory-coding.json",
        "/Users/q284340/Agentic/coding/shared-memory-ui.json", 
        "/Users/q284340/Agentic/coding/shared-memory-resi.json"
    ]
    
    before_times = {}
    for file_path in files_to_check:
        if os.path.exists(file_path):
            before_times[file_path] = os.path.getmtime(file_path)
            print(f"📅 Before - {os.path.basename(file_path)}: {datetime.fromtimestamp(before_times[file_path])}")
    
    # Create NEW entities (with unique names) directly in the knowledge graph 
    print("\n📝 Creating NEW entities directly in knowledge graph...")
    
    timestamp = datetime.now().strftime("%H%M%S")
    test_entities = [
        Entity(
            name=f"FixedSyncTest_{timestamp}",
            entity_type="FixedSyncPattern",
            significance=8,
            observations=[
                f"Fixed sync test entity created at {datetime.now().isoformat()}",
                "Should only sync to coding project file"
            ],
            metadata={
                "test_type": "fixed_sync",
                "created_by": "test_script",
                "timestamp": timestamp
            }
        )
    ]
    
    # Add entities directly to knowledge graph storage
    for entity in test_entities:
        kg_agent.entities[entity.name] = entity
        print(f"  ➕ Added entity: {entity.name}")
    
    print(f"📊 Knowledge graph now has {len(kg_agent.entities)} entities")
    
    # Trigger sync
    print("\n🔄 Triggering synchronization...")
    sync_result = await sync_agent.sync_all_targets()
    
    print(f"📋 Sync result: {sync_result}")
    
    # Check modification times AFTER sync
    print("\n📅 Checking file modification times after sync...")
    
    after_times = {}
    for file_path in files_to_check:
        if os.path.exists(file_path):
            after_times[file_path] = os.path.getmtime(file_path)
            was_modified = after_times[file_path] > before_times.get(file_path, 0)
            status = "✅ MODIFIED" if was_modified else "➖ unchanged"
            print(f"  {status} - {os.path.basename(file_path)}: {datetime.fromtimestamp(after_times[file_path])}")
    
    # Expected: only shared-memory-coding.json should be modified
    coding_file = "/Users/q284340/Agentic/coding/shared-memory-coding.json"
    ui_file = "/Users/q284340/Agentic/coding/shared-memory-ui.json"
    resi_file = "/Users/q284340/Agentic/coding/shared-memory-resi.json"
    
    coding_modified = after_times.get(coding_file, 0) > before_times.get(coding_file, 0)
    ui_modified = after_times.get(ui_file, 0) > before_times.get(ui_file, 0)
    resi_modified = after_times.get(resi_file, 0) > before_times.get(resi_file, 0)
    
    print(f"\n📊 Sync Results Analysis:")
    print(f"  📁 coding file modified: {coding_modified}")
    print(f"  📁 ui file modified: {ui_modified}")
    print(f"  📁 resi file modified: {resi_modified}")
    
    if coding_modified and not ui_modified and not resi_modified:
        print("\n🎉 SUCCESS: Sync correctly targeted only the coding project!")
        
        # Verify the entity was added to coding file
        with open(coding_file, 'r') as f:
            data = json.load(f)
        
        entities_in_file = data.get('entities', [])
        test_entity_found = any(e.get('name', '').startswith('FixedSyncTest_') for e in entities_in_file)
        
        if test_entity_found:
            print("✅ Test entity found in coding file")
        else:
            print("❌ Test entity NOT found in coding file")
            
    elif not coding_modified and not ui_modified and not resi_modified:
        print("\n⚠️  No files were modified - sync may have skipped due to no changes")
    else:
        print("\n❌ FAIL: Sync affected incorrect files")
        print(f"   Expected: only coding modified")
        print(f"   Actual: coding={coding_modified}, ui={ui_modified}, resi={resi_modified}")
    
    return sync_result

if __name__ == "__main__":
    asyncio.run(test_sync_fixed())