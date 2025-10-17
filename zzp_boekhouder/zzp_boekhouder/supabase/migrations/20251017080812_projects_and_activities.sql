-- Location: supabase/migrations/20251017080812_projects_and_activities.sql
-- Schema Analysis: Banking system with user_profiles exists, adding project management
-- Integration Type: NEW_MODULE - Adding project management functionality
-- Dependencies: References existing user_profiles table

-- 1. Create Custom Types
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.activity_type AS ENUM ('time_entry', 'expense', 'milestone', 'note', 'task', 'meeting');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'completed');

-- 2. Core Tables

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status public.project_status DEFAULT 'planning'::public.project_status,
    priority public.project_priority DEFAULT 'medium'::public.project_priority,
    budget DECIMAL(12,2),
    hourly_rate DECIMAL(8,2),
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project deliverables
CREATE TABLE public.project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    deliverable_id UUID REFERENCES public.project_deliverables(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status public.task_status DEFAULT 'todo'::public.task_status,
    priority public.project_priority DEFAULT 'medium'::public.project_priority,
    due_date DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activities table (time entries, notes, milestones)
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    type public.activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    hours DECIMAL(6,2),
    hourly_rate DECIMAL(8,2),
    amount DECIMAL(10,2),
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project templates
CREATE TABLE public.project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_budget DECIMAL(12,2),
    default_hourly_rate DECIMAL(8,2),
    deliverables JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_deliverables_project_id ON public.project_deliverables(project_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_deliverable_id ON public.tasks(deliverable_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_project_id ON public.activities(project_id);
CREATE INDEX idx_activities_task_id ON public.activities(task_id);
CREATE INDEX idx_activities_date ON public.activities(activity_date);
CREATE INDEX idx_project_templates_user_id ON public.project_templates(user_id);

-- 4. Functions
CREATE OR REPLACE FUNCTION public.update_project_progress(project_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks 
    FROM public.tasks 
    WHERE project_id = project_uuid;
    
    SELECT COUNT(*) INTO completed_tasks 
    FROM public.tasks 
    WHERE project_id = project_uuid AND is_completed = true;
    
    IF total_tasks > 0 THEN
        new_progress := ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100);
    ELSE
        new_progress := 0;
    END IF;
    
    UPDATE public.projects 
    SET progress = new_progress, updated_at = CURRENT_TIMESTAMP
    WHERE id = project_uuid;
END;
$func$;

CREATE OR REPLACE FUNCTION public.calculate_project_budget_spent(project_uuid UUID)
RETURNS DECIMAL
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
SELECT COALESCE(SUM(amount), 0)
FROM public.activities a
WHERE a.project_id = project_uuid 
AND a.type IN ('time_entry', 'expense');
$func$;

-- 5. Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_clients"
ON public.clients
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_projects"
ON public.projects
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_project_deliverables"
ON public.project_deliverables
FOR ALL
TO authenticated
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "users_manage_own_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "users_manage_own_activities"
ON public.activities
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_project_templates"
ON public.project_templates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Triggers
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at
    BEFORE UPDATE ON public.project_deliverables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at
    BEFORE UPDATE ON public.project_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
    project1_id UUID := gen_random_uuid();
    project2_id UUID := gen_random_uuid();
    deliverable1_id UUID := gen_random_uuid();
    deliverable2_id UUID := gen_random_uuid();
    task1_id UUID := gen_random_uuid();
    task2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert clients
        INSERT INTO public.clients (id, user_id, name, email, company, is_active)
        VALUES
            (client1_id, existing_user_id, 'Acme Corporation', 'contact@acme.com', 'Acme Corp', true),
            (client2_id, existing_user_id, 'TechStart BV', 'info@techstart.nl', 'TechStart', true);

        -- Insert projects
        INSERT INTO public.projects (id, user_id, client_id, name, description, status, priority, budget, hourly_rate, start_date, end_date, progress)
        VALUES
            (project1_id, existing_user_id, client1_id, 'Website Redesign', 'Complete redesign of company website with modern UI/UX', 'active'::public.project_status, 'high'::public.project_priority, 25000.00, 75.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 35),
            (project2_id, existing_user_id, client2_id, 'Mobile App Development', 'Cross-platform mobile application for iOS and Android', 'planning'::public.project_status, 'medium'::public.project_priority, 45000.00, 85.00, CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE + INTERVAL '6 months', 0);

        -- Insert deliverables
        INSERT INTO public.project_deliverables (id, project_id, name, description, due_date, is_completed)
        VALUES
            (deliverable1_id, project1_id, 'Design Mockups', 'Create wireframes and visual designs for all pages', CURRENT_DATE + INTERVAL '2 weeks', false),
            (deliverable2_id, project1_id, 'Frontend Development', 'Implement responsive frontend with React', CURRENT_DATE + INTERVAL '6 weeks', false);

        -- Insert tasks
        INSERT INTO public.tasks (id, project_id, deliverable_id, name, description, status, priority, due_date, estimated_hours)
        VALUES
            (task1_id, project1_id, deliverable1_id, 'Create Homepage Design', 'Design homepage layout and visual elements', 'in_progress'::public.task_status, 'high'::public.project_priority, CURRENT_DATE + INTERVAL '1 week', 12.0),
            (task2_id, project1_id, deliverable1_id, 'Design Contact Page', 'Create contact form and page layout', 'todo'::public.task_status, 'medium'::public.project_priority, CURRENT_DATE + INTERVAL '10 days', 6.0);

        -- Insert activities
        INSERT INTO public.activities (user_id, project_id, task_id, type, title, description, hours, hourly_rate, amount, activity_date)
        VALUES
            (existing_user_id, project1_id, task1_id, 'time_entry'::public.activity_type, 'Homepage Layout Research', 'Researched modern homepage design patterns and user flows', 4.0, 75.00, 300.00, CURRENT_DATE - INTERVAL '2 days'),
            (existing_user_id, project1_id, task1_id, 'time_entry'::public.activity_type, 'Homepage Wireframing', 'Created initial wireframes for homepage structure', 3.5, 75.00, 262.50, CURRENT_DATE - INTERVAL '1 day'),
            (existing_user_id, project1_id, NULL, 'milestone'::public.activity_type, 'Project Kickoff Meeting', 'Initial client meeting to discuss project requirements and timeline', 2.0, 75.00, 150.00, CURRENT_DATE - INTERVAL '1 week');

        -- Insert project template
        INSERT INTO public.project_templates (user_id, name, description, default_budget, default_hourly_rate, deliverables, tasks)
        VALUES
            (existing_user_id, 'Standard Website Project', 'Template for typical website development projects', 20000.00, 75.00, 
             '[{"name": "Design & UX", "description": "Complete design phase including wireframes and mockups"}, {"name": "Development", "description": "Frontend and backend implementation"}, {"name": "Testing & Launch", "description": "Quality assurance and deployment"}]'::jsonb,
             '[{"name": "Requirements Gathering", "estimated_hours": 8}, {"name": "Wireframe Creation", "estimated_hours": 16}, {"name": "Visual Design", "estimated_hours": 24}, {"name": "Frontend Development", "estimated_hours": 40}, {"name": "Backend Integration", "estimated_hours": 32}, {"name": "Testing & Debugging", "estimated_hours": 16}]'::jsonb);
    ELSE
        RAISE NOTICE 'No existing users found. Please create user profiles first.';
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;