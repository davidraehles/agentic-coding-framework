#!/usr/bin/env python3
"""
Direct test of the semantic analysis workflow execution with monitoring
"""

import asyncio
import time
import json
from pathlib import Path

async def test_real_workflow():
    """Test the actual workflow execution and monitor results"""
    
    print("🧪 Starting Real Workflow Execution Test")
    print("=" * 50)
    
    # Step 1: Trigger actual workflow via MCP
    print("\n1. Triggering complete_semantic_analysis workflow...")
    
    # Note: This would use Claude MCP in practice
    # mcp__semantic-analysis__execute_workflow
    workflow_params = {
        "workflow_name": "complete_semantic_analysis",
        "parameters": {
            "repository": "/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis",
            "include_patterns": True,
            "generate_insights": True
        }
    }
    
    print(f"Workflow params: {workflow_params}")
    
    # Step 2: Monitor for changes
    print("\n2. Monitoring for changes...")
    
    shared_memory_file = Path("/Users/q284340/Agentic/coding/shared-memory-coding.json")
    insights_dir = Path("/Users/q284340/Agentic/coding/knowledge-management/insights")
    
    # Get initial state
    initial_entities = 0
    initial_insights = 0
    initial_sync_time = None
    
    if shared_memory_file.exists():
        with open(shared_memory_file, 'r') as f:
            data = json.load(f)
            initial_entities = len(data.get("entities", []))
            initial_sync_time = data.get("metadata", {}).get("last_sync")
    
    if insights_dir.exists():
        initial_insights = len(list(insights_dir.glob("*.md")))
    
    print(f"Initial state:")
    print(f"  - Entities: {initial_entities}")
    print(f"  - Insights: {initial_insights}")
    print(f"  - Last sync: {initial_sync_time}")
    
    # Step 3: Monitor for 30 seconds
    print("\n3. Monitoring for 30 seconds...")
    
    for i in range(30):
        await asyncio.sleep(1)
        
        # Check for changes
        current_entities = 0
        current_insights = 0
        current_sync_time = None
        
        if shared_memory_file.exists():
            with open(shared_memory_file, 'r') as f:
                data = json.load(f)
                current_entities = len(data.get("entities", []))
                current_sync_time = data.get("metadata", {}).get("last_sync")
        
        if insights_dir.exists():
            current_insights = len(list(insights_dir.glob("*.md")))
        
        # Check for changes
        entities_changed = current_entities != initial_entities
        insights_changed = current_insights != initial_insights
        sync_changed = current_sync_time != initial_sync_time
        
        if entities_changed or insights_changed or sync_changed:
            print(f"\n🔄 CHANGE DETECTED at {i+1}s:")
            print(f"  - Entities: {initial_entities} → {current_entities}")
            print(f"  - Insights: {initial_insights} → {current_insights}")
            print(f"  - Sync time: {initial_sync_time} → {current_sync_time}")
            
            # Update baselines
            initial_entities = current_entities
            initial_insights = current_insights
            initial_sync_time = current_sync_time
        else:
            print(f"⏱️  No changes at {i+1}s", end="\r")
    
    print(f"\n\n4. Final Results:")
    print(f"  - Total entities: {current_entities}")
    print(f"  - Total insights: {current_insights}")
    print(f"  - Latest sync: {current_sync_time}")
    
    # Step 4: Check recent insight files
    if insights_dir.exists():
        recent_files = sorted(insights_dir.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:5]
        print(f"\n5. Recent insight files:")
        for file in recent_files:
            mtime = time.ctime(file.stat().st_mtime)
            print(f"  - {file.name} (modified: {mtime})")
    
    print("\n✅ Test completed")

if __name__ == "__main__":
    asyncio.run(test_real_workflow())