-- Add generated columns for AI analysis fields
ALTER TABLE ph_launches
ADD COLUMN IF NOT EXISTS niche TEXT GENERATED ALWAYS AS (ai_analysis->>'niche') STORED,
ADD COLUMN IF NOT EXISTS icp TEXT GENERATED ALWAYS AS (ai_analysis->>'icp') STORED,
ADD COLUMN IF NOT EXISTS problem TEXT GENERATED ALWAYS AS (ai_analysis->>'problem') STORED;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ph_launches_niche ON ph_launches(niche);
CREATE INDEX IF NOT EXISTS idx_ph_launches_launched_at ON ph_launches(launched_at DESC);
