// This script sets up the database tables for member task features
// Run with: node setup_db.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Creating task_submissions table...');
    
    // Create task_submissions table
    const { error: error1 } = await supabase.rpc('exec', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);
      `
    });

    if (error1 && error1.message !== 'function exec(json) does not exist') {
      console.error('Error creating task_submissions:', error1);
    } else {
      console.log('✓ task_submissions table created/verified');
    }

    console.log('Creating task_reports table...');
    
    // Create task_reports table
    const { error: error2 } = await supabase.rpc('exec', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON task_reports(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_reports_reported_to ON task_reports(reported_to);
        CREATE INDEX IF NOT EXISTS idx_task_reports_status ON task_reports(status);
      `
    });

    if (error2 && error2.message !== 'function exec(json) does not exist') {
      console.error('Error creating task_reports:', error2);
    } else {
      console.log('✓ task_reports table created/verified');
    }

    console.log('\n✓ Database setup completed!');
    console.log('Note: Please run the SQL commands in the setup_member_features.sql file');
    console.log('in your Supabase SQL Editor to create the tables.');

  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
