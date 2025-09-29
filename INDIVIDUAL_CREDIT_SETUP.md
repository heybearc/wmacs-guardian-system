# APEX Guardian Individual Credit Tracking Setup

**Quick setup guide for individual Windsurf users (Pro, Free, Teams)**

## 🎯 What This Solves

Since Windsurf's Analytics API is **Enterprise-only**, individual users need a different approach to track credit usage and optimize costs. This individual tracker provides:

- ✅ **Local credit tracking** - Track your usage without API access
- ✅ **Savings analysis** - Identify optimization opportunities  
- ✅ **Budget management** - Stay within monthly credit limits
- ✅ **Usage patterns** - Understand your development habits
- ✅ **APEX integration** - Works with existing APEX Guardian system

## 🚀 Quick Start (2 minutes)

### 1. Your Service Key Works For Other Features
Your service key `f8f2168f-722a-4f22-ad2c-676bfdb361a2` is valid for:
- Individual user authentication
- Basic API access (non-Analytics)
- Future individual features

### 2. Start Individual Credit Tracking

```bash
cd /Users/cory/Documents/Cloudy-Work/shared/apex-guardian-system

# Start interactive tracker
node windsurf-individual-credit-tracker.js start
```

### 3. Track Your Usage

In the interactive mode:
```
📊 Credit Tracker> session 5 Working on React components
📊 Credit Tracker> log 3
📊 Credit Tracker> status
📊 Credit Tracker> report
```

## 📊 How to Track Credits

### Method 1: Check Windsurf Interface
1. In Windsurf, click the overflow menu (⋯)
2. Select "Cascade Usage"
3. Note the credits used
4. Log them in the tracker

### Method 2: Monitor Your Plan Page
1. Visit: https://windsurf.com/subscription/manage-plan
2. Check current usage
3. Log sessions in the tracker

### Method 3: Estimate from Conversations
- Simple questions: ~1-2 credits
- Code generation: ~3-8 credits  
- Complex debugging: ~5-15 credits
- Large refactoring: ~10-25 credits

## 🎮 Interactive Commands

```bash
# Start interactive session (recommended)
node windsurf-individual-credit-tracker.js start

# Quick commands
node windsurf-individual-credit-tracker.js log 5
node windsurf-individual-credit-tracker.js status
node windsurf-individual-credit-tracker.js report
```

### Interactive Mode Commands:
- `session 8 Debugging API` - Log session with description
- `log 3` - Quick credit logging
- `status` - Current usage status
- `report` - Detailed analysis
- `optimize` - Get recommendations
- `help` - Show all commands
- `exit` - Exit tracker

## 📈 Understanding Your Reports

### Status Output:
```
📊 CURRENT USAGE STATUS
========================
Plan: PRO (500 credits/month)
Today (2025-09-29): 8 credits
This Month (2025-09): 45 credits  
Remaining: 455 credits (91.0%)
Utilization: 9.0%
✅ Usage within normal range
```

### Report Analysis:
- **Total Credits**: Your actual usage
- **Estimated Baseline**: What you might have used without optimization
- **Savings**: Credits saved through better practices
- **Efficiency Score**: 1-10 rating of your usage patterns

## 🔧 Optimization Recommendations

The tracker will suggest optimizations like:

### High Impact:
- **Break large tasks** into smaller prompts
- **Use specific prompts** instead of vague requests
- **Avoid repetitive questions** - save responses
- **Choose appropriate models** for task complexity

### Medium Impact:
- **Set daily budgets** to control spending
- **Track patterns** to identify waste
- **Use free models** for simple tasks
- **Batch similar requests** together

### APEX Integration:
- **Enable response caching** for repeated queries
- **Use MCP batching** for similar operations
- **Implement smart prompting** strategies
- **Monitor efficiency trends** over time

## 📅 Daily Workflow

### Morning (30 seconds):
```bash
node windsurf-individual-credit-tracker.js status
```

### During Development:
- After each Cascade session, note credits used
- Log with: `session <credits> <description>`

### Evening (1 minute):
```bash
📊 Credit Tracker> status
📊 Credit Tracker> optimize  # if needed
```

### Weekly (2 minutes):
```bash
📊 Credit Tracker> report
📊 Credit Tracker> optimize
```

## 🎯 Plan-Specific Setup

### Free Plan (25 credits/month):
```bash
export WINDSURF_PLAN_TYPE=free
node windsurf-individual-credit-tracker.js start
```

### Pro Plan (500 credits/month):
```bash
export WINDSURF_PLAN_TYPE=pro  # default
node windsurf-individual-credit-tracker.js start
```

### Teams Plan (500 credits/user/month):
```bash
export WINDSURF_PLAN_TYPE=teams
node windsurf-individual-credit-tracker.js start
```

## 📊 Sample Usage Patterns

### Efficient Developer:
- 3-5 credits per session
- 20-30 credits per day
- 400-450 credits per month
- 10-20% savings through optimization

### Heavy User:
- 8-15 credits per session
- 50-80 credits per day
- 800+ credits per month (may need add-ons)
- 15-25% savings potential

### Casual User:
- 1-3 credits per session
- 5-15 credits per day
- 150-300 credits per month
- Focus on learning efficient prompting

## 🔄 Data Management

### Export Your Data:
```bash
node windsurf-individual-credit-tracker.js export
```

### Data Location:
- Stored locally: `individual-credit-data.json`
- No data sent to external servers
- Complete privacy and control

### Backup:
```bash
cp individual-credit-data.json individual-credit-backup-$(date +%Y%m%d).json
```

## 🆚 Enterprise vs Individual

| Feature | Enterprise API | Individual Tracker |
|---------|---------------|-------------------|
| Real-time API data | ✅ Automatic | ❌ Manual logging |
| Historical analytics | ✅ 3-hour refresh | ✅ Local storage |
| Team management | ✅ Multi-user | ❌ Single user |
| Cost | $$$ Enterprise plan | ✅ Free |
| Privacy | ☁️ Cloud-based | ✅ 100% local |
| Customization | ⚙️ Limited | ✅ Full control |

## 🎉 Success Metrics

After 1 week of tracking:
- ✅ Know your daily/monthly usage patterns
- ✅ Identify your most expensive activities  
- ✅ Have baseline for optimization

After 1 month:
- ✅ 10-20% reduction in credit usage
- ✅ Better prompting habits
- ✅ Predictable monthly costs
- ✅ Optimized development workflow

## 🚨 Troubleshooting

### "No data" showing:
- Make sure you've logged some sessions first
- Check that the data file was created: `ls -la individual-credit-data.json`

### High usage alerts:
- Review recent sessions with `status`
- Check optimization recommendations
- Consider breaking large tasks into smaller prompts

### Monthly limit approaching:
- Use `optimize` command for immediate suggestions
- Switch to free models for simple tasks
- Set stricter daily budgets

## 🔗 Integration with APEX Guardian

This individual tracker integrates with your existing APEX Guardian system:

1. **Shared optimizations** - Recommendations work across all APEX tools
2. **Project attribution** - Track credits by project manually
3. **MCP integration** - Optimize MCP operations based on credit usage
4. **Smart sync** - Include credit efficiency in sync decisions

---

**Ready to start?** Run: `node windsurf-individual-credit-tracker.js start`

**Questions?** Check the main documentation: `WINDSURF_CREDIT_MONITORING.md`
