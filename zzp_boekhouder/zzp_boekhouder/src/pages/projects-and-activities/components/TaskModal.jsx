import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, Clock, Target, AlertCircle } from 'lucide-react';

const TaskModal = ({ project, onSave, onClose, task = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliverable_id: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    estimated_hours: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task?.name || '',
        description: task?.description || '',
        deliverable_id: task?.deliverable_id || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        due_date: task?.due_date || '',
        estimated_hours: task?.estimated_hours ? task?.estimated_hours?.toString() : ''
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (formData?.estimated_hours && isNaN(parseFloat(formData?.estimated_hours))) {
      newErrors.estimated_hours = 'Estimated hours must be a valid number';
    }

    if (formData?.estimated_hours && parseFloat(formData?.estimated_hours) < 0) {
      newErrors.estimated_hours = 'Estimated hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        project_id: project?.id,
        estimated_hours: formData?.estimated_hours ? parseFloat(formData?.estimated_hours) : null,
        deliverable_id: formData?.deliverable_id || null
      };

      await onSave?.(taskData);
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'text-gray-600' },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-600' },
    { value: 'review', label: 'Review', color: 'text-yellow-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              {project && (
                <p className="text-sm text-gray-600">
                  Project: {project?.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Task Information
            </h3>

            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors?.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter task name"
              />
              {errors?.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors?.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what needs to be done..."
              />
            </div>

            {/* Deliverable */}
            {project?.deliverables?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deliverable
                </label>
                <select
                  value={formData?.deliverable_id}
                  onChange={(e) => handleInputChange('deliverable_id', e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select deliverable (optional)</option>
                  {project?.deliverables?.map((deliverable) => (
                    <option key={deliverable?.id} value={deliverable?.id}>
                      {deliverable?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status & Priority</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData?.status}
                  onChange={(e) => handleInputChange('status', e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData?.priority}
                  onChange={(e) => handleInputChange('priority', e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorityOptions?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline and Estimation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Timeline & Estimation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData?.due_date}
                  onChange={(e) => handleInputChange('due_date', e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData?.estimated_hours}
                    onChange={(e) => handleInputChange('estimated_hours', e?.target?.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.estimated_hours ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                {errors?.estimated_hours && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors?.estimated_hours}
                  </p>
                )}
              </div>
            </div>

            {/* Project Timeline Info */}
            {project?.end_date && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <strong>Project Deadline:</strong> {' '}
                  {new Date(project.end_date)?.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors?.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors?.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;