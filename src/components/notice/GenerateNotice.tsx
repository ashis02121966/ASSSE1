import React, { useState } from 'react';
import { FileOutput, Download, Send, CheckSquare, Calendar, User, Plus, Edit, Eye, X, Save, FileText } from 'lucide-react';

interface NoticeTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

const GenerateNotice: React.FC = () => {
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [noticeTemplate, setNoticeTemplate] = useState('default');
  const [signatory, setSignatory] = useState('ro-user');
  const [selectAll, setSelectAll] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedTemplateForView, setSelectedTemplateForView] = useState<NoticeTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: ''
  });

  const frames = [
    { id: '1', fileName: 'ASI_Frame_2023_Manufacturing.xlsx', sector: 'Manufacturing', enterprises: 1250, status: 'allocated' },
    { id: '2', fileName: 'ASI_Frame_2023_Services.xlsx', sector: 'Services', enterprises: 890, status: 'allocated' },
    { id: '3', fileName: 'ASI_Frame_2023_Construction.xlsx', sector: 'Construction', enterprises: 670, status: 'allocated' },
  ];

  const [templates, setTemplates] = useState<NoticeTemplate[]>([
    { 
      id: 'default', 
      name: 'Default Notice Template', 
      content: `GOVERNMENT OF INDIA
MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
NATIONAL STATISTICAL OFFICE
ECONOMIC STATISTICS DIVISION

NOTICE

Subject: Annual Survey of Service Sector Enterprises (ASSSE) for the year <<SURVEY_YEAR>>

Dear Sir/Madam,

This is to inform you that your enterprise "<<ENTERPRISE_NAME>>" having GSTIN <<GSTIN>> located at <<ENTERPRISE_ADDRESS>> has been selected for the Annual Survey of Service Sector Enterprises (ASSSE) for the year <<SURVEY_YEAR>>.

The survey is being conducted under the Collection of Statistics Act, 2008. Your cooperation in providing the required information is mandatory under this Act.

Survey Details:
- Survey Period: <<SURVEY_PERIOD>>
- DSL Number: <<DSL_NUMBER>>
- Sector: <<SECTOR>>
- Due Date: <<DUE_DATE>>

You are requested to:
1. Fill the survey schedule completely and accurately
2. Submit the filled schedule within <<SUBMISSION_DAYS>> days from the date of this notice
3. Provide all supporting documents as required
4. Cooperate with the survey officials during the data collection process

For any queries or clarifications, please contact:
<<CONTACT_PERSON>>
<<CONTACT_DESIGNATION>>
Phone: <<CONTACT_PHONE>>
Email: <<CONTACT_EMAIL>>

Your cooperation is highly appreciated.

Yours faithfully,

<<SIGNATORY_NAME>>
<<SIGNATORY_DESIGNATION>>
<<OFFICE_ADDRESS>>

Date: <<NOTICE_DATE>>
Place: <<PLACE>>`,
      isDefault: true,
      createdBy: 'System',
      createdAt: '2024-01-01'
    },
    { 
      id: 'urgent', 
      name: 'Urgent Notice Template', 
      content: `URGENT NOTICE

GOVERNMENT OF INDIA
MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION
NATIONAL STATISTICAL OFFICE

Subject: URGENT - Annual Survey of Service Sector Enterprises (ASSSE) for the year <<SURVEY_YEAR>>

Dear Sir/Madam,

This is an URGENT notice regarding your enterprise "<<ENTERPRISE_NAME>>" (GSTIN: <<GSTIN>>) for the Annual Survey of Service Sector Enterprises.

IMMEDIATE ACTION REQUIRED:
- Survey must be completed within <<SUBMISSION_DAYS>> days
- Non-compliance may result in penalties under Collection of Statistics Act, 2008

Contact immediately: <<CONTACT_PHONE>>

<<SIGNATORY_NAME>>
<<SIGNATORY_DESIGNATION>>
Date: <<NOTICE_DATE>>`,
      isDefault: false,
      createdBy: 'Admin User',
      createdAt: '2024-01-10'
    },
    { 
      id: 'reminder', 
      name: 'Reminder Notice Template', 
      content: `REMINDER NOTICE

Subject: Reminder - Annual Survey of Service Sector Enterprises (ASSSE)

Dear Sir/Madam,

This is a reminder that your enterprise "<<ENTERPRISE_NAME>>" has not yet submitted the required survey information.

Original Due Date: <<ORIGINAL_DUE_DATE>>
Extended Due Date: <<DUE_DATE>>

Please submit immediately to avoid penalties.

<<SIGNATORY_NAME>>
<<SIGNATORY_DESIGNATION>>`,
      isDefault: false,
      createdBy: 'RO User',
      createdAt: '2024-01-15'
    }
  ];

  const signatories = [
    { id: 'ro-user', name: 'Regional Officer', designation: 'RO, ENSD' },
    { id: 'ad-user', name: 'Assistant Director', designation: 'AD, ENSD' },
    { id: 'dd-user', name: 'Deputy Director', designation: 'DD, ENSD' },
  ];

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Please provide template name and content');
      return;
    }

    const templateId = `template-${Date.now()}`;
    const template: NoticeTemplate = {
      id: templateId,
      name: newTemplate.name,
      content: newTemplate.content,
      isDefault: false,
      createdBy: 'Current User', // In real app, this would be from auth context
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', content: '' });
    setShowCreateTemplate(false);
    alert('Template created successfully!');
  };

  const handleViewTemplate = (template: NoticeTemplate) => {
    setSelectedTemplateForView(template);
    setShowTemplateModal(true);
  };

  const getVariableHelp = () => {
    return [
      '<<SURVEY_YEAR>> - Current survey year',
      '<<ENTERPRISE_NAME>> - Name of the enterprise',
      '<<GSTIN>> - Enterprise GSTIN number',
      '<<ENTERPRISE_ADDRESS>> - Enterprise address',
      '<<SURVEY_PERIOD>> - Survey period dates',
      '<<DSL_NUMBER>> - DSL number from frame',
      '<<SECTOR>> - Enterprise sector',
      '<<DUE_DATE>> - Survey submission due date',
      '<<SUBMISSION_DAYS>> - Number of days for submission',
      '<<CONTACT_PERSON>> - Contact person name',
      '<<CONTACT_DESIGNATION>> - Contact person designation',
      '<<CONTACT_PHONE>> - Contact phone number',
      '<<CONTACT_EMAIL>> - Contact email address',
      '<<SIGNATORY_NAME>> - Name of signatory authority',
      '<<SIGNATORY_DESIGNATION>> - Designation of signatory',
      '<<OFFICE_ADDRESS>> - Office address',
      '<<NOTICE_DATE>> - Date of notice generation',
      '<<PLACE>> - Place of notice generation',
      '<<ORIGINAL_DUE_DATE>> - Original due date (for reminders)'
    ];
  };

  const generatedNotices = [
    { id: '1', frameId: '1', enterpriseName: 'ABC Manufacturing Ltd.', generatedDate: '2024-01-15', status: 'sent' },
    { id: '2', frameId: '1', enterpriseName: 'XYZ Industries Pvt. Ltd.', generatedDate: '2024-01-15', status: 'generated' },
    { id: '3', frameId: '2', enterpriseName: 'Service Corp Ltd.', generatedDate: '2024-01-16', status: 'received' },
  ];

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrames(prev => 
      prev.includes(frameId) 
        ? prev.filter(id => id !== frameId)
        : [...prev, frameId]
    );
    
    // Update selectAll state based on current selection
    const updatedFrames = selectedFrames.includes(frameId) 
      ? selectedFrames.filter(id => id !== frameId)
      : [...selectedFrames, frameId];
    setSelectAll(updatedFrames.length === frames.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedFrames([]);
      setSelectAll(false);
    } else {
      // Select all frames
      setSelectedFrames(frames.map(frame => frame.id));
      setSelectAll(true);
    }
  };

  const handleGenerateNotices = () => {
    if (selectedFrames.length === 0) {
      alert('Please select frames to generate notices');
      return;
    }
    
    const selectedTemplate = templates.find(t => t.id === noticeTemplate);
    const selectedSignatory = signatories.find(s => s.id === signatory);
    
    // Simulate notice generation process
    const totalEnterprises = frames
      .filter(f => selectedFrames.includes(f.id))
      .reduce((sum, f) => sum + f.enterprises, 0);
    
    // Create a confirmation message
    const confirmMessage = `Generate notices for ${selectedFrames.length} frame(s)?\n\n` +
      `Template: ${selectedTemplate?.name}\n` +
      `Signatory: ${selectedSignatory?.name}\n` +
      `Total Enterprises: ${totalEnterprises.toLocaleString()}\n\n` +
      `This will generate ${totalEnterprises.toLocaleString()} individual notices.`;
    
    if (confirm(confirmMessage)) {
      // Simulate the generation process
      alert('Notice generation started! You will be notified when the process is complete.');
      
      // Reset selections after successful generation
      setSelectedFrames([]);
      setSelectAll(false);
      
      // In a real application, this would trigger the actual notice generation process
      console.log('Generating notices with configuration:', {
        selectedFrames,
        template: selectedTemplate,
        signatory: selectedSignatory,
        totalEnterprises
      });
    }
  };

  const handleDownloadNotice = (noticeId: string) => {
    const notice = generatedNotices.find(n => n.id === noticeId);
    if (!notice) return;
    
    // Generate proper PDF content (in a real app, this would be actual PDF data from backend)
    const fileName = `Notice_${notice.enterpriseName.replace(/[^a-zA-Z0-9]/g, '_')}_${notice.generatedDate}.pdf`;
    
    // Create a proper PDF-like content structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
72 720 Td
(NOTICE TO ENTERPRISE) Tj
0 -20 Td
(Enterprise: ${notice.enterpriseName}) Tj
0 -20 Td
(Generated on: ${notice.generatedDate}) Tj
0 -20 Td
(Status: ${notice.status}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
380
%%EOF`;
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`Downloaded notice for: ${notice.enterpriseName}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Generated</span>;
      case 'sent':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Sent</span>;
      case 'received':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Received</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Generate Notice</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckSquare size={16} />
          <span>{selectedFrames.length} frame(s) selected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frame Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Select Frames for Notice Generation</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All Frames</span>
                  </label>
                  <span className="text-sm text-gray-500">
                    ({selectedFrames.length} of {frames.length} selected)
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {frames.map((frame) => (
                  <div key={frame.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedFrames.includes(frame.id)}
                        onChange={() => handleFrameSelect(frame.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{frame.fileName}</h4>
                        <p className="text-sm text-gray-500">{frame.sector} • DSL: {frame.dslNumber} • {frame.enterprises.toLocaleString()} enterprises</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {frame.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Notices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recently Generated Notices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enterprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated Date
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
                  {generatedNotices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{notice.enterpriseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{notice.generatedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(notice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleDownloadNotice(notice.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title="Download Notice"
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Notice Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileOutput className="h-5 w-5 mr-2" />
              Notice Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Template
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={noticeTemplate}
                      onChange={(e) => setNoticeTemplate(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const template = templates.find(t => t.id === noticeTemplate);
                        if (template) handleViewTemplate(template);
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Preview Template"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created by: {templates.find(t => t.id === noticeTemplate)?.createdBy}
                    </p>
                    <button
                      onClick={() => setShowCreateTemplate(true)}
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Create Template</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signatory Authority
                </label>
                <select
                  value={signatory}
                  onChange={(e) => setSignatory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {signatories.map((sig) => (
                    <option key={sig.id} value={sig.id}>
                      {sig.name} ({sig.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Duration (Days)
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={handleGenerateNotices}
              disabled={selectedFrames.length === 0}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send size={16} />
              <span>Generate Notices</span>
            </button>
            
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar size={14} />
                <span>Notices will be generated in PDF format</span>
              </div>
              <div className="flex items-center space-x-2">
                <User size={14} />
                <span>Signed by: {signatories.find(s => s.id === signatory)?.name}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Generation Summary</h4>
            <div className="text-sm text-blue-700">
              <p>Selected Frames: {selectedFrames.length}</p>
              <p>Total Enterprises: {frames.filter(f => selectedFrames.includes(f.id)).reduce((sum, f) => sum + f.enterprises, 0).toLocaleString()}</p>
              <p>Template: {templates.find(t => t.id === noticeTemplate)?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Notice Template</h3>
              <button 
                onClick={() => setShowCreateTemplate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content *
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={20}
                    placeholder="Enter template content with variables..."
                  />
                </div>
              </div>

              {/* Variable Help */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Available Variables</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-3">
                      Use these variables in your template. They will be replaced with actual values when generating notices:
                    </p>
                    <div className="space-y-1">
                      {getVariableHelp().map((variable, index) => (
                        <div key={index} className="text-xs font-mono bg-white p-2 rounded border">
                          {variable}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Template Guidelines</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use variables within &lt;&lt; &gt;&gt; brackets</li>
                    <li>• Include signatory information at the end</li>
                    <li>• Maintain official government format</li>
                    <li>• Test template before using in production</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateTemplate(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.content}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Create Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {showTemplateModal && selectedTemplateForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Template Preview: {selectedTemplateForView.name}</h3>
              <button 
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplateForView(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Template Content</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {selectedTemplateForView.content}
                  </pre>
                </div>
              </div>

              {/* Sample Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sample Preview</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedTemplateForView.content
                      .replace(/<<SURVEY_YEAR>>/g, '2023-24')
                      .replace(/<<ENTERPRISE_NAME>>/g, 'ABC Manufacturing Ltd.')
                      .replace(/<<GSTIN>>/g, '27AABCU9603R1ZX')
                      .replace(/<<ENTERPRISE_ADDRESS>>/g, '123 Industrial Area, Mumbai - 400001')
                      .replace(/<<SURVEY_PERIOD>>/g, 'April 2023 to March 2024')
                      .replace(/<<DSL_NUMBER>>/g, 'DSL001')
                      .replace(/<<SECTOR>>/g, 'Manufacturing')
                      .replace(/<<DUE_DATE>>/g, '31st March 2024')
                      .replace(/<<SUBMISSION_DAYS>>/g, '30')
                      .replace(/<<CONTACT_PERSON>>/g, 'Regional Officer')
                      .replace(/<<CONTACT_DESIGNATION>>/g, 'RO, ENSD')
                      .replace(/<<CONTACT_PHONE>>/g, '+91-11-23456789')
                      .replace(/<<CONTACT_EMAIL>>/g, 'ro@ensd.gov.in')
                      .replace(/<<SIGNATORY_NAME>>/g, 'Current User Name')
                      .replace(/<<SIGNATORY_DESIGNATION>>/g, 'Regional Officer')
                      .replace(/<<OFFICE_ADDRESS>>/g, 'Regional Office, New Delhi')
                      .replace(/<<NOTICE_DATE>>/g, new Date().toLocaleDateString('en-IN'))
                      .replace(/<<PLACE>>/g, 'New Delhi')
                      .replace(/<<ORIGINAL_DUE_DATE>>/g, '15th March 2024')
                    }
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-2">Template Information</h5>
              <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>Created by: {selectedTemplateForView.createdBy}</div>
                <div>Created on: {selectedTemplateForView.createdAt}</div>
                <div>Type: {selectedTemplateForView.isDefault ? 'System Default' : 'Custom'}</div>
                <div>Status: Active</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplateForView(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setNoticeTemplate(selectedTemplateForView.id);
                  setShowTemplateModal(false);
                  setSelectedTemplateForView(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateNotice;