import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock, User, MoreVertical, Edit, Trash2, Play, Plus, AlertCircle, Target } from 'lucide-react';
import projectsService from '../../../services/projectsService';

const ProjectCard = ({
  project,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onTaskCreate,
  onActivityCreate,
  onStatusUpdate,
  isSelected = false,
  onSelect
}) => {
  const [showActions, setShowActions] = useState(false);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load budget spent data
  useEffect(() => {
    if (project?.id) {
      loadBudgetSpent();
    }
  }, [project?.id]);

  const loadBudgetSpent = async () => {
    setLoading(true);
    try {
      const result = await projectsService?.getProjectBudgetSpent(project?.id);
      if (!result?.error) {
        setBudgetSpent(result?.data || 0);
      }
    } catch (error) {
      console.error('Failed to load budget spent:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors?.[status] || colors?.planning;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors?.[priority] || colors?.medium;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString)?.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const budgetPercentage = project?.budget ? (budgetSpent / project?.budget) * 100 : 0;
  const tasksCompleted = project?.tasks?.filter(task => task?.is_completed)?.length || 0;
  const totalTasks = project?.tasks?.length || 0;
  const progressPercentage = project?.progress || 0;

  if (viewMode === 'list') {
    return (
      <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {project?.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project?.status)}`}>
                  {project?.status?.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project?.priority)}`}>
                  {project?.priority}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                {project?.client && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {project?.client?.name}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(project?.end_date)}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {progressPercentage}% complete
                </div>
              </div>
            </div>

            {/* Budget Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(budgetSpent)} / {formatCurrency(project?.budget)}
              </p>
              <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    budgetPercentage > 90 ? 'bg-red-500' : 
                    budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onEdit?.(project);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onTaskCreate?.(project);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onActivityCreate?.(project);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Log Activity
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onDelete?.(project?.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
      isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
    }`}
    onClick={onSelect}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {project?.name}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project?.status)}`}>
                {project?.status?.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project?.priority)}`}>
                {project?.priority}
              </span>
            </div>
          </div>
          
          <div className="relative ml-4">
            <button
              onClick={(e) => {
                e?.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onEdit?.(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </button>
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onTaskCreate?.(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </button>
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onActivityCreate?.(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onDelete?.(project?.id);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project?.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project?.description}
          </p>
        )}

        {/* Client & Dates */}
        <div className="space-y-2 mb-4">
          {project?.client && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{project?.client?.name}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(project?.start_date)} - {formatDate(project?.end_date)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {totalTasks > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {tasksCompleted} of {totalTasks} tasks completed
            </p>
          )}
        </div>

        {/* Budget Information */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Budget</span>
            <span className="text-sm font-medium">
              {formatCurrency(budgetSpent)} / {formatCurrency(project?.budget)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetPercentage > 90 ? 'bg-red-500' : 
                budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
          {budgetPercentage > 90 && (
            <div className="flex items-center mt-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Budget almost exceeded
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  onActivityCreate?.(project);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Log Time
              </button>
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  onTaskCreate?.(project);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Task
              </button>
            </div>
            
            {project?.hourly_rate && (
              <div className="flex items-center text-xs text-gray-500">
                <DollarSign className="w-3 h-3 mr-1" />
                {formatCurrency(project?.hourly_rate)}/hr
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside handler */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e?.stopPropagation();
            setShowActions(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectCard;