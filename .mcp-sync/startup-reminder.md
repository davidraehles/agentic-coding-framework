# 🚨 CLAUDE CODE STARTUP CHECKLIST 🚨

## MANDATORY FIRST STEPS:

1. **Query MCP Memory for patterns:**
   ```
   mcp__memory__search_nodes("ConditionalLoggingPattern")
   mcp__memory__search_nodes("ReduxStateManagementPattern") 
   mcp__memory__search_nodes("ClaudeCodeStartupPattern")
   ```

2. **Apply patterns immediately:**
   - ❌ NEVER use console.log 
   - ✅ ALWAYS use Logger class
   - ❌ NEVER use local React state
   - ✅ ALWAYS use Redux patterns

3. **Knowledge Management Rules:**
   - ❌ NEVER edit shared-memory.json directly
   - ✅ ALWAYS use: ukb --interactive or ukb --auto
   - ✅ Use vkb to visualize knowledge graph
   - ✅ ukb is in PATH and works from anywhere

4. **Verify logging is working:**
   - Check if today's session is being logged
   - Ensure appropriate .specstory/history location

## ⚠️ FAILURE TO FOLLOW = ARCHITECTURAL MISTAKES ⚠️

