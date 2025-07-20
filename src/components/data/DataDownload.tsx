import React, { useState } from 'react';
import { Download, Filter, Calendar, FileText, Database, CheckCircle } from 'lucide-react';

const DataDownload: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedSector, setSelectedSector] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dataType, setDataType] = useState('survey');

  const downloadHistory = [
    { id: '1', fileName: 'Survey_Data_Manufacturing_2024.xlsx', type: 'Survey Data', size: '2.5 MB', date: '2024-01-15', status: 'completed' },
    { id: '2', fileName: 'Frame_Data_Services_2024.csv', type: 'Frame Data', size: '1.8 MB', date: '2024-01-14', status: 'completed' },
    { id: '3', fileName: 'Scrutiny_Comments_2024.pdf', type: 'Scrutiny Data', size: '890 KB', date: '2024-01-13', status: 'completed' },
    { id: '4', fileName: 'Enterprise_List_Construction.xlsx', type: 'Enterprise Data', size: '3.2 MB', date: '2024-01-12', status: 'processing' },
  ];

  const dataTypes = [
    { id: 'survey', name: 'Survey Data', description: 'Complete survey responses and data' },
    { id: 'frame', name: 'Frame Data', description: 'Enterprise frame information' },
    { id: 'scrutiny', name: 'Scrutiny Data', description: 'Scrutiny comments and feedback' },
    { id: 'enterprise', name: 'Enterprise Data', description: 'Enterprise master data' },
  ];

  const sectors = ['All Sectors', 'Manufacturing', 'Services', 'Construction', 'Trade', 'Transport'];
  const formats = [
    { id: 'excel', name: 'Excel (.xlsx)', icon: '📊' },
    { id: 'csv', name: 'CSV (.csv)', icon: '📄' },
    { id: 'pdf', name: 'PDF (.pdf)', icon: '📋' },
    { id: 'json', name: 'JSON (.json)', icon: '🔧' },
  ];

  const handleDownload = () => {
    const selectedDataType = dataTypes.find(dt => dt.id === dataType);
    const selectedFormatName = formats.find(f => f.id === selectedFormat)?.name;
    
    alert(`Initiating download of ${selectedDataType?.name} in ${selectedFormatName} format for ${selectedSector === 'all' ? 'All Sectors' : selectedSector}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle size={12} className="mr-1" />Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Download (DDDB)</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Database size={16} />
          <span>Data Download & Database</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Download Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Configure Data Download
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Data Type
                </label>
                <div className="space-y-2">
                  {dataTypes.map((type) => (
                    <div key={type.id} className="flex items-center">
                      <input
                        type="radio"
                        id={type.id}
                        name="dataType"
                        value={type.id}
                        checked={dataType === type.id}
                        onChange={(e) => setDataType(e.target.value)}
                        className="mr-3"
                      />
                      <label htmlFor={type.id} className="flex-1">
                        <div className="font-medium text-gray-900">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          selectedFormat === format.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{format.icon}</span>
                          <span className="text-sm font-medium">{format.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector Filter
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sectors</option>
                    {sectors.slice(1).map((sector) => (
                      <option key={sector} value={sector.toLowerCase()}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Download Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Download History & Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Surveys</span>
                <span className="text-sm font-medium text-gray-900">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">2,156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-yellow-600">691</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Download History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Downloads</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {downloadHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.fileName}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.type} • {item.size}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(item.status)}
                        {item.status === 'completed' && (
                          <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDownload;