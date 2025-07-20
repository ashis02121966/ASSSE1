import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, Settings, ArrowUp, ArrowDown, Copy, X, Check } from 'lucide-react';

interface SurveyBlock {
  id: string;
  name: string;
  description: string;
  fields: number;
  required: boolean;
  order: number;
  isTemplate: boolean;
  templateId?: string;
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'sum' | 'count' | 'cross_block' | 'range' | 'custom';
  description: string;
  formula: string;
  targetFields: string[];
  sourceBlocks?: string[];
  isActive: boolean;
}

interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  category: string;
}

const SurveyConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('blocks');
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<SurveyBlock | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [createFromTemplate, setCreateFromTemplate] = useState(true);

  const [surveyBlocks, setSurveyBlocks] = useState<SurveyBlock[]>([
    { id: '1', name: 'Basic Information', description: 'Enterprise identification and basic details', fields: 15, required: true, order: 1, isTemplate: false },
    { id: '2', name: 'Financial Details', description: 'Financial information and accounts', fields: 12, required: true, order: 2, isTemplate: false },
    { id: '3', name: 'Employment Details', description: 'Employment and workforce information', fields: 8, required: true, order: 3, isTemplate: false },
    { id: '4', name: 'Production Details', description: 'Production and operational details', fields: 20, required: false, order: 4, isTemplate: false },
  ]);

  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    {
      id: '1',
      name: 'Total Employment Sum',
      type: 'sum',
      description: 'Sum of all employment categories should equal total employment',
      formula: 'SUM(block_5.male_employees, block_5.female_employees) = block_5.total_employees',
      targetFields: ['block_5.total_employees'],
      isActive: true
    },
    {
      id: '2',
      name: 'Financial Consistency',
      type: 'cross_block',
      description: 'Total receipts should be greater than total expenses',
      formula: 'block_7.total_receipts >= block_6.total_expenses',
      targetFields: ['block_7.total_receipts', 'block_6.total_expenses'],
      sourceBlocks: ['block_6', 'block_7'],
      isActive: true
    }
  ]);

  const [blockTemplates] = useState<BlockTemplate[]>([
    {
      id: 'template_1',
      name: 'Enterprise Identification',
      description: 'Standard enterprise identification block',
      category: 'Basic',
      fields: [
        { id: 'enterprise_name', label: 'Enterprise Name', type: 'text', required: true },
        { id: 'gstin', label: 'GSTIN', type: 'text', required: true },
        { id: 'address', label: 'Address', type: 'textarea', required: true },
        { id: 'contact_person', label: 'Contact Person', type: 'text', required: true }
      ]
    },
    {
      id: 'template_2',
      name: 'Financial Information',
      description: 'Standard financial data collection block',
      category: 'Financial',
      fields: [
        { id: 'total_revenue', label: 'Total Revenue', type: 'number', required: true },
        { id: 'total_expenses', label: 'Total Expenses', type: 'number', required: true },
        { id: 'net_profit', label: 'Net Profit', type: 'number', required: true }
      ]
    },
    {
      id: 'template_3',
      name: 'Employment Data',
      description: 'Standard employment information block',
      category: 'Employment',
      fields: [
        { id: 'male_employees', label: 'Male Employees', type: 'number', required: true },
        { id: 'female_employees', label: 'Female Employees', type: 'number', required: true },
        { id: 'total_employees', label: 'Total Employees', type: 'number', required: true }
      ]
    }
  ]);

  const [newBlock, setNewBlock] = useState<Omit<SurveyBlock, 'id'>>({
    name: '',
    description: '',
    fields: 0,
    required: true,
    order: surveyBlocks.length + 1,
    isTemplate: false
  });

  const [newRule, setNewRule] = useState<Omit<ValidationRule, 'id'>>({
    name: '',
    type: 'sum',
    description: '',
    formula: '',
    targetFields: [],
    sourceBlocks: [],
    isActive: true
  });

  const handleAddBlock = () => {
    if (!newBlock.name.trim()) {
      alert('Please provide a block name');
      return;
    }

    let blockData = { ...newBlock };

    if (createFromTemplate && selectedTemplate) {
      const template = blockTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        blockData = {
          ...blockData,
          name: template.name,
          description: template.description,
          fields: template.fields.length,
          templateId: template.id,
          isTemplate: true
        };
      }
    }

    const blockId = `block-${Date.now()}`;
    const blockWithId: SurveyBlock = {
      ...blockData,
      id: blockId
    };

    setSurveyBlocks([...surveyBlocks, blockWithId]);
    setNewBlock({
      name: '',
      description: '',
      fields: 0,
      required: true,
      order: surveyBlocks.length + 2,
      isTemplate: false
    });
    setSelectedTemplate('');
    setShowAddBlockModal(false);
    alert('Block added successfully!');
  };

  const handleEditBlock = () => {
    if (!selectedBlock) return;

    setSurveyBlocks(surveyBlocks.map(block =>
      block.id === selectedBlock.id ? selectedBlock : block
    ));
    setSelectedBlock(null);
    setShowEditBlockModal(false);
    alert('Block updated successfully!');
  };

  const handleDeleteBlock = (id: string) => {
    if (confirm('Are you sure you want to delete this block?')) {
      setSurveyBlocks(surveyBlocks.filter(block => block.id !== id));
      // Reorder remaining blocks
      const updatedBlocks = surveyBlocks
        .filter(block => block.id !== id)
        .map((block, index) => ({ ...block, order: index + 1 }));
      setSurveyBlocks(updatedBlocks);
    }
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const blockIndex = surveyBlocks.findIndex(block => block.id === id);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= surveyBlocks.length) return;

    const updatedBlocks = [...surveyBlocks];
    [updatedBlocks[blockIndex], updatedBlocks[newIndex]] = [updatedBlocks[newIndex], updatedBlocks[blockIndex]];
    
    // Update order numbers
    updatedBlocks.forEach((block, index) => {
      block.order = index + 1;
    });

    setSurveyBlocks(updatedBlocks);
  };

  const handleDuplicateBlock = (id: string) => {
    const blockToDuplicate = surveyBlocks.find(block => block.id === id);
    if (!blockToDuplicate) return;

    const duplicatedBlock: SurveyBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      name: `${blockToDuplicate.name} (Copy)`,
      order: surveyBlocks.length + 1
    };

    setSurveyBlocks([...surveyBlocks, duplicatedBlock]);
  };

  const handleAddValidationRule = () => {
    if (!newRule.name.trim() || !newRule.formula.trim()) {
      alert('Please provide rule name and formula');
      return;
    }

    const ruleId = `rule-${Date.now()}`;
    const ruleWithId: ValidationRule = {
      ...newRule,
      id: ruleId
    };

    setValidationRules([...validationRules, ruleWithId]);
    setNewRule({
      name: '',
      type: 'sum',
      description: '',
      formula: '',
      targetFields: [],
      sourceBlocks: [],
      isActive: true
    });
    setShowAddRuleModal(false);
    alert('Validation rule added successfully!');
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this validation rule?')) {
      setValidationRules(validationRules.filter(rule => rule.id !== id));
    }
  };

  const handleToggleRule = (id: string) => {
    setValidationRules(validationRules.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getTemplateByCategory = (category: string) => {
    return blockTemplates.filter(template => template.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Survey Configuration</h1>
        <button 
          onClick={() => alert('Configuration saved successfully!')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blocks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Survey Blocks
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fields'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Field Types
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'validation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Validation Rules
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'blocks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Survey Blocks</h3>
                <button 
                  onClick={() => setShowAddBlockModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Block</span>
                </button>
              </div>
              
              <div className="grid gap-4">
                {surveyBlocks
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                          {block.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{block.name}</h4>
                            {block.isTemplate && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Template</span>
                            )}
                            {block.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Required</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{block.description}</p>
                          <p className="text-xs text-gray-400">{block.fields} fields</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleMoveBlock(block.id, 'up')}
                          disabled={block.order === 1}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          onClick={() => handleMoveBlock(block.id, 'down')}
                          disabled={block.order === surveyBlocks.length}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button 
                          onClick={() => handleDuplicateBlock(block.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Duplicate Block"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBlock(block);
                            setShowEditBlockModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Edit Block"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Delete Block"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Available Field Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'text', name: 'Text Input', icon: '📝', description: 'Single line text input' },
                  { id: 'number', name: 'Number Input', icon: '🔢', description: 'Numeric input with validation' },
                  { id: 'date', name: 'Date Picker', icon: '📅', description: 'Date selection field' },
                  { id: 'select', name: 'Dropdown', icon: '📋', description: 'Single selection dropdown' },
                  { id: 'textarea', name: 'Text Area', icon: '📄', description: 'Multi-line text input' },
                  { id: 'checkbox', name: 'Checkbox', icon: '☑️', description: 'Boolean selection field' },
                  { id: 'radio', name: 'Radio Button', icon: '🔘', description: 'Single choice from options' },
                  { id: 'file', name: 'File Upload', icon: '📎', description: 'File attachment field' }
                ].map((type) => (
                  <div key={type.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-500">{type.description}</p>
                        <p className="text-xs text-gray-400">ID: {type.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Validation Rules</h3>
                <button 
                  onClick={() => setShowAddRuleModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Rule</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {validationRules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.type === 'sum' ? 'bg-blue-100 text-blue-800' :
                            rule.type === 'count' ? 'bg-green-100 text-green-800' :
                            rule.type === 'cross_block' ? 'bg-purple-100 text-purple-800' :
                            rule.type === 'range' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-700">
                          {rule.formula}
                        </div>
                        {rule.targetFields.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Target Fields: </span>
                            <span className="text-xs text-gray-700">{rule.targetFields.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`p-1 rounded ${
                            rule.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                          }`}
                          title={rule.isActive ? 'Deactivate Rule' : 'Activate Rule'}
                        >
                          {rule.isActive ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Delete Rule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Survey Block</h3>
              <button 
                onClick={() => setShowAddBlockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Selection */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-3">Block Creation Method</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={createFromTemplate}
                      onChange={() => setCreateFromTemplate(true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Create from template</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!createFromTemplate}
                      onChange={() => setCreateFromTemplate(false)}
                      className="mr-2"
                    />
                    <span className="text-sm">Create new block from scratch</span>
                  </label>
                </div>

                {createFromTemplate && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a template...</option>
                      {['Basic', 'Financial', 'Employment'].map(category => (
                        <optgroup key={category} label={category}>
                          {getTemplateByCategory(category).map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name} - {template.description}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    {selectedTemplate && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        {(() => {
                          const template = blockTemplates.find(t => t.id === selectedTemplate);
                          return template ? (
                            <div>
                              <p className="text-sm font-medium text-blue-900">{template.name}</p>
                              <p className="text-sm text-blue-700">{template.description}</p>
                              <p className="text-xs text-blue-600 mt-1">{template.fields.length} fields included</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Block Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name *
                </label>
                <input
                  type="text"
                  value={newBlock.name}
                  onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Enterprise Basic Information"
                  disabled={createFromTemplate && selectedTemplate !== ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newBlock.description}
                  onChange={(e) => setNewBlock({...newBlock, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the purpose and content of this block"
                  disabled={createFromTemplate && selectedTemplate !== ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sequence Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBlock.order}
                    onChange={(e) => setNewBlock({...newBlock, order: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Determines the order in which blocks appear in the survey
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Fields
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBlock.fields}
                    onChange={(e) => setNewBlock({...newBlock, fields: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={createFromTemplate && selectedTemplate !== ''}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="block-required"
                  checked={newBlock.required}
                  onChange={(e) => setNewBlock({...newBlock, required: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="block-required" className="text-sm text-gray-700">
                  Required block (must be completed to submit survey)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBlock}
                disabled={!newBlock.name.trim() || (createFromTemplate && !selectedTemplate)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {showEditBlockModal && selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Survey Block</h3>
              <button 
                onClick={() => setShowEditBlockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name *
                </label>
                <input
                  type="text"
                  value={selectedBlock.name}
                  onChange={(e) => setSelectedBlock({...selectedBlock, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedBlock.description}
                  onChange={(e) => setSelectedBlock({...selectedBlock, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sequence Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedBlock.order}
                    onChange={(e) => setSelectedBlock({...selectedBlock, order: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Fields
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedBlock.fields}
                    onChange={(e) => setSelectedBlock({...selectedBlock, fields: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-block-required"
                  checked={selectedBlock.required}
                  onChange={(e) => setSelectedBlock({...selectedBlock, required: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="edit-block-required" className="text-sm text-gray-700">
                  Required block
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditBlockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditBlock}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Update Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Validation Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Validation Rule</h3>
              <button 
                onClick={() => setShowAddRuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Total Employment Validation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Type *
                  </label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value as ValidationRule['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sum">Sum Validation</option>
                    <option value="count">Count Validation</option>
                    <option value="cross_block">Cross Block Validation</option>
                    <option value="range">Range Validation</option>
                    <option value="custom">Custom Formula</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Describe what this validation rule checks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formula/Expression *
                </label>
                <textarea
                  value={newRule.formula}
                  onChange={(e) => setNewRule({...newRule, formula: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={3}
                  placeholder={
                    newRule.type === 'sum' ? 'SUM(field1, field2, field3) = total_field' :
                    newRule.type === 'count' ? 'COUNT(field_name) > 0' :
                    newRule.type === 'cross_block' ? 'block_1.field_a >= block_2.field_b' :
                    newRule.type === 'range' ? 'field_name BETWEEN 0 AND 100' :
                    'Custom validation expression'
                  }
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-medium">Formula Examples:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><strong>Sum:</strong> SUM(male_employees, female_employees) = total_employees</li>
                    <li><strong>Count:</strong> COUNT(product_lines) >= 1</li>
                    <li><strong>Cross Block:</strong> block_7.total_receipts >= block_6.total_expenses</li>
                    <li><strong>Range:</strong> employee_count BETWEEN 1 AND 1000</li>
                    <li><strong>Custom:</strong> IF(revenue > 1000000, tax_paid > 0, true)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Fields (comma-separated)
                </label>
                <input
                  type="text"
                  value={newRule.targetFields.join(', ')}
                  onChange={(e) => setNewRule({...newRule, targetFields: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., block_5.total_employees, block_6.total_expenses"
                />
              </div>

              {newRule.type === 'cross_block' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Blocks (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newRule.sourceBlocks?.join(', ') || ''}
                    onChange={(e) => setNewRule({...newRule, sourceBlocks: e.target.value.split(',').map(b => b.trim()).filter(b => b)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., block_5, block_6, block_7"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rule-active"
                  checked={newRule.isActive}
                  onChange={(e) => setNewRule({...newRule, isActive: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="rule-active" className="text-sm text-gray-700">
                  Activate rule immediately
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddValidationRule}
                disabled={!newRule.name.trim() || !newRule.formula.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyConfiguration;