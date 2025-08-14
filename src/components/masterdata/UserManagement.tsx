import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, X, Save, UserPlus, Upload, Image } from 'lucide-react';
import { userRoles, officeTypes } from '../../data/mockData';
import { OfficeType, UserRole } from '../../types';
import { UserService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'Active' | 'Inactive';
  lastLogin: string;
  profileImage?: string;
  officeType?: string;
  officeLocation?: string;
  signatureImage?: string;
}

const UserManagement: React.FC = () => {
  const { loadUserMenuItems } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterOfficeType, setFilterOfficeType] = useState('all');
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
      profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      officeType: 'CSO',
      officeLocation: 'New Delhi'
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane@ensd.gov.in', 
      roles: ['CPG User', 'RO User'], 
      status: 'Active', 
      lastLogin: '2024-01-14',
      profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      officeType: 'FOD HQ',
      officeLocation: 'Mumbai'
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      email: 'mike@ensd.gov.in', 
      roles: ['DS User', 'SSO User'], 
      status: 'Inactive', 
      lastLogin: '2024-01-10',
      profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      officeType: 'ZO',
      officeLocation: 'Chennai'
    },
    { 
      id: '4', 
      name: 'Sarah Wilson', 
      email: 'sarah@ensd.gov.in', 
      roles: ['RO User'], 
      status: 'Active', 
      lastLogin: '2024-01-15',
      profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      officeType: 'RO',
      officeLocation: 'Kolkata'
    },
  ]);
  
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'lastLogin'>>({
    name: '',
    email: '',
    roles: [],
    status: 'Active',
    officeType: '',
    officeLocation: '',
    signatureImage: ''
  });

  // Get available roles based on selected office type
  const getAvailableRoles = (officeType: string): UserRole[] => {
    if (!officeType) return [];
    
    // All roles can be assigned to any office type, but with different permissions
    return userRoles.filter(role => {
      // Enterprise users don't belong to any office
      if (role.code === 'ENTERPRISE') return false;
      return true;
    }).sort((a, b) => a.level - b.level); // Sort by hierarchy level
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.officeType || newUser.roles.length === 0) {
      alert('Please fill in all required fields including office type and select at least one role');
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
    
    // Refresh menu items for all users to reflect role changes
    if (userWithId.id) {
      loadUserMenuItems(userWithId.id);
    }
    
    setNewUser({
      name: '',
      email: '',
      roles: [],
      status: 'Active',
      officeType: '',
      officeLocation: '',
      signatureImage: ''
    });
    setShowAddModal(false);
  };

  const handleEditUser = () => {
    if (!selectedUser || !selectedUser.name || !selectedUser.email || !selectedUser.officeType || selectedUser.roles.length === 0) {
      alert('Please fill in all required fields including office type and select at least one role');
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
    
    // Refresh menu items for the updated user
    if (selectedUser.id) {
      loadUserMenuItems(selectedUser.id);
    }
    
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

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('Please upload only JPEG or PNG files for signature');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Signature file size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'new') {
        setNewUser(prev => ({ ...prev, signatureImage: result }));
      } else if (selectedUser) {
        setSelectedUser(prev => prev ? ({ ...prev, signatureImage: result }) : null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = (target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewUser(prev => ({ ...prev, signatureImage: '' }));
    } else if (selectedUser) {
      setSelectedUser(prev => prev ? ({ ...prev, signatureImage: '' }) : null);
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
    const matchesOfficeType = filterOfficeType === 'all' || user.officeType === filterOfficeType;
    return matchesSearch && matchesRole && matchesOfficeType;
  });

  const renderRoleSelection = (selectedRoles: string[], target: 'new' | 'edit') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Roles * (Select multiple roles)
      </label>
      {!((target === 'new' ? newUser.officeType : selectedUser?.officeType)) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-2">
          <p className="text-sm text-yellow-800">Please select an office type first to see available roles.</p>
        </div>
      )}
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
        {getAvailableRoles(target === 'new' ? newUser.officeType || '' : selectedUser?.officeType || '').map((role) => (
          <div key={role.name} className="flex items-center">
            <input
              type="checkbox"
              id={`${target}-${role.name}`}
              checked={selectedRoles.includes(role.name)}
              onChange={(e) => handleRoleToggle(role.name, e.target.checked, target)}
              className="mr-2 rounded"
            />
            <label htmlFor={`${target}-${role.name}`} className="text-sm text-gray-700">
              <div className="flex items-center justify-between w-full">
                <span>{role.name}</span>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    role.isAdmin ? 'bg-purple-100 text-purple-800' : 
                    role.isScrutinizer ? 'bg-orange-100 text-orange-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Level {role.level}
                  </span>
                  {role.isAdmin && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Admin</span>
                  )}
                  {role.isScrutinizer && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Scrutinizer</span>
                  )}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Users can have multiple roles. Role hierarchy: EnSD Admin (1) → CPG User (2) → EnSD AD/DD (3) → DS User (4) → ZO (5) → RO (6) → SSO (7) → JSO (8)
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
                {userRoles.map(role => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterOfficeType}
                onChange={(e) => setFilterOfficeType(e.target.value)}
              >
                <option value="all">All Office Types</option>
                {officeTypes.map(office => (
                  <option key={office.code} value={office.name}>{office.name}</option>
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
                  Office Type
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
                        {user.officeLocation && (
                          <div className="text-xs text-gray-400">{user.officeLocation}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.officeType || 'Not Set'}</div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Type *
                </label>
                <select
                  value={newUser.officeType}
                  onChange={(e) => {
                    setNewUser({...newUser, officeType: e.target.value, roles: []});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Office Type</option>
                  {officeTypes.map((office) => (
                    <option key={office.id} value={office.name}>
                      {office.name} - {office.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select office type before choosing roles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  value={newUser.officeLocation}
                  onChange={(e) => setNewUser({...newUser, officeLocation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter office location"
                />
              </div>

              {newUser.officeType && renderRoleSelection(newUser.roles, 'new')}
              
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
                disabled={!newUser.name || !newUser.email || !newUser.officeType || newUser.roles.length === 0}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Type *
                </label>
                <select
                  value={selectedUser.officeType}
                  onChange={(e) => {
                    setSelectedUser({...selectedUser, officeType: e.target.value, roles: []});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Office Type</option>
                  {officeTypes.map((office) => (
                    <option key={office.id} value={office.name}>
                      {office.name} - {office.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature
                </label>
                <div className="space-y-3">
                  {selectedUser.signatureImage ? (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Current Signature:</span>
                        <button
                          type="button"
                          onClick={() => removeSignature('edit')}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Remove Signature"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <img
                        src={selectedUser.signatureImage}
                        alt="Signature"
                        className="max-w-full h-20 object-contain border border-gray-200 rounded"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload signature image</p>
                      <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-flex items-center space-x-1">
                        <Upload size={14} />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleSignatureUpload(e, 'edit')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPEG or PNG format, max 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature
                </label>
                <div className="space-y-3">
                  {newUser.signatureImage ? (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Current Signature:</span>
                        <button
                          type="button"
                          onClick={() => removeSignature('new')}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Remove Signature"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <img
                        src={newUser.signatureImage}
                        alt="Signature"
                        className="max-w-full h-20 object-contain border border-gray-200 rounded"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload signature image</p>
                      <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-flex items-center space-x-1">
                        <Upload size={14} />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleSignatureUpload(e, 'new')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPEG or PNG format, max 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  value={selectedUser.officeLocation}
                  onChange={(e) => setSelectedUser({...selectedUser, officeLocation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter office location"
                />
              </div>

              {selectedUser.officeType && renderRoleSelection(selectedUser.roles, 'edit')}
              
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
                disabled={!selectedUser.name || !selectedUser.email || !selectedUser.officeType || selectedUser.roles.length === 0}
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
                  src={selectedUser?.profileImage || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                  alt={selectedUser?.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedUser?.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser?.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedUser?.signatureImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Digital Signature
                  </label>
                  <div className="p-2 bg-gray-50 rounded">
                    <img
                      src={selectedUser.signatureImage}
                      alt="Signature"
                      className="max-w-full h-16 object-contain border border-gray-200 rounded"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedUser?.status || 'Active')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser?.lastLogin}</p>
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