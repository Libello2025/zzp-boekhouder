import { supabase } from '../lib/supabase';

class ProjectsService {
  // Projects CRUD
  async getProjects() {
    try {
      const { data, error } = await supabase?.from('projects')?.select(`
          *,
          client:clients(*),
          deliverables:project_deliverables(*),
          tasks:tasks(*)
        `)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getProject(id) {
    try {
      const { data, error } = await supabase?.from('projects')?.select(`
          *,
          client:clients(*),
          deliverables:project_deliverables(*),
          tasks:tasks(*),
          activities:activities(*)
        `)?.eq('id', id)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createProject(projectData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('projects')?.insert([{ ...projectData, user_id: user?.user?.id }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateProject(id, updates) {
    try {
      const { data, error } = await supabase?.from('projects')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async deleteProject(id) {
    try {
      const { error } = await supabase?.from('projects')?.delete()?.eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // Clients CRUD
  async getClients() {
    try {
      const { data, error } = await supabase?.from('clients')?.select('*')?.eq('is_active', true)?.order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createClient(clientData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('clients')?.insert([{ ...clientData, user_id: user?.user?.id }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Tasks CRUD
  async createTask(taskData) {
    try {
      const { data, error } = await supabase?.from('tasks')?.insert([taskData])?.select()?.single();

      if (error) throw error;

      // Update project progress
      if (taskData?.project_id) {
        await supabase?.rpc('update_project_progress', { 
          project_uuid: taskData?.project_id 
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateTask(id, updates) {
    try {
      const { data, error } = await supabase?.from('tasks')?.update(updates)?.eq('id', id)?.select(`*, project:projects(id)`)?.single();

      if (error) throw error;

      // Update project progress if task completion status changed
      if (updates?.is_completed !== undefined && data?.project?.id) {
        await supabase?.rpc('update_project_progress', { 
          project_uuid: data?.project?.id 
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async deleteTask(id) {
    try {
      // Get project id before deletion
      const { data: task } = await supabase?.from('tasks')?.select('project_id')?.eq('id', id)?.single();

      const { error } = await supabase?.from('tasks')?.delete()?.eq('id', id);

      if (error) throw error;

      // Update project progress after deletion
      if (task?.project_id) {
        await supabase?.rpc('update_project_progress', { 
          project_uuid: task?.project_id 
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // Activities CRUD
  async getActivities(projectId = null) {
    try {
      let query = supabase?.from('activities')?.select(`
          *,
          project:projects(name),
          task:tasks(name)
        `)?.order('created_at', { ascending: false });

      if (projectId) {
        query = query?.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createActivity(activityData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('activities')?.insert([{ ...activityData, user_id: user?.user?.id }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Deliverables CRUD
  async createDeliverable(deliverableData) {
    try {
      const { data, error } = await supabase?.from('project_deliverables')?.insert([deliverableData])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateDeliverable(id, updates) {
    try {
      const { data, error } = await supabase?.from('project_deliverables')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Project Templates
  async getProjectTemplates() {
    try {
      const { data, error } = await supabase?.from('project_templates')?.select('*')?.order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createProjectFromTemplate(templateId, projectOverrides = {}) {
    try {
      const { data: template, error: templateError } = await supabase?.from('project_templates')?.select('*')?.eq('id', templateId)?.single();

      if (templateError) throw templateError;

      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user) throw new Error('User not authenticated');

      // Create project from template
      const projectData = {
        user_id: user?.user?.id,
        name: template?.name,
        description: template?.description,
        budget: template?.default_budget,
        hourly_rate: template?.default_hourly_rate,
        status: 'planning',
        ...projectOverrides
      };

      const { data: project, error: projectError } = await supabase?.from('projects')?.insert([projectData])?.select()?.single();

      if (projectError) throw projectError;

      // Create deliverables from template
      if (template?.deliverables?.length > 0) {
        const deliverables = template?.deliverables?.map(d => ({
          project_id: project?.id,
          name: d?.name,
          description: d?.description
        }));

        await supabase?.from('project_deliverables')?.insert(deliverables);
      }

      // Create tasks from template
      if (template?.tasks?.length > 0) {
        const tasks = template?.tasks?.map(t => ({
          project_id: project?.id,
          name: t?.name,
          estimated_hours: t?.estimated_hours
        }));

        await supabase?.from('tasks')?.insert(tasks);
      }

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Budget & Analytics
  async getProjectBudgetSpent(projectId) {
    try {
      const { data, error } = await supabase?.rpc('calculate_project_budget_spent', { 
          project_uuid: projectId 
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getProjectStats(projectId = null) {
    try {
      let query = supabase?.from('activities')?.select('type, amount, hours');

      if (projectId) {
        query = query?.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        totalHours: data?.reduce((sum, activity) => sum + (activity?.hours || 0), 0) || 0,
        totalAmount: data?.reduce((sum, activity) => sum + (activity?.amount || 0), 0) || 0,
        timeEntries: data?.filter(a => a?.type === 'time_entry')?.length || 0,
        expenses: data?.filter(a => a?.type === 'expense')?.length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Real-time subscriptions
  subscribeToProjects(callback) {
    return supabase?.channel('projects')?.on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects' 
      }, callback)?.subscribe();
  }

  subscribeToActivities(callback, projectId = null) {
    let channel = supabase?.channel('activities');
    
    if (projectId) {
      channel = channel?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `project_id=eq.${projectId}`
      }, callback);
    } else {
      channel = channel?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, callback);
    }

    return channel?.subscribe();
  }
}

export default new ProjectsService();