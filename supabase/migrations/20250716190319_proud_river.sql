/*
  # Create Frames and Surveys Schema

  1. New Tables
    - `frames`
      - `id` (uuid, primary key)
      - `file_name` (text)
      - `dsl_number` (text)
      - `sector` (text)
      - `enterprises_count` (integer)
      - `status` (text)
      - `upload_date` (timestamp)
      - `uploaded_by` (uuid, references users)
    - `frame_allocations`
      - `id` (uuid, primary key)
      - `frame_id` (uuid, references frames)
      - `user_id` (uuid, references users)
      - `allocated_by` (uuid, references users)
      - `allocated_at` (timestamp)
    - `survey_schedules`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `sector` (text)
      - `year` (text)
      - `is_active` (boolean)
    - `survey_blocks`
      - `id` (uuid, primary key)
      - `schedule_id` (uuid, references survey_schedules)
      - `name` (text)
      - `description` (text)
      - `order_index` (integer)
    - `survey_fields`
      - `id` (uuid, primary key)
      - `block_id` (uuid, references survey_blocks)
      - `label` (text)
      - `field_type` (text)
      - `is_required` (boolean)
      - `validation_rules` (jsonb)
      - `order_index` (integer)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create frames table
CREATE TABLE IF NOT EXISTS frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  dsl_number text,
  sector text NOT NULL,
  enterprises_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'completed')),
  upload_date timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create frame_allocations table
CREATE TABLE IF NOT EXISTS frame_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id uuid REFERENCES frames(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  allocated_by uuid REFERENCES users(id),
  allocated_at timestamptz DEFAULT now(),
  UNIQUE(frame_id, user_id)
);

-- Create survey_schedules table
CREATE TABLE IF NOT EXISTS survey_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  sector text DEFAULT '',
  year text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_blocks table
CREATE TABLE IF NOT EXISTS survey_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES survey_schedules(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_fields table
CREATE TABLE IF NOT EXISTS survey_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES survey_blocks(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'textarea')),
  is_required boolean DEFAULT false,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for frames
CREATE POLICY "Users can read frames"
  ON frames
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CPG and Admin can manage frames"
  ON frames
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'CPG_USER')
    )
  );

-- RLS Policies for frame_allocations
CREATE POLICY "Users can read frame allocations"
  ON frame_allocations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CPG and RO can manage allocations"
  ON frame_allocations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'CPG_USER', 'RO_USER')
    )
  );

-- RLS Policies for survey_schedules
CREATE POLICY "Users can read survey schedules"
  ON survey_schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage survey schedules"
  ON survey_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- RLS Policies for survey_blocks
CREATE POLICY "Users can read survey blocks"
  ON survey_blocks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage survey blocks"
  ON survey_blocks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- RLS Policies for survey_fields
CREATE POLICY "Users can read survey fields"
  ON survey_fields
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage survey fields"
  ON survey_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );