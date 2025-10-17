import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, MessageSquare, Target, User, Calendar, AlertCircle } from 'lucide-react';

const ActivityModal = ({ project, projects = [], onSave, onClose, activity = null }) => {
  const [formData, setFormData] = useState({
    type: 'time_entry',
    title: '',
    description: '',
    project_id: project?.id || '',
    task_id: '',
    hours: '',
    hourly_rate: '',
    amount: '',
    activity_date: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(project);

  // Initialize form data when activity changes
  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity?.type || 'time_entry',
        title: activity?.title || '',
        description: activity?.description || '',
        project_id: activity?.project_id || '',
        task_id: activity?.task_id || '',
        hours: activity?.hours ? activity?.hours?.toString() : '',
        hourly_rate: activity?.hourly_rate ? activity?.hourly_rate?.toString() : '',
        amount: activity?.amount ? activity?.amount?.toString() : '',
        activity_date: activity?.activity_date || new Date()?.toISOString()?.split('T')?.[0]
      });
    } else if (project) {
      // Auto-fill hourly rate from project
      setFormData(prev => ({
        ...prev,
        project_id: project?.id,
        hourly_rate: project?.hourly_rate ? project?.hourly_rate?.toString() : ''
      }));
    }
  }, [activity, project]);

  // Update selected project when project_id changes
  useEffect(() => {
    const proj = projects?.find(p => p?.id === formData?.project_id);
    setSelectedProject(proj);
    
    // Auto-fill hourly rate when project changes
    if (proj?.hourly_rate && !formData?.hourly_rate) {
      setFormData(prev => ({
        ...prev,
        hourly_rate: proj?.hourly_rate?.toString()
      }));
    }
  }, [formData?.project_id, projects]);

  // Auto-calculate amount when hours or hourly_rate changes
  useEffect(() => {
    if (formData?.type === 'time_entry' && formData?.hours && formData?.hourly_rate) {
      const hours = parseFloat(formData?.hours);
      const rate = parseFloat(formData?.hourly_rate);
      if (!isNaN(hours) && !isNaN(rate)) {
        const calculatedAmount = (hours * rate)?.toFixed(2);
        setFormData(prev => ({ ...prev, amount: calculatedAmount }));
      }
    }
  }, [formData?.hours, formData?.hourly_rate, formData?.type]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Activity title is required';
    }

    if (!formData?.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (formData?.type === 'time_entry') {
      if (!formData?.hours || isNaN(parseFloat(formData?.hours))) {
        newErrors.hours = 'Hours is required and must be a valid number';
      } else if (parseFloat(formData?.hours) <= 0) {
        newErrors.hours = 'Hours must be greater than 0';
      }

      if (!formData?.hourly_rate || isNaN(parseFloat(formData?.hourly_rate))) {
        newErrors.hourly_rate = 'Hourly rate is required and must be a valid number';
      } else if (parseFloat(formData?.hourly_rate) <= 0) {
        newErrors.hourly_rate = 'Hourly rate must be greater than 0';
      }
    }

    if (formData?.type === 'expense') {
      if (!formData?.amount || isNaN(parseFloat(formData?.amount))) {
        newErrors.amount = 'Amount is required and must be a valid number';
      } else if (parseFloat(formData?.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    }

    if (formData?.hours && isNaN(parseFloat(formData?.hours))) {
      newErrors.hours = 'Hours must be a valid number';
    }

    if (formData?.amount && isNaN(parseFloat(formData?.amount))) {
      newErrors.amount = 'Amount must be a valid number';
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
      const activityData = {
        ...formData,
        hours: formData?.hours ? parseFloat(formData?.hours) : null,
        hourly_rate: formData?.hourly_rate ? parseFloat(formData?.hourly_rate) : null,
        amount: formData?.amount ? parseFloat(formData?.amount) : null,
        task_id: formData?.task_id || null
      };

      await onSave?.(activityData);
    } catch (error) {
      console.error('Failed to save activity:', error);
      setErrors({ submit: 'Failed to save activity. Please try again.' });
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

  const getActivityIcon = (type) => {
    const icons = {
      time_entry: Clock,
      expense: DollarSign,
      milestone: Target,
      note: MessageSquare,
      task: Target,
      meeting: User
    };
    return icons?.[type] || Clock;
  };

  const activityTypes = [
    { value: 'time_entry', label: 'Time Entry', icon: Clock, description: 'Log work hours' },
    { value: 'expense', label: 'Expense', icon: DollarSign, description: 'Record project expense' },
    { value: 'milestone', label: 'Milestone', icon: Target, description: 'Mark project milestone' },
    { value: 'note', label: 'Note', icon: MessageSquare, description: 'Add project note' },
    { value: 'meeting', label: 'Meeting', icon: User, description: 'Log meeting or call' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {React.createElement(getActivityIcon(formData?.type), {
              className: "w-6 h-6 text-blue-600"
            })}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activity ? 'Edit Activity' : 'Log New Activity'}
              </h2>
              {selectedProject && (
                <p className="text-sm text-gray-600">
                  Project: {selectedProject?.name}
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
          {/* Activity Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Activity Type</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activityTypes?.map((type) => {
                const IconComponent = type?.icon;
                return (
                  <button
                    key={type?.value}
                    type="button"
                    onClick={() => handleInputChange('type', type?.value)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData?.type === type?.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{type?.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type?.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors?.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={`Enter ${activityTypes?.find(t => t?.value === formData?.type)?.label?.toLowerCase()} title`}
              />
              {errors?.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors?.title}
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
                placeholder="Describe what was done or accomplished..."
              />
            </div>

            {/* Project and Task */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  value={formData?.project_id}
                  onChange={(e) => handleInputChange('project_id', e?.target?.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors?.project_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select project</option>
                  {projects?.map((proj) => (
                    <option key={proj?.id} value={proj?.id}>
                      {proj?.name}
                    </option>
                  ))}
                </select>
                {errors?.project_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors?.project_id}
                  </p>
                )}
              </div>

              {/* Task (if project has tasks) */}
              {selectedProject?.tasks?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task (Optional)
                  </label>
                  <select
                    value={formData?.task_id}
                    onChange={(e) => handleInputChange('task_id', e?.target?.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select task (optional)</option>
                    {selectedProject?.tasks?.map((task) => (
                      <option key={task?.id} value={task?.id}>
                        {task?.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData?.activity_date}
                  onChange={(e) => handleInputChange('activity_date', e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Time and Financial Information */}
          {(formData?.type === 'time_entry' || formData?.type === 'expense' || formData?.type === 'meeting') && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                {formData?.type === 'expense' ? 'Expense Information' : 'Time & Billing'}
              </h3>

              {formData?.type === 'time_entry' || formData?.type === 'meeting' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={formData?.hours}
                        onChange={(e) => handleInputChange('hours', e?.target?.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.hours ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.0"
                      />
                    </div>
                    {errors?.hours && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors?.hours}
                      </p>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (€) *
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

                  {/* Amount (calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount (€)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData?.amount}
                        onChange={(e) => handleInputChange('amount', e?.target?.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        readOnly={formData?.type === 'time_entry'}
                      />
                    </div>
                    {formData?.type === 'time_entry' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Automatically calculated from hours × hourly rate
                      </p>
                    )}
                  </div>
                </div>
              ) : formData?.type === 'expense' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expense Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (€) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData?.amount}
                        onChange={(e) => handleInputChange('amount', e?.target?.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors?.amount && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors?.amount}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Budget Impact */}
              {selectedProject?.budget && formData?.amount && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Budget Impact:</strong> {formatCurrency(formData?.amount)} 
                    {formData?.type === 'time_entry' ? ' (income)' : ' (expense)'}
                  </p>
                </div>
              )}
            </div>
          )}

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
              {loading ? 'Saving...' : activity ? 'Update Activity' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;