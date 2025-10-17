import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Target, AlertCircle } from 'lucide-react';
import ClientSelector from './ClientSelector';

const ProjectModal = ({ project, clients = [], onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    hourly_rate: '',
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project?.name || '',
        description: project?.description || '',
        client_id: project?.client_id || '',
        status: project?.status || 'planning',
        priority: project?.priority || 'medium',
        budget: project?.budget ? project?.budget?.toString() : '',
        hourly_rate: project?.hourly_rate ? project?.hourly_rate?.toString() : '',
        start_date: project?.start_date || '',
        end_date: project?.end_date || ''
      });
    } else {
      // Set default start date to today for new projects
      const today = new Date()?.toISOString()?.split('T')?.[0];
      setFormData(prev => ({
        ...prev,
        start_date: today
      }));
    }
  }, [project]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData?.budget && isNaN(parseFloat(formData?.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData?.hourly_rate && isNaN(parseFloat(formData?.hourly_rate))) {
      newErrors.hourly_rate = 'Hourly rate must be a valid number';
    }

    if (formData?.start_date && formData?.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
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
      const projectData = {
        ...formData,
        budget: formData?.budget ? parseFloat(formData?.budget) : null,
        hourly_rate: formData?.hourly_rate ? parseFloat(formData?.hourly_rate) : null,
        client_id: formData?.client_id || null
      };

      await onSave?.(projectData);
    } catch (error) {
      console.error('Failed to save project:', error);
      setErrors({ submit: 'Failed to save project. Please try again.' });
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

  const handleClientCreate = (newClient) => {
    setFormData(prev => ({ ...prev, client_id: newClient?.id }));
    setShowClientModal(false);
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'text-yellow-600' },
    { value: 'active', label: 'Active', color: 'text-green-600' },
    { value: 'on_hold', label: 'On Hold', color: 'text-gray-600' },
    { value: 'completed', label: 'Completed', color: 'text-blue-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                General Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData?.name}
                    onChange={(e) => handleInputChange('name', e?.target?.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project name"
                  />
                  {errors?.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors?.name}
                    </p>
                  )}
                </div>

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
                  placeholder="Describe the project scope and objectives..."
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Client Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData?.client_id}
                    onChange={(e) => handleInputChange('client_id', e?.target?.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients?.map((client) => (
                      <option key={client?.id} value={client?.id}>
                        {client?.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    New Client
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Financial Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.budget}
                    onChange={(e) => handleInputChange('budget', e?.target?.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors?.budget && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors?.budget}
                    </p>
                  )}
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', e?.target?.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.hourly_rate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors?.hourly_rate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors?.hourly_rate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Timeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData?.start_date}
                    onChange={(e) => handleInputChange('start_date', e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData?.end_date}
                    onChange={(e) => handleInputChange('end_date', e?.target?.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.end_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors?.end_date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors?.end_date}
                    </p>
                  )}
                </div>
              </div>
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
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Client Modal */}
      {showClientModal && (
        <ClientSelector
          onSelect={handleClientCreate}
          onClose={() => setShowClientModal(false)}
          allowCreate={true}
        />
      )}
    </>
  );
};

export default ProjectModal;