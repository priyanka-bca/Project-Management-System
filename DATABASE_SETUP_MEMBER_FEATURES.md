# Database Setup for Member Task Features

Run these SQL commands in Supabase SQL Editor to create the necessary tables:

## 1. Create task_submissions table
```sql
CREATE TABLE task_submissions (
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
CREATE INDEX idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX idx_task_submissions_user_id ON task_submissions(user_id);
```

## 2. Create task_reports table
```sql
CREATE TABLE task_reports (
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
CREATE INDEX idx_task_reports_task_id ON task_reports(task_id);
CREATE INDEX idx_task_reports_reported_to ON task_reports(reported_to);
CREATE INDEX idx_task_reports_status ON task_reports(status);
```

## 3. Create Supabase Storage bucket for task submissions
In Supabase Storage:
- Create a new bucket named `task-submissions`
- Set it as **PUBLIC** (or configure custom CORS if needed)
- This is where uploaded documents will be stored

## 4. Update tasks table if needed
The tasks table should already have these columns:
- `document_submitted` (BOOLEAN) - marks if member submitted a document
- `progress` (INTEGER) - percentage completion (0-100)
- `due_date` (TIMESTAMP) - task deadline

If not present, add them:
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS document_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
```

## 5. Optional: Disable RLS on new tables (for testing, enable in production)
```sql
ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_reports DISABLE ROW LEVEL SECURITY;
```
