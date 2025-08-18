import React, { useState } from 'react';
import { UserCheck, Search, Filter, Users, CheckSquare } from 'lucide-react';

const FrameAllocation: React.FC = () => {
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const frames = [
    { id: '1', fileName: 'ASI_Frame_2023_Manufacturing.xlsx', sector: 'Manufacturing', enterprises: 1250, status: 'pending', uploadDate: '2024-01-15' },
    { id: '2', fileName: 'ASI_Frame_2023_Services.xlsx', sector: 'Services', enterprises: 890, status: 'pending', uploadDate: '2024-01-16' },
    { id: '3', fileName: 'ASI_Frame_2023_Construction.xlsx', sector: 'Construction', enterprises: 670, status: 'allocated', uploadDate: '2024-01-17' },
    { id: '4', fileName: 'ASI_Frame_2023_Trade.xlsx', sector: 'Trade', enterprises: 1100, status: 'pending', uploadDate: '2024-01-18' },
  ];

  const users = [
    { id: '1', name: 'John Compiler', role: 'Compiler', email: 'john.c@ensd.gov.in' },
    { id: '2', name: 'Jane Scrutinizer', role: 'Scrutinizer', email: 'jane.s@ensd.gov.in' },
    { id: '3', name: 'Mike DS User', role: 'DS User', email: 'mike.ds@ensd.gov.in' },
    { id: '4', name: 'Sarah SSO', role: 'SSO User', email: 'sarah.sso@ensd.gov.in' },
  ];

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrames(prev => 
      prev.includes(frameId) 
        ? prev.filter(id => id !== frameId)
        : [...prev, frameId]
    );
  };

  const handleSelectAll = () => {
    const pendingFrames = frames.filter(f => f.status === 'pending').map(f => f.id);
    setSelectedFrames(prev => 
      prev.length === pendingFrames.length ? [] : pendingFrames
    );
  };

  const handleAllocate = (userId: string, role: string) => {
    if (selectedFrames.length === 0) {
      alert('Please select frames to allocate');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    alert(`Allocated ${selectedFrames.length} frame(s) to ${user?.name} (${role})`);
    setSelectedFrames([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'allocated':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Allocated</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Frame Allocation</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckSquare size={16} />
          <span>{selectedFrames.length} frame(s) selected</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search frames..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="allocated">Allocated</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={handleSelectAll}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Select All Pending
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frames List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Available Frames</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFrames.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frame Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DSL Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enterprises
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {frames.map((frame) => (
                    <tr key={frame.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFrames.includes(frame.id)}
                          onChange={() => handleFrameSelect(frame.id)}
                          disabled={frame.status !== 'pending'}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{frame.fileName}</div>
                          <div className="text-sm text-gray-500">{frame.sector} • {frame.uploadDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{frame.dslNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{frame.enterprises.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(frame.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Allocation Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Allocate to Users
            </h3>
            
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.role}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleAllocate(user.id, user.role)}
                      disabled={selectedFrames.length === 0}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Allocate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Allocation Summary</h4>
            <div className="text-sm text-blue-700">
              <p>Selected Frames: {selectedFrames.length}</p>
              <p>Total Enterprises: {frames.filter(f => selectedFrames.includes(f.id)).reduce((sum, f) => sum + f.enterprises, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameAllocation;