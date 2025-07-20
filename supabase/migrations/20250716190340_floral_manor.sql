/*
  # Create Surveys and Notices Schema

  1. New Tables
    - `surveys`
      - `id` (uuid, primary key)
      - `frame_id` (uuid, references frames)
      - `enterprise_id` (text)
      - `schedule_id` (uuid, references survey_schedules)
      - `status` (text)
      - `compiler_id` (uuid, references users)
      - `scrutinizer_id` (uuid, references users)
      - `last_modified` (timestamp)
    - `survey_responses`
      - `id` (uuid, primary key)
      - `survey_id` (uuid, references surveys)
      - `field_id` (uuid, references survey_fields)
      - `value` (text)
      - `updated_at` (timestamp)
    - `scrutiny_comments`
      - `id` (uuid, primary key)
      - `survey_id` (uuid, references surveys)
      - `block_id` (uuid, references survey_blocks)
      - `field_id` (uuid, references survey_fields)
      - `comment` (text)
      - `scrutinizer_id` (uuid, references users)
      - `is_resolved` (boolean)
    - `notices`
      - `id` (uuid, primary key)
      - `frame_id` (uuid, references frames)
      - `enterprise_name` (text)
      - `enterprise_address` (text)
      - `template_type` (text)
      - `signatory_id` (uuid, references users)
      - `status` (text)
      - `generated_date` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id uuid REFERENCES frames(id) ON DELETE CASCADE,
  enterprise_id text NOT NULL,
  schedule_id uuid REFERENCES survey_schedules(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'scrutiny', 'approved', 'rejected')),
  compiler_id uuid REFERENCES users(id),
  scrutinizer_id uuid REFERENCES users(id),
  last_modified timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  field_id uuid REFERENCES survey_fields(id) ON DELETE CASCADE,
  value text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(survey_id, field_id)
);

-- Create scrutiny_comments table
CREATE TABLE IF NOT EXISTS scrutiny_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  block_id uuid REFERENCES survey_blocks(id),
  field_id uuid REFERENCES survey_fields(id),
  comment text NOT NULL,
  scrutinizer_id uuid REFERENCES users(id),
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id uuid REFERENCES frames(id) ON DELETE CASCADE,
  enterprise_name text NOT NULL,
  enterprise_address text NOT NULL,
  template_type text DEFAULT 'default',
  signatory_id uuid REFERENCES users(id),
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'received')),
  generated_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrutiny_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surveys
CREATE POLICY "Users can read assigned surveys"
  ON surveys
  FOR SELECT
  TO authenticated
  USING (
    compiler_id = auth.uid() OR 
    scrutinizer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'DS_USER')
    )
  );

CREATE POLICY "Compilers can update their surveys"
  ON surveys
  FOR UPDATE
  TO authenticated
  USING (compiler_id = auth.uid());

CREATE POLICY "SSO users can create surveys"
  ON surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('SSO_USER', 'ENSD_ADMIN')
    )
  );

-- RLS Policies for survey_responses
CREATE POLICY "Users can read survey responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys s 
      WHERE s.id = survey_id AND (
        s.compiler_id = auth.uid() OR 
        s.scrutinizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_role_assignments ura
          JOIN user_roles ur ON ura.role_id = ur.id
          WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'DS_USER')
        )
      )
    )
  );

CREATE POLICY "Compilers can manage survey responses"
  ON survey_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys s 
      WHERE s.id = survey_id AND s.compiler_id = auth.uid()
    )
  );

-- RLS Policies for scrutiny_comments
CREATE POLICY "Users can read scrutiny comments"
  ON scrutiny_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys s 
      WHERE s.id = survey_id AND (
        s.compiler_id = auth.uid() OR 
        s.scrutinizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_role_assignments ura
          JOIN user_roles ur ON ura.role_id = ur.id
          WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'DS_USER')
        )
      )
    )
  );

CREATE POLICY "Scrutinizers can manage comments"
  ON scrutiny_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('SSO_USER', 'DS_USER', 'ENSD_ADMIN')
    )
  );

-- RLS Policies for notices
CREATE POLICY "Users can read notices"
  ON notices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "RO users can manage notices"
  ON notices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('RO_USER', 'ENSD_ADMIN')
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);