# Semantic Analysis System Architecture

This document provides a detailed technical overview of the current semantic analysis system architecture based on the Node.js MCP server implementation.

## System Overview

![MCP Server Architecture](../../../integrations/mcp-server-semantic-analysis/docs/images/mcp-server-architecture.png)

The semantic analysis system implements a **Node.js-based MCP server architecture** with **direct function calls** and **LLM provider integration** to provide scalable, intelligent knowledge management capabilities.

## Architectural Principles

### 1. MCP Protocol Integration

- **Standards-compliant MCP server** for Claude Code integration
- **Tool-based interface** with 12 specialized tools
- **Direct function calls** for high performance
- **Seamless Claude integration** through stdio transport

### 2. Multi-Agent Coordination

- **8-Agent workflow system** for comprehensive analysis
- **Coordinator-driven orchestration** with quality assurance
- **Parallel processing** for independent operations
- **Intelligent fallback chains** for provider failures

### 3. Knowledge Integration

- **UKB/VKB compatibility** with existing knowledge base
- **Cross-session persistence** through MCP Memory
- **Multi-provider LLM support** (Anthropic, OpenAI, Custom)
- **PlantUML diagram generation** for visualization

## Current Architecture

### Core Components

#### MCP Protocol Layer
- **MCP Server Implementation**: Node.js/TypeScript MCP server
- **Tool Registry**: Registration and dispatch of 12 available tools
- **Request Processing**: JSON-RPC 2.0 protocol handling
- **Response Formatting**: Standardized MCP response format

#### Tool Layer (12 Tools)
1. **Connection Tools**: `heartbeat`, `test_connection`
2. **Analysis Tools**: `determine_insights`, `analyze_code`, `analyze_repository`, `extract_patterns`
3. **Knowledge Tools**: `create_ukb_entity_with_insight`, `execute_workflow`
4. **Documentation Tools**: `generate_documentation`, `create_insight_report`, `generate_plantuml_diagrams`, `generate_lessons_learned`

#### Agent Layer (11 Agents)
**8-Agent Core Workflow**:
1. **GitHistoryAgent** - Git commit analysis
2. **VibeHistoryAgent** - Conversation context processing
3. **SemanticAnalysisAgent** - Deep code analysis
4. **WebSearchAgent** - External research
5. **InsightGenerationAgent** - Insight and diagram creation
6. **ObservationGenerationAgent** - Structured observations
7. **QualityAssuranceAgent** - Output validation
8. **PersistenceAgent** - Knowledge base updates

**Supporting Agents**:
9. **CoordinatorAgent** - Workflow orchestration
10. **SynchronizationAgent** - Multi-source data sync
11. **DeduplicationAgent** - Semantic duplicate detection

### Communication Patterns

#### Direct Function Calls
- **High-performance communication** between tools and agents
- **No network overhead** for internal operations
- **Synchronous processing** with async where beneficial
- **Error propagation** through standard JavaScript mechanisms

#### External Integrations
- **MCP Protocol**: Claude Code integration via stdio
- **LLM APIs**: HTTP REST calls to Anthropic, OpenAI
- **Web Search**: HTTP requests to search providers
- **File System**: Direct file I/O for knowledge bases

### Data Flow

```
Claude Code → MCP Protocol → Tool Registry → Coordinator Agent → Specialized Agents → External Services → Response
```

#### Workflow Execution
1. **Tool Invocation**: MCP client calls tool
2. **Request Validation**: Input sanitization and validation
3. **Workflow Orchestration**: Coordinator assigns tasks to agents
4. **Agent Processing**: Specialized agents execute tasks
5. **Quality Assurance**: Output validation and correction
6. **Response Compilation**: Results formatted for MCP response
7. **Knowledge Persistence**: Updates stored to knowledge base

## Integration Architecture

### Claude Code Integration
- **MCP Server**: Runs as subprocess under Claude Code
- **Stdio Transport**: Bidirectional communication channel
- **Tool Discovery**: Automatic registration of available tools
- **Session Persistence**: Maintains state across interactions

### Knowledge Base Integration
- **UKB Compatibility**: Creates entities compatible with ukb system
- **VKB Visualization**: Supports knowledge graph visualization
- **Cross-Session Sync**: Persistent storage across sessions
- **Multi-Format Support**: JSON, Markdown, PlantUML output

### LLM Provider Architecture
```
Request → Primary Provider (Custom/Anthropic) → Fallback (OpenAI) → Error Handler
```

#### Provider Features
- **Smart Fallback**: Automatic provider switching on failures
- **Rate Limiting**: Built-in request throttling
- **Response Quality**: Validation and retry logic
- **Usage Tracking**: Metrics and cost monitoring

## Performance Characteristics

### Node.js Advantages
- **Fast Startup**: Immediate availability
- **Stable Connections**: No 60-second timeout issues
- **Efficient Memory**: Lower footprint than Python
- **Native JSON**: Built-in serialization support
- **Concurrent Processing**: Event loop efficiency

### Scalability Features
- **Parallel Agent Execution**: Concurrent processing where possible
- **Request Batching**: Grouping of similar LLM requests
- **Intelligent Caching**: Context-aware result caching
- **Resource Management**: Memory and connection pooling

## Monitoring & Observability

### Logging Architecture
- **Structured JSON Logs**: Machine-readable log format
- **Correlation IDs**: Request tracking across components
- **Performance Metrics**: Timing and resource usage
- **Error Tracking**: Comprehensive error logging

### Health Monitoring
- **Connection Health**: MCP protocol validation
- **Provider Status**: LLM service availability
- **Agent Performance**: Workflow execution metrics
- **Resource Usage**: Memory and CPU monitoring

## Migration from Legacy Architecture

### Previous System (Deprecated)
- Python-based semantic analysis system
- MQTT event bus communication
- JSON-RPC API endpoints
- Complex multi-process architecture

### Current Benefits
- **Simplified Architecture**: Single Node.js process
- **Better Integration**: Native MCP protocol support
- **Improved Reliability**: Fewer failure points
- **Enhanced Performance**: Direct function calls
- **Easier Maintenance**: Unified codebase

## Security Considerations

### API Key Management
- **Environment-based Configuration**: Secure key storage
- **Provider Isolation**: Separate credentials per provider
- **Rotation Support**: Easy key updates
- **Audit Logging**: Access tracking

### Data Protection
- **Input Sanitization**: Request validation
- **Output Filtering**: Sensitive data removal
- **Access Control**: Tool-level permissions
- **Session Security**: Secure state management

## Future Architecture

### Planned Enhancements
- **Distributed Processing**: Multi-instance deployment
- **Advanced Caching**: Redis integration
- **Stream Processing**: Real-time updates
- **Enhanced Monitoring**: Prometheus metrics

### Extensibility
- **Plugin Architecture**: Custom agent development
- **API Extensions**: Additional tool creation
- **Provider Integration**: New LLM service support
- **Knowledge Sources**: Additional data integrations

---

**Related Documentation**:
- [MCP Server Implementation](../../../integrations/mcp-server-semantic-analysis/README.md)
- [API Reference](../../../integrations/mcp-server-semantic-analysis/docs/api/README.md)
- [Installation Guide](../../../integrations/mcp-server-semantic-analysis/docs/installation/README.md)