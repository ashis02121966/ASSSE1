/*
  # Create Enterprise and Survey Management Tables

  1. New Tables
    - `enterprises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `gstn` (text, unique)
      - `address` (text)
      - `contact_person` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `sector` (text)
      - `district` (text)
      - `state` (text)
      - `pin_code` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `survey_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `version` (text)
      - `is_active` (boolean)
      - `template_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `enterprise_surveys`
      - `id` (uuid, primary key)
      - `enterprise_id` (uuid, references enterprises)
      - `survey_id` (uuid, references surveys)
      - `template_id` (uuid, references survey_templates)
      - `status` (text)
      - `assigned_to` (uuid, references users)
      - `due_date` (timestamp)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `table_name` (text)
      - `record_id` (uuid)
      - `action` (text)
      - `old_values` (jsonb)
      - `new_values` (jsonb)
      - `user_id` (uuid, references users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for different user roles
*/

-- Create enterprises table
CREATE TABLE IF NOT EXISTS enterprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gstn text UNIQUE,
  address text,
  contact_person text,
  contact_phone text,
  contact_email text,
  sector text,
  district text,
  state text,
  pin_code text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_templates table
CREATE TABLE IF NOT EXISTS survey_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version text DEFAULT '1.0',
  is_active boolean DEFAULT true,
  template_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enterprise_surveys table
CREATE TABLE IF NOT EXISTS enterprise_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  template_id uuid REFERENCES survey_templates(id),
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled')),
  assigned_to uuid REFERENCES users(id),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(enterprise_id, survey_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enterprises_gstn ON enterprises(gstn);
CREATE INDEX IF NOT EXISTS idx_enterprises_sector ON enterprises(sector);
CREATE INDEX IF NOT EXISTS idx_enterprises_status ON enterprises(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_surveys_enterprise_id ON enterprise_surveys(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_surveys_status ON enterprise_surveys(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable RLS
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enterprises
CREATE POLICY "Users can read enterprises"
  ON enterprises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage enterprises"
  ON enterprises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'CPG_USER', 'RO_USER', 'SSO_USER')
    )
  );

-- RLS Policies for survey_templates
CREATE POLICY "Users can read survey templates"
  ON survey_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage survey templates"
  ON survey_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- RLS Policies for enterprise_surveys
CREATE POLICY "Users can read assigned enterprise surveys"
  ON enterprise_surveys
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'CPG_USER', 'RO_USER', 'DS_USER')
    )
  );

CREATE POLICY "Authorized users can manage enterprise surveys"
  ON enterprise_surveys
  FOR ALL
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'CPG_USER', 'RO_USER', 'SSO_USER')
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Users can read relevant audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code IN ('ENSD_ADMIN', 'DS_USER')
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON enterprises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_templates_updated_at BEFORE UPDATE ON survey_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_surveys_updated_at BEFORE UPDATE ON enterprise_surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_enterprises_trigger
    AFTER INSERT OR UPDATE OR DELETE ON enterprises
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_survey_templates_trigger
    AFTER INSERT OR UPDATE OR DELETE ON survey_templates
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_enterprise_surveys_trigger
    AFTER INSERT OR UPDATE OR DELETE ON enterprise_surveys
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();