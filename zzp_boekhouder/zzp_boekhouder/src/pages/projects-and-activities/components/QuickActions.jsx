import React, { useState } from 'react';
import { Clock, DollarSign, MoreHorizontal, CheckSquare, Target } from 'lucide-react';

const QuickActions = ({ 
  projects = [], 
  onAction, 
  onTaskCreate, 
  onActivityCreate 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleQuickAction = (action, data = {}) => {
    onAction?.(action, data);
    setShowDropdown(false);
  };

  const activeProjects = projects?.filter(p => p?.status === 'active') || [];
  const recentProjects = projects
    ?.sort((a, b) => new Date(b?.updated_at || 0) - new Date(a?.updated_at || 0))
    ?.slice(0, 5) || [];

  const quickActions = [
    {
      id: 'log_time',
      label: 'Log Time',
      icon: Clock,
      color: 'text-blue-600 hover:bg-blue-50',
      description: 'Track work hours',
      onClick: () => onActivityCreate?.()
    },
    {
      id: 'add_expense',
      label: 'Add Expense',
      icon: DollarSign,
      color: 'text-green-600 hover:bg-green-50',
      description: 'Record project expense',
      onClick: () => onActivityCreate?.()
    },
    {
      id: 'create_task',
      label: 'New Task',
      icon: CheckSquare,
      color: 'text-purple-600 hover:bg-purple-50',
      description: 'Add project task',
      onClick: () => {
        if (activeProjects?.length === 1) {
          onTaskCreate?.(activeProjects?.[0]);
        } else {
          setShowDropdown(!showDropdown);
        }
      }
    },
    {
      id: 'milestone',
      label: 'Milestone',
      icon: Target,
      color: 'text-orange-600 hover:bg-orange-50',
      description: 'Mark achievement',
      onClick: () => onActivityCreate?.()
    }
  ];

  return (
    <div className="relative">
      {/* Main Actions */}
      <div className="flex items-center space-x-2">
        {quickActions?.map((action) => {
          const IconComponent = action?.icon;
          return (
            <button
              key={action?.id}
              onClick={action?.onClick}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${action?.color} border border-transparent hover:border-gray-200`}
              title={action?.description}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {action?.label}
            </button>
          );
        })}

        {/* More Actions Dropdown */}
        {projects?.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    
                    {/* Recent Projects */}
                    {recentProjects?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Recent Projects
                        </h4>
                        <div className="space-y-1">
                          {recentProjects?.slice(0, 3)?.map((project) => (
                            <div
                              key={project?.id}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {project?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {project?.client?.name || 'No client'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => {
                                    onActivityCreate?.(project);
                                    setShowDropdown(false);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Log time"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    onTaskCreate?.(project);
                                    setShowDropdown(false);
                                  }}
                                  className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                  title="Add task"
                                >
                                  <CheckSquare className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Update Actions */}
                    {activeProjects?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Project Status Updates
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              if (activeProjects?.length === 1) {
                                handleQuickAction('update_status', {
                                  projectId: activeProjects?.[0]?.id,
                                  status: 'completed'
                                });
                              }
                            }}
                            className="flex items-center px-3 py-2 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                          >
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Complete Project
                          </button>
                          <button
                            onClick={() => {
                              if (activeProjects?.length === 1) {
                                handleQuickAction('update_status', {
                                  projectId: activeProjects?.[0]?.id,
                                  status: 'on_hold'
                                });
                              }
                            }}
                            className="flex items-center px-3 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100"
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Put On Hold
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Quick Stats
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <p className="text-lg font-bold text-blue-600">{projects?.length || 0}</p>
                          <p className="text-xs text-blue-600">Projects</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-md">
                          <p className="text-lg font-bold text-green-600">{activeProjects?.length}</p>
                          <p className="text-xs text-green-600">Active</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-md">
                          <p className="text-lg font-bold text-purple-600">
                            {projects?.filter(p => p?.status === 'completed')?.length || 0}
                          </p>
                          <p className="text-xs text-purple-600">Done</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {/* Project Selection Modal for Tasks */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Project for New Task
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeProjects?.map((project) => (
                  <button
                    key={project?.id}
                    onClick={() => {
                      onTaskCreate?.(project);
                      setSelectedProject(null);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-200"
                  >
                    <p className="font-medium text-gray-900">{project?.name}</p>
                    {project?.client && (
                      <p className="text-sm text-gray-500">{project?.client?.name}</p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;