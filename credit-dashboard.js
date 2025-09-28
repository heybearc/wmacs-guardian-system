#!/usr/bin/env node

/**
 * APEX Guardian Real-time Credit Dashboard
 * Interactive terminal dashboard for credit monitoring
 */

const WindsurfCreditMonitor = require('./windsurf-credit-monitor');

class CreditDashboard {
  constructor() {
    this.monitor = new WindsurfCreditMonitor({
      serviceKey: process.env.WINDSURF_SERVICE_KEY,
      refreshInterval: 60000 // 1 minute for dashboard
    });
    
    this.isRunning = false;
    this.dashboardInterval = null;
  }

  /**
   * Start the real-time dashboard
   */
  async start() {
    console.clear();
    console.log('🚀 Starting APEX Guardian Credit Dashboard...\n');
    
    // Start monitoring
    await this.monitor.startMonitoring();
    
    this.isRunning = true;
    
    // Update dashboard every 10 seconds
    this.dashboardInterval = setInterval(() => {
      this.renderDashboard();
    }, 10000);
    
    // Initial render
    this.renderDashboard();
    
    // Handle exit
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  /**
   * Stop the dashboard
   */
  stop() {
    if (this.dashboardInterval) {
      clearInterval(this.dashboardInterval);
    }
    
    this.monitor.stopMonitoring();
    this.isRunning = false;
    
    console.log('\n👋 APEX Guardian Credit Dashboard stopped');
    process.exit(0);
  }

  /**
   * Render the dashboard
   */
  renderDashboard() {
    console.clear();
    
    const stats = this.monitor.getCurrentStats();
    const report = this.monitor.generateReport();
    
    // Header
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎯 APEX Guardian Credit Dashboard                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log();
    
    // Status Overview
    console.log('📊 REAL-TIME STATUS');
    console.log('─'.repeat(80));
    console.log(`Status: ${this.getStatusIcon(stats.status)} ${stats.status.toUpperCase()}`);
    console.log(`Monitoring: ${stats.isMonitoring ? '🟢 Active' : '🔴 Inactive'}`);
    console.log(`Last Update: ${stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Never'}`);
    console.log(`Data Points: ${stats.dataPoints}`);
    console.log();
    
    // Credit Usage
    console.log('💳 CREDIT USAGE');
    console.log('─'.repeat(80));
    console.log(`Current Hourly Rate: ${stats.currentHourlyRate.toFixed(0)} credits/hour`);
    console.log(`Daily Projection: ${stats.dailyProjection.toFixed(0)} credits/day`);
    console.log(`Monthly Projection: ${(stats.dailyProjection * 30).toFixed(0)} credits/month`);
    console.log();
    
    // Savings Analysis
    if (stats.savingsMetrics.savingsPercent !== undefined) {
      console.log('💰 SAVINGS ANALYSIS');
      console.log('─'.repeat(80));
      console.log(`Savings: ${this.getSavingsIcon(stats.savingsMetrics.savingsPercent)} ${stats.savingsMetrics.savingsPercent.toFixed(1)}%`);
      console.log(`Daily Savings: ${(stats.savingsMetrics.estimatedDailySavings || 0).toFixed(0)} credits`);
      console.log(`Monthly Savings: ${((stats.savingsMetrics.estimatedDailySavings || 0) * 30).toFixed(0)} credits`);
      console.log(`Target: ${(this.monitor.config.savingsTarget * 100).toFixed(0)}% ${stats.savingsMetrics.isOptimized ? '✅' : '❌'}`);
      console.log();
    }
    
    // 24 Hour Summary
    if (report.last24Hours.dataPoints > 0) {
      console.log('📈 LAST 24 HOURS');
      console.log('─'.repeat(80));
      console.log(`Total Credits: ${report.last24Hours.totalCredits.toFixed(0)}`);
      console.log(`Average/Hour: ${report.last24Hours.averageHourly.toFixed(1)}`);
      console.log(`Peak Usage: ${report.last24Hours.peakUsage.toFixed(0)} credits/hour`);
      console.log(`Efficiency: ${report.last24Hours.efficiency.linesPerCredit.toFixed(2)} lines/credit`);
      console.log();
    }
    
    // Alerts
    const alerts = this.getAlerts(stats, report);
    if (alerts.length > 0) {
      console.log('🚨 ALERTS');
      console.log('─'.repeat(80));
      alerts.forEach(alert => {
        console.log(`${alert.icon} ${alert.message}`);
      });
      console.log();
    }
    
    // Usage Graph (Simple ASCII)
    if (this.monitor.creditHistory.length > 1) {
      console.log('📊 USAGE TREND (Last 12 Hours)');
      console.log('─'.repeat(80));
      this.renderUsageGraph();
      console.log();
    }
    
    // Footer
    console.log('─'.repeat(80));
    console.log(`🕐 ${new Date().toLocaleString()} | Press Ctrl+C to exit`);
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      'optimized': '🟢',
      'normal': '🟡',
      'high_usage': '🟠',
      'waste_detected': '🔴',
      'initializing': '⚪'
    };
    return icons[status] || '⚪';
  }

  /**
   * Get savings icon
   */
  getSavingsIcon(savingsPercent) {
    if (savingsPercent >= 20) return '🟢';
    if (savingsPercent >= 10) return '🟡';
    if (savingsPercent >= 0) return '🟠';
    return '🔴';
  }

  /**
   * Get current alerts
   */
  getAlerts(stats, report) {
    const alerts = [];
    
    // High usage alert
    if (stats.currentHourlyRate > this.monitor.config.alertThreshold) {
      alerts.push({
        icon: '⚠️',
        message: `High usage: ${stats.currentHourlyRate.toFixed(0)} credits/hour (threshold: ${this.monitor.config.alertThreshold})`
      });
    }
    
    // Waste detection alerts
    if (stats.savingsMetrics.wasteIndicators?.length > 0) {
      alerts.push({
        icon: '🚨',
        message: `${stats.savingsMetrics.wasteIndicators.length} waste indicators detected`
      });
    }
    
    // Savings target not met
    if (stats.savingsMetrics.savingsPercent !== undefined && !stats.savingsMetrics.isOptimized) {
      alerts.push({
        icon: '📉',
        message: `Below savings target: ${stats.savingsMetrics.savingsPercent.toFixed(1)}% (target: ${(this.monitor.config.savingsTarget * 100).toFixed(0)}%)`
      });
    }
    
    // No recent data
    if (!stats.lastUpdate || Date.now() - new Date(stats.lastUpdate).getTime() > 300000) {
      alerts.push({
        icon: '⏰',
        message: 'No recent data - check API connection'
      });
    }
    
    return alerts;
  }

  /**
   * Render simple ASCII usage graph
   */
  renderUsageGraph() {
    const recent = this.monitor.creditHistory.slice(-12); // Last 12 data points
    
    if (recent.length < 2) {
      console.log('Insufficient data for graph');
      return;
    }
    
    const maxCredits = Math.max(...recent.map(entry => entry.totalCredits));
    const scale = maxCredits > 0 ? 40 / maxCredits : 1; // Scale to 40 chars width
    
    recent.forEach((entry, index) => {
      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const barLength = Math.round(entry.totalCredits * scale);
      const bar = '█'.repeat(barLength);
      const credits = entry.totalCredits.toFixed(0).padStart(4);
      
      console.log(`${time} │${bar.padEnd(40)} ${credits}`);
    });
    
    console.log(`${''.padStart(8)}└${'─'.repeat(40)}┘`);
    console.log(`${''.padStart(9)}0${' '.repeat(35)}${maxCredits.toFixed(0)}`);
  }
}

// CLI Interface
if (require.main === module) {
  const dashboard = new CreditDashboard();
  
  if (!process.env.WINDSURF_SERVICE_KEY) {
    console.error('❌ WINDSURF_SERVICE_KEY environment variable required');
    console.log('\nSet your service key:');
    console.log('export WINDSURF_SERVICE_KEY="your_key_here"');
    process.exit(1);
  }
  
  dashboard.start().catch(error => {
    console.error('❌ Dashboard failed to start:', error.message);
    process.exit(1);
  });
}

module.exports = CreditDashboard;
