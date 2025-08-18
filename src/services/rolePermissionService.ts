import { supabase } from '../lib/supabase';
import { RolePermission, MenuItem } from '../types';
import { menuItems } from '../data/mockData';

export class RolePermissionService {
  // Get all role permissions
  static async getRolePermissions(): Promise<RolePermission[]> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      // Return mock data when Supabase is not configured
      return [];
    }

    const { data, error } = await supabase
      .from('role_menu_permissions')
      .select(`
        *,
        role:user_roles(*),
        menu_item:menu_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.mapDatabaseToRolePermission) || [];
  }

  // Get permissions for a specific role
  static async getRolePermissionsByRole(roleId: string): Promise<RolePermission[]> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return [];
    }

    const { data, error } = await supabase
      .from('role_menu_permissions')
      .select('*')
      .eq('role_id', roleId);

    if (error) throw error;

    return data?.map(this.mapDatabaseToRolePermission) || [];
  }

  // Update or create role permission
  static async upsertRolePermission(permission: Omit<RolePermission, 'id'>): Promise<RolePermission> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('role_menu_permissions')
      .upsert({
        role_id: permission.roleId,
        menu_id: permission.menuId,
        can_view: permission.canView,
        can_create: permission.canCreate,
        can_edit: permission.canEdit,
        can_delete: permission.canDelete
      }, {
        onConflict: 'role_id,menu_id'
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapDatabaseToRolePermission(data);
  }

  // Delete role permission
  static async deleteRolePermission(roleId: string, menuId: string): Promise<void> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('role_menu_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('menu_id', menuId);

    if (error) throw error;
  }

  // Get filtered menu items for a user based on their roles
  static async getMenuItemsForUser(userId: string): Promise<MenuItem[]> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      // Return mock menu items when Supabase is not configured
      return menuItems;
    }

    // Get user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles(*)
      `)
      .eq('user_id', userId);

    if (rolesError) throw rolesError;

    const roleIds = userRoles?.map(ur => ur.user_roles.id) || [];
    
    if (roleIds.length === 0) {
      return [];
    }

    // Check if user has admin role (all permissions)
    const hasAdminRole = userRoles?.some(ur => 
      ur.user_roles.permissions?.includes('*') || ur.user_roles.code === 'ENSD_ADMIN'
    );

    if (hasAdminRole) {
      // Return all menu items for admin users
      return await this.getAllMenuItems();
    }

    // Get permissions for user's roles
    const { data: permissions, error: permError } = await supabase
      .from('role_menu_permissions')
      .select(`
        *,
        menu_item:menu_items(*)
      `)
      .in('role_id', roleIds)
      .eq('can_view', true);

    if (permError) throw permError;

    // Get unique menu items that user has access to
    const accessibleMenuIds = new Set(permissions?.map(p => p.menu_id) || []);
    const allMenuItems = await this.getAllMenuItems();

    return this.filterMenuItemsByAccess(allMenuItems, accessibleMenuIds);
  }

  // Get all menu items from database
  static async getAllMenuItems(): Promise<MenuItem[]> {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      // Return mock menu items when Supabase is not configured
      return menuItems;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('order_index');

    if (error) throw error;

    return this.buildMenuHierarchy(data || []);
  }

  // Filter menu items based on user access
  private static filterMenuItemsByAccess(menuItems: MenuItem[], accessibleMenuIds: Set<string>): MenuItem[] {
    return menuItems.filter(item => {
      if (accessibleMenuIds.has(item.id)) {
        // If item has children, filter them too
        if (item.children) {
          item.children = this.filterMenuItemsByAccess(item.children, accessibleMenuIds);
        }
        return true;
      }
      return false;
    });
  }

  // Build menu hierarchy from flat data
  private static buildMenuHierarchy(flatItems: any[]): MenuItem[] {
    const itemMap = new Map();
    const rootItems: MenuItem[] = [];

    // First pass: create all items
    flatItems.forEach(item => {
      const menuItem: MenuItem = {
        id: item.id,
        title: item.title,
        path: item.path,
        icon: item.icon,
        roles: item.roles || [],
        children: [],
        badge: item.badge || 0
      };
      itemMap.set(item.id, menuItem);
    });

    // Second pass: build hierarchy
    flatItems.forEach(item => {
      const menuItem = itemMap.get(item.id);
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        parent.children.push(menuItem);
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems;
  }

  // Helper method to map database row to RolePermission type
  private static mapDatabaseToRolePermission(data: any): RolePermission {
    return {
      id: data.id,
      roleId: data.role_id,
      menuId: data.menu_id,
      canView: data.can_view,
      canCreate: data.can_create,
      canEdit: data.can_edit,
      canDelete: data.can_delete
    };
  }
}