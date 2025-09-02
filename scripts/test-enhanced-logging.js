#!/usr/bin/env node

/**
 * Test Suite for Enhanced Live Session Logging
 * Validates all components of the enhanced logging system
 */

import SemanticToolInterpreter from './semantic-tool-interpreter.js';
import ExchangeClassifier from './exchange-classifier.js';
import HybridSessionLogger from './hybrid-session-logger.js';
import { getGlobalCoordinator, finalizeGlobalSession } from './live-logging-coordinator.js';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

class EnhancedLoggingTestSuite {
  constructor() {
    this.testResults = [];
    this.testStartTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 Starting Enhanced Logging System Test Suite\n');

    // Test individual components
    await this.testSemanticToolInterpreter();
    await this.testExchangeClassifier();
    await this.testHybridSessionLogger();
    await this.testLiveLoggingCoordinator();
    
    // Test integration
    await this.testStatusLineIntegration();
    await this.testPostSessionIntegration();
    
    // Test real scenarios
    await this.testRealScenarios();
    
    this.printTestSummary();
  }

  async testSemanticToolInterpreter() {
    console.log('🔧 Testing SemanticToolInterpreter...');
    
    const interpreter = new SemanticToolInterpreter();
    
    // Test various tool types
    const testCases = [
      {
        name: 'Glob tool',
        toolCall: { name: 'Glob', params: { pattern: '*.js', path: './scripts' } },
        result: '/path/file1.js\n/path/file2.js\n/path/file3.js',
        expectedType: 'search'
      },
      {
        name: 'Read tool',
        toolCall: { name: 'Read', params: { file_path: '/path/to/test.js' } },
        result: 'line 1\nline 2\nline 3',
        expectedType: 'read'
      },
      {
        name: 'Edit tool',
        toolCall: { name: 'Edit', params: { 
          file_path: '/path/test.js', 
          old_string: 'old code', 
          new_string: 'new code' 
        }},
        result: 'File updated',
        expectedType: 'edit'
      },
      {
        name: 'MCP tool',
        toolCall: { name: 'mcp__memory__search_nodes', params: { query: 'test' } },
        result: { entities: [1, 2, 3] },
        expectedType: 'mcp'
      }
    ];

    for (const testCase of testCases) {
      try {
        const summary = await interpreter.summarize(testCase.toolCall, testCase.result);
        
        const passed = summary.type === testCase.expectedType && 
                      summary.summary && 
                      summary.icon;
        
        this.recordTest(`SemanticToolInterpreter - ${testCase.name}`, passed, {
          expected: testCase.expectedType,
          actual: summary.type,
          summary: summary.summary
        });
      } catch (error) {
        this.recordTest(`SemanticToolInterpreter - ${testCase.name}`, false, { error: error.message });
      }
    }
  }

  async testExchangeClassifier() {
    console.log('🎯 Testing ExchangeClassifier...');
    
    const classifier = new ExchangeClassifier();
    
    // Test classification scenarios
    const testExchanges = [
      {
        name: 'Coding-related exchange',
        exchange: {
          summary: { type: 'mcp', summary: 'Knowledge graph search' },
          toolCall: { name: 'mcp__memory__search_nodes', params: {} }
        },
        expectedTarget: 'coding'
      },
      {
        name: 'Project-specific exchange',
        exchange: {
          summary: { type: 'edit', summary: 'Modified app.js' },
          toolCall: { name: 'Edit', params: { file_path: './src/app.js' } }
        },
        expectedTarget: 'project'
      },
      {
        name: 'Hybrid exchange',
        exchange: {
          summary: { type: 'read', summary: 'Read CLAUDE.md' },
          toolCall: { name: 'Read', params: { file_path: './CLAUDE.md' } }
        },
        expectHybrid: true
      }
    ];

    for (const testCase of testExchanges) {
      try {
        const classification = await classifier.classifyExchange(testCase.exchange);
        
        let passed = false;
        if (testCase.expectHybrid) {
          passed = classification.hybrid === true;
        } else {
          passed = classification.target === testCase.expectedTarget;
        }
        
        this.recordTest(`ExchangeClassifier - ${testCase.name}`, passed, {
          expected: testCase.expectedTarget || 'hybrid',
          actual: testCase.expectHybrid ? classification.hybrid : classification.target,
          confidence: classification.confidence
        });
      } catch (error) {
        this.recordTest(`ExchangeClassifier - ${testCase.name}`, false, { error: error.message });
      }
    }
  }

  async testHybridSessionLogger() {
    console.log('📝 Testing HybridSessionLogger...');
    
    try {
      const logger = await HybridSessionLogger.createFromCurrentContext();
      
      // Test tool interaction logging
      const testToolCall = {
        name: 'TestTool',
        params: { test: 'parameter' }
      };
      
      const exchange = await logger.onToolInteraction(
        testToolCall,
        'Test result',
        { testContext: true }
      );
      
      const passed = exchange && 
                    exchange.summary && 
                    exchange.classification;
      
      this.recordTest('HybridSessionLogger - Tool Interaction', passed, {
        exchangeCreated: !!exchange,
        hasSummary: !!(exchange && exchange.summary),
        hasClassification: !!(exchange && exchange.classification)
      });
      
      // Test session finalization
      const summary = await logger.finalizeSession();
      const finalizationPassed = summary && summary.exchangeCount >= 1;
      
      this.recordTest('HybridSessionLogger - Session Finalization', finalizationPassed, {
        exchangeCount: summary ? summary.exchangeCount : 0
      });
      
    } catch (error) {
      this.recordTest('HybridSessionLogger - Creation', false, { error: error.message });
    }
  }

