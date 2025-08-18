import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Save, X, Settings, Copy, Eye } from 'lucide-react';
import { surveySchedules } from '../../data/surveyBlocks';
import { SurveySchedule, SurveyBlock } from '../../types';

const SurveyConfiguration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SurveySchedule | null>(null);
  const [schedules, setSchedules] = useState<SurveySchedule[]>(surveySchedules);
  
  const [newSchedule, setNewSchedule] = useState<Omit<SurveySchedule, 'id' | 'blocks'>>({
    name: '',
    description: '',
    sector: '',
    year: '',
    isActive: true
  });

  const handleAddSchedule = () => {
    if (!newSchedule.name || !newSchedule.year) {
      alert('Please provide schedule name and year');
      return;
    }

    const scheduleId = `schedule-${Date.now()}`;
    const scheduleWithId: SurveySchedule = {
      ...newSchedule,
      id: scheduleId,
      blocks: []
    };

    setSchedules([...schedules, scheduleWithId]);
    setNewSchedule({
      name: '',
      description: '',
      sector: '',
      year: '',
      isActive: true
    });
    setShowAddModal(false);
  };

  const handleUpdateSchedule = () => {
    if (!selectedSchedule) return;

    const updatedSchedules = schedules.map(schedule =>
      schedule.id === selectedSchedule.id ? selectedSchedule : schedule
    );

    setSchedules(updatedSchedules);
    setSelectedSchedule(null);
    setShowEditModal(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this survey schedule?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const handleCloneSchedule = (schedule: SurveySchedule) => {
    const clonedSchedule: SurveySchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
      name: `${schedule.name} (Copy)`,
      isActive: false
    };

    setSchedules([...schedules, clonedSchedule]);
    alert('Survey schedule cloned successfully!');
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Survey Configuration</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Survey Schedule</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search survey schedules..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Survey Schedules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{schedule.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Year: {schedule.year}</span>
                  <span>Sector: {schedule.sector || 'All'}</span>
                  <span>Blocks: {schedule.blocks?.length || 0}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setShowViewModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="View Schedule"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setShowEditModal(true);
                  }}
                  className="text-green-600 hover:text-green-800 p-1 rounded"
                  title="Edit Schedule"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleCloneSchedule(schedule)}
                  className="text-purple-600 hover:text-purple-800 p-1 rounded"
                  title="Clone Schedule"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Delete Schedule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Survey Blocks Preview */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Survey Blocks</h4>
              {schedule.blocks && schedule.blocks.length > 0 ? (
                <div className="space-y-2">
                  {schedule.blocks.slice(0, 3).map((block, index) => (
                    <div key={block.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{block.name}</span>
                    </div>
                  ))}
                  {schedule.blocks.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{schedule.blocks.length - 3} more blocks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No blocks configured</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Survey Schedule</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ASSSE 2024-25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the survey schedule"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Year *
                </label>
                <input
                  type="text"
                  value={newSchedule.year}
                  onChange={(e) => setNewSchedule({...newSchedule, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024-25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  value={newSchedule.sector}
                  onChange={(e) => setNewSchedule({...newSchedule, sector: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sectors</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Services">Services</option>
                  <option value="Construction">Construction</option>
                  <option value="Trade">Trade</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schedule-active"
                  checked={newSchedule.isActive}
                  onChange={(e) => setNewSchedule({...newSchedule, isActive: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="schedule-active" className="text-sm text-gray-700">
                  Active Schedule
                </label>
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
                onClick={handleAddSchedule}
                disabled={!newSchedule.name || !newSchedule.year}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Create Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Survey Schedule</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={selectedSchedule.name}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedSchedule.description}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Year *
                </label>
                <input
                  type="text"
                  value={selectedSchedule.year}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  value={selectedSchedule.sector}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, sector: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sectors</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Services">Services</option>
                  <option value="Construction">Construction</option>
                  <option value="Trade">Trade</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-schedule-active"
                  checked={selectedSchedule.isActive}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, isActive: e.target.checked})}
                  className="mr-2 rounded"
                />
                <label htmlFor="edit-schedule-active" className="text-sm text-gray-700">
                  Active Schedule
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                disabled={!selectedSchedule.name || !selectedSchedule.year}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Update Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Schedule Modal */}
      {showViewModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Survey Schedule Details</h3>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSchedule(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Schedule Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSchedule.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey Year
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSchedule.year}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector
                  </label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSchedule.sector || 'All Sectors'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="p-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedSchedule.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSchedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedSchedule.description || 'No description'}</p>
              </div>

              {/* Survey Blocks */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Survey Blocks ({selectedSchedule.blocks?.length || 0})</h4>
                {selectedSchedule.blocks && selectedSchedule.blocks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSchedule.blocks.map((block, index) => (
                      <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{block.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{block.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Fields: {block.fields?.length || 0}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                block.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {block.completed ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No blocks configured for this schedule</p>
                    <p className="text-sm">Blocks can be added after creating the schedule</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
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

export default SurveyConfiguration;