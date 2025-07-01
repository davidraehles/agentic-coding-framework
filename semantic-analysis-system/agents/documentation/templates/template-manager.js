/**
 * Template Manager
 * Manages documentation templates and rendering
 */

import { Logger } from '../../../shared/logger.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export class TemplateManager {
  constructor(config = {}) {
    this.logger = new Logger('template-manager');
    this.config = config;
    this.templates = new Map();
    this.customTemplates = new Map();
  }

  /**
   * Load template by type
   */
  async loadTemplate(templateType) {
    try {
      if (this.templates.has(templateType)) {
        return this.templates.get(templateType);
      }

      // Try to load custom template first
      const customTemplate = await this.loadCustomTemplate(templateType);
      if (customTemplate) {
        this.templates.set(templateType, customTemplate);
        return customTemplate;
      }

      // Fall back to default template
      const defaultTemplate = this.getDefaultTemplate(templateType);
      this.templates.set(templateType, defaultTemplate);
      return defaultTemplate;
      
    } catch (error) {
      this.logger.error(`Failed to load template ${templateType}:`, error);
      throw error;
    }
  }

  /**
   * Load custom template from file
   */
  async loadCustomTemplate(templateType) {
    try {
      const templatePath = join(this.config.templatePath || './templates', `${templateType}.template`);
      
      if (!existsSync(templatePath)) {
        return null;
      }

      const templateContent = readFileSync(templatePath, 'utf8');
      return this.parseTemplate(templateContent);
      
    } catch (error) {
      this.logger.debug(`Custom template not found for ${templateType}:`, error.message);
      return null;
    }
  }

  /**
   * Get default template configuration
   */
  getDefaultTemplate(templateType) {
    const defaultTemplates = {
      insight: {
        name: 'Default Insight Template',
        sections: [
          { name: 'title', required: true, type: 'header' },
          { name: 'metadata', required: false, type: 'metadata' },
          { name: 'problem', required: true, type: 'content' },
          { name: 'solution', required: true, type: 'content' },
          { name: 'rationale', required: false, type: 'content' },
          { name: 'learnings', required: false, type: 'content' },
          { name: 'applicability', required: false, type: 'content' },
          { name: 'references', required: false, type: 'references' }
        ],
        format: 'markdown'
      },
      
      pattern: {
        name: 'Default Pattern Template',
        sections: [
          { name: 'title', required: true, type: 'header' },
          { name: 'metadata', required: false, type: 'metadata' },
          { name: 'description', required: true, type: 'content' },
          { name: 'context', required: true, type: 'content' },
          { name: 'implementation', required: true, type: 'content' },
          { name: 'consequences', required: false, type: 'content' },
          { name: 'examples', required: false, type: 'code' },
          { name: 'related_patterns', required: false, type: 'references' }
        ],
        format: 'markdown'
      },
      
      workflow: {
        name: 'Default Workflow Template',
        sections: [
          { name: 'title', required: true, type: 'header' },
          { name: 'metadata', required: false, type: 'metadata' },
          { name: 'description', required: true, type: 'content' },
          { name: 'steps', required: true, type: 'list' },
          { name: 'inputs', required: false, type: 'parameters' },
          { name: 'outputs', required: false, type: 'parameters' },
          { name: 'dependencies', required: false, type: 'list' },
          { name: 'examples', required: false, type: 'code' }
        ],
        format: 'markdown'
      },
      
      summary: {
        name: 'Default Summary Template',
        sections: [
          { name: 'title', required: true, type: 'header' },
          { name: 'overview', required: true, type: 'content' },
          { name: 'statistics', required: true, type: 'metrics' },
          { name: 'key_findings', required: true, type: 'list' },
          { name: 'entity_breakdown', required: true, type: 'breakdown' },
          { name: 'recommendations', required: false, type: 'list' },
          { name: 'appendix', required: false, type: 'content' }
        ],
        format: 'markdown'
      }
    };

    return defaultTemplates[templateType] || defaultTemplates.insight;
  }

  /**
   * Parse template file content
   */
  parseTemplate(content) {
    try {
      // Simple template format parsing
      // Expected format:
      // ---
      // name: Template Name
      // format: markdown
      // ---
      // {{section:title}}
      // {{section:content}}
      // etc.

      const parts = content.split('---');
      if (parts.length < 3) {
        throw new Error('Invalid template format');
      }

      // Parse YAML-like header
      const header = parts[1].trim();
      const templateBody = parts.slice(2).join('---').trim();

      const config = {};
      header.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join(':').trim();
        }
      });

      // Parse sections from template body
      const sections = [];
      const sectionMatches = templateBody.match(/\{\{section:(\w+)\}\}/g) || [];
      
      sectionMatches.forEach(match => {
        const sectionName = match.match(/\{\{section:(\w+)\}\}/)[1];
        sections.push({
          name: sectionName,
          required: true,
          type: 'content'
        });
      });

      return {
        name: config.name || 'Custom Template',
        format: config.format || 'markdown',
        sections: sections,
        body: templateBody
      };
      
    } catch (error) {
      this.logger.error('Failed to parse template:', error);
      throw error;
    }
  }

  /**
   * Render template with data
   */
  async renderTemplate(templateType, data) {
    try {
      const template = await this.loadTemplate(templateType);
      
      if (template.body) {
        // Custom template with body
        return this.renderCustomTemplate(template, data);
      } else {
        // Default template
        return this.renderDefaultTemplate(template, data);
      }
      
    } catch (error) {
      this.logger.error(`Failed to render template ${templateType}:`, error);
      throw error;
    }
  }

  /**
   * Render custom template with substitutions
   */
  renderCustomTemplate(template, data) {
    let rendered = template.body;

    // Replace section placeholders
    template.sections.forEach(section => {
      const placeholder = `{{section:${section.name}}}`;
      const value = data[section.name] || (section.required ? `[${section.name} not provided]` : '');
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace variables
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return data[varName] || `[${varName} not provided]`;
    });

    return rendered;
  }

  /**
   * Render default template
   */
  renderDefaultTemplate(template, data) {
    const sections = [];

    template.sections.forEach(section => {
      const value = data[section.name];
      
      if (!value && section.required) {
        sections.push(`[${section.name} not provided]`);
        return;
      }
      
      if (!value) {
        return; // Skip optional empty sections
      }

      switch (section.type) {
        case 'header':
          sections.push(`# ${value}`);
          break;
          
        case 'content':
          sections.push(`## ${this.capitalize(section.name)}\n\n${value}`);
          break;
          
        case 'list':
          if (Array.isArray(value)) {
            const listItems = value.map(item => `- ${item}`).join('\n');
            sections.push(`## ${this.capitalize(section.name)}\n\n${listItems}`);
          } else {
            sections.push(`## ${this.capitalize(section.name)}\n\n${value}`);
          }
          break;
          
        case 'metadata':
          if (typeof value === 'object') {
            const metadataItems = Object.entries(value)
              .map(([key, val]) => `**${this.capitalize(key)}:** ${val}`)
              .join('  \n');
            sections.push(`## Metadata\n\n${metadataItems}`);
          }
          break;
          
        case 'parameters':
          if (typeof value === 'object') {
            const paramItems = Object.entries(value)
              .map(([key, val]) => `- **${key}**: ${val.description || val.type || val}`)
              .join('\n');
            sections.push(`## ${this.capitalize(section.name)}\n\n${paramItems}`);
          }
          break;
          
        case 'code':
          sections.push(`## ${this.capitalize(section.name)}\n\n\`\`\`\n${value}\n\`\`\``);
          break;
          
        case 'references':
          if (Array.isArray(value)) {
            const refItems = value.map(ref => `- ${ref.title || ref.name || ref}: ${ref.url || ref.description || ''}`).join('\n');
            sections.push(`## ${this.capitalize(section.name)}\n\n${refItems}`);
          }
          break;
          
        case 'metrics':
          if (typeof value === 'object') {
            const metricItems = Object.entries(value)
              .map(([key, val]) => `- **${this.capitalize(key)}**: ${val}`)
              .join('\n');
            sections.push(`## ${this.capitalize(section.name)}\n\n${metricItems}`);
          }
          break;
          
        case 'breakdown':
          if (typeof value === 'object') {
            const breakdownSections = Object.entries(value)
              .map(([key, items]) => {
                if (Array.isArray(items)) {
                  const itemList = items.map(item => `  - ${item.name || item} (${item.significance || 'N/A'}/10)`).join('\n');
                  return `### ${key}\n\n${itemList}`;
                }
                return `### ${key}\n\n${items}`;
              })
              .join('\n\n');
            sections.push(`## ${this.capitalize(section.name)}\n\n${breakdownSections}`);
          }
          break;
          
        default:
          sections.push(`## ${this.capitalize(section.name)}\n\n${value}`);
      }
    });

    return sections.join('\n\n');
  }

  /**
   * Save custom template
   */
  async saveTemplate(templateType, templateContent) {
    try {
      const templatePath = join(this.config.templatePath || './templates', `${templateType}.template`);
      writeFileSync(templatePath, templateContent, 'utf8');
      
      // Clear cached template
      this.templates.delete(templateType);
      
      this.logger.info(`Saved custom template: ${templateType}`);
      
    } catch (error) {
      this.logger.error(`Failed to save template ${templateType}:`, error);
      throw error;
    }
  }

  /**
   * List available templates
   */
  listTemplates() {
    const defaultTypes = ['insight', 'pattern', 'workflow', 'summary'];
    const customTypes = Array.from(this.customTemplates.keys());
    
    return {
      default: defaultTypes,
      custom: customTypes,
      all: [...new Set([...defaultTypes, ...customTypes])]
    };
  }

  /**
   * Validate template data
   */
  validateTemplateData(templateType, data) {
    const template = this.templates.get(templateType) || this.getDefaultTemplate(templateType);
    const errors = [];
    const warnings = [];

    template.sections.forEach(section => {
      if (section.required && !data[section.name]) {
        errors.push(`Required section '${section.name}' is missing`);
      }
      
      if (data[section.name] && section.type === 'list' && !Array.isArray(data[section.name])) {
        warnings.push(`Section '${section.name}' should be an array`);
      }
      
      if (data[section.name] && section.type === 'metadata' && typeof data[section.name] !== 'object') {
        warnings.push(`Section '${section.name}' should be an object`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get template schema
   */
  getTemplateSchema(templateType) {
    const template = this.templates.get(templateType) || this.getDefaultTemplate(templateType);
    
    return {
      name: template.name,
      format: template.format,
      sections: template.sections.map(section => ({
        name: section.name,
        required: section.required,
        type: section.type,
        description: this.getSectionDescription(section.name, section.type)
      }))
    };
  }

  getSectionDescription(name, type) {
    const descriptions = {
      title: 'The main title or name of the document',
      metadata: 'Additional metadata like team, project, technologies',
      problem: 'Description of the problem or challenge',
      solution: 'The solution or approach taken',
      rationale: 'Reasoning behind the solution',
      learnings: 'Key learnings or insights gained',
      applicability: 'Where and when this can be applied',
      description: 'Detailed description of the pattern or concept',
      context: 'The context in which this applies',
      implementation: 'How to implement or use this',
      consequences: 'Results, impacts, or consequences',
      steps: 'Step-by-step process or workflow',
      inputs: 'Required inputs or parameters',
      outputs: 'Expected outputs or results',
      dependencies: 'Dependencies or requirements',
      overview: 'High-level summary or overview',
      statistics: 'Numerical data or metrics',
      key_findings: 'Most important discoveries or insights',
      entity_breakdown: 'Breakdown by entity type or category',
      recommendations: 'Suggested actions or next steps'
    };
    
    return descriptions[name] || `${type} content for ${name}`;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}