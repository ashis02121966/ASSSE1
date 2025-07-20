import React, { useState } from 'react';
import { FileOutput, Download, Send, CheckSquare, Calendar, User } from 'lucide-react';

const GenerateNotice: React.FC = () => {
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [noticeTemplate, setNoticeTemplate] = useState('default');
  const [signatory, setSignatory] = useState('ro-user');
  const [selectAll, setSelectAll] = useState(false);

  const frames = [
    { id: '1', fileName: 'ASI_Frame_2023_Manufacturing.xlsx', sector: 'Manufacturing', enterprises: 1250, status: 'allocated' },
    { id: '2', fileName: 'ASI_Frame_2023_Services.xlsx', sector: 'Services', enterprises: 890, status: 'allocated' },
    { id: '3', fileName: 'ASI_Frame_2023_Construction.xlsx', sector: 'Construction', enterprises: 670, status: 'allocated' },
  ];

  const templates = [
    { id: 'default', name: 'Default Notice Template', description: 'Standard survey notice template' },
    { id: 'urgent', name: 'Urgent Notice Template', description: 'For time-sensitive surveys' },
    { id: 'reminder', name: 'Reminder Notice Template', description: 'Follow-up notice template' },
  ];

  const signatories = [
    { id: 'ro-user', name: 'Regional Officer', designation: 'RO, ENSD' },
    { id: 'ad-user', name: 'Assistant Director', designation: 'AD, ENSD' },
    { id: 'dd-user', name: 'Deputy Director', designation: 'DD, ENSD' },
  ];

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
    
    // Simulate PDF download
    const fileName = `Notice_${notice.enterpriseName.replace(/[^a-zA-Z0-9]/g, '_')}_${notice.generatedDate}.pdf`;
    
    // Create a blob with sample PDF content (in real app, this would be actual PDF data)
    const samplePdfContent = `Notice for ${notice.enterpriseName}\nGenerated on: ${notice.generatedDate}\nStatus: ${notice.status}`;
    const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
    
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
                <select
                  value={noticeTemplate}
                  onChange={(e) => setNoticeTemplate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {templates.find(t => t.id === noticeTemplate)?.description}
                </p>
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
    </div>
  );
};

export default GenerateNotice;