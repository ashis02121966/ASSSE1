import React, { useState } from 'react';
import { Upload, Download, Eye, Search, Filter, AlertTriangle, CheckCircle, FileX, FileCheck } from 'lucide-react';
import { Frame } from '../../types';
import { mockFrames } from '../../data/mockData';

// Sample template data for download
const templateData = `CSOID,StateCode,SROCode,DistrictCode,DistrictName,Sector,PslNo,FrameNIC,Scheme,New Scheme,RegistrationNo,CompanyName,CompanyAddress,CompanyPlace,companyPincode,PSU,NoOfEmployees,JointReturnCode,DSLNo,IsSelected,SubSampleNo,App_SurveyYear,App_MotherUnit,PINCode,Description,EmailId,IsPrevYearSelected,ITUse,RU,App_AddEditFlg,remarks,StatusCode`;

const FrameUpload: React.FC = () => {
  const [frames, setFrames] = useState<Frame[]>(mockFrames);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dragActive, setDragActive] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [currentValidation, setCurrentValidation] = useState<ValidationResult | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);

  interface ValidationError {
    row: number;
    column: string;
    value: string;
    error: string;
    severity: 'error' | 'warning';
  }

  interface ValidationResult {
    fileName: string;
    isValid: boolean;
    totalRows: number;
    validRows: number;
    errors: ValidationError[];
    warnings: ValidationError[];
    uploadDate: string;
  }

  // Expected frame format structure
  const expectedColumns = [
    'CSOID', 'StateCode', 'SROCode', 'DistrictCode', 'DistrictName', 
    'Sector', 'PslNo', 'FrameNIC', 'Scheme', 'New Scheme', 
    'RegistrationNo', 'CompanyName', 'CompanyAddress', 'CompanyPlace', 
    'companyPincode', 'PSU', 'NoOfEmployees', 'JointReturnCode', 
    'DSLNo', 'IsSelected', 'SubSampleNo', 'App_SurveyYear', 
    'App_MotherUnit', 'PINCode', 'Description', 'EmailId', 
    'IsPrevYearSelected', 'ITUse', 'RU', 'App_AddEditFlg', 'remarks', 'StatusCode'
  ];

  const validateFrameFormat = (file: File): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            resolve({
              fileName: file.name,
              isValid: false,
              totalRows: 0,
              validRows: 0,
              errors: [{ row: 0, column: 'File', value: '', error: 'File is empty', severity: 'error' }],
              warnings: [],
              uploadDate: new Date().toISOString()
            });
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const dataRows = lines.slice(1);
          
          const errors: ValidationError[] = [];
          const warnings: ValidationError[] = [];
          let validRows = 0;

          // Check header format
          const missingColumns = expectedColumns.filter(col => !headers.includes(col));
          const extraColumns = headers.filter(col => !expectedColumns.includes(col));

          missingColumns.forEach(col => {
            errors.push({
              row: 1,
              column: col,
              value: '',
              error: `Missing required column: ${col}`,
              severity: 'error'
            });
          });

          extraColumns.forEach(col => {
            warnings.push({
              row: 1,
              column: col,
              value: '',
              error: `Unexpected column: ${col}`,
              severity: 'warning'
            });
          });

          // Validate data rows
          dataRows.forEach((line, index) => {
            const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            let rowValid = true;

            // Check if row has correct number of columns
            if (values.length !== expectedColumns.length) {
              errors.push({
                row: rowNumber,
                column: 'Row Structure',
                value: `${values.length} columns`,
                error: `Expected ${expectedColumns.length} columns, found ${values.length}`,
                severity: 'error'
              });
              rowValid = false;
            }

            // Validate specific fields
            expectedColumns.forEach((column, colIndex) => {
              const value = values[colIndex] || '';
              
              switch (column) {
                case 'CSOID':
                  if (!value || value.length === 0) {
                    errors.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'CSOID is required',
                      severity: 'error'
                    });
                    rowValid = false;
                  }
                  break;
                  
                case 'StateCode':
                  if (!value || !/^\d{2}$/.test(value)) {
                    errors.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'StateCode must be a 2-digit number',
                      severity: 'error'
                    });
                    rowValid = false;
                  }
                  break;
                  
                case 'CompanyName':
                  if (!value || value.length === 0) {
                    errors.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'Company Name is required',
                      severity: 'error'
                    });
                    rowValid = false;
                  }
                  break;
                  
                case 'PINCode':
                case 'companyPincode':
                  if (value && !/^\d{6}$/.test(value)) {
                    warnings.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'PIN Code should be a 6-digit number',
                      severity: 'warning'
                    });
                  }
                  break;
                  
                case 'EmailId':
                  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    warnings.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'Invalid email format',
                      severity: 'warning'
                    });
                  }
                  break;
                  
                case 'NoOfEmployees':
                  if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                    errors.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'Number of employees must be a valid positive number',
                      severity: 'error'
                    });
                    rowValid = false;
                  }
                  break;
                  
                case 'DSLNo':
                  if (!value || value.length === 0) {
                    errors.push({
                      row: rowNumber,
                      column: column,
                      value: value,
                      error: 'DSL Number is required',
                      severity: 'error'
                    });
                    rowValid = false;
                  }
                  break;
              }
            });

            if (rowValid) {
              validRows++;
            }
          });

          const result: ValidationResult = {
            fileName: file.name,
            isValid: errors.length === 0,
            totalRows: dataRows.length,
            validRows: validRows,
            errors: errors,
            warnings: warnings,
            uploadDate: new Date().toISOString()
          };

          resolve(result);
        } catch (error) {
          resolve({
            fileName: file.name,
            isValid: false,
            totalRows: 0,
            validRows: 0,
            errors: [{ row: 0, column: 'File', value: '', error: `File parsing error: ${error}`, severity: 'error' }],
            warnings: [],
            uploadDate: new Date().toISOString()
          });
        }
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file format
      const validationResult = await validateFrameFormat(file);
      setValidationResults(prev => [...prev, validationResult]);
      setCurrentValidation(validationResult);
      setShowValidationModal(true);
      
      // Only add frame if validation passes or has only warnings
      if (validationResult.isValid || validationResult.errors.length === 0) {
        const newFrame: Frame = {
          id: Date.now().toString(),
          fileName: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: validationResult.isValid ? 'pending' : 'pending',
          allocatedTo: [],
          enterprises: validationResult.validRows,
          sector: 'Manufacturing'
        };
        setFrames(prev => [...prev, newFrame]);
      }
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
      const file = files[0];
      handleFileUploadValidation(file);
    }
  };

  const handleFileUploadValidation = async (file: File) => {
    // Validate file format
    const validationResult = await validateFrameFormat(file);
    setValidationResults(prev => [...prev, validationResult]);
    setCurrentValidation(validationResult);
    setShowValidationModal(true);
    
    // Only add frame if validation passes or has only warnings
    if (validationResult.isValid || validationResult.errors.length === 0) {
      const newFrame: Frame = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: validationResult.isValid ? 'pending' : 'pending',
        allocatedTo: [],
        enterprises: validationResult.validRows,
        sector: 'Manufacturing'
      };
      setFrames(prev => [...prev, newFrame]);
    }
  };

  const downloadExceptionReport = (validation: ValidationResult) => {
    const reportContent = generateExceptionReport(validation);
    const blob = new Blob([reportContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exception_Report_${validation.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateExceptionReport = (validation: ValidationResult): string => {
    const headers = ['Row Number', 'Column', 'Value', 'Error/Warning', 'Severity'];
    const rows = [
      headers.join(','),
      ...validation.errors.map(error => 
        [error.row, error.column, `"${error.value}"`, `"${error.error}"`, error.severity].join(',')
      ),
      ...validation.warnings.map(warning => 
        [warning.row, warning.column, `"${warning.value}"`, `"${warning.error}"`, warning.severity].join(',')
      )
    ];
    
    return rows.join('\n');
  };

  const handleViewFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setShowViewModal(true);
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
            // Create proper CSV content with BOM for Excel compatibility
            const csvContent = '\uFEFF' + templateData; // Add BOM for proper Excel opening
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
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
        {/* Validation Results Summary */}
        {validationResults.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">Recent Validation Results</h4>
              <button
                onClick={() => setValidationResults([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {validationResults.slice(-3).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    {result.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {result.validRows}/{result.totalRows} valid rows • 
                        {result.errors.length} errors • {result.warnings.length} warnings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setCurrentValidation(result);
                        setShowValidationModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => downloadExceptionReport(result)}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="Download Exception Report"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                        onClick={() => handleViewFrame(frame)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          // Generate proper Excel-compatible CSV content
                          const csvHeader = 'CSOID,StateCode,SROCode,DistrictCode,DistrictName,Sector,PslNo,FrameNIC,Scheme,New Scheme,RegistrationNo,CompanyName,CompanyAddress,CompanyPlace,companyPincode,PSU,NoOfEmployees,JointReturnCode,DSLNo,IsSelected,SubSampleNo,App_SurveyYear,App_MotherUnit,PINCode,Description,EmailId,IsPrevYearSelected,ITUse,RU,App_AddEditFlg,remarks,StatusCode\n';
                          const sampleRows = [
                            '001,27,001,001,Mumbai,2,12345,25111,ASI,ASI2024,REG001,"ABC Manufacturing Ltd.","123 Industrial Area, Mumbai","Mumbai",400001,0,150,0,DSL001,1,1,2024,0,400001,"Manufacturing of metal products","contact@abc.com",0,1,2,0,"Sample data",1',
                            '001,27,001,002,Pune,2,12346,25112,ASI,ASI2024,REG002,"XYZ Industries Pvt Ltd","456 Tech Park, Pune","Pune",411001,0,200,0,DSL002,1,2,2024,0,411001,"Manufacturing of machinery","info@xyz.com",0,1,2,0,"Sample data",1'
                          ].join('\n');
                          
                          const csvContent = '\uFEFF' + csvHeader + sampleRows; // Add BOM for Excel compatibility
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                          // Create a URL for the blob
                          const url = URL.createObjectURL(blob);
                          // Create a temporary anchor element
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = frame.fileName.replace(/\.[^/.]+$/, '') + '_sample.csv';
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

      {/* Validation Modal */}
      {showValidationModal && currentValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                {currentValidation.isValid ? (
                  <FileCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <FileX className="h-6 w-6 text-red-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  Frame Validation Report: {currentValidation.fileName}
                </h3>
              </div>
              <button 
                onClick={() => setShowValidationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentValidation.totalRows}</div>
                <div className="text-sm text-blue-700">Total Rows</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentValidation.validRows}</div>
                <div className="text-sm text-green-700">Valid Rows</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{currentValidation.errors.length}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{currentValidation.warnings.length}</div>
                <div className="text-sm text-yellow-700">Warnings</div>
              </div>
            </div>

            {/* Validation Status */}
            <div className={`p-4 rounded-lg mb-6 ${
              currentValidation.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {currentValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${
                  currentValidation.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {currentValidation.isValid 
                    ? 'Frame format is valid and ready for upload' 
                    : 'Frame format has errors that need to be fixed'}
                </span>
              </div>
            </div>

            {/* Errors Table */}
            {currentValidation.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Errors ({currentValidation.errors.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-red-700">
                          Row
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-red-700">
                          Column
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-red-700">
                          Value
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-red-700">
                          Error Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentValidation.errors.map((error, index) => (
                        <tr key={index} className="hover:bg-red-25">
                          <td className="px-4 py-2 border border-gray-300 text-sm">{error.row}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm font-mono">{error.column}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm font-mono">{error.value || '(empty)'}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warnings Table */}
            {currentValidation.warnings.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-yellow-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Warnings ({currentValidation.warnings.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-yellow-700">
                          Row
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-yellow-700">
                          Column
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-yellow-700">
                          Value
                        </th>
                        <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-yellow-700">
                          Warning Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentValidation.warnings.map((warning, index) => (
                        <tr key={index} className="hover:bg-yellow-25">
                          <td className="px-4 py-2 border border-gray-300 text-sm">{warning.row}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm font-mono">{warning.column}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm font-mono">{warning.value || '(empty)'}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{warning.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => downloadExceptionReport(currentValidation)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download Exception Report</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {currentValidation.isValid && (
                  <button
                    onClick={() => {
                      setShowValidationModal(false);
                      alert('Frame uploaded successfully!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Proceed with Upload
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Frame Modal */}
      {showViewModal && selectedFrame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Frame Details</h3>
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
                    File Name
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedFrame.fileName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DSL Number
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-mono">{selectedFrame.dslNumber || 'Not Set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedFrame.sector}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Enterprises
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedFrame.enterprises.toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Date
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedFrame.uploadDate}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="p-2">{getStatusBadge(selectedFrame.status)}</div>
                </div>
              </div>
              
              {selectedFrame.allocatedTo && selectedFrame.allocatedTo.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated To
                  </label>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="flex flex-wrap gap-2">
                      {selectedFrame.allocatedTo.map((userId, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          User {userId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Frame Statistics */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Frame Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-lg font-semibold text-blue-600">{selectedFrame.enterprises.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Total Enterprises</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-lg font-semibold text-green-600">
                      {selectedFrame.status === 'completed' ? '100%' : 
                       selectedFrame.status === 'allocated' ? '50%' : '0%'}
                    </div>
                    <div className="text-sm text-green-700">Progress</div>
                  </div>
                </div>
              </div>
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
                  // Generate proper Excel-compatible CSV content
                  const csvHeader = 'CSOID,StateCode,SROCode,DistrictCode,DistrictName,Sector,PslNo,FrameNIC,Scheme,New Scheme,RegistrationNo,CompanyName,CompanyAddress,CompanyPlace,companyPincode,PSU,NoOfEmployees,JointReturnCode,DSLNo,IsSelected,SubSampleNo,App_SurveyYear,App_MotherUnit,PINCode,Description,EmailId,IsPrevYearSelected,ITUse,RU,App_AddEditFlg,remarks,StatusCode\n';
                  const sampleRows = [
                    '001,27,001,001,Mumbai,2,12345,25111,ASI,ASI2024,REG001,"ABC Manufacturing Ltd.","123 Industrial Area, Mumbai","Mumbai",400001,0,150,0,DSL001,1,1,2024,0,400001,"Manufacturing of metal products","contact@abc.com",0,1,2,0,"Sample data",1',
                    '001,27,001,002,Pune,2,12346,25112,ASI,ASI2024,REG002,"XYZ Industries Pvt Ltd","456 Tech Park, Pune","Pune",411001,0,200,0,DSL002,1,2,2024,0,411001,"Manufacturing of machinery","info@xyz.com",0,1,2,0,"Sample data",1'
                  ].join('\n');
                  
                  const csvContent = '\uFEFF' + csvHeader + sampleRows; // Add BOM for Excel compatibility
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = selectedFrame.fileName.replace(/\.[^/.]+$/, '') + '_sample.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Download Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameUpload;