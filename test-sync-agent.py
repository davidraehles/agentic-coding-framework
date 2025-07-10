#!/usr/bin/env python3
"""
Test script to verify SynchronizationAgent can be imported and instantiated
"""

import sys
import os
from pathlib import Path

# Add the semantic analysis path
sys.path.insert(0, str(Path("/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis")))

def test_sync_agent():
    print("🧪 Testing SynchronizationAgent Import and Instantiation")
    print("=" * 60)
    
    try:
        print("1. Testing import...")
        from agents.synchronization import SynchronizationAgent
        print("   ✅ SynchronizationAgent imported successfully")
        
        print("2. Testing class inspection...")
        print(f"   - Class: {SynchronizationAgent}")
        print(f"   - Methods: {[m for m in dir(SynchronizationAgent) if 'sync' in m.lower()]}")
        print(f"   - Has periodic_sync: {'periodic_sync' in dir(SynchronizationAgent)}")
        
        print("3. Testing instantiation...")
        config = {
            "sync_targets": {
                "mcp_memory": {"enabled": True},
                "shared_memory_files": {"enabled": True}
            },
            "sync_interval": 60
        }
        
        # Mock system object
        class MockSystem:
            def __init__(self):
                self.agents = {}
        
        system = MockSystem()
        agent = SynchronizationAgent(
            name="test_sync",
            config=config,
            system=system
        )
        print("   ✅ SynchronizationAgent instantiated successfully")
        
        print("4. Testing method availability...")
        print(f"   - periodic_sync method: {hasattr(agent, 'periodic_sync')}")
        print(f"   - sync_all_targets method: {hasattr(agent, 'sync_all_targets')}")
        print(f"   - Agent running: {agent.running}")
        
        print("5. Testing method signature...")
        import inspect
        if hasattr(agent, 'periodic_sync'):
            sig = inspect.signature(agent.periodic_sync)
            print(f"   - periodic_sync signature: {sig}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_sync_agent()
    print(f"\n🎯 Test Result: {'SUCCESS' if success else 'FAILED'}")