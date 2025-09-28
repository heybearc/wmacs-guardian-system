#!/usr/bin/env node

/**
 * APEX Guardian Windsurf Credit Monitoring System
 * Real-time credit usage tracking and savings analysis
 * 
 * Features:
 * - Real-time credit consumption monitoring
 * - Before/after savings calculations
 * - Credit waste detection and alerts
 * - Integration with existing APEX Guardian system
 * - Multi-project credit attribution
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class WindsurfCreditMonitor {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://server.codeium.com/api/v1',
      serviceKey: config.serviceKey || process.env.WINDSURF_SERVICE_KEY,
      refreshInterval: config.refreshInterval || 180000, // 3 minutes (API refreshes every 3 hours)
      alertThreshold: config.alertThreshold || 100, // Alert if spending >$1.00 per hour
      savingsTarget: config.savingsTarget || 0.20, // Target 20% savings
      dataRetention: config.dataRetention || 30, // Keep 30 days of data
      ...config
    };

    this.creditHistory = [];
    this.savingsMetrics = {
      totalCreditsUsed: 0,
      estimatedSavings: 0,
      wasteDetected: 0,
      optimizationOpportunities: []
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Start real-time credit monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Credit monitoring already running');
      return;
    }

    console.log('🚀 Starting Windsurf Credit Monitoring...');
    
    // Validate service key
    if (!this.config.serviceKey) {
      throw new Error('Service key required. Set WINDSURF_SERVICE_KEY environment variable or pass in config.');
    }

    // Load historical data
    await this.loadHistoricalData();

    // Start monitoring loop
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectCreditData();
        await this.analyzeSavings();
        await this.detectWaste();
        await this.saveData();
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    }, this.config.refreshInterval);

    // Initial data collection
    await this.collectCreditData();
    console.log('✅ Credit monitoring started successfully');
  }

  /**
   * Stop credit monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Credit monitoring stopped');
  }

  /**
   * Collect current credit usage data from Windsurf API
   */
  async collectCreditData() {
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 3600000).toISOString(); // Last hour

    const requestBody = {
      service_key: this.config.serviceKey,
      start_timestamp: startTime,
      end_timestamp: endTime,
      query_requests: [
        { cascade_runs: {} },
        { cascade_lines: {} },
        { cascade_tool_usage: {} }
      ]
    };

    try {
      const response = await this.makeApiRequest('/CascadeAnalytics', requestBody);
      
      const creditData = {
        timestamp: new Date().toISOString(),
        timeRange: { start: startTime, end: endTime },
        runs: response.cascade_runs || [],
        lines: response.cascade_lines || [],
        tools: response.cascade_tool_usage || [],
        totalCredits: this.calculateTotalCredits(response.cascade_runs || []),
        hourlyRate: this.calculateHourlyRate(response.cascade_runs || [])
      };

      this.creditHistory.push(creditData);
      
      // Trim old data
      const cutoffDate = new Date(Date.now() - (this.config.dataRetention * 24 * 60 * 60 * 1000));
      this.creditHistory = this.creditHistory.filter(
        entry => new Date(entry.timestamp) > cutoffDate
      );

      console.log(`📊 Credit data collected: ${creditData.totalCredits} credits used in last hour`);
      return creditData;

    } catch (error) {
      console.error('❌ Failed to collect credit data:', error.message);
      throw error;
    }
  }

  /**
   * Calculate total credits from cascade runs
   */
  calculateTotalCredits(runs) {
    return runs.reduce((total, run) => total + (run.promptsUsed || 0), 0);
  }

  /**
   * Calculate hourly credit usage rate
   */
  calculateHourlyRate(runs) {
    const totalCredits = this.calculateTotalCredits(runs);
    return totalCredits; // Already per hour since we query last hour
  }

  /**
   * Analyze credit savings and optimization opportunities
   */
  async analyzeSavings() {
    if (this.creditHistory.length < 2) {
      return; // Need at least 2 data points
    }

    const recent = this.creditHistory.slice(-24); // Last 24 hours
    const baseline = this.creditHistory.slice(-48, -24); // Previous 24 hours

    const recentAvg = recent.reduce((sum, entry) => sum + entry.totalCredits, 0) / recent.length;
    const baselineAvg = baseline.reduce((sum, entry) => sum + entry.totalCredits, 0) / baseline.length;

    const savingsPercent = ((baselineAvg - recentAvg) / baselineAvg) * 100;
    const estimatedSavings = (baselineAvg - recentAvg) * 24; // Daily savings

    this.savingsMetrics = {
      ...this.savingsMetrics,
      currentHourlyRate: recentAvg,
      baselineHourlyRate: baselineAvg,
      savingsPercent: savingsPercent,
      estimatedDailySavings: estimatedSavings,
      isOptimized: savingsPercent >= (this.config.savingsTarget * 100),
      lastUpdated: new Date().toISOString()
    };

    // Log savings analysis
    if (savingsPercent > 0) {
      console.log(`💰 SAVINGS DETECTED: ${savingsPercent.toFixed(1)}% reduction (${estimatedSavings.toFixed(0)} credits/day)`);
    } else if (savingsPercent < -10) {
      console.log(`⚠️ INCREASED USAGE: ${Math.abs(savingsPercent).toFixed(1)}% increase detected`);
    }
  }

  /**
   * Detect credit waste and inefficient usage patterns
   */
  async detectWaste() {
    const recentData = this.creditHistory.slice(-6); // Last 6 data points
    
    const wasteIndicators = [];

    // High credit usage without proportional output
    recentData.forEach(entry => {
      const linesPerCredit = entry.lines.reduce((sum, l) => sum + l.linesAccepted, 0) / entry.totalCredits;
      
      if (entry.totalCredits > this.config.alertThreshold && linesPerCredit < 0.1) {
        wasteIndicators.push({
          type: 'low_efficiency',
          timestamp: entry.timestamp,
          credits: entry.totalCredits,
          efficiency: linesPerCredit,
          message: `Low efficiency: ${entry.totalCredits} credits for ${linesPerCredit.toFixed(2)} lines/credit`
        });
      }
    });

    // Rapid credit consumption spikes
    for (let i = 1; i < recentData.length; i++) {
      const current = recentData[i];
      const previous = recentData[i - 1];
      
      const spike = ((current.totalCredits - previous.totalCredits) / previous.totalCredits) * 100;
      
      if (spike > 200) { // 200% increase
        wasteIndicators.push({
          type: 'usage_spike',
          timestamp: current.timestamp,
          spike: spike,
          credits: current.totalCredits,
          message: `Usage spike: ${spike.toFixed(0)}% increase (${current.totalCredits} credits)`
        });
      }
    }

    // Alert on waste detection
    if (wasteIndicators.length > 0) {
      console.log(`🚨 WASTE DETECTED: ${wasteIndicators.length} indicators found`);
      wasteIndicators.forEach(indicator => {
        console.log(`   - ${indicator.message}`);
      });
    }

    this.savingsMetrics.wasteIndicators = wasteIndicators;
    this.savingsMetrics.wasteDetected += wasteIndicators.length;
  }

  /**
   * Get current credit usage statistics
   */
  getCurrentStats() {
    const recent = this.creditHistory.slice(-1)[0];
    
    return {
      isMonitoring: this.isMonitoring,
      lastUpdate: recent?.timestamp || null,
      currentHourlyRate: recent?.totalCredits || 0,
      dailyProjection: (recent?.totalCredits || 0) * 24,
      savingsMetrics: this.savingsMetrics,
      dataPoints: this.creditHistory.length,
      status: this.getSystemStatus()
    };
  }

  /**
   * Get system status based on current metrics
   */
  getSystemStatus() {
    const recent = this.creditHistory.slice(-1)[0];
    
    if (!recent) return 'initializing';
    
    if (recent.totalCredits > this.config.alertThreshold) {
      return 'high_usage';
    }
    
    if (this.savingsMetrics.savingsPercent >= (this.config.savingsTarget * 100)) {
      return 'optimized';
    }
    
    if (this.savingsMetrics.wasteIndicators?.length > 0) {
      return 'waste_detected';
    }
    
    return 'normal';
  }

  /**
   * Generate credit savings report
   */
  generateReport() {
    const stats = this.getCurrentStats();
    const recent24h = this.creditHistory.slice(-24);
    
    const report = {
      reportGenerated: new Date().toISOString(),
      summary: {
        monitoringStatus: stats.isMonitoring ? 'Active' : 'Inactive',
        systemStatus: stats.status,
        currentHourlyRate: stats.currentHourlyRate,
        dailyProjection: stats.dailyProjection,
        savingsPercent: this.savingsMetrics.savingsPercent?.toFixed(1) || 'N/A',
        estimatedMonthlySavings: (this.savingsMetrics.estimatedDailySavings || 0) * 30
      },
      last24Hours: {
        dataPoints: recent24h.length,
        totalCredits: recent24h.reduce((sum, entry) => sum + entry.totalCredits, 0),
        averageHourly: recent24h.reduce((sum, entry) => sum + entry.totalCredits, 0) / recent24h.length,
        peakUsage: Math.max(...recent24h.map(entry => entry.totalCredits)),
        efficiency: this.calculateEfficiency(recent24h)
      },
      optimizationOpportunities: this.savingsMetrics.optimizationOpportunities || [],
      wasteIndicators: this.savingsMetrics.wasteIndicators || []
    };

    return report;
  }

  /**
   * Calculate efficiency metrics
   */
  calculateEfficiency(data) {
    const totalCredits = data.reduce((sum, entry) => sum + entry.totalCredits, 0);
    const totalLines = data.reduce((sum, entry) => 
      sum + entry.lines.reduce((lineSum, l) => lineSum + l.linesAccepted, 0), 0
    );
    
    return {
      linesPerCredit: totalCredits > 0 ? totalLines / totalCredits : 0,
      creditsPerLine: totalLines > 0 ? totalCredits / totalLines : 0
    };
  }

  /**
   * Make API request to Windsurf
   */
  async makeApiRequest(endpoint, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      
      const options = {
        hostname: 'server.codeium.com',
        port: 443,
        path: `/api/v1${endpoint}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${parsed.message || responseData}`));
            }
          } catch (error) {
            reject(new Error(`Parse Error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request Error: ${error.message}`));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Save monitoring data to file
   */
  async saveData() {
    const dataFile = path.join(__dirname, 'credit-monitoring-data.json');
    
    const saveData = {
      config: this.config,
      creditHistory: this.creditHistory,
      savingsMetrics: this.savingsMetrics,
      lastSaved: new Date().toISOString()
    };

    try {
      await fs.writeFile(dataFile, JSON.stringify(saveData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save monitoring data:', error.message);
    }
  }

  /**
   * Load historical monitoring data
   */
  async loadHistoricalData() {
    const dataFile = path.join(__dirname, 'credit-monitoring-data.json');
    
    try {
      const data = await fs.readFile(dataFile, 'utf8');
      const parsed = JSON.parse(data);
      
      this.creditHistory = parsed.creditHistory || [];
      this.savingsMetrics = parsed.savingsMetrics || this.savingsMetrics;
      
      console.log(`📂 Loaded ${this.creditHistory.length} historical data points`);
    } catch (error) {
      console.log('📂 No historical data found, starting fresh');
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const monitor = new WindsurfCreditMonitor({
    serviceKey: process.env.WINDSURF_SERVICE_KEY
  });

  switch (command) {
    case 'start':
      monitor.startMonitoring().catch(console.error);
      break;
      
    case 'stop':
      monitor.stopMonitoring();
      break;
      
    case 'status':
      console.log(JSON.stringify(monitor.getCurrentStats(), null, 2));
      break;
      
    case 'report':
      console.log(JSON.stringify(monitor.generateReport(), null, 2));
      break;
      
    case 'test':
      monitor.collectCreditData()
        .then(data => console.log('✅ Test successful:', data))
        .catch(error => console.error('❌ Test failed:', error.message));
      break;
      
    default:
      console.log(`
APEX Guardian Windsurf Credit Monitor

Usage:
  node windsurf-credit-monitor.js <command>

Commands:
  start    Start real-time credit monitoring
  stop     Stop credit monitoring
  status   Show current monitoring status
  report   Generate detailed credit usage report
  test     Test API connection and data collection

Environment Variables:
  WINDSURF_SERVICE_KEY    Your Windsurf service key (required)

Examples:
  export WINDSURF_SERVICE_KEY="your_key_here"
  node windsurf-credit-monitor.js start
  node windsurf-credit-monitor.js report
      `);
  }
}

module.exports = WindsurfCreditMonitor;
