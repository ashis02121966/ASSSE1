import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Save, X, ArrowRight, ArrowDown, Settings, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { userRoles, officeTypes } from '../../data/mockData';
import { ApprovalWorkflow, ApprovalStep } from '../../types';

const ApprovalWorkflowManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: '1',
      name: 'Standard Survey Approval',
      description: 'Standard multi-level approval workflow for survey data',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          name: 'First Level Scrutiny',
          roleCode: 'SSO_USER',
          isRequired: true,
          canReject: true,
          canReferBack: true,
          nextStepOnApproval: 'step-2'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          name: 'Second Level Scrutiny',
          roleCode: 'DS_USER',
          isRequired: true,
          canReject: true,
          canReferBack: true,
          nextStepOnApproval: 'step-3'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          name: 'Final Approval',
          roleCode: 'RO_USER',
          isRequired: true,
          canReject: true,
          canReferBack: true
        }
      ]
    },
    {
      id: '2',
      name: 'Express Approval',
      description: 'Fast-track approval for simple surveys',
      isActive: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          name: 'Direct Approval',
          roleCode: 'DS_USER',
          isRequired: true,
          canReject: true,
          canReferBack: false
        }
      ]
    }
  ]);

  const [newWorkflow, setNewWorkflow] = useState<Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    isActive: true,
    steps: []
  });

  const [newStep, setNewStep] = useState<Omit<ApprovalStep, 'id'>>({
    stepNumber: 1,
    name: '',
    roleCode: '',
    officeType: '',
    isRequired: true,
    canReject: true,
    canReferBack: true
  });

  const handleAddWorkflow = () => {
    if (!newWorkflow.name || newWorkflow.steps.length === 0) {
      alert('Please provide workflow name and at least one step');
      return;
    }

    const workflowId = `workflow-${Date.now()}`;
    const workflowWithId: ApprovalWorkflow = {
      ...newWorkflow,
      id: workflowId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkflows([...workflows, workflowWithId]);
    setNewWorkflow({
      name: '',
      description: '',
      isActive: true,
      steps: []
    });
    setShowAddModal(false);
  };

  const handleUpdateWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflows = workflows.map(workflow =>
      workflow.id === selectedWorkflow.id 
        ? { ...selectedWorkflow, updatedAt: new Date().toISOString() }
        : workflow
    );

    setWorkflows(updatedWorkflows);
    setSelectedWorkflow(null);
    setShowEditModal(false);
  };

  const handleDeleteWorkflow = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  const handleAddStep = () => {
    if (!newStep.name || !newStep.roleCode) {
      alert('Please provide step name and role');
      return;
    }

    const stepId = `step-${Date.now()}`;
    const stepWithId: ApprovalStep = {
      ...newStep,
      id: stepId,
      stepNumber: newWorkflow.steps.length + 1
    };

    setNewWorkflow({
      ...newWorkflow,
      steps: [...newWorkflow.steps, stepWithId]
    });

    setNewStep({
      stepNumber: newWorkflow.steps.length + 2,
      name: '',
      roleCode: '',
      officeType: '',
      isRequired: true,
      canReject: true,
      canReferBack: true
    });
  };

  const handleRemoveStep = (stepId: string) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.filter(s => s.id !== stepId)
    });
  };

  const getRoleName = (roleCode: string) => {
    const role = userRoles.find(r => r.code === roleCode);
    return role ? role.name : roleCode;
  };

  const getOfficeTypeName = (officeCode: string) => {
    const office = officeTypes.find(o => o.code === officeCode);
    return office ? office.name : officeCode;
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderWorkflowSteps = (steps: ApprovalStep[]) => (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
            {step.stepNumber}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{step.name}</div>
            <div className="text-xs text-gray-500">
              {getRoleName(step.roleCode)}
              {step.officeType && ` (${getOfficeTypeName(step.officeType)})`}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {step.canReject && (
              <span className="px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">Reject</span>
            )}
            {step.canReferBack && (
              <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Refer</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <ArrowDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Approval Workflow Configuration</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Workflow</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {workflow.steps.length} step(s) • Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setShowEditModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Edit Workflow"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Delete Workflow"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Steps</h4>
              {renderWorkflowSteps(workflow.steps)}
            </div>
          </div>
        ))}
      </div>

      {/* Add Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Approval Workflow</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Workflow Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Standard Survey Approval"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the workflow purpose and usage"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="workflow-active"
                    checked={newWorkflow.isActive}
                    onChange={(e) => setNewWorkflow({...newWorkflow, isActive: e.target.checked})}
                    className="mr-2 rounded"
                  />
                  <label htmlFor="workflow-active" className="text-sm text-gray-700">
                    Active Workflow
                  </label>
                </div>

                {/* Add Step Form */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Add Approval Step</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Step Name *
                      </label>
                      <input
                        type="text"
                        value={newStep.name}
                        onChange={(e) => setNewStep({...newStep, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., First Level Scrutiny"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        value={newStep.roleCode}
                        onChange={(e) => setNewStep({...newStep, roleCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Role</option>
                        {userRoles.filter(r => r.isScrutinizer || r.isAdmin || r.code === 'COMPILER' || r.code === 'JSO_USER').map((role) => (
                          <option key={role.id} value={role.code}>
                            {role.name} (Level {role.level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Office Type (Optional)
                      </label>
                      <select
                        value={newStep.officeType}
                        onChange={(e) => setNewStep({...newStep, officeType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any Office Type</option>
                        {officeTypes.map((office) => (
                          <option key={office.id} value={office.code}>
                            {office.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStep.isRequired}
                          onChange={(e) => setNewStep({...newStep, isRequired: e.target.checked})}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm">Required Step</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStep.canReject}
                          onChange={(e) => setNewStep({...newStep, canReject: e.target.checked})}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm">Can Reject</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStep.canReferBack}
                          onChange={(e) => setNewStep({...newStep, canReferBack: e.target.checked})}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm">Can Refer Back</span>
                      </label>
                    </div>

                    <button
                      onClick={handleAddStep}
                      disabled={!newStep.name || !newStep.roleCode}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Step
                    </button>
                  </div>
                </div>
              </div>

              {/* Workflow Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Workflow Preview</h4>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-2">{newWorkflow.name || 'Untitled Workflow'}</h5>
                  <p className="text-sm text-gray-600 mb-4">{newWorkflow.description || 'No description'}</p>
                  
                  {newWorkflow.steps.length > 0 ? (
                    <div className="space-y-3">
                      <h6 className="text-sm font-medium text-gray-700">Approval Steps:</h6>
                      {newWorkflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              {step.stepNumber}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{step.name}</div>
                              <div className="text-xs text-gray-500">
                                {getRoleName(step.roleCode)}
                                {step.officeType && ` (${getOfficeTypeName(step.officeType)})`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {step.canReject && <XCircle className="h-4 w-4 text-red-500" title="Can Reject" />}
                              {step.canReferBack && <RotateCcw className="h-4 w-4 text-yellow-500" title="Can Refer Back" />}
                              <CheckCircle className="h-4 w-4 text-green-500" title="Can Approve" />
                            </div>
                            <button
                              onClick={() => handleRemoveStep(step.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Remove Step"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No steps added yet</p>
                      <p className="text-sm">Add approval steps to build your workflow</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorkflow}
                disabled={!newWorkflow.name || newWorkflow.steps.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Create Workflow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {showEditModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Workflow</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorkflow(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={selectedWorkflow.name}
                  onChange={(e) => setSelectedWorkflow({...selectedWorkflow, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedWorkflow.description}
                  onChange={(e) => setSelectedWorkflow({...selectedWorkflow, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-workflow-active"
                  checked={selectedWorkflow.isActive}
                  onChange={(e) => setSelectedWorkflow({...selectedWorkflow, isActive: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="edit-workflow-active" className="text-sm text-gray-700">
                  Active Workflow
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Approval Steps</h4>
                {renderWorkflowSteps(selectedWorkflow.steps)}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorkflow(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWorkflow}
                disabled={!selectedWorkflow.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Update Workflow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowManagement;