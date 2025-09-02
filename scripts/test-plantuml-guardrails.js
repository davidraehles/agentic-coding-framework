#!/usr/bin/env node

/**
 * Test PlantUML Guardrails
 * Validates that PlantUML files follow the established standards
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

class PlantUMLGuardrailsTest {
  constructor() {
    this.results = [];
    this.warnings = [];
    this.errors = [];
  }

  async runTests() {
    console.log('🛡️ PlantUML Guardrails Validation\n');

    await this.testStandardStyleInclusion();
    await this.testFileLocations();
    await this.testReadabilityGuidelines();
    await this.testImageReferences();
    
    this.printResults();
  }

  async testStandardStyleInclusion() {
    console.log('📏 Testing standard style inclusion...');
    
    const pumlFiles = await glob('docs/puml/*.puml', { ignore: 'docs/puml/_*.puml' });
    
    for (const file of pumlFiles) {
      const content = readFileSync(file, 'utf8');
      const filename = file.split('/').pop();
      
      if (content.includes('!include _standard-style.puml')) {
        this.recordResult(filename, 'standard-style', true, 'Includes standard styling');
      } else {
        this.recordResult(filename, 'standard-style', false, 'Missing !include _standard-style.puml');
      }
      
      // Check for old style patterns that should be replaced
      if (content.includes('!theme plain') || content.includes('skinparam backgroundColor white')) {
        this.warnings.push(`${filename}: Contains deprecated styling - should use _standard-style.puml`);
      }
    }
  }

  async testFileLocations() {
    console.log('📁 Testing file locations...');
    
    // Test that PUML files are in docs/puml/
    const pumlFiles = await glob('**/*.puml', { ignore: ['node_modules/**', 'docs/puml/**'] });
    
    if (pumlFiles.length === 0) {
      this.recordResult('file-location', 'puml-in-docs', true, 'All PUML files in docs/puml/');
    } else {
      this.recordResult('file-location', 'puml-in-docs', false, `PUML files outside docs/puml/: ${pumlFiles.join(', ')}`);
    }

    // Test that PNG files exist for PUML files
    const pumlFilenames = await glob('docs/puml/*.puml', { ignore: 'docs/puml/_*.puml' });
    
    for (const pumlFile of pumlFilenames) {
      const basename = pumlFile.replace('docs/puml/', '').replace('.puml', '');
      const pngFile = `docs/images/${basename}.png`;
      
      if (existsSync(pngFile)) {
        this.recordResult(basename, 'png-exists', true, 'Corresponding PNG exists');
      } else {
        this.recordResult(basename, 'png-exists', false, 'Missing PNG file in docs/images/');
      }
    }
  }

  async testReadabilityGuidelines() {
    console.log('👀 Testing readability guidelines...');
    
    const pumlFiles = await glob('docs/puml/*.puml', { ignore: 'docs/puml/_*.puml' });
    
    for (const file of pumlFiles) {
      const content = readFileSync(file, 'utf8');
      const filename = file.split('/').pop();
      
      // Check for vertical layout direction
      if (content.includes('direction top to bottom layout') || content.includes('skinparam direction')) {
        this.recordResult(filename, 'readability', true, 'Uses recommended layout direction');
      } else {
        this.warnings.push(`${filename}: Consider adding 'skinparam direction top to bottom layout' for better readability`);
        this.recordResult(filename, 'readability', false, 'No explicit layout direction');
      }
      
      // Check for logical grouping
      const hasGrouping = content.includes('rectangle') || content.includes('package') || content.includes('namespace');
      if (hasGrouping) {
        this.recordResult(filename, 'grouping', true, 'Uses logical component grouping');
      } else {
        this.warnings.push(`${filename}: Consider grouping related components in rectangles or packages`);
      }
    }
  }

  async testImageReferences() {
    console.log('🖼️ Testing image references in markdown...');
    
    const mdFiles = await glob('**/*.md', { ignore: 'node_modules/**' });
    
    for (const file of mdFiles) {
      const content = readFileSync(file, 'utf8');
      const filename = file.split('/').pop();
      
      // Find image references
      const imageRefs = content.match(/!\[.*?\]\([^)]+\.(png|jpg|jpeg|svg)\)/g) || [];
      
      for (const ref of imageRefs) {
        const pathMatch = ref.match(/!\[.*?\]\(([^)]+\.(png|jpg|jpeg|svg))\)/);
        if (pathMatch) {
          const imagePath = pathMatch[1];
          
          if (imagePath.startsWith('docs/images/')) {
            this.recordResult(filename, 'image-ref', true, `Correct image reference: ${imagePath}`);
          } else {
            this.recordResult(filename, 'image-ref', false, `Image should be in docs/images/: ${imagePath}`);
          }
        }
      }
    }
  }

  recordResult(context, test, passed, message) {
    this.results.push({
      context,
      test,
      passed,
      message,
      timestamp: Date.now()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${context} - ${test}: ${message}`);
  }

  printResults() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('🛡️ PlantUML Guardrails Test Results');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.context} (${result.test}): ${result.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    console.log('\n🎯 Guardrails Status:');
    if (failedTests === 0) {
      console.log('🌟 All PlantUML guardrails are properly enforced!');
    } else {
      console.log('🔧 Some guardrails need attention - review failed tests above');
    }

    console.log('\n💡 PlantUML Workflow Checklist:');
    console.log('  1. ✅ Create .puml files in docs/puml/');
    console.log('  2. ✅ Include !include _standard-style.puml');
    console.log('  3. ✅ Use vertical layouts for readability');
    console.log('  4. ✅ Group related components logically');
    console.log('  5. ✅ Generate PNGs with plantuml -tpng');
    console.log('  6. ✅ Store PNGs in docs/images/');
    console.log('  7. ✅ Reference PNGs (not PUMLs) in markdown');
  }
}

// Run tests if called directly
async function main() {
  const testSuite = new PlantUMLGuardrailsTest();
  await testSuite.runTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PlantUMLGuardrailsTest;