# APEX Guardian Windsurf Credit Monitoring System

**Real-time credit usage tracking and savings optimization for Windsurf IDE**

## 🎯 Overview

The APEX Guardian Windsurf Credit Monitoring System provides real-time tracking of your Windsurf credit usage, identifies savings opportunities, and helps optimize your AI development costs. This system integrates seamlessly with your existing APEX Guardian infrastructure.

## ✨ Features

- **Real-time Credit Tracking** - Monitor credit usage every 3 minutes
- **Savings Analysis** - Calculate before/after savings with optimization recommendations
- **Waste Detection** - Identify inefficient usage patterns and credit waste
- **Interactive Dashboard** - Live terminal dashboard with usage graphs and alerts
- **Project Attribution** - Track credit usage by project with budget management
- **APEX Integration** - Seamless integration with existing APEX Guardian system
- **Automated Optimization** - Auto-enable optimizations when savings targets aren't met

## 🚀 Quick Start

### 1. Prerequisites

- Windsurf Enterprise plan (Analytics API required)
- Node.js 14+ installed
- APEX Guardian system (this repository)

### 2. Get Windsurf Service Key

1. Navigate to your [Windsurf team settings](https://windsurf.com/team/settings)
2. Go to the "Service Keys" section
3. Create a new service key with "Teams Read-only" permissions
4. Copy the generated service key

### 3. Set Environment Variable

```bash
export WINDSURF_SERVICE_KEY="your_service_key_here"
```

### 4. Install Dependencies

```bash
cd /path/to/apex-guardian-system
npm install
```

### 5. Start Monitoring

```bash
# Start basic credit monitoring
node windsurf-credit-monitor.js start

# Start real-time dashboard
node credit-dashboard.js

# Start integrated APEX monitoring
node apex-credit-integration.js start
```

## 📊 Components

### 1. WindsurfCreditMonitor (`windsurf-credit-monitor.js`)

Core monitoring engine that collects credit usage data from Windsurf Analytics API.

**Features:**
- Real-time data collection every 3 minutes
- Credit usage history with 30-day retention
- Savings calculation and trend analysis
- Waste detection algorithms
- Configurable alert thresholds

**Usage:**
```bash
# Start monitoring
node windsurf-credit-monitor.js start

# Get current status
node windsurf-credit-monitor.js status

# Generate usage report
node windsurf-credit-monitor.js report

# Test API connection
node windsurf-credit-monitor.js test
```

### 2. CreditDashboard (`credit-dashboard.js`)

Interactive terminal dashboard for real-time credit monitoring.

**Features:**
- Live credit usage display
- ASCII usage graphs
- Real-time alerts and warnings
- 24-hour usage summary
- Savings target tracking

**Usage:**
```bash
node credit-dashboard.js
```

**Dashboard Sections:**
- 📊 **Real-time Status** - Current monitoring status and data freshness
- 💳 **Credit Usage** - Hourly rate, daily/monthly projections
- 💰 **Savings Analysis** - Current savings percentage and targets
- 📈 **24 Hour Summary** - Usage statistics and efficiency metrics
- 🚨 **Alerts** - Warnings for high usage, waste detection, budget issues
- 📊 **Usage Trend** - ASCII graph of recent usage patterns

### 3. APEXCreditIntegration (`apex-credit-integration.js`)

Integration layer that connects credit monitoring with APEX Guardian system.

**Features:**
- Project-specific credit attribution
- Budget management per project
- APEX-specific optimizations
- Automated optimization triggers
- Integrated reporting

**Usage:**
```bash
# Start integrated monitoring
node apex-credit-integration.js start

# Generate integrated report
node apex-credit-integration.js report

# Check integration status
node apex-credit-integration.js status
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required
WINDSURF_SERVICE_KEY="your_service_key_here"

# Optional
WINDSURF_REFRESH_INTERVAL=180000    # 3 minutes
WINDSURF_ALERT_THRESHOLD=100        # Alert if >100 credits/hour
WINDSURF_SAVINGS_TARGET=0.20        # Target 20% savings
```

### Project Configuration

Edit `apex-credit-integration.js` to configure your projects:

```javascript
projectMappings: {
  'your-project-name': {
    path: '/path/to/your/project',
    priority: 'high',           // high, medium, low
    budgetLimit: 1000          // credits per day
  }
}
```

## 📈 Understanding the Metrics

### Credit Usage Metrics

- **Credits/Hour** - Current rate of credit consumption
- **Daily Projection** - Estimated credits for full day based on current rate
- **Monthly Projection** - Estimated monthly usage
- **Efficiency** - Lines of code generated per credit spent

### Savings Metrics

- **Savings Percentage** - Reduction compared to baseline usage
- **Daily Savings** - Credits saved per day
- **Monthly Savings** - Projected monthly savings
- **Target Achievement** - Whether savings target is met

### Status Indicators

- 🟢 **Optimized** - Meeting or exceeding savings targets
- 🟡 **Normal** - Standard usage within expected ranges
- 🟠 **High Usage** - Above normal usage levels
- 🔴 **Waste Detected** - Inefficient usage patterns identified
- ⚪ **Initializing** - System starting up or insufficient data

## 🚨 Alerts and Warnings

### High Usage Alert
Triggered when credit usage exceeds configured threshold (default: 100 credits/hour).

### Waste Detection
Identifies patterns like:
- High credit usage with low code output
- Sudden usage spikes (>200% increase)
- Inefficient prompt patterns

### Budget Warnings
- **80% Budget** - Warning when project approaches budget limit
- **100% Budget** - Critical alert when budget is exceeded

### Savings Target Alerts
- Notification when savings fall below target percentage
- Recommendations for optimization

## 🔧 Optimization Recommendations

### Automatic Optimizations

The system can automatically enable optimizations when savings targets aren't met:

1. **MCP Operation Batching** - Batch similar operations to reduce API calls
2. **Response Caching** - Cache responses to avoid redundant requests
3. **Model Selection Optimization** - Use appropriate models for task complexity

### Manual Optimizations

1. **Review Prompts** - Analyze high-cost conversations for efficiency
2. **Use Lighter Models** - Switch to Base Model for simple tasks
3. **Implement Caching** - Add project-level response caching
4. **Batch Operations** - Group similar requests together

## 📊 API Reference

### Windsurf Analytics API Endpoints Used

- **POST /api/v1/CascadeAnalytics** - Get credit usage data
  - `cascade_runs` - Model usage and credit consumption
  - `cascade_lines` - Lines suggested/accepted
  - `cascade_tool_usage` - Tool usage statistics

### Data Sources

- **cascade_runs** provides:
  - `promptsUsed` - Credits consumed (in cents)
  - `model` - Model name used
  - `mode` - Cascade mode (Write/Read/Legacy)
  - `messagesSent` - Number of messages

## 🔒 Security Considerations

1. **Service Key Protection**
   - Never commit service keys to version control
   - Use environment variables only
   - Rotate keys regularly

2. **Data Privacy**
   - Credit monitoring data is stored locally
   - No conversation content is accessed
   - Only usage metrics are collected

3. **API Rate Limits**
   - System respects Windsurf API rate limits
   - Data refreshes every 3 hours (API limitation)
   - Monitoring interval is configurable

## 🛠️ Troubleshooting

### Common Issues

**"Service key required" Error**
```bash
# Set your service key
export WINDSURF_SERVICE_KEY="your_key_here"
```

**"API Error 401: Unauthorized"**
- Verify service key is correct
- Ensure key has "Teams Read-only" permissions
- Check if key has expired

**"No recent data" Alert**
- Windsurf API refreshes every 3 hours
- Check API connection with test command
- Verify you have recent Windsurf usage

**Dashboard Not Updating**
- Check terminal size (minimum 80 characters wide)
- Verify monitoring is active
- Check for API errors in logs

### Debug Commands

```bash
# Test API connection
node windsurf-credit-monitor.js test

# Check current status
node windsurf-credit-monitor.js status

# View detailed logs
DEBUG=apex:credit node windsurf-credit-monitor.js start
```

## 📋 Integration with APEX Guardian

The credit monitoring system integrates with existing APEX Guardian components:

1. **MCP Federation** - Optimizes MCP operations based on credit usage
2. **Smart Sync** - Includes credit efficiency in sync decisions
3. **Deployment Standards** - Considers credit budgets in deployment planning
4. **Research Advisor** - Provides credit-aware optimization recommendations

## 🎯 Best Practices

1. **Set Realistic Budgets** - Start with generous budgets and optimize down
2. **Monitor Regularly** - Check dashboard daily during active development
3. **Review Recommendations** - Act on optimization suggestions promptly
4. **Track Trends** - Look for patterns in usage over time
5. **Project Isolation** - Use separate budgets for different projects

## 📈 Expected Savings

With proper optimization, expect:
- **15-25%** credit savings through intelligent batching
- **10-20%** savings from response caching
- **5-15%** savings from model optimization
- **Overall 20-40%** total savings potential

## 🔄 Updates and Maintenance

The system automatically:
- Cleans up old data (30-day retention)
- Optimizes settings based on usage patterns
- Updates project budgets based on trends
- Generates periodic reports

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review APEX Guardian documentation
3. Check Windsurf Analytics API status
4. Verify service key permissions

---

**Version**: 1.0.0  
**Last Updated**: 2025-09-28  
**Maintainer**: APEX Guardian System
