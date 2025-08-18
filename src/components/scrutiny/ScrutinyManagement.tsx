import React, { useState } from 'react';
import { Search, Filter, Eye, MessageSquare, CheckCircle, AlertCircle, Clock, FileText, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { surveyBlocks as allSurveyBlocks } from '../../data/surveyBlocks';

interface ScrutinySurvey {
  id: string;
  enterpriseName: string;
  gstn: string;
  dslNumber: string;
  sector: string;
  status: 'submitted' | 'scrutiny' | 'approved' | 'rejected';
  lastModified: string;
  compiler?: string;
  scrutinizer?: string;
  commentsCount: number;
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

interface ScrutinyComment {
  id: string;
  blockId: string;
  fieldId: string;
  comment: string;
  scrutinizer: string;
  timestamp: string;
  resolved: boolean;
}

const ScrutinyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSurvey, setSelectedSurvey] = useState<ScrutinySurvey | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [showScrutinyForm, setShowScrutinyForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [comments, setComments] = useState<ScrutinyComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFieldForComment, setSelectedFieldForComment] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<{[key: string]: any}>({});
  const [collapsedComments, setCollapsedComments] = useState<{[key: string]: boolean}>({});

  // Mock scrutiny surveys data with GSTN
  const scrutinySurveys: ScrutinySurvey[] = [
    {
      id: '1',
      enterpriseName: 'ABC Manufacturing Ltd.',
      gstn: '27AABCU9603R1ZX',
      dslNumber: 'DSL001',
      sector: 'Manufacturing',
      status: 'submitted',
      lastModified: '2024-01-15',
      compiler: 'John Compiler',
      commentsCount: 0
    },
    {
      id: '2',
      enterpriseName: 'XYZ Services Pvt. Ltd.',
      gstn: '29AABCU9603R1ZY',
      dslNumber: 'DSL002',
      sector: 'Services',
      status: 'scrutiny',
      lastModified: '2024-01-14',
      compiler: 'Jane Compiler',
      scrutinizer: 'Mike Scrutinizer',
      commentsCount: 3
    },
    {
      id: '3',
      enterpriseName: 'PQR Construction Co.',
      gstn: '07AABCU9603R1ZZ',
      dslNumber: 'DSL003',
      sector: 'Construction',
      status: 'approved',
      lastModified: '2024-01-13',
      compiler: 'Sarah Compiler',
      scrutinizer: 'David Scrutinizer',
      commentsCount: 1
    },
    {
      id: '4',
      enterpriseName: 'LMN Trading Corp.',
      gstn: '19AABCU9603R1ZA',
      dslNumber: 'DSL004',
      sector: 'Trade',
      status: 'rejected',
      lastModified: '2024-01-12',
      compiler: 'Tom Compiler',
      scrutinizer: 'Lisa Scrutinizer',
      commentsCount: 5
    }
  ];

  // Get survey blocks with GSTIN and DSL fields populated and sample data for scrutiny
  const getSurveyBlocks = (): SurveyBlock[] => {
    // Sample data for scrutiny review
    const sampleData: {[key: string]: any} = {
      'enterprise_address_current': '123 Industrial Area, Manufacturing Zone, Mumbai - 400001',
      'contact_person_name': 'Rajesh Kumar',
      'contact_person_phone': '+91-9876543210',
      'contact_email': 'rajesh@abcmfg.com',
      'sector': '2', // Urban
      'type_of_organization': '1', // Private Limited
      'major_activity_code': '25111',
      'accounting_period': '04/2023 to 03/2024',
      'total_persons_worked': '150',
      'total_wages_salaries': '12500000',
      'working_days_enterprise': '300'
    };

    return allSurveyBlocks.map(block => ({
      ...block,
      fields: block.fields.map(field => ({
        ...field,
        value: field.id === 'gstin' || field.id.includes('gstin') ? selectedSurvey?.gstn || '' :
               field.id === 'dsl_number' || field.id.includes('dsl') ? selectedSurvey?.dslNumber || '' :
               field.id === 'enterprise_name_current' ? selectedSurvey?.enterpriseName || '' :
               sampleData[field.id] || surveyResponses[field.id] || field.value || '',
        readOnly: true // All fields are read-only in scrutiny mode
      })),
      gridData: block.gridData?.map(row => ({
        ...row,
        // Add sample data for grid rows if needed
      }))
    }));
  };

  // Mock comments
  const mockComments: ScrutinyComment[] = [
    {
      id: '1',
      blockId: 'block-1',
      fieldId: 'major_activity',
      comment: 'Please verify the NIC code. It seems incorrect for the described activity.',
      scrutinizer: 'Mike Scrutinizer',
      timestamp: '2024-01-14 10:30:00',
      resolved: false
    },
    {
      id: '2',
      blockId: 'block-2',
      fieldId: 'total_wages',
      comment: 'The total wages amount seems unusually high. Please double-check the calculation.',
      scrutinizer: 'Mike Scrutinizer',
      timestamp: '2024-01-14 11:15:00',
      resolved: false
    }
  ];

  const filteredSurveys = scrutinySurveys.filter(survey => {
    const matchesSearch = survey.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.gstn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.dslNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || survey.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const handleStartScrutiny = (survey: ScrutinySurvey) => {
    setSelectedSurvey(survey);
    setCurrentBlock(0);
    setShowScrutinyForm(true);
    setComments(mockComments);
    // Initialize survey responses with enterprise data
    setSurveyResponses({
      gstin: survey.gstn,
      dsl_number: survey.dslNumber,
      enterprise_name_current: survey.enterpriseName
    });
  };

  const handleAddComment = (fieldId: string) => {
    if (!newComment.trim()) return;
    
    const surveyBlocks = getSurveyBlocks();
    const comment: ScrutinyComment = {
      id: Date.now().toString(),
      blockId: surveyBlocks[currentBlock].id,
      fieldId: fieldId,
      comment: newComment,
      scrutinizer: 'Current Scrutinizer',
      timestamp: new Date().toLocaleString(),
      resolved: false
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    setSelectedFieldForComment(null);
    
    // Show success message
    alert('Comment added successfully!');
  };

  const handleViewSurvey = (survey: ScrutinySurvey) => {
    setSelectedSurvey(survey);
    setShowViewModal(true);
  };

  const handleBlockNavigation = (blockIndex: number) => {
    setCurrentBlock(blockIndex);
  };

  const handleApproveBlock = () => {
    alert('Block approved successfully!');
  };

  const handleRejectBlock = () => {
    alert('Block rejected. Comments have been added for the compiler to review.');
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

  const handleFinalApproval = () => {
    alert('Survey approved and finalized!');
    setShowScrutinyForm(false);
    setSelectedSurvey(null);
    setSurveyResponses({});
  };

  const getFieldComments = (fieldId: string) => {
    const surveyBlocks = getSurveyBlocks();
    return comments.filter(c => c.fieldId === fieldId && c.blockId === surveyBlocks[currentBlock].id);
  };

  const toggleCommentsCollapse = (fieldId: string) => {
    setCollapsedComments(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const isCommentsCollapsed = (fieldId: string) => {
    return collapsedComments[fieldId] || false;
  };
  const renderScrutinyForm = () => {
    const surveyBlocks = getSurveyBlocks();
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
              onClick={() => setShowScrutinyForm(false)}
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

        {/* Scrutiny Form Fields */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {block.isGrid ? (
            <div className="overflow-x-auto">
              <h4 className="font-medium text-gray-900 mb-4">Grid Data Review</h4>
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {block.gridColumns?.map((column) => (
                      <th key={column.id} className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        {column.label}
                        {column.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    ))}
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {block.gridData?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {block.gridColumns?.map((column) => (
                        <td key={column.id} className="px-4 py-2 border border-gray-300">
                          {/* Handle Block 12 special display in scrutiny */}
                          {block.id === 'block-12' ? (
                            row[column.id] === 'NO_ENTRY' || row[column.id] === '' ? (
                              <div className="text-sm text-gray-400 italic">-</div>
                            ) : (
                              <div className="text-sm text-gray-900">{row[column.id]}</div>
                            )
                          ) : (
                            <div className="text-sm text-gray-900">{row[column.id] || '-'}</div>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2 border border-gray-300">
                        <button
                          onClick={() => setSelectedFieldForComment(`${block.id}_${rowIndex}`)}
                          className="text-orange-600 hover:text-orange-800 p-1 rounded"
                          title="Add Comment"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {block.fields.map((field) => {
                const fieldComments = getFieldComments(field.id);
                return (
                  <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        {field.readOnly && <span className="text-blue-500 ml-1">(Read-only)</span>}
                      </label>
                      <button
                        onClick={() => setSelectedFieldForComment(field.id)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded"
                        title="Add Comment"
                      >
                        <MessageSquare size={16} />
                      </button>
                      {/* Show comment count if there are comments for this row */}
                      {fieldComments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => toggleCommentsCollapse(field.id)}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded flex items-center space-x-1"
                            title="Toggle Comments"
                          >
                            <span className="text-xs">{fieldComments.length}</span>
                            {isCommentsCollapsed(field.id) ? (
                              <ChevronDown size={12} />
                            ) : (
                              <ChevronUp size={12} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.value}
                        readOnly
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 ${
                          fieldComments.length > 0 ? 'border-orange-300 bg-orange-50' : ''
                        }`}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={field.value}
                        disabled
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 ${
                          fieldComments.length > 0 ? 'border-orange-300 bg-orange-50' : ''
                        }`}
                      >
                        <option value={field.value}>{field.value}</option>
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={field.value}
                        readOnly
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 ${
                          fieldComments.length > 0 ? 'border-orange-300 bg-orange-50' : ''
                        }`}
                      />
                    )}
                    
                    {/* Field Comments */}
                    {fieldComments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <div className="bg-orange-50 border border-orange-200 rounded">
                          <div className="flex items-center justify-between p-2 cursor-pointer" onClick={() => toggleCommentsCollapse(field.id)}>
                            <div className="flex items-center space-x-2">
                              <MessageSquare size={14} className="text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">
                                {fieldComments.length} Comment{fieldComments.length > 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-orange-600">
                                ({fieldComments.filter(c => !c.resolved).length} pending)
                              </span>
                            </div>
                            {isCommentsCollapsed(field.id) ? (
                              <ChevronDown size={16} className="text-orange-600" />
                            ) : (
                              <ChevronUp size={16} className="text-orange-600" />
                            )}
                          </div>
                          {!isCommentsCollapsed(field.id) && (
                            <div className="px-3 pb-3 space-y-2">
                              {fieldComments.map((comment) => (
                                <div key={comment.id} className="bg-white border border-orange-200 rounded p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm text-orange-800">{comment.comment}</p>
                                      <p className="text-xs text-orange-600 mt-1">
                                        {comment.scrutinizer} • {comment.timestamp}
                                      </p>
                                    </div>
                                    {!comment.resolved && (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                        Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Add Comment Form */}
                    {selectedFieldForComment === field.id && (
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add your scrutiny comment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setSelectedFieldForComment(null)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddComment(field.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Send size={14} />
                            <span>Add Comment</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment Form for Grid */}
          {selectedFieldForComment?.includes('_') && selectedFieldForComment.startsWith(block.id) && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <h5 className="font-medium text-gray-900 mb-2">Add Comment for Row</h5>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your scrutiny comment for this row..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setSelectedFieldForComment(null)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddComment(selectedFieldForComment)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Send size={14} />
                  <span>Add Comment</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrutiny Actions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Block Scrutiny Actions</h4>
          <div className="flex space-x-3">
            <button
              onClick={handleApproveBlock}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Approve Block</span>
            </button>
            <button
              onClick={handleRejectBlock}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <AlertCircle size={16} />
              <span>Reject Block</span>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
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
            {currentBlock === getSurveyBlocks().length - 1 ? (
              <button
                onClick={handleFinalApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Final Approval
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

        {/* Comments Summary Table */}
        {comments.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
              Scrutiny Comments Summary ({comments.length} comments)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Block
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Field/Item
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Comment
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Scrutinizer
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Timestamp
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => {
                    const block = getSurveyBlocks().find(b => b.id === comment.blockId);
                    const field = block?.fields.find(f => f.id === comment.fieldId);
                    return (
                      <tr key={comment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="text-sm text-gray-900">{block?.name || 'Unknown Block'}</div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="text-sm text-gray-900">
                            {field?.label || comment.fieldId}
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {comment.comment}
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="text-sm text-gray-900">{comment.scrutinizer}</div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="text-sm text-gray-900">{comment.timestamp}</div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comment.resolved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {comment.resolved ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="flex items-center space-x-2">
                            {!comment.resolved && (
                              <button
                                onClick={() => {
                                  setComments(comments.map(c => 
                                    c.id === comment.id ? { ...c, resolved: true } : c
                                  ));
                                }}
                                className="text-green-600 hover:text-green-800 p-1 rounded"
                                title="Mark as Resolved"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this comment?')) {
                                  setComments(comments.filter(c => c.id !== comment.id));
                                }
                              }}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Delete Comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Comments Summary Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Total Comments: {comments.length}</span>
                <span>Pending: {comments.filter(c => !c.resolved).length}</span>
                <span>Resolved: {comments.filter(c => c.resolved).length}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all resolved comments?')) {
                    setComments(comments.filter(c => !c.resolved));
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear Resolved Comments
              </button>
            </div>
          </div>
        )}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments Count
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.commentsCount}</p>
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
            
            {selectedSurvey.scrutinizer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scrutinizer
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSurvey.scrutinizer}</p>
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
                handleStartScrutiny(selectedSurvey);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
            >
              Start Scrutiny
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showScrutinyForm) {
    return (
      <div className="space-y-6">
        {renderScrutinyForm()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Scrutiny Management</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Search size={16} />
          <span>Survey Scrutiny</span>
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
                <option value="submitted">Submitted</option>
                <option value="scrutiny">In Scrutiny</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys for Scrutiny Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Surveys for Scrutiny</h3>
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
                  Comments
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
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{survey.commentsCount}</span>
                    </div>
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
                        onClick={() => handleStartScrutiny(survey)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded"
                        title="Start Scrutiny"
                      >
                        <Search size={16} />
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

export default ScrutinyManagement;