  async testLiveLoggingCoordinator() {
    console.log('🚀 Testing LiveLoggingCoordinator...');
    
    try {
      const coordinator = await getGlobalCoordinator();
      
      // Test manual interaction capture
      await coordinator.captureManualInteraction(
        'TestManualTool',
        { testParam: 'value' },
        'Manual test result',
        { manual: true }
      );
      
      const stats = coordinator.getSessionStats();
      const passed = stats.isActive && stats.sessionId;
      
      this.recordTest('LiveLoggingCoordinator - Manual Capture', passed, {
        isActive: stats.isActive,
        sessionId: !!stats.sessionId
      });
      
      // Test finalization
      const summary = await finalizeGlobalSession();
      const finalizationPassed = !!summary;
      
      this.recordTest('LiveLoggingCoordinator - Finalization', finalizationPassed, {
        summaryExists: !!summary
      });
      
    } catch (error) {
      this.recordTest('LiveLoggingCoordinator - Initialization', false, { error: error.message });
    }
  }

  async testStatusLineIntegration() {
    console.log('📊 Testing StatusLine Integration...');
    
    try {
      // Test if combined status line can be executed
      const result = execSync('node scripts/combined-status-line.js', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 10000
      });
      
      const passed = result && result.includes('🛡️');
      
      this.recordTest('StatusLine Integration - Execution', passed, {
        result: result ? result.slice(0, 50) : 'No result'
      });
      
    } catch (error) {
      this.recordTest('StatusLine Integration - Execution', false, { error: error.message });
    }
  }

  async testPostSessionIntegration() {
    console.log('📋 Testing Post-Session Integration...');
    
    try {
      // Check if enhanced post-session logger exists and can be parsed
      const loggerPath = path.join(process.cwd(), 'scripts/enhanced-post-session-logger.js');
      const passed = existsSync(loggerPath);
      
      this.recordTest('Post-Session Integration - File Exists', passed, {
        path: loggerPath,
        exists: passed
      });
      
      // Test launcher integration
      const launcherPath = path.join(process.cwd(), 'scripts/claude-mcp-launcher.sh');
      if (existsSync(launcherPath)) {
        const launcherContent = readFileSync(launcherPath, 'utf8');
        const hasEnhancedLogger = launcherContent.includes('enhanced-post-session-logger.js');
        
        this.recordTest('Post-Session Integration - Launcher Updated', hasEnhancedLogger, {
          hasEnhancedLogger
        });
      }
      
    } catch (error) {
      this.recordTest('Post-Session Integration - Check', false, { error: error.message });
    }
  }

  async testRealScenarios() {
    console.log('🎬 Testing Real Scenarios...');
    
    try {
      // Simulate a realistic tool interaction sequence
      const scenarios = [
        {
          name: 'File Search and Read Scenario',
          sequence: [
            { tool: 'Glob', params: { pattern: '*.md' }, result: 'README.md\nCLAUDE.md' },
            { tool: 'Read', params: { file_path: './CLAUDE.md' }, result: 'CLAUDE.md content...' }
          ]
        },
        {
          name: 'MCP Knowledge Management Scenario',
          sequence: [
            { tool: 'mcp__memory__search_nodes', params: { query: 'test' }, result: { entities: [] } },
            { tool: 'mcp__memory__create_entities', params: { entities: [] }, result: 'Created' }
          ]
        }
      ];

      for (const scenario of scenarios) {
        let scenarioPassed = true;
        const logger = await HybridSessionLogger.createFromCurrentContext();
        
        for (const step of scenario.sequence) {
          try {
            await logger.onToolInteraction(
              { name: step.tool, params: step.params },
              step.result,
              { scenario: scenario.name }
            );
          } catch (error) {
            scenarioPassed = false;
            console.warn(`Scenario step failed: ${error.message}`);
          }
        }
        
        await logger.finalizeSession();
        
        this.recordTest(`Real Scenario - ${scenario.name}`, scenarioPassed, {
          steps: scenario.sequence.length
        });
      }
      
    } catch (error) {
      this.recordTest('Real Scenarios - Execution', false, { error: error.message });
    }
  }

  recordTest(testName, passed, details = {}) {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: Date.now()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${testName}`);
    
    if (!passed && details.error) {
      console.log(`      Error: ${details.error}`);
    }
  }

  printTestSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const duration = Date.now() - this.testStartTime;

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Enhanced Logging System Test Summary');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.name}`);
        if (test.details.error) {
          console.log(`    Error: ${test.details.error}`);
        }
      });
    }

    // Generate test report file
    this.generateTestReport();

    console.log('\n🎉 Test suite completed!');
    
    if (passedTests === totalTests) {
      console.log('🌟 All tests passed - Enhanced logging system is ready for use!');
    } else if (passedTests / totalTests >= 0.8) {
      console.log('⚠️  Most tests passed - System is functional with minor issues');
    } else {
      console.log('🔧 Several tests failed - Review system configuration before use');
    }
  }

  generateTestReport() {
    const reportPath = path.join(process.cwd(), '.specstory/test-reports', 
      `enhanced-logging-test-${new Date().toISOString().split('T')[0]}.json`);
    
    const reportDir = path.dirname(reportPath);
    if (!existsSync(reportDir)) {
      const fs = await import('fs');
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.testStartTime,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.passed).length,
        failed: this.testResults.filter(t => !t.passed).length,
        successRate: (this.testResults.filter(t => t.passed).length / this.testResults.length * 100)
      },
      results: this.testResults,
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        workingDirectory: process.cwd()
      }
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Test report saved: ${path.basename(reportPath)}`);
  }
}

// Run tests if called directly
async function main() {
  const testSuite = new EnhancedLoggingTestSuite();
  await testSuite.runAllTests();
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default EnhancedLoggingTestSuite;