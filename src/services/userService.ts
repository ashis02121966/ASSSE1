import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

export class UserService {
  // Get all users with their roles
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_role_assignments (
          user_roles (*)
        )
      `);

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profile_image,
      roles: user.user_role_assignments.map((assignment: any) => assignment.user_roles),
      permissions: this.getUserPermissions(user.user_role_assignments.map((assignment: any) => assignment.user_roles))
    }));
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_role_assignments (
          user_roles (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      profileImage: data.profile_image,
      roles: data.user_role_assignments.map((assignment: any) => assignment.user_roles),
      permissions: this.getUserPermissions(data.user_role_assignments.map((assignment: any) => assignment.user_roles))
    };
  }

  // Create new user
  static async createUser(userData: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profile_image: userData.profileImage || ''
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      profileImage: data.profile_image,
      roles: [],
      permissions: []
    };
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        profile_image: updates.profileImage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found after update');
    
    return user;
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Assign role to user
  static async assignRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: userId,
        role_id: roleId
      });

    if (error) throw error;
  }

  // Remove role from user
  static async removeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_role_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  }

  // Helper method to calculate user permissions
  private static getUserPermissions(roles: UserRole[]): string[] {
    const permissions = new Set<string>();
    
    roles.forEach(role => {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    });

    return Array.from(permissions);
  }
}