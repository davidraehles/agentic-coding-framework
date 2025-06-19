# Coding Agent Startup Checklist

## Critical Rules (Apply Immediately)

1. **🚨 LOGGING**: NEVER `console.log` - ALWAYS `Logger.log(level, category, message)`
2. **🚨 STATE**: NEVER `useState` for complex state - ALWAYS Redux slices  
3. **🚨 KNOWLEDGE**: NEVER edit `shared-memory.json` - ALWAYS use `bin/ukb` command
4. **🚨 PATTERNS**: Query existing patterns before implementing: `bin/ukb --list-entities | grep Pattern`
5. **🚨 STARTUP**: Use `claude-mcp` (not `claude code`) for MCP memory access
6. **🚨 TOOLS**: All commands are in `coding/bin/` - use `bin/ukb` and `bin/vkb`

## Session Initialization

7. **Check MCP Memory**: Verify knowledge base sync at session start
8. **Query Critical Patterns**: ConditionalLogging, Redux, KnowledgePersistence, ViewportCulling
9. **Start Visualization**: `bin/vkb` for pattern exploration at localhost:8080
10. **Verify Compliance**: Run pattern checks before implementing new features

## Development Rules

11. **React Projects**: Use Redux Toolkit with typed hooks, feature-based slices (basic) or MVI architecture (20+ components)
12. **3D Graphics**: Apply viewport culling for 200+ objects (basic) or 800+ objects with anti-jump (advanced)
13. **Performance**: Implement viewport culling when rendering 200+ elements, use React Three Fiber for 3D
14. **Logging Categories**: auth, api, component, validation, performance, error
15. **Knowledge Capture**: Run `bin/ukb` after significant changes or insights

## Quality Assurance

16. **Pre-commit**: Run linting/typechecking, verify no `console.log` usage, check Redux compliance

*This checklist ensures consistent application of proven patterns across all coding sessions.*