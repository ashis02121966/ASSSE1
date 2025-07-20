import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export class RoleService {
  // Get all roles
  static async getRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      permissions: Array.isArray(role.permissions) ? role.permissions as string[] : []
    }));
  }

  // Get role by ID
  static async getRoleById(id: string): Promise<UserRole | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      permissions: Array.isArray(data.permissions) ? data.permissions as string[] : []
    };
  }

  // Create new role
  static async createRole(roleData: {
    name: string;
    code: string;
    permissions: string[];
  }): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        name: roleData.name,
        code: roleData.code.toUpperCase(),
        permissions: roleData.permissions
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      permissions: Array.isArray(data.permissions) ? data.permissions as string[] : []
    };
  }

  // Update role
  static async updateRole(id: string, updates: Partial<UserRole>): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .update({
        name: updates.name,
        code: updates.code?.toUpperCase(),
        permissions: updates.permissions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      permissions: Array.isArray(data.permissions) ? data.permissions as string[] : []
    };
  }

  // Delete role
  static async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}