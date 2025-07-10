#!/usr/bin/env python3
"""
Comprehensive Semantic Analysis System Monitor
Tracks all agents, workflows, and system state step-by-step
"""

import asyncio
import json
import time
import subprocess
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class SemanticAnalysisMonitor:
    def __init__(self):
        self.coding_root = Path("/Users/q284340/Agentic/coding")
        self.mcp_server_path = self.coding_root / "integrations/mcp-server-semantic-analysis"
        self.shared_memory_file = self.coding_root / "shared-memory-coding.json"
        self.insights_dir = self.coding_root / "knowledge-management/insights"
        
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "system_status": {},
            "agent_status": {},
            "workflow_executions": [],
            "sync_operations": [],
            "failures": [],
            "step_by_step_log": []
        }
    
    def log_step(self, step: str, status: str, details: Dict[str, Any] = None):
        """Log each step with timestamp and details"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "step": step,
            "status": status,
            "details": details or {}
        }
        self.test_results["step_by_step_log"].append(entry)
        print(f"[{entry['timestamp']}] {step}: {status}")
        if details:
            print(f"  Details: {details}")
    
    async def check_mcp_server_health(self) -> Dict[str, Any]:
        """Check if MCP server is running and responsive"""
        self.log_step("Checking MCP Server Health", "starting")
        
        # Check if process is running
        try:
            result = subprocess.run(
                ["ps", "aux"], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            mcp_processes = [line for line in result.stdout.split('\n') 
                           if 'working_mcp_server.py' in line]
            
            status = {
                "process_running": len(mcp_processes) > 0,
                "process_count": len(mcp_processes),
                "processes": mcp_processes
            }
            
            if mcp_processes:
                self.log_step("MCP Server Process Check", "success", status)
            else:
                self.log_step("MCP Server Process Check", "failure", status)
                
            return status
            
        except Exception as e:
            error_status = {"error": str(e)}
            self.log_step("MCP Server Process Check", "error", error_status)
            return error_status
    
    async def check_shared_memory_state(self) -> Dict[str, Any]:
        """Check current state of shared memory file"""
        self.log_step("Checking Shared Memory State", "starting")
        
        try:
            if not self.shared_memory_file.exists():
                status = {"exists": False, "error": "File does not exist"}
                self.log_step("Shared Memory File Check", "failure", status)
                return status
            
            with open(self.shared_memory_file, 'r') as f:
                data = json.load(f)
            
            status = {
                "exists": True,
                "entity_count": len(data.get("entities", [])),
                "relation_count": len(data.get("relations", [])),
                "last_updated": data.get("metadata", {}).get("last_updated"),
                "sync_source": data.get("metadata", {}).get("sync_source"),
                "last_sync": data.get("metadata", {}).get("last_sync")
            }
            
            self.log_step("Shared Memory File Check", "success", status)
            return status
            
        except Exception as e:
            error_status = {"exists": True, "error": str(e)}
            self.log_step("Shared Memory File Check", "error", error_status)
            return error_status
    
    async def check_insights_directory(self) -> Dict[str, Any]:
        """Check for generated insight documents"""
        self.log_step("Checking Insights Directory", "starting")
        
        try:
            if not self.insights_dir.exists():
                status = {"exists": False, "insight_files": []}
                self.log_step("Insights Directory Check", "failure", status)
                return status
            
            insight_files = list(self.insights_dir.glob("*.md"))
            status = {
                "exists": True,
                "file_count": len(insight_files),
                "files": [f.name for f in insight_files],
                "recent_files": [f.name for f in sorted(insight_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]]
            }
            
            self.log_step("Insights Directory Check", "success", status)
            return status
            
        except Exception as e:
            error_status = {"exists": True, "error": str(e)}
            self.log_step("Insights Directory Check", "error", error_status)
            return error_status
    
    async def test_individual_mcp_tools(self) -> Dict[str, Any]:
        """Test each MCP tool individually"""
        self.log_step("Testing Individual MCP Tools", "starting")
        
        tools_status = {}
        
        # Test connection
        try:
            # This would be called via Claude MCP, simulating the test
            tools_status["test_connection"] = "Would test mcp__semantic-analysis__test_connection"
            self.log_step("MCP Test Connection", "simulated")
        except Exception as e:
            tools_status["test_connection"] = f"Error: {e}"
            self.log_step("MCP Test Connection", "error", {"error": str(e)})
        
        # Test pattern extraction
        try:
            tools_status["extract_patterns"] = "Would test mcp__semantic-analysis__extract_patterns"
            self.log_step("MCP Extract Patterns", "simulated")
        except Exception as e:
            tools_status["extract_patterns"] = f"Error: {e}"
            self.log_step("MCP Extract Patterns", "error", {"error": str(e)})
        
        return tools_status
    
    async def monitor_workflow_execution(self, workflow_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Monitor a complete workflow execution"""
        self.log_step(f"Starting Workflow Monitor: {workflow_name}", "starting", parameters)
        
        workflow_monitor = {
            "workflow_name": workflow_name,
            "parameters": parameters,
            "start_time": time.time(),
            "stages": [],
            "final_status": None
        }
        
        # Record pre-execution state
        pre_state = {
            "shared_memory": await self.check_shared_memory_state(),
            "insights_dir": await self.check_insights_directory()
        }
        workflow_monitor["pre_execution_state"] = pre_state
        
        self.log_step("Pre-execution State Captured", "success", {
            "entities": pre_state["shared_memory"].get("entity_count", 0),
            "insights": pre_state["insights_dir"].get("file_count", 0)
        })
        
        # This would trigger the actual workflow via Claude MCP
        self.log_step("Workflow Execution", "would_trigger_via_claude_mcp", {
            "tool": "mcp__semantic-analysis__execute_workflow",
            "workflow": workflow_name,
            "params": parameters
        })
        
        # Monitor for changes during execution
        for i in range(10):  # Monitor for 10 iterations
            await asyncio.sleep(2)  # Wait 2 seconds between checks
            
            current_state = {
                "shared_memory": await self.check_shared_memory_state(),
                "insights_dir": await self.check_insights_directory()
            }
            
            # Check for changes
            entities_changed = (current_state["shared_memory"].get("entity_count", 0) != 
                              pre_state["shared_memory"].get("entity_count", 0))
            insights_changed = (current_state["insights_dir"].get("file_count", 0) != 
                               pre_state["insights_dir"].get("file_count", 0))
            
            if entities_changed or insights_changed:
                self.log_step(f"Changes Detected (iteration {i+1})", "change_detected", {
                    "entities_changed": entities_changed,
                    "insights_changed": insights_changed,
                    "new_entity_count": current_state["shared_memory"].get("entity_count", 0),
                    "new_insight_count": current_state["insights_dir"].get("file_count", 0)
                })
                workflow_monitor["stages"].append({
                    "iteration": i+1,
                    "timestamp": time.time(),
                    "changes": current_state
                })
        
        # Record post-execution state
        post_state = {
            "shared_memory": await self.check_shared_memory_state(),
            "insights_dir": await self.check_insights_directory()
        }
        workflow_monitor["post_execution_state"] = post_state
        workflow_monitor["end_time"] = time.time()
        workflow_monitor["duration"] = workflow_monitor["end_time"] - workflow_monitor["start_time"]
        
        # Analyze results
        entities_added = (post_state["shared_memory"].get("entity_count", 0) - 
                         pre_state["shared_memory"].get("entity_count", 0))
        insights_added = (post_state["insights_dir"].get("file_count", 0) - 
                         pre_state["insights_dir"].get("file_count", 0))
        
        workflow_monitor["final_status"] = {
            "entities_added": entities_added,
            "insights_added": insights_added,
            "sync_occurred": post_state["shared_memory"].get("last_sync") != pre_state["shared_memory"].get("last_sync"),
            "success": entities_added > 0 or insights_added > 0
        }
        
        self.log_step(f"Workflow Monitor Complete: {workflow_name}", 
                     "success" if workflow_monitor["final_status"]["success"] else "failure",
                     workflow_monitor["final_status"])
        
        return workflow_monitor
    
    async def check_agent_logs(self) -> Dict[str, Any]:
        """Check for agent-specific logs and error messages"""
        self.log_step("Checking Agent Logs", "starting")
        
        log_locations = [
            "/tmp/mcp_wrapper_execution.log",
            self.mcp_server_path / "logs" / "semantic_analysis.log",
            "/tmp/semantic_analysis_debug.log"
        ]
        
        logs_status = {}
        
        for log_path in log_locations:
            try:
                if Path(log_path).exists():
                    with open(log_path, 'r') as f:
                        content = f.read()
                    
                    logs_status[str(log_path)] = {
                        "exists": True,
                        "size": len(content),
                        "lines": len(content.split('\n')),
                        "recent_lines": content.split('\n')[-10:],  # Last 10 lines
                        "errors": [line for line in content.split('\n') if 'error' in line.lower() or 'failed' in line.lower()]
                    }
                else:
                    logs_status[str(log_path)] = {"exists": False}
                    
            except Exception as e:
                logs_status[str(log_path)] = {"exists": True, "error": str(e)}
        
        self.log_step("Agent Logs Check", "success", {
            "logs_found": sum(1 for status in logs_status.values() if status.get("exists")),
            "total_errors": sum(len(status.get("errors", [])) for status in logs_status.values())
        })
        
        return logs_status
    
    async def run_comprehensive_test(self):
        """Run the complete monitoring test suite"""
        print("🔍 Starting Comprehensive Semantic Analysis System Test")
        print("=" * 60)
        
        # Phase 1: System Health Check
        print("\n📊 Phase 1: System Health Check")
        self.test_results["system_status"]["mcp_server"] = await self.check_mcp_server_health()
        self.test_results["system_status"]["shared_memory"] = await self.check_shared_memory_state()
        self.test_results["system_status"]["insights_dir"] = await self.check_insights_directory()
        self.test_results["system_status"]["agent_logs"] = await self.check_agent_logs()
        
        # Phase 2: Individual Tool Testing
        print("\n🔧 Phase 2: Individual MCP Tool Testing")
        self.test_results["agent_status"]["individual_tools"] = await self.test_individual_mcp_tools()
        
        # Phase 3: Workflow Monitoring
        print("\n🔄 Phase 3: Workflow Execution Monitoring")
        # Note: This would need to be triggered by Claude MCP in practice
        test_workflow = await self.monitor_workflow_execution(
            "complete_semantic_analysis",
            {"repository": str(self.mcp_server_path), "include_patterns": True}
        )
        self.test_results["workflow_executions"].append(test_workflow)
        
        # Phase 4: Results Analysis
        print("\n📋 Phase 4: Results Analysis")
        await self.analyze_results()
        
        # Save complete results
        results_file = self.coding_root / "semantic-analysis-test-results.json"
        with open(results_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n✅ Test completed. Results saved to: {results_file}")
        return self.test_results
    
    async def analyze_results(self):
        """Analyze test results and identify failure points"""
        self.log_step("Analyzing Test Results", "starting")
        
        # Identify key failure points
        failures = []
        
        # Check MCP server status
        if not self.test_results["system_status"]["mcp_server"].get("process_running"):
            failures.append({
                "type": "mcp_server_not_running",
                "severity": "critical",
                "description": "MCP server process not detected"
            })
        
        # Check shared memory sync
        shared_memory = self.test_results["system_status"]["shared_memory"]
        if shared_memory.get("sync_source") != "semantic_analysis_agent":
            failures.append({
                "type": "sync_agent_not_active",
                "severity": "high", 
                "description": f"Sync source is {shared_memory.get('sync_source')}, not semantic_analysis_agent"
            })
        
        # Check insights generation
        insights = self.test_results["system_status"]["insights_dir"]
        if insights.get("file_count", 0) == 0:
            failures.append({
                "type": "no_insights_generated",
                "severity": "high",
                "description": "No insight documents found in knowledge-management/insights/"
            })
        
        # Check for workflow execution
        workflow_executions = self.test_results["workflow_executions"]
        if not workflow_executions or not any(w.get("final_status", {}).get("success") for w in workflow_executions):
            failures.append({
                "type": "workflow_execution_failed",
                "severity": "critical",
                "description": "No successful workflow executions detected"
            })
        
        self.test_results["failures"] = failures
        
        # Generate recommendations
        recommendations = []
        for failure in failures:
            if failure["type"] == "mcp_server_not_running":
                recommendations.append("Start MCP server: cd integrations/mcp-server-semantic-analysis && ./run_mcp_server.sh")
            elif failure["type"] == "sync_agent_not_active":
                recommendations.append("Check sync agent configuration and ensure it's properly initialized")
            elif failure["type"] == "no_insights_generated":
                recommendations.append("Verify insight generation agent is working and has write permissions")
            elif failure["type"] == "workflow_execution_failed":
                recommendations.append("Check coordinator agent initialization and workflow definitions")
        
        self.test_results["recommendations"] = recommendations
        
        self.log_step("Results Analysis Complete", "success", {
            "failures_found": len(failures),
            "recommendations": len(recommendations)
        })

if __name__ == "__main__":
    monitor = SemanticAnalysisMonitor()
    asyncio.run(monitor.run_comprehensive_test())