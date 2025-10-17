import React, { useMemo } from 'react';
import { FolderOpen, Clock, DollarSign, TrendingUp, AlertCircle, Target, Calendar } from 'lucide-react';

const ProjectStats = ({ projects = [], activities = [] }) => {
  const stats = useMemo(() => {
    // Project statistics
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p?.status === 'active')?.length || 0;
    const completedProjects = projects?.filter(p => p?.status === 'completed')?.length || 0;
    const overbudgetProjects = projects?.filter(p => {
      if (!p?.budget) return false;
      const spent = activities
        ?.filter(a => a?.project_id === p?.id)
        ?.reduce((sum, a) => sum + (a?.amount || 0), 0) || 0;
      return spent > p?.budget;
    })?.length || 0;

    // Time and financial statistics
    const totalHours = activities
      ?.filter(a => a?.type === 'time_entry')
      ?.reduce((sum, a) => sum + (a?.hours || 0), 0) || 0;
    
    const totalRevenue = activities
      ?.filter(a => a?.type === 'time_entry')
      ?.reduce((sum, a) => sum + (a?.amount || 0), 0) || 0;
    
    const totalExpenses = activities
      ?.filter(a => a?.type === 'expense')
      ?.reduce((sum, a) => sum + (a?.amount || 0), 0) || 0;
    
    const netIncome = totalRevenue - totalExpenses;

    // Average hourly rate
    const timeEntries = activities?.filter(a => a?.type === 'time_entry' && a?.hours && a?.amount) || [];
    const avgHourlyRate = timeEntries?.length > 0 
      ? timeEntries?.reduce((sum, a) => sum + (a?.amount / a?.hours), 0) / timeEntries?.length 
      : 0;

    // This week's activity
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekActivities = activities?.filter(a => 
      new Date(a?.created_at) >= weekStart
    ) || [];
    const thisWeekHours = thisWeekActivities?.filter(a => a?.type === 'time_entry')?.reduce((sum, a) => sum + (a?.hours || 0), 0);

    // Upcoming deadlines
    const upcomingDeadlines = projects
      ?.filter(p => p?.end_date && p?.status !== 'completed')
      ?.map(p => ({
        ...p,
        daysUntilDeadline: Math.ceil((new Date(p.end_date) - now) / (1000 * 60 * 60 * 24))
      }))
      ?.filter(p => p?.daysUntilDeadline >= 0 && p?.daysUntilDeadline <= 30)
      ?.sort((a, b) => a?.daysUntilDeadline - b?.daysUntilDeadline) || [];

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overbudgetProjects,
      totalHours,
      totalRevenue,
      totalExpenses,
      netIncome,
      avgHourlyRate,
      thisWeekHours,
      upcomingDeadlines
    };
  }, [projects, activities]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount || 0);
  };

  const formatHours = (hours) => {
    return `${(hours || 0)?.toFixed(1)}h`;
  };

  const getStatusColor = (status, value) => {
    if (status === 'danger') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'warning') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (status === 'success') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects,
      icon: FolderOpen,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      detail: `${stats?.activeProjects} active, ${stats?.completedProjects} completed`
    },
    {
      label: 'This Week',
      value: formatHours(stats?.thisWeekHours),
      icon: Clock,
      color: stats?.thisWeekHours >= 40 ? getStatusColor('success') : 
             stats?.thisWeekHours >= 20 ? getStatusColor('warning') : 
             getStatusColor('danger'),
      detail: 'Hours logged'
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue),
      icon: TrendingUp,
      color: getStatusColor('success'),
      detail: `Avg. ${formatCurrency(stats?.avgHourlyRate)}/hour`
    },
    {
      label: 'Net Income',
      value: formatCurrency(stats?.netIncome),
      icon: DollarSign,
      color: stats?.netIncome >= 0 ? getStatusColor('success') : getStatusColor('danger'),
      detail: `${formatCurrency(stats?.totalExpenses)} expenses`
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards?.map((stat, index) => {
          const IconComponent = stat?.icon;
          return (
            <div key={index} className={`rounded-lg border p-6 ${stat?.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium opacity-80">{stat?.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat?.value}</p>
                  <p className="text-xs opacity-70 mt-1">{stat?.detail}</p>
                </div>
                <div className="ml-4">
                  <IconComponent className="w-8 h-8 opacity-60" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Project Overview</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="font-medium text-green-600">{stats?.activeProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Projects</span>
              <span className="font-medium text-blue-600">{stats?.completedProjects}</span>
            </div>
            {stats?.overbudgetProjects > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                  Over Budget
                </span>
                <span className="font-medium text-red-600">{stats?.overbudgetProjects}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Total Hours Logged</span>
              <span className="font-medium text-gray-900">{formatHours(stats?.totalHours)}</span>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          </div>
          
          {stats?.upcomingDeadlines?.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {stats?.upcomingDeadlines?.slice(0, 5)?.map((project) => (
                <div key={project?.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(project.end_date)?.toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="ml-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      project?.daysUntilDeadline <= 3 
                        ? 'bg-red-100 text-red-700'
                        : project?.daysUntilDeadline <= 7
                        ? 'bg-yellow-100 text-yellow-700' :'bg-blue-100 text-blue-700'
                    }`}>
                      {project?.daysUntilDeadline === 0 
                        ? 'Today'
                        : project?.daysUntilDeadline === 1
                        ? '1 day'
                        : `${project?.daysUntilDeadline} days`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;