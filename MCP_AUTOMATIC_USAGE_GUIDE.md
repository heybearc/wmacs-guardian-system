# APEX MCP Automatic Usage Guide

## 🎯 How MCP Servers Work Automatically on Every Prompt

### Automatic Activation

The APEX MCP Federation operates **transparently** - you don't need to explicitly call MCP tools. They activate automatically based on your prompts and context.

## 🚀 Automatic Triggers by Prompt Type

### Database Operations
**Trigger Words**: "database", "query", "data", "volunteers", "assignments", "export", "import"

**What Happens Automatically**:
```
User: "Show me the volunteer data"
→ Automatically triggers: ldc_volunteer_management with action "list"
→ Batches with any other pending database operations
→ Caches result for 60 seconds
→ Credit Savings: 15-20%
```

**User: "Get assignment data for JW Attendant"**
```
→ Automatically triggers: jw_assignment_operations
→ Intelligent batching with related operations
→ Role-based optimization applied
→ Credit Savings: 15-25%
```

### Health and Status Checks
**Trigger Words**: "status", "health", "check", "running", "working", "available"

**What Happens Automatically**:
```
User: "Is the LDC system working?"
→ Automatically triggers: ldc_health_check with caching enabled
→ Returns cached result if checked within last 60 seconds
→ Credit Savings: 10-15% (cache hit)
```

**User: "Check both LDC and JW systems"**
```
→ Automatically triggers: batch_multi_project_operations
→ Combines health checks for both projects
→ Prevents resource conflicts
→ Credit Savings: 20-25%
```

### Migration and Schema Operations
**Trigger Words**: "migrate", "postgresql", "database", "schema", "phase 2"

**What Happens Automatically**:
```
User: "Plan the PostgreSQL migration"
→ Automatically triggers: ldc_postgresql_migration with dryRun: true
→ Validates migration plan without executing
→ Prevents costly failed migrations
→ Credit Savings: Planning prevents failures
```

### Cross-Project Operations
**Trigger Words**: "both projects", "LDC and JW", "all systems", "federation"

**What Happens Automatically**:
```
User: "Get status of all projects"
→ Automatically triggers: global_credit_savings_report
→ Routes to appropriate project MCPs
→ Batches operations across projects
→ Credit Savings: 20-30%
```

## 💡 Smart Context Detection

### Project Context Recognition
The federation coordinator automatically detects which project you're working with:

**Working Directory Detection**:
- `/Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools/` → LDC MCP
- `/Users/cory/Documents/Cloudy-Work/applications/jw-attendant-scheduler/` → JW MCP
- Cross-directory operations → Federation Coordinator

**Content Analysis**:
- Mentions of "volunteers", "trade teams", "crews" → LDC MCP
- Mentions of "attendants", "assignments", "events" → JW MCP
- Mentions of "both", "federation", "all projects" → Federation Coordinator

## 📊 Automatic Credit Optimization

### Operation Batching
**How It Works**:
1. MCP servers detect multiple related operations
2. Automatically batch them into single requests
3. Execute as one optimized operation
4. Return combined results

**Example**:
```
User: "Show volunteer count, health status, and recent exports"
→ Batched into: ldc_volunteer_management + ldc_health_check + ldc_database_operations
→ 3 operations → 1 batched request
→ Credit Savings: 66% (3→1 operations)
```

### Response Caching
**How It Works**:
1. Frequently requested data is automatically cached
2. Cache TTL prevents stale data (60 seconds default)
3. Cache hits return instant results with credit savings

**Example**:
```
First Request: "Check LDC health"
→ Full health check executed
→ Result cached for 60 seconds

Second Request (within 60s): "Is LDC working?"
→ Cached result returned instantly
→ Credit Savings: 100% (no API call)
```

### Query Optimization
**How It Works**:
1. Database queries are automatically optimized
2. Redundant operations are eliminated
3. Efficient data fetching strategies applied

**Example**:
```
User: "Show all volunteers and their teams"
→ Optimized query: Single join operation instead of multiple queries
→ Intelligent data fetching with minimal overhead
→ Credit Savings: 15-20%
```

## 🎯 Monitoring Your Savings

### Automatic Savings Tracking
Every operation automatically tracks credit savings:

**View Current Savings**:
```
User: "How much am I saving with MCP?"
→ Automatically triggers: global_credit_savings_report
→ Shows real-time savings metrics
→ Displays optimization effectiveness
```

**Typical Response**:
```
💰 APEX Federation Credit Savings Report

📊 Global Optimization Metrics:
- Total Batched Operations: 45
- Total Cached Responses: 23
- Total Optimized Queries: 31
- Conflicts Prevented: 8
- Project Routings: 67

💸 Federation Credit Savings: 22%

🎯 Active Projects: 2
⚡ Total Optimized Operations: 99
```

## 🔧 Customizing Automatic Behavior

### Cache Duration
Default: 60 seconds for health checks, 5 minutes for data queries

**Override Example**:
```
User: "Check LDC health with fresh data"
→ Automatically uses: ldc_health_check with useCache: false
→ Forces fresh check, updates cache
```

### Batch Size
Default: 50 operations per batch

**Automatic Adjustment**:
- Small operations: Larger batches (up to 100)
- Complex operations: Smaller batches (10-25)
- Cross-project operations: Optimized batching

### Project Routing
**Manual Override**:
```
User: "Check JW health from LDC directory"
→ Automatically detects context mismatch
→ Routes to correct JW MCP server
→ Prevents operation failures
```

## 🚨 Error Handling and Fallbacks

### Automatic Fallbacks
If an MCP server fails, the system automatically:
1. Retries with simplified parameters
2. Falls back to basic operations
3. Logs the failure for debugging
4. Continues with available servers

### Graceful Degradation
- If caching fails → Direct operations continue
- If batching fails → Individual operations execute
- If routing fails → Default to current project context

## 📋 Best Practices for Maximum Savings

### Phrase Your Requests for Optimization
**Good**: "Show me LDC volunteer data and system health"
- Triggers automatic batching
- Single optimized operation

**Less Optimal**: "Show volunteers. Also check if system is healthy."
- May trigger separate operations
- Less batching opportunity

### Use Project Context
**Good**: "Check both LDC and JW systems"
- Triggers federation coordinator
- Cross-project optimization

**Less Optimal**: "Check LDC. Check JW."
- May trigger separate project operations
- Less federation benefits

### Leverage Caching
**Good**: "Is the system still working?" (within 60 seconds of previous check)
- Uses cached result
- 100% credit savings

**Less Optimal**: "Force check system status"
- Bypasses cache
- Full operation cost

## ✅ Verification

### Confirm MCP is Working
```
User: "Show me current credit savings"
→ Should automatically trigger: global_credit_savings_report
→ Should show non-zero savings metrics
→ Should display active optimization
```

### Test Automatic Batching
```
User: "Show LDC volunteers, health, and recent activity"
→ Should batch into single operation
→ Should show batching in credit savings report
→ Should complete faster than separate requests
```

---

**The APEX MCP Federation works automatically on every prompt, optimizing operations for maximum credit savings while maintaining full functionality. No manual intervention required - just use Windsurf normally and enjoy 15-25% credit savings!**
