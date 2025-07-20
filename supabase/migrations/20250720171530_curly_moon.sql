/*
  # Create Survey Block Items Schema

  1. New Tables
    - `survey_block_items`
      - `id` (uuid, primary key)
      - `block_id` (uuid, references survey_blocks)
      - `item_id` (text, unique within block)
      - `item_name` (text)
      - `data_type` (text)
      - `max_length` (integer)
      - `is_required` (boolean)
      - `validation_rules` (jsonb)
      - `options` (jsonb)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add template_id to survey_blocks for template inheritance
    - Add is_template flag to survey_blocks

  3. Security
    - Enable RLS on survey_block_items
    - Add appropriate policies
*/

-- Add template support to survey_blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_blocks' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE survey_blocks ADD COLUMN template_id uuid REFERENCES survey_blocks(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_blocks' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE survey_blocks ADD COLUMN is_template boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_blocks' AND column_name = 'category'
  ) THEN
    ALTER TABLE survey_blocks ADD COLUMN category text DEFAULT '';
  END IF;
END $$;

-- Create survey_block_items table
CREATE TABLE IF NOT EXISTS survey_block_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES survey_blocks(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_name text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio', 'email', 'tel', 'url')),
  max_length integer DEFAULT 255,
  is_required boolean DEFAULT false,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  options jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(block_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_block_items_block_id ON survey_block_items(block_id);
CREATE INDEX IF NOT EXISTS idx_survey_block_items_order ON survey_block_items(block_id, order_index);
CREATE INDEX IF NOT EXISTS idx_survey_blocks_template ON survey_blocks(template_id);
CREATE INDEX IF NOT EXISTS idx_survey_blocks_is_template ON survey_blocks(is_template);

-- Enable RLS
ALTER TABLE survey_block_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for survey_block_items
CREATE POLICY "Users can read survey block items"
  ON survey_block_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage survey block items"
  ON survey_block_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_survey_block_items_updated_at BEFORE UPDATE ON survey_block_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert template blocks
INSERT INTO survey_blocks (name, description, schedule_id, order_index, is_template, category) VALUES
  ('Basic Information Template', 'Template for basic enterprise information', null, 0, true, 'Basic'),
  ('Financial Information Template', 'Template for financial data collection', null, 0, true, 'Financial'),
  ('Employment Information Template', 'Template for employment and labor data', null, 0, true, 'Employment')
ON CONFLICT DO NOTHING;

-- Get template IDs for inserting items
DO $$
DECLARE
  basic_template_id uuid;
  financial_template_id uuid;
  employment_template_id uuid;
BEGIN
  SELECT id INTO basic_template_id FROM survey_blocks WHERE name = 'Basic Information Template' AND is_template = true;
  SELECT id INTO financial_template_id FROM survey_blocks WHERE name = 'Financial Information Template' AND is_template = true;
  SELECT id INTO employment_template_id FROM survey_blocks WHERE name = 'Employment Information Template' AND is_template = true;

  -- Insert basic template items
  IF basic_template_id IS NOT NULL THEN
    INSERT INTO survey_block_items (block_id, item_id, item_name, data_type, max_length, is_required, order_index) VALUES
      (basic_template_id, 'enterprise_name', 'Enterprise Name', 'text', 255, true, 1),
      (basic_template_id, 'enterprise_address', 'Enterprise Address', 'textarea', 500, true, 2),
      (basic_template_id, 'contact_person', 'Contact Person', 'text', 100, true, 3),
      (basic_template_id, 'contact_phone', 'Contact Phone', 'tel', 15, true, 4),
      (basic_template_id, 'contact_email', 'Contact Email', 'email', 100, false, 5),
      (basic_template_id, 'gstin', 'GSTIN', 'text', 15, true, 6),
      (basic_template_id, 'sector', 'Sector', 'select', 50, true, 7)
    ON CONFLICT (block_id, item_id) DO NOTHING;
  END IF;

  -- Insert financial template items
  IF financial_template_id IS NOT NULL THEN
    INSERT INTO survey_block_items (block_id, item_id, item_name, data_type, max_length, is_required, order_index) VALUES
      (financial_template_id, 'total_revenue', 'Total Revenue', 'number', 15, true, 1),
      (financial_template_id, 'total_expenses', 'Total Expenses', 'number', 15, true, 2),
      (financial_template_id, 'net_profit', 'Net Profit', 'number', 15, false, 3),
      (financial_template_id, 'fixed_assets', 'Fixed Assets', 'number', 15, true, 4),
      (financial_template_id, 'current_assets', 'Current Assets', 'number', 15, true, 5),
      (financial_template_id, 'total_liabilities', 'Total Liabilities', 'number', 15, true, 6)
    ON CONFLICT (block_id, item_id) DO NOTHING;
  END IF;

  -- Insert employment template items
  IF employment_template_id IS NOT NULL THEN
    INSERT INTO survey_block_items (block_id, item_id, item_name, data_type, max_length, is_required, order_index) VALUES
      (employment_template_id, 'total_employees', 'Total Employees', 'number', 10, true, 1),
      (employment_template_id, 'male_employees', 'Male Employees', 'number', 10, true, 2),
      (employment_template_id, 'female_employees', 'Female Employees', 'number', 10, true, 3),
      (employment_template_id, 'permanent_employees', 'Permanent Employees', 'number', 10, true, 4),
      (employment_template_id, 'contract_employees', 'Contract Employees', 'number', 10, false, 5),
      (employment_template_id, 'average_salary', 'Average Salary', 'number', 12, false, 6)
    ON CONFLICT (block_id, item_id) DO NOTHING;
  END IF;
END $$;