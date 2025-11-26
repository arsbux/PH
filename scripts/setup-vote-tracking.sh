#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📊 Setting up Vote Snapshots Table${NC}\n"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
fi

# Load environment variables
source .env.local

# Verify required env vars
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing Supabase credentials in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo -e "\n${YELLOW}Creating vote_snapshots table...${NC}\n"

# Run the migration using curl to Supabase SQL API
curl -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  --data @- << 'EOF'
{
  "query": "CREATE TABLE IF NOT EXISTS vote_snapshots (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, product_id TEXT NOT NULL, product_name TEXT NOT NULL, votes_count INTEGER NOT NULL DEFAULT 0, comments_count INTEGER NOT NULL DEFAULT 0, snapshot_date DATE NOT NULL, snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_vote_snapshots_date ON vote_snapshots(snapshot_date); CREATE INDEX IF NOT EXISTS idx_vote_snapshots_product ON vote_snapshots(product_id, snapshot_date); CREATE INDEX IF NOT EXISTS idx_vote_snapshots_time ON vote_snapshots(snapshot_time); GRANT ALL ON vote_snapshots TO anon, authenticated, service_role; ALTER TABLE vote_snapshots DISABLE ROW LEVEL SECURITY;"
}
EOF

echo -e "\n\n${GREEN}✓ Migration complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Test the snapshot API:"
echo -e "   ${GREEN}npm run snapshot${NC}"
echo -e "\n2. Or manually:"
echo -e "   ${GREEN}curl -X POST -H 'Authorization: Bearer mp_cron_secret_2025_producthunt_analytics_tracker_v1_secure' http://localhost:3000/api/snapshot-votes${NC}"
