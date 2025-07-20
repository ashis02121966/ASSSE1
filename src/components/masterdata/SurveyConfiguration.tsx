import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, Settings } from 'lucide-react';

const SurveyConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('blocks');

  const surveyBlocks = [
    { id: '1', name: 'Basic Information', fields: 15, required: true, order: 1 },
    { id: '2', name: 'Financial Details', fields: 12, required: true, order: 2 },
    { id: '3', name: 'Employment Details', fields: 8, required: true, order: 3 },
    { id: '4', name: 'Production Details', fields: 20, required: false, order: 4 },
  ];

  const fieldTypes = [
    { id: 'text', name: 'Text Input', icon: '📝' },
    { id: 'number', name: 'Number Input', icon: '🔢' },
    { id: 'date', name: 'Date Picker', icon: '📅' },
    { id: 'select', name: 'Dropdown', icon: '📋' },
    { id: 'textarea', name: 'Text Area', icon: '📄' },
    { id: 'checkbox', name: 'Checkbox', icon: '☑️' },
    { id: 'radio', name: 'Radio Button', icon: '🔘' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Survey Configuration</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Add Block</span>
                </button>
              </div>
              
              <div className="grid gap-4">
                {surveyBlocks.map((block) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                          {block.order}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{block.name}</h4>
                          <p className="text-sm text-gray-500">{block.fields} fields</p>
                        </div>
                        {block.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Required</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                          <Settings size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-800 p-1 rounded">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-1 rounded">
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
                {fieldTypes.map((type) => (
                  <div key={type.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-500">ID: {type.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Validation Rules</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Configure validation rules for survey fields to ensure data quality and consistency.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm text-gray-700">Required field validation</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm text-gray-700">Numeric range validation</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm text-gray-700">Date format validation</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm text-gray-700">Email format validation</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyConfiguration;