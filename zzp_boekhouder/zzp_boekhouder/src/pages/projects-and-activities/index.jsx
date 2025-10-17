import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderOpen } from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import ActivityFeed from './components/ActivityFeed';
import ProjectStats from './components/ProjectStats';

import TaskModal from './components/TaskModal';
import ActivityModal from './components/ActivityModal';
import ProjectFilters from './components/ProjectFilters';
import QuickActions from './components/QuickActions';
import projectsService from '../../services/projectsService';
import { useAuth } from '../../contexts/AuthContext';

const ProjectsAndActivities = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  
  // View states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const projectsChannel = projectsService?.subscribeToProjects(() => {
      loadProjects();
    });

    const activitiesChannel = projectsService?.subscribeToActivities(() => {
      loadActivities();
    });

    return () => {
      projectsChannel?.unsubscribe();
      activitiesChannel?.unsubscribe();
    };
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProjects(),
        loadActivities(), 
        loadClients()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    const result = await projectsService?.getProjects();
    if (result?.error) {
      setError(result?.error);
    } else {
      setProjects(result?.data || []);
    }
  };

  const loadActivities = async () => {
    const result = await projectsService?.getActivities();
    if (result?.error) {
      setError(result?.error);
    } else {
      setActivities(result?.data || []);
    }
  };

  const loadClients = async () => {
    const result = await projectsService?.getClients();
    if (result?.error) {
      setError(result?.error);
    } else {
      setClients(result?.data || []);
    }
  };

  // Filter projects
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         project?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         project?.client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project?.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project?.priority === priorityFilter;
    const matchesClient = clientFilter === 'all' || project?.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  }) || [];

  // Event handlers
  const handleProjectCreate = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const handleProjectEdit = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleProjectSave = async (projectData) => {
    try {
      if (selectedProject) {
        await projectsService?.updateProject(selectedProject?.id, projectData);
      } else {
        await projectsService?.createProject(projectData);
      }
      await loadProjects();
      setShowProjectModal(false);
      setSelectedProject(null);
    } catch (err) {
      setError('Failed to save project');
    }
  };

  const handleProjectDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsService?.deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const handleTaskCreate = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  const handleActivityCreate = (project = null) => {
    setSelectedProject(project);
    setShowActivityModal(true);
  };

  const handleQuickAction = async (action, data) => {
    try {
      switch (action) {
        case 'start_timer':
          // Handle timer start - could integrate with time tracking
          break;
        case 'add_expense':
          await projectsService?.createActivity({
            ...data,
            type: 'expense'
          });
          await loadActivities();
          break;
        case 'update_status':
          await projectsService?.updateProject(data?.projectId, { status: data?.status });
          await loadProjects();
          break;
        default:
          break;
      }
    } catch (err) {
      setError(`Failed to perform action: ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">Please sign in to view your projects and activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FolderOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects & Activities</h1>
                <p className="text-sm text-gray-500">
                  Manage your projects, track activities, and monitor progress
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'grid' ?'bg-blue-600 text-white border-blue-600' :'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'list' ?'bg-blue-600 text-white border-blue-600' :'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
              
              <button
                onClick={handleProjectCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, clients, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {showFilters && (
          <ProjectFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            clientFilter={clientFilter}
            clients={clients}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onClientChange={setClientFilter}
            onReset={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setClientFilter('all');
              setSearchTerm('');
            }}
          />
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <ProjectStats projects={projects} activities={activities} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Projects ({filteredProjects?.length || 0})
                  </h2>
                  <QuickActions
                    projects={projects}
                    onAction={handleQuickAction}
                    onTaskCreate={handleTaskCreate}
                    onActivityCreate={handleActivityCreate}
                  />
                </div>
              </div>

              <div className="p-6">
                {filteredProjects?.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {projects?.length === 0 
                        ? 'Get started by creating your first project.' :'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleProjectCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 gap-6' :'space-y-4'
                  }>
                    {filteredProjects?.map((project) => (
                      <ProjectCard
                        key={project?.id}
                        project={project}
                        viewMode={viewMode}
                        onEdit={handleProjectEdit}
                        onDelete={handleProjectDelete}
                        onTaskCreate={handleTaskCreate}
                        onActivityCreate={handleActivityCreate}
                        onStatusUpdate={(status) => handleQuickAction('update_status', {
                          projectId: project?.id,
                          status
                        })}
                        isSelected={selectedProjectId === project?.id}
                        onSelect={() => setSelectedProjectId(
                          selectedProjectId === project?.id ? null : project?.id
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1">
            <ActivityFeed
              activities={activities}
              projects={projects}
              onActivityCreate={handleActivityCreate}
              selectedProjectId={selectedProjectId}
            />
          </div>
        </div>
      </div>
      {/* Modals */}
      {showProjectModal && (
        <ProjectModal
          project={selectedProject}
          clients={clients}
          onSave={handleProjectSave}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
        />
      )}
      {showTaskModal && (
        <TaskModal
          project={selectedProject}
          onSave={async (taskData) => {
            await projectsService?.createTask(taskData);
            await loadProjects();
            setShowTaskModal(false);
          }}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedProject(null);
          }}
        />
      )}
      {showActivityModal && (
        <ActivityModal
          project={selectedProject}
          projects={projects}
          onSave={async (activityData) => {
            await projectsService?.createActivity(activityData);
            await loadActivities();
            setShowActivityModal(false);
          }}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsAndActivities;