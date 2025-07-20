import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, X, Save, UserPlus } from 'lucide-react';
import { userRoles } from '../../data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'Active' | 'Inactive';
  lastLogin: string;
  profileImage?: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john@ensd.gov.in', 
      roles: ['EnSD Admin'], 
      status: 'Active', 
      lastLogin: '2024-01-15',
      profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane@ensd.gov.in', 
      roles: ['CPG User', 'RO User'], 
      status: 'Active', 
      lastLogin: '2024-01-14',
      profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      email: 'mike@ensd.gov.in', 
      roles: ['DS User', 'SSO User'], 
      status: 'Inactive', 
      lastLogin: '2024-01-10',
      profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    { 
      id: '4', 
      name: 'Sarah Wilson', 
      email: 'sarah@ensd.gov.in', 
      roles: ['RO User'], 
      status: 'Active', 
      lastLogin: '2024-01-15',
      profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
  ]);
  
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'lastLogin'>>({
    name: '',
    email: '',
    roles: [],
    status: 'Active'
  });

  const availableRoles = userRoles.map(role => role.name);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || newUser.roles.length === 0) {
      alert('Please fill in all required fields and select at least one role');
      return;
    }

    // Check if email already exists
    if (users.some(user => user.email === newUser.email)) {
      alert('A user with this email already exists');
      return;
    }

    const userId = `user-${Date.now()}`;
    const userWithId: User = {
      ...newUser,
      id: userId,
      lastLogin: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, userWithId]);
    setNewUser({
      name: '',
      email: '',
      roles: [],
      status: 'Active'
    });
    setShowAddModal(false);
  };

  const handleEditUser = () => {
    if (!selectedUser || !selectedUser.name || !selectedUser.email || selectedUser.roles.length === 0) {
      alert('Please fill in all required fields and select at least one role');
      return;
    }

    // Check if email already exists for other users
    if (users.some(user => user.email === selectedUser.email && user.id !== selectedUser.id)) {
      alert('A user with this email already exists');
      return;
    }

    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (confirm(`Are you sure you want to delete ${user?.name}?`)) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const handleRoleToggle = (roleName: string, isSelected: boolean, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewUser(prev => ({
        ...prev,
        roles: isSelected 
          ? [...prev.roles, roleName]
          : prev.roles.filter(r => r !== roleName)
      }));
    } else if (selectedUser) {
      setSelectedUser(prev => prev ? ({
        ...prev,
        roles: isSelected 
          ? [...prev.roles, roleName]
          : prev.roles.filter(r => r !== roleName)
      }) : null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  const renderRoleSelection = (selectedRoles: string[], target: 'new' | 'edit') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Roles * (Select multiple roles)
      </label>
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
        {availableRoles.map((role) => (
          <div key={role} className="flex items-center">
            <input
              type="checkbox"
              id={`${target}-${role}`}
              checked={selectedRoles.includes(role)}
              onChange={(e) => handleRoleToggle(role, e.target.checked, target)}
              className="mr-2 rounded"
            />
            <label htmlFor={`${target}-${role}`} className="text-sm text-gray-700">
              {role}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Users can have multiple roles for different responsibilities
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.profileImage || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.lastLogin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="View User"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete User"
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              {renderRoleSelection(newUser.roles, 'new')}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value as 'Active' | 'Inactive'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || newUser.roles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              {renderRoleSelection(selectedUser.roles, 'edit')}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as 'Active' | 'Inactive'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={!selectedUser.name || !selectedUser.email || selectedUser.roles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Update User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.profileImage || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                  alt={selectedUser.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.lastLogin}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;