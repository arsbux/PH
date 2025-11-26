# Automated Vote Tracking Setup

Now that you have the snapshot system working, here's how to automate it without manual curl commands:

## ✅ Option 1: GitHub Actions (Recommended - Free & Easy)

### Setup:

1. **Add Secret to GitHub**:
   - Go to your GitHub repo → Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `CRON_SECRET`
   - Value: `mp_cron_secret_2025_producthunt_analytics_tracker_v1_secure`

2. **Deploy your app** (Vercel, Railway, etc.) and update the workflow:
   - Edit `.github/workflows/snapshot-votes.yml`
   - Replace `https://your-domain.vercel.app` with your actual URL

3. **Commit and push**:
   ```bash
   git add .github/workflows/snapshot-votes.yml
   git commit -m "Add automated vote snapshots"
   git push
   ```

4. **Verify it's running**:
   - Go to GitHub → Your Repo → Actions tab
   - You'll see "Snapshot Product Hunt Votes" running every 5 minutes
   - Click on a run to see logs

### Manual Trigger:
You can also run it manually from GitHub Actions → Select workflow → "Run workflow"

---

## ✅ Option 2: Vercel Cron (For Vercel Deployments)

### Setup:

1. **The `vercel.json` file is already created** with the cron configuration

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Add environment variable in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `CRON_SECRET` = `mp_cron_secret_2025_producthunt_analytics_tracker_v1_secure`

4. **Verify**:
   - Vercel automatically runs the cron job every 5 minutes
   - Check logs in Vercel Dashboard → Your Project → Functions → Logs

---

## ✅ Option 3: External Cron Service (Backup)

If you don't use GitHub Actions or Vercel, use [cron-job.org](https://cron-job.org):

1. **Create free account** at cron-job.org

2. **Create new cron job**:
   - URL: `https://your-domain.com/api/snapshot-votes`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Method: POST
   - Headers: `Authorization: Bearer mp_cron_secret_2025_producthunt_analytics_tracker_v1_secure`

3. **Save and activate**

---

## Testing

### Test the endpoint manually:
```bash
curl -X POST \
  -H "Authorization: Bearer mp_cron_secret_2025_producthunt_analytics_tracker_v1_secure" \
  https://your-domain.com/api/snapshot-votes
```

Expected response:
```json
{
  "success": true,
  "count": 20,
  "timestamp": "2025-11-25T...",
  "products": [...]
}
```

---

## Monitoring

### Check if snapshots are running:

**In Database** (Supabase SQL Editor):
```sql
SELECT 
  snapshot_date,
  snapshot_time,
  COUNT(*) as snapshot_count,
  STRING_AGG(DISTINCT product_name, ', ') as products
FROM vote_snapshots
WHERE snapshot_date >= CURRENT_DATE - 1
GROUP BY snapshot_date, snapshot_time
ORDER BY snapshot_time DESC
LIMIT 20;
```

**Expected**: You should see new rows every 5 minutes

---

## Troubleshooting

### GitHub Actions:
- Check Actions tab for errors
- Verify secret is set correctly
- Make sure URL is correct (not localhost)

### Vercel Cron:
- Check Function logs in Vercel dashboard
- Verify environment variable is set
- Cron jobs only work on production deployments

### General:
- Endpoint returns 401? Check `CRON_SECRET` matches
- No new snapshots? Check your deployment URL is accessible
- Check Product Hunt API rate limits (shouldn't be an issue with 5-min intervals)

---

## Next Steps

1. **Choose your preferred method** (GitHub Actions recommended)
2. **Set it up** following the steps above
3. **Wait 30 minutes** - you'll have 6 new snapshots
4. **Check the chart** - smooth trendlines will appear!

After 24 hours, you'll have 288 data points creating beautiful smooth curves like Hunted.Space! 📈
