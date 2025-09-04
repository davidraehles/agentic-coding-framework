#!/usr/bin/env node

const testContent = `### Grep - 2025-09-04T14:29:21.146Z (2025-09-04 16:29:21 Europe/Berlin)

**User Request:** No context

**Tool:** Grep  `;

const pattern = /(### .+ - \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \([^)]+\)\n\n\*\*User Request:\*\* )([^\n]+)(\n\n\*\*Tool:\*\* )/g;

console.log('Testing regex pattern...');
console.log('Test content:', JSON.stringify(testContent));
console.log('Pattern:', pattern);

const match = pattern.exec(testContent);
console.log('Match result:', match);

if (match) {
  console.log('✅ Pattern matches!');
  console.log('- Full match:', JSON.stringify(match[0]));
  console.log('- Prefix:', JSON.stringify(match[1]));
  console.log('- User request:', JSON.stringify(match[2]));
  console.log('- Suffix:', JSON.stringify(match[3]));
} else {
  console.log('❌ Pattern does not match');
  
  // Try alternative patterns
  const altPattern1 = /### .+ - [\d\-T:\.]+ \([^)]+\)/g;
  console.log('Alt pattern 1 (header only):', altPattern1.test(testContent));
  
  const altPattern2 = /\*\*User Request:\*\* [^\n]+/g;
  console.log('Alt pattern 2 (user request only):', altPattern2.test(testContent));
  
  const altPattern3 = /\*\*Tool:\*\* /g;
  console.log('Alt pattern 3 (tool only):', altPattern3.test(testContent));
}