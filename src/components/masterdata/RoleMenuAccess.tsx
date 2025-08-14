import React, { useState, useEffect } from 'react';
import { Save, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { userRoles } from '../../data/mockData';
import { MenuItem, RolePermission, UserRole } from '../../types';
import { RolePermissionService } from '../../services/rolePermissionService';

const RoleMenuAccess: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>(userRoles[0]?.id || '');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, menuItemsData] = await Promise.all([
        RolePermissionService.getRolePermissions(),
        RolePermissionService.getAllMenuItems()
      ]);
      
      setPermissions(permissionsData);
      setMenuItems(menuItemsData);
    } catch (error) {
      console.error('Failed to load RBAC data:', error);
    } finally {
      setLoading(false);
    }
  };
  const toggleExpanded = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const getPermissionForMenu = (menuId: string): RolePermission | undefined => {
    return permissions.find(p => p.roleId === selectedRole && p.menuId === menuId);
  };

  const handlePermissionChange = (menuId: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: boolean) => {
    setPermissions(prev => {
      const existingPermIndex = prev.findIndex(p => p.roleId === selectedRole && p.menuId === menuId);
      
      if (existingPermIndex >= 0) {
        // Update existing permission
        const updatedPermissions = [...prev];
        updatedPermissions[existingPermIndex] = {
          ...updatedPermissions[existingPermIndex],
          [field]: value
        };
        
        // If canView is set to false, set all other permissions to false as well
        if (field === 'canView' && value === false) {
          updatedPermissions[existingPermIndex].canCreate = false;
          updatedPermissions[existingPermIndex].canEdit = false;
          updatedPermissions[existingPermIndex].canDelete = false;
        }
        
        // If any other permission is set to true, ensure canView is also true
        if (field !== 'canView' && value === true) {
          updatedPermissions[existingPermIndex].canView = true;
        }
        
        return updatedPermissions;
      } else {
        // Create new permission
        const newPermission: RolePermission = {
          id: `${selectedRole}-${menuId}-${Date.now()}`,
          roleId: selectedRole,
          menuId: menuId,
          canView: field === 'canView' ? value : field !== 'canView' && value,
          canCreate: field === 'canCreate' ? value : false,
          canEdit: field === 'canEdit' ? value : false,
          canDelete: field === 'canDelete' ? value : false
        };
        
        return [...prev, newPermission];
      }
    });
    
    setUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Save all permissions for the selected role
      const rolePermissions = permissions.filter(p => p.roleId === selectedRole);
      
      for (const permission of rolePermissions) {
        await RolePermissionService.upsertRolePermission({
          roleId: permission.roleId,
          menuId: permission.menuId,
          canView: permission.canView,
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete
        });
      }
      
      setUnsavedChanges(false);
      alert('Role menu access permissions saved successfully!');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Failed to save permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Role Wise Menu Access</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Loading RBAC data...</span>
          </div>
        </div>
      </div>
    );
  }
  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const permission = getPermissionForMenu(item.id);
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id} className="border-b border-gray-100 last:border-b-0">
        <div className={`flex items-center py-3 ${depth > 0 ? 'pl-8' : ''}`}>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          <div className="flex-1 flex items-center">
            <span className="text-sm font-medium text-gray-900 flex-1">{item.title}</span>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`view-${item.id}`}
                  checked={permission?.canView || false}
                  onChange={(e) => handlePermissionChange(item.id, 'canView', e.target.checked)}
                  className="mr-1 rounded"
                />
                <label htmlFor={"view-" + item.id} className="text-xs text-gray-600">View</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={"create-" + item.id}
                  checked={permission?.canCreate || false}
                  disabled={!permission?.canView}
                  onChange={(e) => handlePermissionChange(item.id, 'canCreate', e.target.checked)}
                  className="mr-1 rounded"
                />
                <label htmlFor={"create-" + item.id} className="text-xs text-gray-600">Create</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={"edit-" + item.id}
                  checked={permission?.canEdit || false}
                  disabled={!permission?.canView}
                  onChange={(e) => handlePermissionChange(item.id, 'canEdit', e.target.checked)}
                  className="mr-1 rounded"
                />
                <label htmlFor={"edit-" + item.id} className="text-xs text-gray-600">Edit</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={"delete-" + item.id}
                  checked={permission?.canDelete || false}
                  disabled={!permission?.canView}
                  onChange={(e) => handlePermissionChange(item.id, 'canDelete', e.target.checked)}
                  className="mr-1 rounded"
                />
                <label htmlFor={"delete-" + item.id} className="text-xs text-gray-600">Delete</label>
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-t border-gray-100">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Role Wise Menu Access</h1>
        <button
          onClick={handleSaveChanges}
          disabled={!unsavedChanges || loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
            !unsavedChanges || loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={16} />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Role Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {userRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Role Details:</p>
              <p>Code: {userRoles.find(r => r.id === selectedRole)?.code}</p>
              <p>
                Permissions: {userRoles.find(r => r.id === selectedRole)?.permissions.includes('*') 
                  ? 'All Permissions' 
                  : userRoles.find(r => r.id === selectedRole)?.permissions.join(', ') || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Access Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Menu Access Permissions</h3>
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Saving...</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Legend:</span>
              <span className="flex items-center">
                <Check size={14} className="text-green-600 mr-1" />
                <span>Allowed</span>
              </span>
              <span className="flex items-center">
                <X size={14} className="text-red-600 mr-1" />
                <span>Denied</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4 grid grid-cols-5 gap-4 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="col-span-1 font-medium text-sm text-gray-700">Menu Item</div>
            <div className="col-span-4 grid grid-cols-4 gap-4">
              <div className="text-center font-medium text-sm text-gray-700">View</div>
              <div className="text-center font-medium text-sm text-gray-700">Create</div>
              <div className="text-center font-medium text-sm text-gray-700">Edit</div>
              <div className="text-center font-medium text-sm text-gray-700">Delete</div>
            </div>
          </div>
          
          <div className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-yellow-600 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">You have unsaved changes</p>
              <p className="text-sm">Please save your changes before leaving this page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMenuAccess;