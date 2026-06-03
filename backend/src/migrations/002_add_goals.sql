ALTER TABLE habits
ADD COLUMN IF NOT EXISTS goal_type VARCHAR(10) DEFAULT 'daily' CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS goal_value INTEGER DEFAULT 1;
