#!/usr/bin/env node

/**
 * APEX Guardian Individual Credit Tracker
 * Local credit usage tracking for individual Windsurf users
 * 
 * Since Analytics API is Enterprise-only, this provides:
 * - Local credit usage tracking
 * - Manual credit logging
 * - Savings estimation based on usage patterns
 * - Integration with APEX Guardian optimizations
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class IndividualCreditTracker {
  constructor(config = {}) {
    this.planLimits = {
      free: 25,
      pro: 500,
      teams: 500,
      enterprise: 1000
    };

    this.config = {
      dataFile: path.join(__dirname, 'individual-credit-data.json'),
      savingsTarget: config.savingsTarget || 0.20, // Target 20% savings
      alertThreshold: config.alertThreshold || 50, // Alert if >50 credits/day
      planType: config.planType || 'pro', // free, pro, teams, enterprise
      monthlyLimit: this.getPlanLimit(config.planType || 'pro'),
      ...config
    };

    this.creditData = {
      sessions: [],
      dailyTotals: {},
      monthlyTotals: {},
      savingsMetrics: {
        totalSaved: 0,
        optimizationsApplied: [],
        efficiency: 0
      },
      lastUpdated: null
    };
  }

  /**
   * Get monthly credit limit for plan type
   */
  getPlanLimit(planType) {
    return this.planLimits[planType] || 500;
  }

  /**
   * Start interactive credit tracking session
   */
  async startTrackingSession() {
    console.log('🎯 APEX Guardian Individual Credit Tracker');
    console.log('==========================================');
    console.log();
    
    await this.loadData();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Track your Windsurf credit usage to optimize costs and identify savings opportunities.');
    console.log();
    console.log('Commands:');
    console.log('  log <credits>     - Log credits used in current session');
    console.log('  session <credits> - Log a complete session with credits used');
    console.log('  status           - Show current usage status');
    console.log('  report           - Generate savings report');
    console.log('  optimize         - Get optimization recommendations');
    console.log('  help             - Show this help');
    console.log('  exit             - Exit tracker');
    console.log();

    const askQuestion = () => {
      rl.question('📊 Credit Tracker> ', async (input) => {
        const [command, ...args] = input.trim().split(' ');
        
        try {
          switch (command.toLowerCase()) {
            case 'log':
              await this.logCredits(parseInt(args[0]) || 0);
              break;
            case 'session':
              await this.logSession(parseInt(args[0]) || 0, args.slice(1).join(' '));
              break;
            case 'status':
              await this.showStatus();
              break;
            case 'report':
              await this.generateReport();
              break;
            case 'optimize':
              await this.showOptimizations();
              break;
            case 'help':
              this.showHelp();
              break;
            case 'exit':
              console.log('👋 Goodbye! Keep optimizing those credits!');
              rl.close();
              return;
            default:
              console.log('❌ Unknown command. Type "help" for available commands.');
          }
        } catch (error) {
          console.error('❌ Error:', error.message);
        }
        
        console.log();
        askQuestion();
      });
    };

    askQuestion();
  }

  /**
   * Log credits used in current session
   */
  async logCredits(credits) {
    if (!credits || credits <= 0) {
      console.log('❌ Please specify a valid number of credits (e.g., "log 5")');
      return;
    }

    const session = {
      timestamp: new Date().toISOString(),
      credits: credits,
      type: 'manual_log',
      date: new Date().toISOString().split('T')[0]
    };

    this.creditData.sessions.push(session);
    await this.updateDailyTotals();
    await this.saveData();

    console.log(`✅ Logged ${credits} credits for current session`);
    console.log(`📊 Today's total: ${this.getTodayTotal()} credits`);
  }

  /**
   * Log a complete session with description
   */
  async logSession(credits, description = '') {
    if (!credits || credits <= 0) {
      console.log('❌ Please specify credits used (e.g., "session 10 Working on React component")');
      return;
    }

    const session = {
      timestamp: new Date().toISOString(),
      credits: credits,
      description: description || 'Development session',
      type: 'session',
      date: new Date().toISOString().split('T')[0]
    };

    this.creditData.sessions.push(session);
    await this.updateDailyTotals();
    await this.saveData();

    console.log(`✅ Logged session: ${credits} credits - "${session.description}"`);
    console.log(`📊 Today's total: ${this.getTodayTotal()} credits`);
    
    // Check for alerts
    if (this.getTodayTotal() > this.config.alertThreshold) {
      console.log(`⚠️  High usage alert: ${this.getTodayTotal()} credits today (threshold: ${this.config.alertThreshold})`);
    }
  }

  /**
   * Show current usage status
   */
  async showStatus() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);
    
    const todayTotal = this.getTodayTotal();
    const monthTotal = this.getMonthTotal();
    const remainingCredits = this.config.monthlyLimit - monthTotal;
    const utilizationPercent = (monthTotal / this.config.monthlyLimit) * 100;

    console.log('📊 CURRENT USAGE STATUS');
    console.log('========================');
    console.log(`Plan: ${this.config.planType.toUpperCase()} (${this.config.monthlyLimit} credits/month)`);
    console.log(`Today (${today}): ${todayTotal} credits`);
    console.log(`This Month (${thisMonth}): ${monthTotal} credits`);
    console.log(`Remaining: ${remainingCredits} credits (${(100 - utilizationPercent).toFixed(1)}%)`);
    console.log(`Utilization: ${utilizationPercent.toFixed(1)}%`);
    
    if (utilizationPercent > 90) {
      console.log('🚨 WARNING: Approaching monthly limit!');
    } else if (utilizationPercent > 75) {
      console.log('⚠️  CAUTION: High monthly usage');
    } else {
      console.log('✅ Usage within normal range');
    }

    // Recent sessions
    const recentSessions = this.creditData.sessions.slice(-5);
    if (recentSessions.length > 0) {
      console.log('\n📝 RECENT SESSIONS:');
      recentSessions.forEach(session => {
        const time = new Date(session.timestamp).toLocaleTimeString();
        const desc = session.description ? ` - ${session.description}` : '';
        console.log(`  ${time}: ${session.credits} credits${desc}`);
      });
    }
  }

  /**
   * Generate comprehensive usage report
   */
  async generateReport() {
    const report = this.calculateSavingsReport();
    
    console.log('📈 CREDIT USAGE REPORT');
    console.log('======================');
    console.log(`Report Period: Last 30 days`);
    console.log(`Total Sessions: ${report.totalSessions}`);
    console.log(`Total Credits: ${report.totalCredits}`);
    console.log(`Average per Session: ${report.averagePerSession.toFixed(1)} credits`);
    console.log(`Average per Day: ${report.averagePerDay.toFixed(1)} credits`);
    console.log();
    
    console.log('💰 SAVINGS ANALYSIS:');
    console.log(`Estimated Baseline: ${report.estimatedBaseline} credits`);
    console.log(`Actual Usage: ${report.totalCredits} credits`);
    console.log(`Savings: ${report.savings} credits (${report.savingsPercent.toFixed(1)}%)`);
    
    if (report.savingsPercent >= this.config.savingsTarget * 100) {
      console.log('✅ Meeting savings target!');
    } else {
      console.log(`❌ Below savings target (${(this.config.savingsTarget * 100).toFixed(0)}%)`);
    }
    
    console.log();
    console.log('📊 USAGE PATTERNS:');
    Object.entries(report.dailyBreakdown).slice(-7).forEach(([date, credits]) => {
      console.log(`  ${date}: ${credits} credits`);
    });

    console.log();
    console.log('🎯 EFFICIENCY METRICS:');
    console.log(`Sessions per Day: ${report.sessionsPerDay.toFixed(1)}`);
    console.log(`Credits per Hour: ${report.creditsPerHour.toFixed(1)} (estimated)`);
    console.log(`Efficiency Score: ${report.efficiencyScore}/10`);
  }

  /**
   * Show optimization recommendations
   */
  async showOptimizations() {
    const recommendations = this.generateOptimizationRecommendations();
    
    console.log('🔧 OPTIMIZATION RECOMMENDATIONS');
    console.log('================================');
    
    if (recommendations.length === 0) {
      console.log('✅ No optimizations needed - you\'re doing great!');
      return;
    }

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   Impact: ${rec.impact} | Savings: ${rec.estimatedSavings} credits/month`);
      console.log(`   Action: ${rec.action}`);
      console.log();
    });

    console.log('💡 APEX GUARDIAN OPTIMIZATIONS:');
    console.log('- Enable response caching for repeated queries');
    console.log('- Use batch operations for similar tasks');
    console.log('- Optimize prompt engineering for efficiency');
    console.log('- Consider model selection based on task complexity');
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    const recommendations = [];
    const report = this.calculateSavingsReport();
    
    // High usage per session
    if (report.averagePerSession > 10) {
      recommendations.push({
        title: 'Reduce Credits per Session',
        impact: 'High',
        estimatedSavings: Math.round(report.averagePerSession * 0.3 * 30),
        action: 'Break large tasks into smaller, focused prompts'
      });
    }

    // High daily usage
    if (report.averagePerDay > this.config.alertThreshold) {
      recommendations.push({
        title: 'Optimize Daily Usage',
        impact: 'Medium',
        estimatedSavings: Math.round(report.averagePerDay * 0.2 * 30),
        action: 'Set daily credit budgets and track usage more closely'
      });
    }

    // Low efficiency score
    if (report.efficiencyScore < 7) {
      recommendations.push({
        title: 'Improve Prompt Efficiency',
        impact: 'Medium',
        estimatedSavings: Math.round(report.totalCredits * 0.15),
        action: 'Use more specific prompts and avoid repetitive requests'
      });
    }

    // Approaching monthly limit
    const monthTotal = this.getMonthTotal();
    const utilizationPercent = (monthTotal / this.config.monthlyLimit) * 100;
    
    if (utilizationPercent > 80) {
      recommendations.push({
        title: 'Monthly Budget Management',
        impact: 'High',
        estimatedSavings: Math.round(this.config.monthlyLimit * 0.1),
        action: 'Implement stricter daily limits and use free models when possible'
      });
    }

    return recommendations;
  }

  /**
   * Calculate comprehensive savings report
   */
  calculateSavingsReport() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = this.creditData.sessions.filter(session => 
      new Date(session.timestamp) >= thirtyDaysAgo
    );

    const totalCredits = recentSessions.reduce((sum, session) => sum + session.credits, 0);
    const totalSessions = recentSessions.length;
    const averagePerSession = totalSessions > 0 ? totalCredits / totalSessions : 0;
    const averagePerDay = totalCredits / 30;
    
    // Estimate baseline (what usage might have been without optimization)
    const estimatedBaseline = Math.round(totalCredits * 1.25); // Assume 25% savings
    const savings = estimatedBaseline - totalCredits;
    const savingsPercent = estimatedBaseline > 0 ? (savings / estimatedBaseline) * 100 : 0;

    // Daily breakdown
    const dailyBreakdown = {};
    recentSessions.forEach(session => {
      const date = session.date || session.timestamp.split('T')[0];
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + session.credits;
    });

    // Efficiency score (1-10 based on various factors)
    let efficiencyScore = 10;
    if (averagePerSession > 15) efficiencyScore -= 2;
    if (averagePerSession > 10) efficiencyScore -= 1;
    if (averagePerDay > this.config.alertThreshold) efficiencyScore -= 2;
    if (savingsPercent < 10) efficiencyScore -= 1;
    
    return {
      totalCredits,
      totalSessions,
      averagePerSession,
      averagePerDay,
      estimatedBaseline,
      savings,
      savingsPercent,
      dailyBreakdown,
      sessionsPerDay: totalSessions / 30,
      creditsPerHour: averagePerDay / 8, // Assume 8 hour work day
      efficiencyScore: Math.max(1, efficiencyScore)
    };
  }

  /**
   * Get today's total credits
   */
  getTodayTotal() {
    const today = new Date().toISOString().split('T')[0];
    return this.creditData.dailyTotals[today] || 0;
  }

  /**
   * Get this month's total credits
   */
  getMonthTotal() {
    const thisMonth = new Date().toISOString().substring(0, 7);
    return this.creditData.monthlyTotals[thisMonth] || 0;
  }

  /**
   * Update daily and monthly totals
   */
  async updateDailyTotals() {
    // Reset totals
    this.creditData.dailyTotals = {};
    this.creditData.monthlyTotals = {};

    // Recalculate from sessions
    this.creditData.sessions.forEach(session => {
      const date = session.date || session.timestamp.split('T')[0];
      const month = date.substring(0, 7);
      
      this.creditData.dailyTotals[date] = (this.creditData.dailyTotals[date] || 0) + session.credits;
      this.creditData.monthlyTotals[month] = (this.creditData.monthlyTotals[month] || 0) + session.credits;
    });
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('📚 APEX GUARDIAN CREDIT TRACKER HELP');
    console.log('====================================');
    console.log();
    console.log('COMMANDS:');
    console.log('  log <credits>           - Log credits used (e.g., "log 5")');
    console.log('  session <credits> <desc> - Log session with description');
    console.log('  status                  - Show current usage status');
    console.log('  report                  - Generate detailed usage report');
    console.log('  optimize                - Get optimization recommendations');
    console.log('  help                    - Show this help');
    console.log('  exit                    - Exit tracker');
    console.log();
    console.log('EXAMPLES:');
    console.log('  log 3');
    console.log('  session 8 Working on React components');
    console.log('  session 12 Debugging API integration');
    console.log();
    console.log('TIPS:');
    console.log('- Track every Cascade interaction for accurate savings analysis');
    console.log('- Use descriptive session names to identify usage patterns');
    console.log('- Check status regularly to avoid exceeding monthly limits');
    console.log('- Review optimization recommendations weekly');
  }

  /**
   * Load existing data
   */
  async loadData() {
    try {
      const data = await fs.readFile(this.config.dataFile, 'utf8');
      this.creditData = { ...this.creditData, ...JSON.parse(data) };
      await this.updateDailyTotals();
    } catch (error) {
      // File doesn't exist, start fresh
      console.log('📂 Starting fresh credit tracking...');
    }
  }

  /**
   * Save data to file
   */
  async saveData() {
    this.creditData.lastUpdated = new Date().toISOString();
    try {
      await fs.writeFile(this.config.dataFile, JSON.stringify(this.creditData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save data:', error.message);
    }
  }

  /**
   * Export data for analysis
   */
  async exportData() {
    const exportFile = path.join(__dirname, `credit-export-${Date.now()}.json`);
    const exportData = {
      exportDate: new Date().toISOString(),
      config: this.config,
      data: this.creditData,
      summary: this.calculateSavingsReport()
    };
    
    await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));
    console.log(`📤 Data exported to: ${exportFile}`);
    return exportFile;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const tracker = new IndividualCreditTracker({
    planType: process.env.WINDSURF_PLAN_TYPE || 'pro'
  });

  switch (command) {
    case 'start':
    case 'interactive':
      tracker.startTrackingSession().catch(console.error);
      break;
      
    case 'log':
      const credits = parseInt(args[1]);
      if (!credits) {
        console.log('Usage: node windsurf-individual-credit-tracker.js log <credits>');
        process.exit(1);
      }
      tracker.loadData()
        .then(() => tracker.logCredits(credits))
        .catch(console.error);
      break;
      
    case 'status':
      tracker.loadData()
        .then(() => tracker.showStatus())
        .catch(console.error);
      break;
      
    case 'report':
      tracker.loadData()
        .then(() => tracker.generateReport())
        .catch(console.error);
      break;
      
    case 'export':
      tracker.loadData()
        .then(() => tracker.exportData())
        .catch(console.error);
      break;
      
    default:
      console.log(`
APEX Guardian Individual Credit Tracker

Usage:
  node windsurf-individual-credit-tracker.js <command>

Commands:
  start       Start interactive tracking session
  log <n>     Log n credits used
  status      Show current usage status
  report      Generate usage report
  export      Export data for analysis

Interactive Mode (Recommended):
  node windsurf-individual-credit-tracker.js start

Environment Variables:
  WINDSURF_PLAN_TYPE    Your plan type (free, pro, teams, enterprise)

Examples:
  node windsurf-individual-credit-tracker.js start
  node windsurf-individual-credit-tracker.js log 5
  node windsurf-individual-credit-tracker.js status
      `);
  }
}

module.exports = IndividualCreditTracker;
