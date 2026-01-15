-- Create task_submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);

-- Create task_reports table
CREATE TABLE IF NOT EXISTS task_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reported_to UUID NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON task_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_reported_to ON task_reports(reported_to);
CREATE INDEX IF NOT EXISTS idx_task_reports_status ON task_reports(status);

-- Disable RLS on new tables for testing
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_reports DISABLE ROW LEVEL SECURITY;
