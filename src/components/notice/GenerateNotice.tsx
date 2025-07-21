import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Download, Upload, Save, X, HelpCircle, Search, Filter, Image, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockUsers } from '../../data/mockData';
import jsPDF from 'jspdf';

interface NoticeTemplate {
  id: string;
  name: string;
  content: string;
  images?: { [imageId: string]: { name: string; data: string; type: string } };
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

interface Enterprise {
  id: string;
  name: string;
  gstn: string;
  address: string;
  dslNumber: string;
  sector: string;
}

const GenerateNotice: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'templates'>('generate');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariableHelp, setShowVariableHelp] = useState(false);
  const [showAddTranslation, setShowAddTranslation] = useState(false);
  const [selectedEnterprises, setSelectedEnterprises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  
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
    signatoryName: user?.name || '',
    signatoryDesignation: '',
    contactNumber: '',
    emailAddress: '',
    surveyType: 'Annual Survey of Service Sector Enterprises (ASSSE)',
    referenceNumber: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  // Get RO users for signatory dropdown
  const roUsers = mockUsers.filter(user => 
    user.roles.some(role => role.code === 'RO_USER')
  );

  // Mock enterprises data
  const enterprises: Enterprise[] = [
    {
      id: '1',
      name: 'ABC Manufacturing Ltd.',
      gstn: '27AABCU9603R1ZX',
      address: '123 Industrial Area, Mumbai - 400001',
      dslNumber: 'DSL001',
      sector: 'Manufacturing'
    },
    {
      id: '2',
      name: 'XYZ Services Pvt. Ltd.',
      gstn: '29AABCU9603R1ZY',
      address: '456 Business Park, Pune - 411001',
      dslNumber: 'DSL002',
      sector: 'Services'
    },
    {
      id: '3',
      name: 'PQR Construction Co.',
      gstn: '07AABCU9603R1ZZ',
      address: '789 Construction Zone, Delhi - 110001',
      dslNumber: 'DSL003',
      sector: 'Construction'
    },
    {
      id: '4',
      name: 'LMN Trading Corp.',
      gstn: '19AABCU9603R1ZA',
      address: '321 Trade Center, Kolkata - 700001',
      dslNumber: 'DSL004',
      sector: 'Trade'
    }
  ];

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
    if (!newTemplate.name.trim()) {
      alert('Please provide template name');
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      alert('Please upload only JPEG, PNG, or GIF images');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const imageId = `IMG_${Date.now()}`;
      const imageTag = `<<IMAGE:${imageId}>>`;
      
      // Insert image tag at cursor position or end of content
      const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = newTemplate.content;
        const newContent = currentContent.substring(0, start) + imageTag + currentContent.substring(end);
        
        setNewTemplate(prev => ({
          ...prev,
          content: newContent
        }));
      } else {
        setNewTemplate(prev => ({
          ...prev,
          content: prev.content + '\n' + imageTag
        }));
      }
      
      // Store image data (in real app, this would be uploaded to server)
      const imageData = {
        [imageId]: {
          name: file.name,
          data: result,
          type: file.type
        }
      };
      
      // For now, store in component state (in real app, would be part of template)
      console.log('Image uploaded:', imageData);
    };
    reader.readAsDataURL(file);
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

  const handleEnterpriseSelect = (enterpriseId: string) => {
    setSelectedEnterprises(prev => 
      prev.includes(enterpriseId) 
        ? prev.filter(id => id !== enterpriseId)
        : [...prev, enterpriseId]
    );
  };

  const handleSelectAll = () => {
    const filteredEnterpriseIds = filteredEnterprises.map(e => e.id);
    setSelectedEnterprises(prev => 
      prev.length === filteredEnterpriseIds.length ? [] : filteredEnterpriseIds
    );
  };

  const generateNotices = () => {
    if (selectedEnterprises.length === 0) {
      alert('Please select at least one enterprise');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      alert('Please select a template');
      return;
    }

    const templateContent = template.content;

    // Generate PDF for each selected enterprise
    selectedEnterprises.forEach(enterpriseId => {
      const enterprise = enterprises.find(e => e.id === enterpriseId);
      if (enterprise) {
        const enterpriseNoticeData = {
          ...noticeData,
          enterpriseName: enterprise.name,
          gstin: enterprise.gstn,
          enterpriseAddress: enterprise.address,
          dslNumber: enterprise.dslNumber,
          sector: enterprise.sector
        };

        const finalContent = substituteVariables(templateContent, enterpriseNoticeData);
        
        // Generate PDF
        generatePDF(finalContent, enterprise.name, enterpriseNoticeData, template);
      }
    });

    alert(`Generated ${selectedEnterprises.length} notice(s) successfully!`);
  };

  const generatePDF = (content: string, enterpriseName: string, data: NoticeData, template: NoticeTemplate) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    const fontFamily = 'helvetica';
    pdf.setFont(fontFamily, 'normal');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Function to add header on each page
    const addHeader = () => {
      pdf.setFontSize(14);
      pdf.setFont(fontFamily, 'bold');
      pdf.text('GOVERNMENT OF INDIA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text('MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text('NATIONAL SAMPLE SURVEY OFFICE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
    };
    
    // Function to check if new page is needed
    const checkNewPage = (requiredSpace: number = 10) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
        addHeader();
      }
    };
    
    // Add initial header
    addHeader();
    
    // Process content line by line
    const lines = content.split('\n');
    pdf.setFontSize(10);
    pdf.setFont(fontFamily, 'normal');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === '') {
        yPosition += 4;
        continue;
      }
      
      // Handle image placeholders
      if (line.includes('<<IMAGE:')) {
        const imageMatch = line.match(/<<IMAGE:([^>]+)>>/);
        if (imageMatch && template.images && template.images[imageMatch[1]]) {
          checkNewPage(30);
          try {
            const imageData = template.images[imageMatch[1]];
            pdf.addImage(imageData.data, 'JPEG', margin, yPosition, 60, 20);
            yPosition += 25;
          } catch (error) {
            console.warn('Could not add image:', error);
            // Add placeholder text instead
            pdf.text('[Image: ' + (template.images[imageMatch[1]]?.name || 'Unknown') + ']', margin, yPosition);
            yPosition += 6;
          }
        }
        continue;
      }
      
      // Skip header lines as we already added them
      if (line.includes('GOVERNMENT OF INDIA') || 
          line.includes('MINISTRY OF STATISTICS') || 
          line.includes('NATIONAL SAMPLE SURVEY OFFICE')) {
        continue;
      }
      
      // Handle reference and date lines
      if (line.includes('Reference No:') || line.includes('Date:')) {
        checkNewPage(8);
        pdf.setFontSize(10);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
        continue;
      }
      
      // Handle subject line
      if (line.includes('Subject:')) {
        checkNewPage(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        const wrappedSubject = pdf.splitTextToSize(line, maxWidth);
        wrappedSubject.forEach((wrappedLine: string) => {
          pdf.text(wrappedLine, margin, yPosition);
          yPosition += 6;
        });
        pdf.setFont('helvetica', 'normal');
        yPosition += 4;
        continue;
      }
      
      // Handle "To," line
      if (line.includes('To,')) {
        checkNewPage(8);
        pdf.setFontSize(11);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
        continue;
      }
      
      // Handle enterprise details section
      if (line.includes('Enterprise Details:')) {
        checkNewPage(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(line, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition += 6;
        continue;
      }
      
      // Handle bullet points and numbered lists
      if (line.trim().match(/^[\d\-\•]/)) {
        checkNewPage(8);
        pdf.setFontSize(10);
        const wrappedLines = pdf.splitTextToSize(line, maxWidth - 10);
        wrappedLines.forEach((wrappedLine: string) => {
          checkNewPage(6);
          pdf.text(wrappedLine, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
        continue;
      }
      
      // Handle signature section
      if (line.includes('Yours faithfully') || 
          line.includes(data.signatoryName) || 
          line.includes(data.signatoryDesignation)) {
        checkNewPage(25); // Ensure enough space for signature
        yPosition += 10;
        pdf.text(line, margin, yPosition);
        yPosition += 6;
        
        // Add signature image if user has one
        if (line.includes(data.signatoryName)) {
          const selectedUser = roUsers.find(u => u.name === data.signatoryName);
          if (selectedUser?.signatureImage) {
            try {
              checkNewPage(15);
              pdf.addImage(selectedUser.signatureImage, 'PNG', margin, yPosition - 15, 40, 10);
            } catch (error) {
              console.warn('Could not add signature image:', error);
            }
          }
        } else if (line.includes(data.signatoryName) && user?.signatureImage) {
          try {
            checkNewPage(15);
            pdf.addImage(user.signatureImage, 'PNG', margin, yPosition - 15, 40, 10);
          } catch (error) {
            console.warn('Could not add signature image:', error);
          }
        }
        continue;
      }
      
      // Regular text lines
      checkNewPage(8);
      pdf.setFontSize(10);
      const wrappedLines = pdf.splitTextToSize(line, maxWidth);
      wrappedLines.forEach((wrappedLine: string) => {
        checkNewPage(6);
        pdf.text(wrappedLine, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    }
    
    // Add footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text('This is a computer generated notice', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = `ASSSE_Notice_${enterpriseName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };
  const previewNotice = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      alert('Please select a template');
      return;
    }
    setShowPreview(true);
  };

  const filteredEnterprises = enterprises.filter(enterprise => {
    const matchesSearch = enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enterprise.gstn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enterprise.dslNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' || enterprise.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Generate Notice</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText size={16} />
          <span>Survey Notice Generation</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} />
              <span>Generate Notice</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus size={16} />
              <span>Manage Templates</span>
            </button>
          </nav>
        </div>

        {activeTab === 'generate' && (
          <div className="p-6 space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setShowVariableHelp(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <HelpCircle size={16} />
                    <span>Variables</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notice Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notice Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey Year
                  </label>
                  <input
                    type="text"
                    value={noticeData.surveyYear}
                    onChange={(e) => setNoticeData({...noticeData, surveyYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signatory User
                  </label>
                  <select
                    value={noticeData.signatoryName}
                    onChange={(e) => {
                      const selectedUser = roUsers.find(u => u.name === e.target.value);
                      setNoticeData({
                        ...noticeData, 
                        signatoryName: e.target.value,
                        signatoryDesignation: selectedUser ? 'Regional Officer' : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select RO User</option>
                    {roUsers.map((roUser) => (
                      <option key={roUser.id} value={roUser.name}>
                        {roUser.name} ({roUser.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Enterprise Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Enterprises</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{selectedEnterprises.length} selected</span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search enterprises..."
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
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                    >
                      <option value="all">All Sectors</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Services">Services</option>
                      <option value="Construction">Construction</option>
                      <option value="Trade">Trade</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {selectedEnterprises.length === filteredEnterprises.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Enterprises Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedEnterprises.length > 0 && selectedEnterprises.length === filteredEnterprises.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enterprise Details
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnterprises.map((enterprise) => (
                      <tr key={enterprise.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedEnterprises.includes(enterprise.id)}
                            onChange={() => handleEnterpriseSelect(enterprise.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enterprise.name}</div>
                            <div className="text-sm text-gray-500">{enterprise.address}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{enterprise.gstn}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{enterprise.dslNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enterprise.sector}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <button
                onClick={generateNotices}
                disabled={!selectedTemplate || selectedEnterprises.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Generate PDF Notice ({selectedEnterprises.length})</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6 space-y-6">
            {/* Create Template Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notice Templates</h3>
             <div className="flex space-x-2">
               <button
                 onClick={() => setShowCreateTemplate(true)}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
               >
                 <Plus size={16} />
                 <span>Create Template</span>
               </button>
             </div>
            </div>

            {/* Templates List */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Preview
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
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate">
                          {template.content.substring(0, 100)}...
                        </div>
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
                          className="text-blue-600 hover:text-blue-800 mr-3"
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
        )}
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Content (Supports Multiple Languages)
                  </label>
                  <div className="flex space-x-2">
                    <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-flex items-center space-x-1">
                      <Image size={14} />
                      <span>Add Image</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => setShowVariableHelp(true)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 inline-flex items-center space-x-1"
                    >
                      <HelpCircle size={14} />
                      <span>Variables</span>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  You can type in multiple languages directly. Use variables like &lt;&lt;ENTERPRISE_NAME&gt;&gt; for dynamic content. Images can be inserted using the "Add Image" button.
                </div>
                <textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter template content with variables in << >> format. You can type in multiple languages directly in this text area."
                  style={{ 
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                />
              </div>
              
              <div className="flex justify-between">
                <div className="space-x-2">
                  <button
                    onClick={() => setShowVariableHelp(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <HelpCircle size={16} />
                    <span>View Variables</span>
                  </button>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowCreateTemplate(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notice Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm" style={{ fontFamily: 'inherit', lineHeight: '1.5' }}>
                {selectedTemplate ? (() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  if (template) {
                    return substituteVariables(template.content, noticeData);
                  }
                  return '';
                })() : ''}
              </pre>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variable Help Modal */}
      {showVariableHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Available Variables</h3>
              <button
                onClick={() => setShowVariableHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
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
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Image Support</h4>
                <p className="text-sm text-gray-600 mb-2">
                  You can insert images in your template using the "Add Image" button. Images will be inserted as:
                </p>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                  &lt;&lt;IMAGE:IMG_123456789&gt;&gt;
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Multilingual Support</h4>
                <p className="text-sm text-gray-600">
                  You can type directly in multiple languages in the template content area. The system supports all Indian languages and will preserve the formatting in the generated PDF notices.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowVariableHelp(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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