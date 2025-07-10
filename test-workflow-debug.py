#!/usr/bin/env python3
"""
Direct workflow execution test to debug why workflows don't produce logs
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the mcp server path to sys.path
mcp_server_path = Path("/Users/q284340/Agentic/coding/integrations/mcp-server-semantic-analysis")
sys.path.insert(0, str(mcp_server_path))

async def test_workflow_execution():
    """Test workflow execution directly."""
    print("🚀 Starting direct workflow execution test...")
    
    try:
        # Import the agent manager
        from working_mcp_server import AgentManager
        
        # Initialize the agent manager
        print("📡 Initializing agent manager...")
        agent_manager = AgentManager()
        await agent_manager.initialize()
        
        print(f"✅ Agent manager initialized. Available agents: {list(agent_manager.agents.keys())}")
        
        # Check if coordinator is available
        coordinator = agent_manager.agents.get('coordinator')
        if coordinator:
            print(f"📊 Coordinator available. Active workflows: {len(coordinator.active_workflows)}")
            
            # Get workflow definitions
            try:
                from config.agent_config import AgentConfig
                config = AgentConfig()
                workflow_definitions = config.get_workflow_definitions()
                print(f"🎯 Available workflows: {list(workflow_definitions.keys())}")
                
                # Execute workflow through coordinator directly
                print("🚀 Executing complete_semantic_analysis workflow through coordinator...")
                workflow_def = workflow_definitions["complete_semantic_analysis"]
                
                result = await coordinator.execute_workflow(
                    workflow_name="complete_semantic_analysis",
                    workflow_def=workflow_def,
                    parameters={"path": "/Users/q284340/Agentic/coding", "description": "Direct coordinator test"}
                )
                
                print(f"📊 Workflow result: {result}")
                
                # Monitor for 30 seconds
                for i in range(6):
                    await asyncio.sleep(5)
                    print(f"🔄 Active workflows after {(i+1)*5}s: {len(coordinator.active_workflows)}")
                    for workflow_id, execution in coordinator.active_workflows.items():
                        print(f"   - {workflow_id}: status={execution.status.value}, step={execution.current_step_index}/{len(execution.steps)}")
                        if execution.steps and execution.current_step_index < len(execution.steps):
                            current_step = execution.steps[execution.current_step_index]
                            print(f"     Current step: {current_step.agent} - {current_step.action}")
                
                return result
                
            except Exception as config_error:
                print(f"❌ Configuration error: {config_error}")
                import traceback
                traceback.print_exc()
                
        else:
            print("❌ Coordinator not available in agent manager")
            print(f"Available agents: {list(agent_manager.agents.keys())}")
        
        return None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = asyncio.run(test_workflow_execution())
    print(f"🎯 Final result: {result}")