import { useState, useEffect } from 'react';
import { User, LoginCredentials } from '../types';
import { mockUsers } from '../data/mockData';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('assse_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Ensure permissions is always an array
          if (!parsedUser.permissions || !Array.isArray(parsedUser.permissions)) {
            parsedUser.permissions = [];
          }
          // Ensure roles is always an array
          if (!parsedUser.roles || !Array.isArray(parsedUser.roles)) {
            parsedUser.roles = [];
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid data
        localStorage.removeItem('assse_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasRole = (roleCode: string): boolean => {
    if (!user) return false;
    if (user.permissions?.includes('*')) return true;
    return user.roles?.some(role => role.code === roleCode) || false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(permission) || false;
  };

  const isDSUser = (): boolean => {
    return hasRole('DS_USER');
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email and password
      const foundUser = mockUsers.find(u => u.email === credentials.email);
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Simple password validation (in real app, this would be handled by backend)
      const validPasswords: { [key: string]: string } = {
        'admin@ensd.gov.in': 'admin123',
        'cpg@ensd.gov.in': 'cpg123',
        'ds@ensd.gov.in': 'ds123',
        'ro@ensd.gov.in': 'ro123',
        'sso@ensd.gov.in': 'sso123',
        'enterprise@company.com': 'enterprise123'
      };
      
      if (validPasswords[credentials.email] !== credentials.password) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Ensure permissions and roles are always arrays before setting user
      const userWithDefaults = {
        ...foundUser,
        permissions: foundUser.permissions || [],
        roles: foundUser.roles || []
      };
      
      setUser(userWithDefaults);
      localStorage.setItem('assse_user', JSON.stringify(userWithDefaults));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('assse_user');
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  return {
    user,
    loading,
    hasRole,
    hasPermission,
    isDSUser,
    login,
    logout
  };
};