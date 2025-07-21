import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Download, Upload, Save, X, HelpCircle } from 'lucide-react';

interface NoticeTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NoticeData {
  surveyYear: string;
  enterpriseName: string;
  gstin: string;
  enterpriseAddress: string;
  dslNumber: string;
  sector: string;
  dueDate: string;
  signatoryName: string;
  signatoryDesignation: string;
  contactNumber: string;
  emailAddress: string;
  surveyType: string;
  referenceNumber: string;
  issueDate: string;
}

const GenerateNotice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'templates'>('generate');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariableHelp, setShowVariableHelp] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: ''
  });

  const [noticeData, setNoticeData] = useState<NoticeData>({
    surveyYear: '2024-25',
    enterpriseName: '',
    gstin: '',
    enterpriseAddress: '',
    dslNumber: '',
    sector: '',
    dueDate: '',
    signatoryName: '',
    signatoryDesignation: '',
    contactNumber: '',
    emailAddress: '',
    surveyType: 'Annual Survey of Service Sector Enterprises (ASSSE)',
    referenceNumber: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const defaultTemplate = `GOVERNMENT OF INDIA
MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
NATIONAL SAMPLE SURVEY OFFICE
<<REGIONAL_OFFICE_ADDRESS>>

Notice for Conduct of <<SURVEY_TYPE>>

Reference No: <<REFERENCE_NUMBER>>
Date: <<ISSUE_DATE>>

To,
<<ENTERPRISE_NAME>>
GSTIN: <<GSTIN>>
<<ENTERPRISE_ADDRESS>>

Subject: Notice for conduct of <<SURVEY_TYPE>> for the year <<SURVEY_YEAR>>

Sir/Madam,

This is to inform you that your enterprise has been selected for the <<SURVEY_TYPE>> for the year <<SURVEY_YEAR>>. The survey is being conducted by the National Sample Survey Office (NSSO), Ministry of Statistics and Programme Implementation, Government of India.

Enterprise Details:
- Enterprise Name: <<ENTERPRISE_NAME>>
- GSTIN: <<GSTIN>>
- DSL Number: <<DSL_NUMBER>>
- Sector: <<SECTOR>>
- Address: <<ENTERPRISE_ADDRESS>>

You are hereby requested to:
1. Cooperate with the survey team during data collection
2. Provide accurate information as required
3. Submit the completed survey forms by <<DUE_DATE>>

For any queries, please contact:
Phone: <<CONTACT_NUMBER>>
Email: <<EMAIL_ADDRESS>>

Your cooperation in this national endeavor is highly appreciated.

Yours faithfully,

<<SIGNATORY_NAME>>
<<SIGNATORY_DESIGNATION>>
National Sample Survey Office`;

  const variables = [
    'SURVEY_YEAR', 'ENTERPRISE_NAME', 'GSTIN', 'ENTERPRISE_ADDRESS',
    'DSL_NUMBER', 'SECTOR', 'DUE_DATE', 'SIGNATORY_NAME', 'SIGNATORY_DESIGNATION',
    'CONTACT_NUMBER', 'EMAIL_ADDRESS', 'SURVEY_TYPE', 'REFERENCE_NUMBER',
    'ISSUE_DATE', 'REGIONAL_OFFICE_ADDRESS'
  ];

  useEffect(() => {
    // Load templates from localStorage or API
    const savedTemplates = localStorage.getItem('noticeTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Add default template
      const defaultTemplateObj: NoticeTemplate = {
        id: 'default',
        name: 'ASSSE Survey Notice Template',
        content: defaultTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTemplates([defaultTemplateObj]);
      setSelectedTemplate('default');
    }
  }, []);

  const saveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      alert('Please provide both template name and content');
      return;
    }

    const template: NoticeTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem('noticeTemplates', JSON.stringify(updatedTemplates));
    
    setNewTemplate({ name: '', content: '' });
    setShowCreateTemplate(false);
    alert('Template saved successfully!');
  };

  const substituteVariables = (content: string, data: NoticeData): string => {
    let result = content;
    
    const substitutions: Record<string, string> = {
      'SURVEY_YEAR': data.surveyYear,
      'ENTERPRISE_NAME': data.enterpriseName,
      'GSTIN': data.gstin,
      'ENTERPRISE_ADDRESS': data.enterpriseAddress,
      'DSL_NUMBER': data.dslNumber,
      'SECTOR': data.sector,
      'DUE_DATE': data.dueDate,
      'SIGNATORY_NAME': data.signatoryName,
      'SIGNATORY_DESIGNATION': data.signatoryDesignation,
      'CONTACT_NUMBER': data.contactNumber,
      'EMAIL_ADDRESS': data.emailAddress,
      'SURVEY_TYPE': data.surveyType,
      'REFERENCE_NUMBER': data.referenceNumber,
      'ISSUE_DATE': data.issueDate,
      'REGIONAL_OFFICE_ADDRESS': 'Regional Office Address'
    };

    Object.entries(substitutions).forEach(([key, value]) => {
      const regex = new RegExp(`<<${key}>>`, 'g');
      result = result.replace(regex, value || `<<${key}>>`);
    });

    return result;
  };

  const generateNotice = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      alert('Please select a template');
      return;
    }

    const finalContent = substituteVariables(template.content, noticeData);
    
    // Create and download the notice
    const blob = new Blob([finalContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notice_${noticeData.enterpriseName || 'Enterprise'}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewNotice = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      alert('Please select a template');
      return;
    }
    setShowPreview(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Notice</h1>
        <p className="text-gray-600">Create and manage survey notices for enterprises</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Generate Notice
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Manage Templates
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Select Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={previewNotice}
                  disabled={!selectedTemplate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => setShowVariableHelp(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Variables
                </button>
              </div>
            </div>
          </div>

          {/* Notice Data Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Notice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Year
                </label>
                <input
                  type="text"
                  value={noticeData.surveyYear}
                  onChange={(e) => setNoticeData({...noticeData, surveyYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enterprise Name
                </label>
                <input
                  type="text"
                  value={noticeData.enterpriseName}
                  onChange={(e) => setNoticeData({...noticeData, enterpriseName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={noticeData.gstin}
                  onChange={(e) => setNoticeData({...noticeData, gstin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enterprise Address
                </label>
                <textarea
                  value={noticeData.enterpriseAddress}
                  onChange={(e) => setNoticeData({...noticeData, enterpriseAddress: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DSL Number
                </label>
                <input
                  type="text"
                  value={noticeData.dslNumber}
                  onChange={(e) => setNoticeData({...noticeData, dslNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  value={noticeData.sector}
                  onChange={(e) => setNoticeData({...noticeData, sector: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={noticeData.dueDate}
                  onChange={(e) => setNoticeData({...noticeData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={noticeData.signatoryName}
                  onChange={(e) => setNoticeData({...noticeData, signatoryName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signatory Designation
                </label>
                <input
                  type="text"
                  value={noticeData.signatoryDesignation}
                  onChange={(e) => setNoticeData({...noticeData, signatoryDesignation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={noticeData.contactNumber}
                  onChange={(e) => setNoticeData({...noticeData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={noticeData.emailAddress}
                  onChange={(e) => setNoticeData({...noticeData, emailAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={noticeData.referenceNumber}
                  onChange={(e) => setNoticeData({...noticeData, referenceNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={generateNotice}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Notice
            </button>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Create Template Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notice Templates</h2>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>

          {/* Templates List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setActiveTab('generate');
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Use Template
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Notice Template</h3>
              <button
                onClick={() => setShowCreateTemplate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Enter template content with variables in << >> format"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowVariableHelp(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  View Variables
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowCreateTemplate(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notice Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {selectedTemplate ? substituteVariables(
                  templates.find(t => t.id === selectedTemplate)?.content || '',
                  noticeData
                ) : ''}
              </pre>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variable Help Modal */}
      {showVariableHelp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Available Variables</h3>
              <button
                onClick={() => setShowVariableHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Use these variables in your template by wrapping them with &lt;&lt; and &gt;&gt;
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {variables.map((variable) => (
                  <div key={variable} className="bg-gray-50 p-2 rounded text-sm font-mono">
                    &lt;&lt;{variable}&gt;&gt;
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowVariableHelp(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

export default GenerateNotice;