#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Trajectory-Informed Keyword Extractor
 * Analyzes completed trajectory files to generate dynamic routing keywords
 */
class TrajectoryKeywordExtractor {
  constructor() {
    this.codingRepo = process.env.CODING_TOOLS_PATH || process.env.CODING_REPO || process.cwd();
    this.targetProject = process.env.CODING_TARGET_PROJECT || process.cwd();
    this.keywordConfig = {
      proCodingKeywords: new Set(),
      contraCodingKeywords: new Set(),
      lastUpdated: null,
      sourceTrajectories: []
    };
  }

  /**
   * Find all trajectory files in both coding and target project
   */
  findTrajectoryFiles() {
    const trajectoryDirs = [
      path.join(this.codingRepo, '.specstory/trajectory'),
      path.join(this.targetProject, '.specstory/trajectory')
    ];

    const trajectoryFiles = [];
    
    for (const dir of trajectoryDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(f => f.endsWith('-trajectory.md'))
          .map(f => ({
            path: path.join(dir, f),
            project: dir.includes('coding') ? 'coding' : 'other',
            mtime: fs.statSync(path.join(dir, f)).mtime
          }));
        trajectoryFiles.push(...files);
      }
    }

    // Sort by modification time, most recent first
    return trajectoryFiles.sort((a, b) => b.mtime - a.mtime);
  }

  /**
   * Extract keywords from trajectory content
   */
  extractKeywordsFromContent(content, isCodingTrajectory) {
    const keywords = new Set();
    
    // Extract key phrases and technical terms
    const lines = content.toLowerCase().split('\n');
    
    for (const line of lines) {
      // Skip markdown headers and metadata
      if (line.startsWith('#') || line.startsWith('**') || line.length < 10) continue;
      
      // Extract technical terms, tool names, file extensions
      const technicalPatterns = [
        /\b(debug|debugging|bug|error|fix|fixing)\b/g,
        /\b(script|code|coding|programming|development)\b/g,
        /\b(monitor|monitoring|system|service|process)\b/g,
        /\b(constraint|violation|guardrail|compliance)\b/g,
        /\b(plantuml|puml|styling|diagram)\b/g,
        /\b(status|line|dashboard|redirect|routing)\b/g,
        /\b(trajectory|session|logging|lsl|transcript)\b/g,
        /\b(git|repository|commit|branch)\b/g,
        /\b(api|endpoint|database|schema)\b/g,
        /\b(file|directory|path|config|configuration)\b/g,
        /\b(tool|tools|bash|grep|read|write|edit)\b/g,
        /\b(semantic|analysis|detection|classification)\b/g,
        /\b(architecture|design|pattern|workflow)\b/g,
        /\b(test|testing|build|deploy|deployment)\b/g,
        /\b(cross-project|portability|environment|variable)\b/g
      ];

      for (const pattern of technicalPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => keywords.add(match));
        }
      }

      // Extract compound technical phrases
      const phrasePatterns = [
        /\b(status line|constraint monitor|transcript monitor|enhanced transcript)\b/g,
        /\b(cross-project routing|semantic analysis|trajectory analysis)\b/g,
        /\b(plantuml styling|standard styling|guardrail system)\b/g,
        /\b(live session logging|session boundary|time tranche)\b/g,
        /\b(project detection|environment variable|portability issue)\b/g
      ];

      for (const pattern of phrasePatterns) {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => keywords.add(match.replace(/\s+/g, '-')));
        }
      }
    }

    return Array.from(keywords);
  }

  /**
   * Analyze trajectory files and extract coding vs non-coding patterns
   */
  async analyzeTrajectories() {
    const trajectoryFiles = this.findTrajectoryFiles().slice(0, 20); // Last 20 trajectories
    
    const codingKeywords = new Set();
    const nonCodingKeywords = new Set();
    const processedFiles = [];

    console.log(`Analyzing ${trajectoryFiles.length} trajectory files...`);

    for (const file of trajectoryFiles) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        
        // Determine if this trajectory represents coding activity
        const isCodingTrajectory = this.isCodingTrajectory(content, file);
        
        const keywords = this.extractKeywordsFromContent(content, isCodingTrajectory);
        
        if (isCodingTrajectory) {
          keywords.forEach(kw => codingKeywords.add(kw));
        } else {
          keywords.forEach(kw => nonCodingKeywords.add(kw));
        }
        
        processedFiles.push({
          file: path.basename(file.path),
          project: file.project,
          isCoding: isCodingTrajectory,
          keywords: keywords.length
        });
        
      } catch (error) {
        console.error(`Error processing ${file.path}:`, error.message);
      }
    }

    // Find keywords that strongly correlate with coding activity
    const strongCodingKeywords = Array.from(codingKeywords).filter(kw => 
      !nonCodingKeywords.has(kw) || 
      (Array.from(codingKeywords).filter(k => k === kw).length > 
       Array.from(nonCodingKeywords).filter(k => k === kw).length * 2)
    );

    // Find keywords that strongly correlate with non-coding activity
    const strongNonCodingKeywords = Array.from(nonCodingKeywords).filter(kw => 
      !codingKeywords.has(kw) ||
      (Array.from(nonCodingKeywords).filter(k => k === kw).length > 
       Array.from(codingKeywords).filter(k => k === kw).length * 2)
    );

    this.keywordConfig = {
      proCodingKeywords: strongCodingKeywords,
      contraCodingKeywords: strongNonCodingKeywords,
      lastUpdated: new Date().toISOString(),
      sourceTrajectories: processedFiles,
      stats: {
        totalTrajectories: trajectoryFiles.length,
        codingTrajectories: processedFiles.filter(f => f.isCoding).length,
        nonCodingTrajectories: processedFiles.filter(f => !f.isCoding).length,
        proCodingKeywords: strongCodingKeywords.length,
        contraCodingKeywords: strongNonCodingKeywords.length
      }
    };

    return this.keywordConfig;
  }

  /**
   * Determine if trajectory represents coding activity
   */
  isCodingTrajectory(content, file) {
    const indicators = [
      // File is from coding project
      file.project === 'coding',
      
      // File name contains coding indicators
      file.path.includes('coding-session') || file.path.includes('from-nano-degree'),
      
      // Content analysis
      /tool usage:|coding focus:|development|technical|system|debug|bug|error/i.test(content),
      /(bash|grep|read|write|edit|git|api|database|script|monitor|constraint)/i.test(content),
      /trajectory.*coding|focus.*technical|development.*task/i.test(content)
    ];

    // If majority of indicators suggest coding activity
    return indicators.filter(Boolean).length >= Math.ceil(indicators.length * 0.4);
  }

  /**
   * Save keyword configuration
   */
  saveKeywordConfig() {
    // Save to the TARGET project (non-coding project that needs redirect detection)
    const configPath = path.join(this.targetProject, '.specstory/trajectory-keywords.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(this.keywordConfig, null, 2));
    console.log(`✅ Keyword configuration saved to ${configPath}`);
    
    return configPath;
  }

  /**
   * Load existing keyword configuration
   */
  loadKeywordConfig() {
    // Load from the TARGET project where it's needed
    const configPath = path.join(this.targetProject, '.specstory/trajectory-keywords.json');
    
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.keywordConfig = config;
        return config;
      } catch (error) {
        console.error('Error loading keyword config:', error.message);
      }
    }
    
    return null;
  }

  /**
   * Main execution
   */
  async run() {
    console.log('🧠 Trajectory-Informed Keyword Extractor');
    console.log('=' .repeat(50));
    
    // Load existing config
    const existing = this.loadKeywordConfig();
    if (existing) {
      console.log(`📋 Loaded existing config from ${existing.lastUpdated}`);
      console.log(`   Pro-keywords: ${existing.proCodingKeywords?.length || 0}`);
      console.log(`   Contra-keywords: ${existing.contraCodingKeywords?.length || 0}`);
      console.log('');
    }
    
    // Analyze trajectories
    const config = await this.analyzeTrajectories();
    
    // Display results
    console.log('📊 Analysis Results:');
    console.log(`   Total trajectories analyzed: ${config.stats.totalTrajectories}`);
    console.log(`   Coding trajectories: ${config.stats.codingTrajectories}`);
    console.log(`   Non-coding trajectories: ${config.stats.nonCodingTrajectories}`);
    console.log(`   Pro-coding keywords: ${config.stats.proCodingKeywords}`);
    console.log(`   Contra-coding keywords: ${config.stats.contraCodingKeywords}`);
    console.log('');
    
    console.log('🎯 Top Pro-Coding Keywords:');
    config.proCodingKeywords.slice(0, 10).forEach(kw => console.log(`   • ${kw}`));
    console.log('');
    
    if (config.contraCodingKeywords.length > 0) {
      console.log('🚫 Top Contra-Coding Keywords:');
      config.contraCodingKeywords.slice(0, 5).forEach(kw => console.log(`   • ${kw}`));
      console.log('');
    }
    
    // Save configuration
    this.saveKeywordConfig();
    
    return config;
  }
}

// Run if called directly
if (require.main === module) {
  const extractor = new TrajectoryKeywordExtractor();
  extractor.run().catch(console.error);
}

module.exports = TrajectoryKeywordExtractor;