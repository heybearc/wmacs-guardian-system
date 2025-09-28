#!/usr/bin/env node

/**
 * APEX Guardian Credit Integration Module
 * Integrates Windsurf credit monitoring with existing APEX Guardian system
 */

const WindsurfCreditMonitor = require('./windsurf-credit-monitor');
const fs = require('fs').promises;
const path = require('path');

class APEXCreditIntegration {
  constructor(config = {}) {
    this.config = {
      projectMappings: {
        'jw-attendant-scheduler': {
          path: '/Users/cory/Documents/Cloudy-Work/applications/jw-attendant-scheduler',
          priority: 'high',
          budgetLimit: 1000 // credits per day
        },
        'ldc-construction-tools': {
          path: '/Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools',
          priority: 'high',
          budgetLimit: 800 // credits per day
        }
      },
      alertWebhook: config.alertWebhook,
      savingsReportInterval: config.savingsReportInterval || 86400000, // 24 hours
      ...config
    };

    this.creditMonitor = new WindsurfCreditMonitor({
      serviceKey: config.serviceKey || process.env.WINDSURF_SERVICE_KEY,
      refreshInterval: 180000, // 3 minutes
      alertThreshold: 100,
      savingsTarget: 0.20
    });

    this.integrationData = {
      projectCredits: {},
      totalSavings: 0,
      optimizationRecommendations: [],
      lastReport: null
    };
  }

  /**
   * Start integrated credit monitoring
   */
  async startIntegratedMonitoring() {
    console.log('🔗 Starting APEX Guardian Credit Integration...');

    // Load existing integration data
    await this.loadIntegrationData();

    // Start credit monitoring
    await this.creditMonitor.startMonitoring();

    // Set up periodic reporting
    setInterval(async () => {
      await this.generateIntegratedReport();
      await this.updateProjectBudgets();
      await this.optimizeAPEXSettings();
    }, this.config.savingsReportInterval);

    // Initial report
    await this.generateIntegratedReport();

    console.log('✅ APEX Credit Integration active');
  }

  /**
   * Generate integrated savings report
   */
  async generateIntegratedReport() {
    const creditReport = this.creditMonitor.generateReport();
    const projectAnalysis = await this.analyzeProjectCredits();
    
    const integratedReport = {
      timestamp: new Date().toISOString(),
      creditUsage: creditReport,
      projectBreakdown: projectAnalysis,
      apexOptimizations: await this.getAPEXOptimizations(),
      recommendations: this.generateRecommendations(creditReport, projectAnalysis),
      totalSavings: this.calculateTotalSavings(creditReport),
      budgetStatus: this.checkBudgetStatus(projectAnalysis)
    };

    // Save report
    await this.saveIntegratedReport(integratedReport);

    // Send alerts if needed
    await this.checkAndSendAlerts(integratedReport);

    this.integrationData.lastReport = integratedReport;
    return integratedReport;
  }

  /**
   * Analyze credit usage by project
   */
  async analyzeProjectCredits() {
    const projectAnalysis = {};

    for (const [projectName, projectConfig] of Object.entries(this.config.projectMappings)) {
      try {
        // Check if project is currently active (has recent git activity)
        const isActive = await this.isProjectActive(projectConfig.path);
        
        // Estimate credit attribution (simplified - in reality would need more sophisticated tracking)
        const estimatedCredits = await this.estimateProjectCredits(projectName, projectConfig);

        projectAnalysis[projectName] = {
          isActive,
          estimatedDailyCredits: estimatedCredits,
          budgetLimit: projectConfig.budgetLimit,
          budgetUtilization: (estimatedCredits / projectConfig.budgetLimit) * 100,
          priority: projectConfig.priority,
          recommendations: []
        };

        // Add budget warnings
        if (projectAnalysis[projectName].budgetUtilization > 90) {
          projectAnalysis[projectName].recommendations.push({
            type: 'budget_warning',
            message: `Project approaching budget limit (${projectAnalysis[projectName].budgetUtilization.toFixed(1)}%)`
          });
        }

      } catch (error) {
        console.error(`❌ Error analyzing project ${projectName}:`, error.message);
        projectAnalysis[projectName] = {
          error: error.message,
          isActive: false,
          estimatedDailyCredits: 0
        };
      }
    }

    return projectAnalysis;
  }

