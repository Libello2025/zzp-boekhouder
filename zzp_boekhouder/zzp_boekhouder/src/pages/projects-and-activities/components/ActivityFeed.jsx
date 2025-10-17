import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  Target, 
  MessageSquare, 
  Calendar,
  Filter,
  TrendingUp,
  User,
  CheckCircle
} from 'lucide-react';

const ActivityFeed = ({ 
  activities = [], 
  projects = [], 
  onActivityCreate,
  selectedProjectId = null 
}) => {
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

  // Filter activities based on selected project and filters
  const filteredActivities = useMemo(() => {
    let filtered = activities || [];

    // Filter by selected project
    if (selectedProjectId) {
      filtered = filtered?.filter(activity => activity?.project_id === selectedProjectId);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered?.filter(activity => activity?.type === filterType);
    }

    // Filter by time range
    const now = new Date();
    const timeFilters = {
      today: () => {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return filtered?.filter(activity => new Date(activity?.created_at) >= today);
      },
      week: () => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filtered?.filter(activity => new Date(activity?.created_at) >= weekAgo);
      },
      month: () => {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filtered?.filter(activity => new Date(activity?.created_at) >= monthAgo);
      },
      all: () => filtered
    };

    return timeFilters?.[timeRange] ? timeFilters?.[timeRange]() : filtered;
  }, [activities, selectedProjectId, filterType, timeRange]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = {};
    
    filteredActivities?.forEach(activity => {
      const date = new Date(activity?.created_at)?.toDateString();
      if (!groups?.[date]) {
        groups[date] = [];
      }
      groups?.[date]?.push(activity);
    });

    return Object.entries(groups)?.sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredActivities]);

  const getActivityIcon = (type) => {
    const icons = {
      time_entry: Clock,
      expense: DollarSign,
      milestone: Target,
      note: MessageSquare,
      task: CheckCircle,
      meeting: User
    };
    const IconComponent = icons?.[type] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      time_entry: 'bg-blue-100 text-blue-600 border-blue-200',
      expense: 'bg-red-100 text-red-600 border-red-200',
      milestone: 'bg-green-100 text-green-600 border-green-200',
      note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      task: 'bg-purple-100 text-purple-600 border-purple-200',
      meeting: 'bg-indigo-100 text-indigo-600 border-indigo-200'
    };
    return colors?.[type] || colors?.time_entry;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount || 0);
  };

  const formatTime = (dateString) => {
    return new Date(dateString)?.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return date?.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getProjectName = (projectId) => {
    const project = projects?.find(p => p?.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalHours = filteredActivities?.filter(a => a?.type === 'time_entry')?.reduce((sum, a) => sum + (a?.hours || 0), 0);
    
    const totalExpenses = filteredActivities?.filter(a => a?.type === 'expense')?.reduce((sum, a) => sum + (a?.amount || 0), 0);
    
    const totalEarnings = filteredActivities?.filter(a => a?.type === 'time_entry')?.reduce((sum, a) => sum + (a?.amount || 0), 0);

    return {
      totalHours: totalHours?.toFixed(1),
      totalExpenses,
      totalEarnings,
      activityCount: filteredActivities?.length
    };
  }, [filteredActivities]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Activity Feed
            {selectedProjectId && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {getProjectName(selectedProjectId)}
              </span>
            )}
          </h2>
          <button
            onClick={() => onActivityCreate?.()}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e?.target?.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="time_entry">Time Entries</option>
              <option value="expense">Expenses</option>
              <option value="milestone">Milestones</option>
              <option value="note">Notes</option>
              <option value="task">Tasks</option>
              <option value="meeting">Meetings</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hours</span>
                <Clock className="w-3 h-3 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-900 mt-1">{summaryStats?.totalHours}h</p>
            </div>
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Earnings</span>
                <TrendingUp className="w-3 h-3 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-900 mt-1">{formatCurrency(summaryStats?.totalEarnings)}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {groupedActivities?.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedProjectId 
                ? 'No activities for this project yet.'
                : 'Start tracking your work by adding activities.'
              }
            </p>
            <button
              onClick={() => onActivityCreate?.()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedActivities?.map(([date, dayActivities]) => (
              <div key={date} className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(date)}
                </h4>
                
                <div className="space-y-3">
                  {dayActivities?.map((activity) => (
                    <div 
                      key={activity?.id} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                        {getActivityIcon(activity?.type)}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity?.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(activity?.created_at)}
                          </span>
                        </div>
                        
                        {activity?.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {activity?.description}
                          </p>
                        )}

                        {!selectedProjectId && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            {getProjectName(activity?.project_id)}
                          </p>
                        )}

                        {/* Activity Metadata */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            {activity?.hours && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity?.hours}h
                              </span>
                            )}
                            {activity?.amount && (
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {formatCurrency(activity?.amount)}
                              </span>
                            )}
                          </div>

                          {activity?.task && (
                            <span className="text-xs text-gray-500">
                              Task: {activity?.task?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer Summary */}
      {groupedActivities?.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>{summaryStats?.activityCount} activities</span>
            <div className="flex items-center space-x-4">
              {summaryStats?.totalExpenses > 0 && (
                <span>Expenses: {formatCurrency(summaryStats?.totalExpenses)}</span>
              )}
              <span>Total: {summaryStats?.totalHours}h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;