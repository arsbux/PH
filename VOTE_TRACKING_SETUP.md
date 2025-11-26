# Vote Tracking System Setup

This system tracks Product Hunt votes over time to generate real trendline charts.

## How It Works

1. **Database**: `vote_snapshots` table stores vote counts every 30 minutes
2. **API Endpoint**: `/api/snapshot-votes` fetches current votes and saves them
3. **Cron Job**: Calls the API every 30 minutes
4. **Dashboard**: Displays real growth curves from historical data

## Setup Instructions

### 1. Run Database Migration

Execute this in your Supabase SQL Editor:

```sql
-- Run the migration
\i supabase/migrations/create_vote_snapshots.sql
```

Or manually run:
```bash
# If you have psql installed
psql $DATABASE_URL < supabase/migrations/create_vote_snapshots.sql
```

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
# Generate a random secret for cron authentication
CRON_SECRET=your_random_secret_here_32_chars_min

# Already have these
PRODUCT_HUNT_API_TOKEN=your_ph_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Set Up Cron Job

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/snapshot-votes",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Then in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with your secret value

#### Option B: External Cron Service (cron-job.org, EasyCron, etc.)

Set up a cron job to POST to your endpoint every 30 minutes:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/snapshot-votes
```

Schedule: `*/30 * * * *` (every 30 minutes)

#### Option C: GitHub Actions (Free)

Create `.github/workflows/snapshot-votes.yml`:

```yaml
name: Snapshot Product Hunt Votes

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Call Snapshot API
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.vercel.app/api/snapshot-votes
```

Then add `CRON_SECRET` to GitHub Secrets.

### 4. Test the Setup

#### Manual Test

```bash
# Test the endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/snapshot-votes

# Should return:
{
  "success": true,
  "count": 10,
  "timestamp": "2025-11-25T11:00:00.000Z",
  "products": [...]
}
```

#### Check Database

```sql
SELECT 
  product_name, 
  votes_count, 
  snapshot_time 
FROM vote_snapshots 
ORDER BY snapshot_time DESC 
LIMIT 20;
```

You should see entries being created every 30 minutes.

### 5. First Run

The first snapshot will start collecting data. After **2-3 hours** you'll see actual trendlines on the chart as data accumulates.

## Monitoring

### Check Cron Status

```bash
# View recent snapshots
curl http://localhost:3000/api/snapshot-votes
```

### Logs to Watch

- Vercel Functions logs (if using Vercel Cron)
- Database row count in `vote_snapshots`
- Chart should show "No trendline data yet" until first snapshots are saved

## Data Lifecycle

- **Retention**: Keep 30 days of snapshots (add cleanup cron if needed)
- **Storage**: ~10 products × 48 snapshots/day × 30 days = ~14,400 rows/month
- **Cleanup Query** (run monthly):

```sql
DELETE FROM vote_snapshots 
WHERE snapshot_date < CURRENT_DATE - INTERVAL '30 days';
```

## Troubleshooting

### No trendlines showing?

1. Check if snapshots are being saved:
   ```sql
   SELECT COUNT(*) FROM vote_snapshots WHERE snapshot_date = CURRENT_DATE;
   ```

2. Verify cron is running (check logs)

3. Ensure `PRODUCT_HUNT_API_TOKEN` is valid

### Chart shows gaps?

- Normal if cron missed a few runs
- Trendlines will interpolate between points

### Too much data?

Reduce snapshot frequency to every hour instead of 30 min in cron schedule.
