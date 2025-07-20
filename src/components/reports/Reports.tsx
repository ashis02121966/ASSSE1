import React, { useState } from 'react';
import { FileBarChart, TrendingUp, PieChart, BarChart3, Download, Filter, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('survey-progress');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedSector, setSelectedSector] = useState('all');

  const reportTypes = [
    { id: 'survey-progress', name: 'Survey Progress Report', icon: TrendingUp, description: 'Track survey completion status' },
    { id: 'sector-analysis', name: 'Sector Analysis Report', icon: PieChart, description: 'Analyze data by sector' },
    { id: 'performance', name: 'Performance Report', icon: BarChart3, description: 'User and system performance metrics' },
    { id: 'compliance', name: 'Compliance Report', icon: FileBarChart, description: 'Compliance and quality metrics' },
  ];

  const predefinedReports = [
    { id: '1', name: 'Monthly Survey Summary', type: 'survey-progress', lastGenerated: '2024-01-15', size: '2.3 MB' },
    { id: '2', name: 'Manufacturing Sector Analysis', type: 'sector-analysis', lastGenerated: '2024-01-14', size: '1.8 MB' },
    { id: '3', name: 'User Performance Dashboard', type: 'performance', lastGenerated: '2024-01-13', size: '1.2 MB' },
    { id: '4', name: 'Data Quality Report', type: 'compliance', lastGenerated: '2024-01-12', size: '950 KB' },
  ];

  const chartData = {
    'survey-progress': {
      title: 'Survey Completion Progress',
      data: [
        { name: 'Manufacturing', completed: 85, total: 100 },
        { name: 'Services', completed: 72, total: 100 },
        { name: 'Construction', completed: 64, total: 100 },
        { name: 'Trade', completed: 91, total: 100 },
      ]
    },
    'sector-analysis': {
      title: 'Enterprise Distribution by Sector',
      data: [
        { name: 'Manufacturing', value: 1250, color: '#3B82F6' },
        { name: 'Services', value: 890, color: '#10B981' },
        { name: 'Construction', value: 670, color: '#F59E0B' },
        { name: 'Trade', value: 1100, color: '#EF4444' },
      ]
    }
  };

  const handleGenerateReport = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    alert(`Generating ${report?.name} for ${selectedSector === 'all' ? 'All Sectors' : selectedSector}`);
  };

  const renderChart = () => {
    const data = chartData[selectedReport as keyof typeof chartData];
    if (!data) return null;

    if (selectedReport === 'survey-progress') {
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{data.title}</h4>
          {data.data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium text-gray-900">{item.completed}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.completed}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (selectedReport === 'sector-analysis') {
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">{data.title}</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.data.map((item, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
        <p>Chart visualization will be displayed here</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleGenerateReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FileBarChart size={16} />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => {
                const IconComponent = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-6 w-6 mt-1 ${
                        selectedReport === report.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className={`font-medium ${
                          selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {report.name}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          selectedReport === report.id ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h3>
            {renderChart()}
          </div>

          {/* Predefined Reports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Predefined Reports</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {predefinedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-500">
                        Last generated: {report.lastGenerated} • {report.size}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-2 rounded">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Options */}
        <div className="space-y-6">
          {/* Report Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Report Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sectors</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="construction">Construction</option>
                  <option value="trade">Trade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="format" value="pdf" defaultChecked className="mr-2" />
                    <span className="text-sm">PDF Report</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="format" value="excel" className="mr-2" />
                    <span className="text-sm">Excel Workbook</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="format" value="csv" className="mr-2" />
                    <span className="text-sm">CSV Data</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Reports Generated</span>
                <span className="text-sm font-medium text-gray-900">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium text-blue-600">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Popular</span>
                <span className="text-sm font-medium text-gray-900">Survey Progress</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Generated</span>
                <span className="text-sm font-medium text-gray-900">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;