#!/usr/bin/env node

/**
 * WMACS Cascade Rules IDE Validator
 * Real-time enforcement of WMACS rules within Windsurf IDE
 */

const fs = require('fs');
const path = require('path');

class WMACScascadeValidator {
  constructor() {
    this.rulesPath = path.join(__dirname, 'cascade-rules.json');
    this.rules = this.loadRules();
  }

  loadRules() {
    try {
      const rulesContent = fs.readFileSync(this.rulesPath, 'utf8');
      return JSON.parse(rulesContent);
    } catch (error) {
      console.error('❌ Failed to load WMACS cascade rules:', error.message);
      return { apex: { enabled: false, rules: {} } };
    }
  }

  validateCommand(command) {
    if (!this.rules.apex.enabled) {
      return { allowed: true, message: 'WMACS validation disabled' };
    }

    // Check hard stops (blocking)
    for (const rule of this.rules.apex.rules.hardStops || []) {
      if (new RegExp(rule.pattern, 'i').test(command)) {
        return {
          allowed: false,
          level: 'HARD_STOP',
          message: rule.message,
          action: rule.action
        };
      }
    }

    // Check soft stops (warnings)
    for (const rule of this.rules.apex.rules.softStops || []) {
      if (new RegExp(rule.pattern, 'i').test(command)) {
        return {
          allowed: true,
          level: 'SOFT_STOP', 
          message: rule.message,
          action: rule.action
        };
      }
    }

    // Check approved patterns
    for (const rule of this.rules.apex.rules.approvedPatterns || []) {
      if (new RegExp(rule.pattern, 'i').test(command)) {
        return {
          allowed: true,
          level: 'APPROVED',
          message: rule.message,
          action: rule.action
        };
      }
    }

    return { allowed: true, message: 'Command validation passed' };
  }

  validateEnvironmentAccess(container, operation) {
    const environments = this.rules.apex.environments || {};
    
    for (const [envName, config] of Object.entries(environments)) {
      if (config.container === container) {
        if (config.allowed_operations.includes(operation)) {
          return {
            allowed: true,
            environment: envName,
            message: `✅ ${operation} allowed on ${envName} (container ${container})`
          };
        } else {
          return {
            allowed: false,
            environment: envName,
            message: `🚫 ${operation} not allowed on ${envName} (container ${container})`
          };
        }
      }
    }

    return {
      allowed: false,
      message: `❌ Unknown container: ${container}`
    };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      apex_enabled: this.rules.apex.enabled,
      strict_mode: this.rules.apex.strictMode,
      rules_count: {
        hard_stops: (this.rules.apex.rules.hardStops || []).length,
        soft_stops: (this.rules.apex.rules.softStops || []).length,
        approved_patterns: (this.rules.apex.rules.approvedPatterns || []).length
      },
      environments: Object.keys(this.rules.apex.environments || {})
    };

    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const validator = new WMACScascadeValidator();
  const command = process.argv[2];
  const input = process.argv[3];

  switch (command) {
    case 'validate':
      const result = validator.validateCommand(input);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.allowed ? 0 : 1);
      break;

    case 'check-env':
      const container = process.argv[3];
      const operation = process.argv[4];
      const envResult = validator.validateEnvironmentAccess(container, operation);
      console.log(JSON.stringify(envResult, null, 2));
      process.exit(envResult.allowed ? 0 : 1);
      break;

    case 'report':
      const report = validator.generateReport();
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.log('Usage:');
      console.log('  node apex-validator.js validate "command string"');
      console.log('  node apex-validator.js check-env <container> <operation>');
      console.log('  node apex-validator.js report');
  }
}

module.exports = WMACScascadeValidator;
