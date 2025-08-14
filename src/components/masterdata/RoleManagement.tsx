import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, Save, X, Check } from 'lucide-react';
import { userRoles, officeTypes } from '../../data/mockData';
import { UserRole } from '../../types';
import { RoleService } from '../../services/roleService';
import { useAuth } from '../../hooks/useAuth';

const RoleManagement: React.FC = () => {
  const { loadUserMenuItems, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [roles, setRoles] = useState(userRoles);
  const [newRole, setNewRole] = useState<UserRole>({
    id: '',
    name: '',
    code: '',
    permissions: [],
    level: 1,
    isAdmin: false,
    isScrutinizer: false
  });

  const handleAddRole = () => {
    const roleId = `role-${Date.now()}`;
    const roleWithId = {
      ...newRole,
      id: roleId,
      code: newRole.code.toUpperCase()
    };
    
    setRoles([...roles, roleWithId]);
    
    // Refresh current user's menu items if they have admin role
    if (user?.id) {
      loadUserMenuItems(user.id);
    }
    
    setNewRole({
      id: '',
      name: '',
      code: '',
      permissions: []
    });
    setShowAddModal(false);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;
    
    const updatedRoles = roles.map(role => 
      role.id === editingRole.id ? editingRole : role
    );
    
    setRoles(updatedRoles);
    
    // Refresh current user's menu items if they have admin role
    if (user?.id) {
      loadUserMenuItems(user.id);
    }
    
    setEditingRole(null);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm('Are you sure you want to delete this role? This will affect all users with this role.')) {
      const updatedRoles = roles.filter(role => role.id !== id);
      setRoles(updatedRoles);
      
      // Refresh current user's menu items
      if (user?.id) {
        loadUserMenuItems(user.id);
      }
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Role</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{role.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Level {role.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {role.isAdmin && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Admin</span>
                      )}
                      {role.isScrutinizer && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Scrutinizer</span>
                      )}
                      {!role.isAdmin && !role.isScrutinizer && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Regular</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {role.permissions.includes('*') 
                        ? <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">All Permissions</span>
                        : role.permissions.slice(0, 3).map((perm, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full mr-1">
                              {perm}
                            </span>
                          ))
                      }
                      {role.permissions.length > 3 && !role.permissions.includes('*') && (
                        <span className="text-xs text-gray-500 ml-1">+{role.permissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        onClick={() => setEditingRole(role)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Role</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Data Entry Operator"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code
                </label>
                <input
                  type="text"
                  value={newRole.code}
                  onChange={(e) => setNewRole({...newRole, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., DATA_ENTRY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hierarchy Level (1 = Highest, 9 = Lowest)
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={newRole.level}
                  onChange={(e) => setNewRole({...newRole, level: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.isAdmin}
                      onChange={(e) => setNewRole({...newRole, isAdmin: e.target.checked})}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">Admin Role</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.isScrutinizer}
                      onChange={(e) => setNewRole({...newRole, isScrutinizer: e.target.checked})}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">Scrutinizer Role</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="all-permissions"
                      checked={newRole.permissions.includes('*')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRole({...newRole, permissions: ['*']});
                        } else {
                          setNewRole({...newRole, permissions: []});
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="all-permissions" className="text-sm">All Permissions</label>
                  </div>
                  
                  {!newRole.permissions.includes('*') && (
                    <>
                      {['dashboard.view', 'frame.upload', 'frame.allocate', 'notice.generate', 'survey.compile', 'survey.scrutinize', 'scrutiny.level1', 'scrutiny.level2', 'data.download', 'reports.view', 'user.create'].map((perm) => (
                        <div key={perm} className="flex items-center">
                          <input
                            type="checkbox"
                            id={perm}
                            checked={newRole.permissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRole({...newRole, permissions: [...newRole.permissions, perm]});
                              } else {
                                setNewRole({...newRole, permissions: newRole.permissions.filter(p => p !== perm)});
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={perm} className="text-sm">{perm}</label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                disabled={!newRole.name || !newRole.code}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Role</h3>
              <button 
                onClick={() => setEditingRole(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code
                </label>
                <input
                  type="text"
                  value={editingRole.code}
                  onChange={(e) => setEditingRole({...editingRole, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hierarchy Level (1 = Highest, 9 = Lowest)
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={editingRole.level}
                  onChange={(e) => setEditingRole({...editingRole, level: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRole.isAdmin}
                      onChange={(e) => setEditingRole({...editingRole, isAdmin: e.target.checked})}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">Admin Role</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRole.isScrutinizer}
                      onChange={(e) => setEditingRole({...editingRole, isScrutinizer: e.target.checked})}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm">Scrutinizer Role</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-all-permissions"
                      checked={editingRole.permissions.includes('*')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingRole({...editingRole, permissions: ['*']});
                        } else {
                          setEditingRole({...editingRole, permissions: []});
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="edit-all-permissions" className="text-sm">All Permissions</label>
                  </div>
                  
                  {!editingRole.permissions.includes('*') && (
                    <>
                      {['dashboard.view', 'frame.upload', 'frame.allocate', 'notice.generate', 'survey.compile', 'survey.scrutinize', 'scrutiny.level1', 'scrutiny.level2', 'data.download', 'reports.view', 'user.create'].map((perm) => (
                        <div key={perm} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`edit-${perm}`}
                            checked={editingRole.permissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingRole({...editingRole, permissions: [...editingRole.permissions, perm]});
                              } else {
                                setEditingRole({...editingRole, permissions: editingRole.permissions.filter(p => p !== perm)});
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`edit-${perm}`} className="text-sm">{perm}</label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={!editingRole.name || !editingRole.code}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;