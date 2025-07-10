#!/usr/bin/env python3
"""
Test complete workflow execution with all agents
"""

import asyncio
import json
import time
from pathlib import Path
import sys

# Add the semantic analysis path
sys.path.insert(0, str(Path("/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis")))

async def test_complete_workflow():
    """Test complete workflow execution"""
    
    print("🚀 Testing Complete Workflow Execution")
    print("=" * 60)
    
    try:
        print("1. Importing and initializing system...")
        from semantic_analysis.core import get_system, initialize_system
        
        system = await initialize_system()
        
        print(f"✅ System initialized")
        print(f"   - Agents: {len(system.agents)}")
        print(f"   - Workflows: {len(system.workflows)}")
        
        # Get initial state
        shared_memory_file = Path("/Users/q284340/Agentic/coding/shared-memory-coding.json")
        initial_entities = 0
        initial_sync_time = None
        
        if shared_memory_file.exists():
            with open(shared_memory_file, 'r') as f:
                data = json.load(f)
                initial_entities = len(data.get("entities", []))
                initial_sync_time = data.get("metadata", {}).get("last_sync")
        
        print(f"\n2. Initial state:")
        print(f"   - Entities in shared memory: {initial_entities}")
        print(f"   - Last sync: {initial_sync_time}")
        
        print(f"\n3. Testing synchronization agent...")
        sync_agent = system.agents.get("synchronization")
        if sync_agent and hasattr(sync_agent, 'periodic_sync'):
            sync_result = await sync_agent.periodic_sync()
            print(f"   - Sync result: {sync_result.get('success', False)}")
        
        print(f"\n4. Executing complete_semantic_analysis workflow...")
        workflow_params = {
            "repository": "/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis",
            "include_patterns": True,
            "generate_insights": True
        }
        
        start_time = time.time()
        workflow_result = await system.execute_workflow("complete_semantic_analysis", workflow_params)
        end_time = time.time()
        
        print(f"   - Workflow completed in {end_time - start_time:.2f}s")
        print(f"   - Success: {workflow_result.get('success', False)}")
        
        if not workflow_result.get('success', False):
            print(f"   - Error: {workflow_result.get('error', 'Unknown error')}")
        else:
            print(f"   - Result keys: {list(workflow_result.keys())}")
        
        print(f"\n5. Checking final state...")
        
        # Check sync after workflow
        if sync_agent and hasattr(sync_agent, 'periodic_sync'):
            final_sync_result = await sync_agent.periodic_sync()
            print(f"   - Final sync result: {final_sync_result.get('success', False)}")
        
        # Check shared memory changes
        final_entities = 0
        final_sync_time = None
        
        if shared_memory_file.exists():
            with open(shared_memory_file, 'r') as f:
                data = json.load(f)
                final_entities = len(data.get("entities", []))
                final_sync_time = data.get("metadata", {}).get("last_sync")
        
        print(f"   - Final entities: {final_entities}")
        print(f"   - Final sync time: {final_sync_time}")
        print(f"   - Entities added: {final_entities - initial_entities}")
        print(f"   - Sync time changed: {final_sync_time != initial_sync_time}")
        
        # Check insight files
        insights_dir = Path("/Users/q284340/Agentic/coding/knowledge-management/insights")
        if insights_dir.exists():
            recent_files = sorted(insights_dir.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:3]
            print(f"   - Recent insight files:")
            for file in recent_files:
                mtime = time.ctime(file.stat().st_mtime)
                print(f"     • {file.name} ({mtime})")
        
        print(f"\n6. System status:")
        status = system.get_system_status()
        print(f"   - System running: {status['system_running']}")
        for agent_name, agent_status in status['agents'].items():
            health = "✅" if agent_status['health'] == 'healthy' else "❌"
            running = "🟢" if agent_status['running'] else "🔴"
            print(f"   - {agent_name}: {health} {running}")
        
        await system.shutdown()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_complete_workflow())
    print(f"\n🎯 Workflow Test Result: {'SUCCESS' if success else 'FAILED'}")