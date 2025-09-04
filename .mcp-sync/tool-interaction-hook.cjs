// Tool Interaction Hook for Live Logging
// This file is called by the constraint monitor or statusLine to capture tool interactions

const { existsSync, appendFileSync } = require('fs');
const path = require('path');

function captureToolInteraction(toolCall, result, context = {}) {
  const interaction = {
    timestamp: new Date().toISOString(),
    sessionId: `live-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    toolCall: toolCall,
    result: result,
    context: context
  };
  
  const bufferPath = path.join(process.cwd(), '.mcp-sync/tool-interaction-buffer.jsonl');
  
  try {
    appendFileSync(bufferPath, JSON.stringify(interaction) + '\n');
  } catch (error) {
    console.error('Hook capture error:', error);
  }
}

// Fallback execution for basic testing
if (require.main === module) {
  captureToolInteraction(
    { tool: 'test', parameters: { test: 'value' } },
    { success: true },
    { source: 'manual' }
  );
  console.log('Test tool interaction captured');
}

module.exports = { captureToolInteraction };