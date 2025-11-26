-- Create table to store vote/comment snapshots over time
CREATE TABLE IF NOT EXISTS vote_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL,
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by date and product
CREATE INDEX IF NOT EXISTS idx_vote_snapshots_date ON vote_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_vote_snapshots_product ON vote_snapshots(product_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_vote_snapshots_time ON vote_snapshots(snapshot_time);

-- Composite index for chart queries
CREATE INDEX IF NOT EXISTS idx_vote_snapshots_date_product ON vote_snapshots(snapshot_date, product_id);

-- Grant permissions
GRANT ALL ON vote_snapshots TO anon, authenticated, service_role;

-- Disable RLS for simplicity (change if you need auth)
ALTER TABLE vote_snapshots DISABLE ROW LEVEL SECURITY;
