#!/usr/bin/env python3

import sys
import os
import asyncio
import json
from datetime import datetime

# Add the project path
sys.path.insert(0, '/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis')

from lib.agents.synchronization_agent import SynchronizationAgent

async def test_sync_directly():
    """Test sync agent directly to verify it can persist entities"""
    print("🔄 Testing sync agent directly...")
    
    # Initialize sync agent
    sync_agent = SynchronizationAgent("test_sync")
    
    # Check current shared memory content
    shared_memory_path = "/Users/q284340/Agentic/coding/shared-memory-coding.json"
    
    print(f"📁 Checking {shared_memory_path}")
    
    if os.path.exists(shared_memory_path):
        with open(shared_memory_path, 'r') as f:
            current_data = json.load(f)
        print(f"📊 Current entities: {len(current_data.get('entities', {}))}")
        
        # Show last few entities
        entities = current_data.get('entities', {})
        if entities:
            print("🔍 Recent entities:")
            for name, entity in list(entities.items())[-3:]:
                print(f"  - {name}: {entity.get('entityType', 'unknown')}")
    else:
        print("❌ Shared memory file doesn't exist")
        return
    
    # Create a test entity to sync
    test_entity = {
        "name": "SyncTestEntity",
        "entityType": "TestPattern",
        "observations": [
            f"Test sync at {datetime.now().isoformat()}"
        ],
        "significance": 5,
        "metadata": {
            "test": True,
            "timestamp": datetime.now().isoformat()
        }
    }
    
    # Add to sync agent's entities
    sync_agent.entities["SyncTestEntity"] = test_entity
    print(f"➕ Added test entity: {test_entity['name']}")
    
    # Trigger sync
    print("🔄 Triggering sync...")
    await sync_agent.periodic_sync()
    
    # Check if entity was synced
    print("📋 Checking sync results...")
    if os.path.exists(shared_memory_path):
        with open(shared_memory_path, 'r') as f:
            updated_data = json.load(f)
        
        if "SyncTestEntity" in updated_data.get('entities', {}):
            print("✅ SUCCESS: Test entity found in shared memory!")
            print(f"📊 Total entities now: {len(updated_data.get('entities', {}))}")
        else:
            print("❌ FAIL: Test entity not found in shared memory")
            print(f"📊 Entities in file: {list(updated_data.get('entities', {}).keys())}")
    
    return sync_agent

if __name__ == "__main__":
    asyncio.run(test_sync_directly())