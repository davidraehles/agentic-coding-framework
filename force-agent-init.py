#!/usr/bin/env python3
"""
Force agent initialization by directly calling the core system
"""

import asyncio
import sys
from pathlib import Path

# Add the semantic analysis path
sys.path.insert(0, str(Path("/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis")))

async def force_initialize_agents():
    """Force initialization of all agents"""
    
    print("🚀 Forcing Agent Initialization")
    print("=" * 50)
    
    try:
        print("1. Importing core system...")
        from semantic_analysis.core import get_system, initialize_system
        
        print("2. Getting system instance...")
        system = get_system()
        
        print(f"   - System running: {system.running}")
        print(f"   - Agents count: {len(system.agents)}")
        print(f"   - Agent names: {list(system.agents.keys())}")
        
        if not system.running:
            print("3. Initializing system...")
            await initialize_system()
            
            print(f"   - System running: {system.running}")
            print(f"   - Agents count: {len(system.agents)}")
            print(f"   - Agent names: {list(system.agents.keys())}")
            
            print("4. Checking agent capabilities...")
            for agent_name, agent in system.agents.items():
                print(f"   - {agent_name}: {agent.capabilities}")
                print(f"     Running: {agent.running}")
                print(f"     Has periodic_sync: {hasattr(agent, 'periodic_sync')}")
        else:
            print("3. System already running")
        
        print("5. Getting system status...")
        status = system.get_system_status()
        print(f"   - System running: {status['system_running']}")
        print(f"   - Agent count: {len(status['agents'])}")
        print(f"   - Available workflows: {len(status['workflows'])}")
        
        print("6. Testing synchronization agent...")
        sync_agent = system.agents.get("synchronization")
        if sync_agent:
            print(f"   - Sync agent found: {type(sync_agent)}")
            print(f"   - Has periodic_sync: {hasattr(sync_agent, 'periodic_sync')}")
            if hasattr(sync_agent, 'periodic_sync'):
                print("   - Testing periodic_sync...")
                result = await sync_agent.periodic_sync()
                print(f"   - Sync result: {result.get('success', False)}")
        else:
            print("   - No sync agent found!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(force_initialize_agents())
    print(f"\n🎯 Initialization Result: {'SUCCESS' if success else 'FAILED'}")