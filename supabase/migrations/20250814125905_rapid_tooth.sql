/*
  # Create Menu Items and Role Permissions Schema

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `path` (text)
      - `icon` (text)
      - `parent_id` (uuid, references menu_items)
      - `order_index` (integer)
      - `roles` (jsonb)
      - `badge` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `role_menu_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid, references user_roles)
      - `menu_id` (uuid, references menu_items)
      - `can_view` (boolean)
      - `can_create` (boolean)
      - `can_edit` (boolean)
      - `can_delete` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  path text NOT NULL,
  icon text NOT NULL,
  parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  roles jsonb DEFAULT '[]'::jsonb,
  badge integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_menu_permissions table
CREATE TABLE IF NOT EXISTS role_menu_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  menu_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role_id, menu_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index);
CREATE INDEX IF NOT EXISTS idx_role_menu_permissions_role ON role_menu_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_permissions_menu ON role_menu_permissions(menu_id);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_menu_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
CREATE POLICY "Users can read active menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- RLS Policies for role_menu_permissions
CREATE POLICY "Users can read role menu permissions"
  ON role_menu_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role menu permissions"
  ON role_menu_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.code = 'ENSD_ADMIN'
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_menu_permissions_updated_at BEFORE UPDATE ON role_menu_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default menu items
INSERT INTO menu_items (id, title, path, icon, parent_id, order_index, roles) VALUES
  ('dashboard', 'Dashboard', '/dashboard', 'BarChart3', null, 1, '["*"]'::jsonb),
  ('master-data', 'Master Data Management', '/master-data', 'Database', null, 2, '["ENSD_ADMIN", "CPG_USER"]'::jsonb),
  ('frame-upload', 'Frame Upload', '/frame-upload', 'Upload', null, 3, '["ENSD_ADMIN", "CPG_USER"]'::jsonb),
  ('frame-allocation', 'Frame Allocation', '/frame-allocation', 'UserCheck', null, 4, '["CPG_USER", "RO_USER"]'::jsonb),
  ('generate-notice', 'Generate Notice', '/generate-notice', 'FileOutput', null, 5, '["RO_USER"]'::jsonb),
  ('survey-management', 'Survey Management', '/survey-management', 'ClipboardList', null, 6, '["SSO_USER", "ENTERPRISE"]'::jsonb),
  ('scrutiny-management', 'Scrutiny Management', '/scrutiny-management', 'Search', null, 7, '["SSO_USER", "DS_USER"]'::jsonb),
  ('data-download', 'Data Download (DDDB)', '/data-download', 'Download', null, 8, '["DS_USER", "ENSD_ADMIN"]'::jsonb),
  ('reports', 'Reports', '/reports', 'FileBarChart', null, 9, '["*"]'::jsonb),
  ('settings', 'Settings', '/settings', 'Settings', null, 10, '["ENSD_ADMIN"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  roles = EXCLUDED.roles;

-- Insert master data sub-menu items
INSERT INTO menu_items (id, title, path, icon, parent_id, order_index, roles) VALUES
  ('survey-config', 'Survey Configuration', '/master-data/survey-config', 'Settings', 'master-data', 1, '["ENSD_ADMIN"]'::jsonb),
  ('user-management', 'User Management', '/master-data/user-management', 'Users', 'master-data', 2, '["ENSD_ADMIN"]'::jsonb),
  ('role-management', 'Role Management', '/master-data/role-management', 'Shield', 'master-data', 3, '["ENSD_ADMIN"]'::jsonb),
  ('menu-access', 'Role Wise Menu Access', '/master-data/menu-access', 'Menu', 'master-data', 4, '["ENSD_ADMIN"]'::jsonb),
  ('nic-master', 'NIC Master', '/master-data/nic-master', 'Building', 'master-data', 5, '["ENSD_ADMIN", "CPG_USER"]'::jsonb),
  ('npc-master', 'NPC Master', '/master-data/npc-master', 'Package', 'master-data', 6, '["ENSD_ADMIN", "CPG_USER"]'::jsonb),
  ('approval-workflow', 'Approval Workflow Configuration', '/master-data/approval-workflow', 'GitBranch', 'master-data', 7, '["ENSD_ADMIN"]'::jsonb),
  ('team-management', 'Team Management', '/master-data/team-management', 'UsersRound', 'master-data', 8, '["ENSD_ADMIN"]'::jsonb),
  ('office-type', 'Office Type', '/master-data/office-type', 'Building2', 'master-data', 9, '["ENSD_ADMIN"]'::jsonb),
  ('location-master', 'Office Location', '/master-data/location-master', 'MapPin', 'master-data', 10, '["ENSD_ADMIN"]'::jsonb),
  ('rate-master', 'Rate Master', '/master-data/rate-master', 'DollarSign', 'master-data', 11, '["ENSD_ADMIN"]'::jsonb),
  ('high-profile', 'High Profile Unit', '/master-data/high-profile', 'Star', 'master-data', 12, '["ENSD_ADMIN"]'::jsonb),
  ('howler-unit', 'Howler Unit', '/master-data/howler-unit', 'AlertTriangle', 'master-data', 13, '["ENSD_ADMIN"]'::jsonb),
  ('notice-template', 'Notice Template', '/master-data/notice-template', 'FileText', 'master-data', 14, '["ENSD_ADMIN"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  parent_id = EXCLUDED.parent_id,
  order_index = EXCLUDED.order_index,
  roles = EXCLUDED.roles;

-- Insert default role permissions for ENSD_ADMIN (all permissions)
DO $$
DECLARE
  admin_role_id uuid;
  menu_item_record RECORD;
BEGIN
  -- Get ENSD_ADMIN role ID
  SELECT id INTO admin_role_id FROM user_roles WHERE code = 'ENSD_ADMIN';
  
  IF admin_role_id IS NOT NULL THEN
    -- Grant all permissions to admin for all menu items
    FOR menu_item_record IN SELECT id FROM menu_items LOOP
      INSERT INTO role_menu_permissions (role_id, menu_id, can_view, can_create, can_edit, can_delete)
      VALUES (admin_role_id, menu_item_record.id, true, true, true, true)
      ON CONFLICT (role_id, menu_id) DO UPDATE SET
        can_view = true,
        can_create = true,
        can_edit = true,
        can_delete = true;
    END LOOP;
  END IF;
END $$;