  /**
   * Check if project is currently active
   */
  async isProjectActive(projectPath) {
    try {
      // Check for recent git commits (last 24 hours)
      const gitLogPath = path.join(projectPath, '.git', 'logs', 'HEAD');
      const stats = await fs.stat(gitLogPath);
      const lastModified = stats.mtime;
      const hoursSinceLastCommit = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceLastCommit < 24;
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate credit usage for a specific project
   */
  async estimateProjectCredits(projectName, projectConfig) {
    // Simplified estimation - in reality would need conversation/session tracking
    const stats = this.creditMonitor.getCurrentStats();
    const totalDailyCredits = stats.dailyProjection;
    
    // Distribute credits based on project priority and activity
    const priorityWeights = { high: 0.4, medium: 0.3, low: 0.2 };
    const weight = priorityWeights[projectConfig.priority] || 0.2;
    
    return totalDailyCredits * weight;
  }

  /**
   * Get APEX-specific optimizations
   */
  async getAPEXOptimizations() {
    const optimizations = [];

    // Check MCP usage efficiency
    const mcpEfficiency = await this.analyzeMCPEfficiency();
    if (mcpEfficiency.canOptimize) {
      optimizations.push({
        type: 'mcp_optimization',
        impact: 'high',
        savings: mcpEfficiency.potentialSavings,
        description: 'Optimize MCP server usage to reduce redundant API calls',
        implementation: 'Enable response caching and batch operations'
      });
    }

    // Check for redundant operations
    const redundancyAnalysis = await this.analyzeRedundantOperations();
    if (redundancyAnalysis.detected) {
      optimizations.push({
        type: 'redundancy_elimination',
        impact: 'medium',
        savings: redundancyAnalysis.potentialSavings,
        description: 'Eliminate redundant code generation requests',
        implementation: 'Implement intelligent caching and deduplication'
      });
    }

    // Check model selection optimization
    const modelOptimization = await this.analyzeModelUsage();
    if (modelOptimization.canOptimize) {
      optimizations.push({
        type: 'model_optimization',
        impact: 'high',
        savings: modelOptimization.potentialSavings,
        description: 'Optimize model selection for different task types',
        implementation: 'Use lighter models for simple tasks, premium models for complex work'
      });
    }

    return optimizations;
  }

  /**
   * Analyze MCP efficiency
   */
  async analyzeMCPEfficiency() {
    // Placeholder for MCP efficiency analysis
    return {
      canOptimize: true,
      potentialSavings: 150, // credits per day
      issues: ['Redundant database queries', 'Uncached API responses']
    };
  }

  /**
   * Analyze redundant operations
   */
  async analyzeRedundantOperations() {
    // Placeholder for redundancy analysis
    return {
      detected: true,
      potentialSavings: 100,
      redundancies: ['Repeated code generation', 'Duplicate explanations']
    };
  }

  /**
   * Analyze model usage patterns
   */
  async analyzeModelUsage() {
    // Placeholder for model usage analysis
    return {
      canOptimize: true,
      potentialSavings: 200,
      recommendations: ['Use Base Model for simple tasks', 'Reserve Premier for complex generation']
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(creditReport, projectAnalysis) {
    const recommendations = [];

    // High usage recommendations
    if (creditReport.summary.currentHourlyRate > 100) {
      recommendations.push({
        priority: 'high',
        type: 'usage_reduction',
        title: 'Reduce High Credit Usage',
        description: 'Current usage is above optimal levels',
        actions: [
          'Review recent conversations for efficiency',
          'Consider using lighter models for simple tasks',
          'Implement response caching'
        ],
        estimatedSavings: 300
      });
    }

    // Project-specific recommendations
    Object.entries(projectAnalysis).forEach(([project, analysis]) => {
      if (analysis.budgetUtilization > 80) {
        recommendations.push({
          priority: 'medium',
          type: 'budget_management',
          title: `Optimize ${project} Credit Usage`,
          description: `Project is using ${analysis.budgetUtilization.toFixed(1)}% of budget`,
          actions: [
            'Review project-specific prompts',
            'Implement project-level caching',
            'Consider adjusting model selection'
          ],
          estimatedSavings: analysis.estimatedDailyCredits * 0.2
        });
      }
    });

    // APEX-specific recommendations
    recommendations.push({
      priority: 'low',
      type: 'apex_optimization',
      title: 'Enable APEX Smart Batching',
      description: 'Batch similar operations to reduce API calls',
      actions: [
        'Enable MCP operation batching',
        'Implement intelligent request queuing',
        'Use APEX federation for cross-project optimization'
      ],
      estimatedSavings: 150
    });

    return recommendations;
  }

  /**
   * Calculate total savings
   */
  calculateTotalSavings(creditReport) {
    const dailySavings = creditReport.summary.estimatedMonthlySavings / 30;
    const monthlySavings = creditReport.summary.estimatedMonthlySavings;
    
    return {
      daily: dailySavings,
      monthly: monthlySavings,
      yearly: monthlySavings * 12,
      percentage: creditReport.summary.savingsPercent
    };
  }

  /**
   * Check budget status across projects
   */
  checkBudgetStatus(projectAnalysis) {
    const status = {
      totalBudget: 0,
      totalUsed: 0,
      overBudgetProjects: [],
      warningProjects: []
    };

    Object.entries(projectAnalysis).forEach(([project, analysis]) => {
      if (analysis.budgetLimit && analysis.estimatedDailyCredits) {
        status.totalBudget += analysis.budgetLimit;
        status.totalUsed += analysis.estimatedDailyCredits;

        if (analysis.budgetUtilization > 100) {
          status.overBudgetProjects.push(project);
        } else if (analysis.budgetUtilization > 80) {
          status.warningProjects.push(project);
        }
      }
    });

    status.utilizationPercent = (status.totalUsed / status.totalBudget) * 100;
    status.status = status.utilizationPercent > 100 ? 'over_budget' : 
                   status.utilizationPercent > 80 ? 'warning' : 'normal';

    return status;
  }

  /**
   * Update project budgets based on usage patterns
   */
  async updateProjectBudgets() {
    // Placeholder for dynamic budget adjustment
    console.log('📊 Updating project budgets based on usage patterns...');
  }

  /**
   * Optimize APEX settings based on credit usage
   */
  async optimizeAPEXSettings() {
    const report = this.integrationData.lastReport;
    if (!report) return;

    // Auto-enable optimizations if savings are below target
    if (report.totalSavings.percentage < 15) {
      console.log('🔧 Auto-optimizing APEX settings for better credit efficiency...');
      
      // Enable MCP batching
      await this.enableMCPBatching();
      
      // Optimize model selection
      await this.optimizeModelSelection();
      
      // Enable response caching
      await this.enableResponseCaching();
    }
  }

  /**
   * Enable MCP batching
   */
  async enableMCPBatching() {
    console.log('⚡ Enabling MCP operation batching...');
    // Implementation would update MCP configuration
  }

  /**
   * Optimize model selection
   */
  async optimizeModelSelection() {
    console.log('🧠 Optimizing model selection strategy...');
    // Implementation would update model selection logic
  }

  /**
   * Enable response caching
   */
  async enableResponseCaching() {
    console.log('💾 Enabling intelligent response caching...');
    // Implementation would enable caching mechanisms
  }

  /**
   * Check and send alerts
   */
  async checkAndSendAlerts(report) {
    const alerts = [];

    // Budget alerts
    if (report.budgetStatus.status === 'over_budget') {
      alerts.push({
        level: 'critical',
        message: `Budget exceeded: ${report.budgetStatus.utilizationPercent.toFixed(1)}% utilization`,
        projects: report.budgetStatus.overBudgetProjects
      });
    }

    // High usage alerts
    if (report.creditUsage.summary.currentHourlyRate > 150) {
      alerts.push({
        level: 'warning',
        message: `High credit usage: ${report.creditUsage.summary.currentHourlyRate} credits/hour`
      });
    }

    // Send alerts if configured
    if (alerts.length > 0 && this.config.alertWebhook) {
      await this.sendWebhookAlerts(alerts);
    }

    // Log alerts
    alerts.forEach(alert => {
      const icon = alert.level === 'critical' ? '🚨' : '⚠️';
      console.log(`${icon} ${alert.message}`);
    });
  }

  /**
   * Send webhook alerts
   */
  async sendWebhookAlerts(alerts) {
    // Placeholder for webhook implementation
    console.log('📡 Sending webhook alerts...');
  }

  /**
   * Save integrated report
   */
  async saveIntegratedReport(report) {
    const reportFile = path.join(__dirname, 'apex-credit-reports.json');
    
    try {
      let reports = [];
      try {
        const existing = await fs.readFile(reportFile, 'utf8');
        reports = JSON.parse(existing);
      } catch (error) {
        // File doesn't exist, start fresh
      }

      reports.push(report);
      
      // Keep only last 30 reports
      if (reports.length > 30) {
        reports = reports.slice(-30);
      }

      await fs.writeFile(reportFile, JSON.stringify(reports, null, 2));
    } catch (error) {
      console.error('❌ Failed to save integrated report:', error.message);
    }
  }

  /**
   * Load integration data
   */
  async loadIntegrationData() {
    const dataFile = path.join(__dirname, 'apex-integration-data.json');
    
    try {
      const data = await fs.readFile(dataFile, 'utf8');
      this.integrationData = { ...this.integrationData, ...JSON.parse(data) };
      console.log('📂 Loaded APEX integration data');
    } catch (error) {
      console.log('📂 No existing integration data found');
    }
  }

  /**
   * Get integration status
   */
  getIntegrationStatus() {
    return {
      isActive: this.creditMonitor.isMonitoring,
      lastReport: this.integrationData.lastReport?.timestamp,
      projectCount: Object.keys(this.config.projectMappings).length,
      totalSavings: this.integrationData.totalSavings,
      recommendations: this.integrationData.optimizationRecommendations?.length || 0
    };
  }
}

// CLI Interface
if (require.main === module) {
  const integration = new APEXCreditIntegration({
    serviceKey: process.env.WINDSURF_SERVICE_KEY
  });

  const command = process.argv[2];

  switch (command) {
    case 'start':
      integration.startIntegratedMonitoring().catch(console.error);
      break;
      
    case 'report':
      integration.generateIntegratedReport()
        .then(report => console.log(JSON.stringify(report, null, 2)))
        .catch(console.error);
      break;
      
    case 'status':
      console.log(JSON.stringify(integration.getIntegrationStatus(), null, 2));
      break;
      
    default:
      console.log(`
APEX Guardian Credit Integration

Usage:
  node apex-credit-integration.js <command>

Commands:
  start    Start integrated credit monitoring
  report   Generate integrated savings report
  status   Show integration status

Environment Variables:
  WINDSURF_SERVICE_KEY    Your Windsurf service key (required)
      `);
  }
}

module.exports = APEXCreditIntegration;
