import React from 'react';
import { Filter, X, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

const ProjectFilters = ({
  statusFilter,
  priorityFilter,
  clientFilter,
  clients = [],
  onStatusChange,
  onPriorityChange,
  onClientChange,
  onReset
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Filter, color: 'text-gray-600' },
    { value: 'planning', label: 'Planning', icon: Clock, color: 'text-yellow-600' },
    { value: 'active', label: 'Active', icon: CheckCircle, color: 'text-green-600' },
    { value: 'on_hold', label: 'On Hold', icon: AlertCircle, color: 'text-gray-600' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-blue-600' },
    { value: 'cancelled', label: 'Cancelled', icon: X, color: 'text-red-600' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority', color: 'text-gray-600' },
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || clientFilter !== 'all';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="space-y-2">
            {statusOptions?.map((option) => {
              const IconComponent = option?.icon;
              return (
                <button
                  key={option?.value}
                  onClick={() => onStatusChange?.(option?.value)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                    statusFilter === option?.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700' :'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 mr-2 ${
                    statusFilter === option?.value ? 'text-blue-600' : option?.color
                  }`} />
                  <span className="flex-1 text-left">{option?.label}</span>
                  {statusFilter === option?.value && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority
          </label>
          <div className="space-y-2">
            {priorityOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => onPriorityChange?.(option?.value)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  priorityFilter === option?.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700' :'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priorityFilter === option?.value ? 'bg-blue-600' : 
                  option?.value === 'low' ? 'bg-green-500' :
                  option?.value === 'medium' ? 'bg-yellow-500' :
                  option?.value === 'high' ? 'bg-orange-500' :
                  option?.value === 'urgent' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="flex-1 text-left">{option?.label}</span>
                {priorityFilter === option?.value && (
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Client Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Client
          </label>
          <div className="space-y-2">
            <button
              onClick={() => onClientChange?.('all')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                clientFilter === 'all' ?'bg-blue-50 border-blue-200 text-blue-700' :'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className={`w-4 h-4 mr-2 ${
                clientFilter === 'all' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <span className="flex-1 text-left">All Clients</span>
              {clientFilter === 'all' && (
                <CheckCircle className="w-4 h-4 text-blue-600" />
              )}
            </button>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {clients?.map((client) => (
                <button
                  key={client?.id}
                  onClick={() => onClientChange?.(client?.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                    clientFilter === client?.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700' :'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className={`w-4 h-4 mr-2 ${
                    clientFilter === client?.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="truncate font-medium">{client?.name}</p>
                    {client?.company && (
                      <p className="text-xs text-gray-500 truncate">{client?.company}</p>
                    )}
                  </div>
                  {clientFilter === client?.id && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {clients?.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No clients available
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Active filters:</span>
            <div className="flex items-center space-x-2">
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Status: {statusOptions?.find(s => s?.value === statusFilter)?.label}
                  <button
                    onClick={() => onStatusChange?.('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priorityFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Priority: {priorityOptions?.find(p => p?.value === priorityFilter)?.label}
                  <button
                    onClick={() => onPriorityChange?.('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {clientFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Client: {clients?.find(c => c?.id === clientFilter)?.name || 'Unknown'}
                  <button
                    onClick={() => onClientChange?.('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;