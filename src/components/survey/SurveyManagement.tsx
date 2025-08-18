import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Eye, Edit, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { surveyBlocks as allSurveyBlocks } from '../../data/surveyBlocks';
import { useAuth } from '../../hooks/useAuth';

interface AllocatedSurvey {
  id: string;
  enterpriseName: string;
  gstn: string;
  dslNumber: string;
  sector: string;
  status: 'draft' | 'submitted' | 'scrutiny' | 'approved' | 'rejected';
  lastModified: string;
  compiler?: string;
  scrutinizer?: string;
}

interface SurveyField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  value: any;
  required: boolean;
  readOnly?: boolean;
}

interface SurveyBlock {
  id: string;
  name: string;
  description?: string;
  fields: SurveyField[];
  completed: boolean;
}

const SurveyManagement: React.FC = () => {
  const { isDSUser, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSurvey, setSelectedSurvey] = useState<AllocatedSurvey | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<{[key: string]: any}>({});

  // Mock allocated surveys data with GSTN
  const allocatedSurveys: AllocatedSurvey[] = [
    {
      id: '1',
      enterpriseName: 'ABC Manufacturing Ltd.',
      gstn: '27AABCU9603R1ZX',
      dslNumber: 'DSL001',
      sector: 'Manufacturing',
      status: 'draft',
      lastModified: '2024-01-15',
      compiler: 'John Compiler'
    },
    {
      id: '2',
      enterpriseName: 'XYZ Services Pvt. Ltd.',
      gstn: '29AABCU9603R1ZY',
      dslNumber: 'DSL002',
      sector: 'Services',
      status: 'submitted',
      lastModified: '2024-01-14',
      compiler: 'Jane Compiler',
      scrutinizer: 'Mike Scrutinizer'
    },
    {
      id: '3',
      enterpriseName: 'PQR Construction Co.',
      gstn: '07AABCU9603R1ZZ',
      dslNumber: 'DSL003',
      sector: 'Construction',
      status: 'scrutiny',
      lastModified: '2024-01-13',
      compiler: 'Sarah Compiler',
      scrutinizer: 'David Scrutinizer'
    },
    {
      id: '4',
      enterpriseName: 'LMN Trading Corp.',
      gstn: '19AABCU9603R1ZA',
      dslNumber: 'DSL004',
      sector: 'Trade',
      status: 'approved',
      lastModified: '2024-01-12',
      compiler: 'Tom Compiler',
      scrutinizer: 'Lisa Scrutinizer'
    }
  ];

  // Get survey blocks with GSTIN and DSL fields populated
  const getSurveyBlocks = (currentUser: any): SurveyBlock[] => {
    const currentUserName = currentUser?.name || 'Current User';
    const currentUserId = currentUser?.id || 'USER_ID';
    const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YY format
    
    return allSurveyBlocks.map(block => ({
      ...block,
      fields: block.fields.map(field => ({
        ...field,
        value: field.id === 'gstin' || field.id.includes('gstin') ? selectedSurvey?.gstn || '' :
               field.id === 'dsl_number' || field.id.includes('dsl') ? selectedSurvey?.dslNumber || '' :
               field.id === 'enterprise_name_current' ? selectedSurvey?.enterpriseName || '' :
               surveyResponses[field.id] || field.value || '',
        readOnly: field.readOnly || 
                  field.id === 'gstin' || field.id.includes('gstin') || 
                  field.id === 'dsl_number' || field.id.includes('dsl')
      })),
      gridData: block.gridData?.map(row => ({
        ...row,
        // Auto-populate Block 12 fields
        survey_supervisor: row.survey_supervisor === 'AUTO_POPULATE_USER_NAME' ? currentUserName :
                          row.survey_supervisor === 'AUTO_POPULATE_USER_ID' ? currentUserId :
                          row.survey_supervisor === 'AUTO_POPULATE_SURVEY_DATE' ? currentDate :
                          row.survey_supervisor === 'AUTO_POPULATE_DISPATCH_DATE' ? currentDate :
                          row.survey_supervisor === 'USER_ENTRY' ? (surveyResponses[`${block.id}_${row.sl_no}_investigators`] || '') :
                          row.survey_supervisor === 'NO_ENTRY' ? '' :
                          row.survey_supervisor || '',
        inspecting_authority: row.inspecting_authority === 'AUTO_POPULATE_INSPECTOR_NAME' ? '' :
                             row.inspecting_authority === 'AUTO_POPULATE_INSPECTOR_ID' ? '' :
                             row.inspecting_authority === 'AUTO_POPULATE_INSPECTION_DATE' ? '' :
                             row.inspecting_authority === 'AUTO_POPULATE_RECEIPT_DATE' ? '' :
                             row.inspecting_authority === 'AUTO_POPULATE_SCRUTINY_DATE' ? '' :
                             row.inspecting_authority === 'AUTO_POPULATE_INSPECTOR_DISPATCH_DATE' ? '' :
                             row.inspecting_authority === 'NO_ENTRY' ? '' :
                             row.inspecting_authority || ''
      }))
    }));
  };

  const filteredSurveys = allocatedSurveys.filter(survey => {
    const matchesSearch = survey.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.gstn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.dslNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || survey.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center"><Clock size={12} className="mr-1" />Draft</span>;
      case 'submitted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"><FileText size={12} className="mr-1" />Submitted</span>;
      case 'scrutiny':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center"><AlertCircle size={12} className="mr-1" />In Scrutiny</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle size={12} className="mr-1" />Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center"><AlertCircle size={12} className="mr-1" />Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  const handleStartSurvey = (survey: AllocatedSurvey) => {
    setSelectedSurvey(survey);
    setCurrentBlock(0);
    setShowSurveyForm(true);
    // Initialize survey responses with enterprise data
    setSurveyResponses({
      gstin: survey.gstn,
      dsl_number: survey.dslNumber,
      enterprise_name_current: survey.enterpriseName
    });
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setSurveyResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSaveBlock = () => {
    // Save current block data
    alert('Block data saved successfully!');
  };

  const handleSaveAsDraft = () => {
    // Save current survey as draft
    alert('Survey saved as draft successfully!');
  };

  const handleViewSurvey = (survey: AllocatedSurvey) => {
    setSelectedSurvey(survey);
    setShowViewModal(true);
  };

  const handleBlockNavigation = (blockIndex: number) => {
    setCurrentBlock(blockIndex);
  };

  const handleNextBlock = () => {
    const surveyBlocks = getSurveyBlocks();
    if (currentBlock < surveyBlocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
    }
  };

  const handlePreviousBlock = () => {
    if (currentBlock > 0) {
      setCurrentBlock(currentBlock - 1);
    }
  };

  const handleSubmitSurvey = () => {
    alert('Survey submitted successfully!');
    setShowSurveyForm(false);
    setSelectedSurvey(null);
    setSurveyResponses({});
  };

  const renderSurveyForm = () => {
    const surveyBlocks = getSurveyBlocks(user);
    const block = surveyBlocks[currentBlock];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{block.name}</h2>
            <p className="text-sm text-gray-600">{block.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Block {currentBlock + 1} of {surveyBlocks.length}
            </span>
            <button
              onClick={() => setShowSurveyForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Enterprise Info Header */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Enterprise Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Enterprise:</span>
              <p className="text-blue-900">{selectedSurvey?.enterpriseName}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">GSTIN:</span>
              <p className="text-blue-900 font-mono">{selectedSurvey?.gstn}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">DSL Number:</span>
              <p className="text-blue-900 font-mono">{selectedSurvey?.dslNumber}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Navigate to Block:</span>
              <select
                value={currentBlock}
                onChange={(e) => handleBlockNavigation(parseInt(e.target.value))}
                className="mt-1 w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {surveyBlocks.map((block, index) => (
                  <option key={block.id} value={index}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Survey Form Fields */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {block.isGrid ? (
            <div className="overflow-x-auto">
              <h4 className="font-medium text-gray-900 mb-4">Grid Data Entry</h4>
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {block.gridColumns?.map((column) => (
                      <th key={column.id} className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        {column.label}
                        {column.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.gridData?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {block.gridColumns?.map((column) => (
                        <td key={column.id} className="px-4 py-2 border border-gray-300">
                          {column.type === 'select' ? (
                            <select
                              value={surveyResponses[`${block.id}_${rowIndex}_${column.id}`] || row[column.id] || ''}
                              onChange={(e) => handleFieldChange(`${block.id}_${rowIndex}_${column.id}`, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select</option>
                              <option value="1">Yes</option>
                              <option value="2">No</option>
                            </select>
                          ) : (
                            <input
                              type={column.type}
                              value={surveyResponses[`${block.id}_${rowIndex}_${column.id}`] || row[column.id] || ''}
                              onChange={(e) => handleFieldChange(`${block.id}_${rowIndex}_${column.id}`, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Enter ${column.label.toLowerCase()}`}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {block.fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.readOnly && <span className="text-blue-500 ml-1">(Read-only)</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      readOnly={field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        (field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())) ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                      rows={3}
                      placeholder={(field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())) ? '' : `Enter ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      disabled={field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        (field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())) ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                    >
                      <option value="">Select {field.label}</option>
                      <option value="1">Rural</option>
                      <option value="2">Urban</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      readOnly={field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        (field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())) ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                      placeholder={(field.readOnly || (field.validation === 'ds_user_only' && !isDSUser())) ? '' : `Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                  
                  {/* Special handling for Block 14 - DS User only */}
                  {field.validation === 'ds_user_only' && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm font-medium text-yellow-800">
                          DS User Access Required
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        This field can only be edited by DS Users (Data Scrutinizers)
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (currentBlock > 0) {
                setCurrentBlock(currentBlock - 1);
              }
            }}
            disabled={currentBlock === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Block
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSaveBlock}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Block
            </button>
            
            <button
              onClick={handleSaveAsDraft}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Save as Draft
            </button>
            
            {currentBlock === getSurveyBlocks().length - 1 ? (
              <button
                onClick={handleSubmitSurvey}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Survey
              </button>
            ) : (
              <button
                onClick={() => {
                  const surveyBlocks = getSurveyBlocks();
                  if (currentBlock < surveyBlocks.length - 1) {
                    setCurrentBlock(currentBlock + 1);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next Block
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderViewModal = () => {
    if (!selectedSurvey || !showViewModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Survey Details</h3>
            <button 
              onClick={() => setShowViewModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enterprise Name
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.enterpriseName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTN
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-mono">{selectedSurvey.gstn}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DSL Number
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-mono">{selectedSurvey.dslNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.sector}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="p-2">{getStatusBadge(selectedSurvey.status)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Modified
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.lastModified}</p>
              </div>
            </div>
            
            {selectedSurvey.compiler && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compiler
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.compiler}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowViewModal(false);
                handleStartSurvey(selectedSurvey);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Start/Continue Survey
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showSurveyForm) {
    return (
      <div className="space-y-6">
        {renderSurveyForm()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClipboardList size={16} />
          <span>Allocated Surveys</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by enterprise name, GSTN, or DSL..."
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
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="scrutiny">In Scrutiny</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Allocated Surveys Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Allocated Surveys</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enterprise Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GSTN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DSL Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSurveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{survey.enterpriseName}</div>
                    {survey.compiler && (
                      <div className="text-sm text-gray-500">Compiler: {survey.compiler}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{survey.gstn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{survey.dslNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{survey.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(survey.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{survey.lastModified}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewSurvey(survey)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleStartSurvey(survey)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="Start/Continue Survey"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* View Modal */}
      {renderViewModal()}
    </div>
  );
};

export default SurveyManagement;