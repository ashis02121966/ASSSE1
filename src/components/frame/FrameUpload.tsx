import React, { useState } from 'react';
import { Upload, Download, Eye, Search, Filter } from 'lucide-react';
import { Frame } from '../../types';
import { mockFrames } from '../../data/mockData';

// Sample template data for download
const templateData = `CSOID,StateCode,SROCode,DistrictCode,DistrictName,Sector,PslNo,FrameNIC,Scheme,New Scheme,RegistrationNo,CompanyName,CompanyAddress,CompanyPlace,companyPincode,PSU,NoOfEmployees,JointReturnCode,DSLNo,IsSelected,SubSampleNo,App_SurveyYear,App_MotherUnit,PINCode,Description,EmailId,IsPrevYearSelected,ITUse,RU,App_AddEditFlg,remarks,StatusCode`;

const FrameUpload: React.FC = () => {
  const [frames, setFrames] = useState<Frame[]>(mockFrames);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Simulate file upload
      const newFrame: Frame = {
        id: Date.now().toString(),
        fileName: files[0].name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        allocatedTo: [],
        enterprises: Math.floor(Math.random() * 1000) + 500,
        sector: 'Manufacturing'
      };
      setFrames(prev => [...prev, newFrame]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Simulate file upload
      const newFrame: Frame = {
        id: Date.now().toString(),
        fileName: files[0].name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        allocatedTo: [],
        enterprises: Math.floor(Math.random() * 1000) + 500,
        sector: 'Manufacturing'
      };
      setFrames(prev => [...prev, newFrame]);
    }
  };

  const filteredFrames = frames.filter(frame => {
    const matchesSearch = frame.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         frame.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || frame.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Frame Upload</h1>
        <button 
          onClick={() => {
            // Create a blob from the template data
            const blob = new Blob([templateData], { type: 'text/csv' });
            // Create a URL for the blob
            const url = URL.createObjectURL(blob);
            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ASI_frame_template.csv';
            // Trigger a click on the anchor
            document.body.appendChild(a);
            a.click();
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Download Template</span>
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your frame files here, or{' '}
            <label className="text-blue-600 cursor-pointer hover:text-blue-800">
              browse
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: .xlsx, .xls, .csv (Max size: 50MB)
          </p>
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
          </div>
        </div>
      </div>

      {/* Frames Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DSL Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enterprises
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFrames.map((frame) => (
                <tr key={frame.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{frame.fileName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{frame.dslNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{frame.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{frame.enterprises.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{frame.uploadDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(frame.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => alert(`Viewing details for ${frame.fileName}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          // Create a blob with sample data
                          const blob = new Blob([`Sample data for ${frame.fileName}`], { type: 'text/plain' });
                          // Create a URL for the blob
                          const url = URL.createObjectURL(blob);
                          // Create a temporary anchor element
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = frame.fileName;
                          // Trigger a click on the anchor
                          document.body.appendChild(a);
                          a.click();
                          // Clean up
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="Download Frame"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FrameUpload;