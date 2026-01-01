
'use client';

import React, { useState, useEffect } from 'react';
import { ViewType, Project, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import History from './components/History';
import Auth from './components/Auth';
import { getProjectsAction, createProjectAction, updateProjectAction, logoutAction } from './app/actions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// @google/genai: Defined AppProps to handle initial session from server-side components
interface AppProps {
  initialSession?: User | null;
}

const App: React.FC<AppProps> = ({ initialSession }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // @google/genai: Use session from props if provided
    if (initialSession) {
      setCurrentUser(initialSession);
      loadProjects();
    }
    setLoading(false);
  }, [initialSession]);

  const loadProjects = async () => {
    const result = await getProjectsAction();
    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      toast.error('Failed to load projects');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadProjects();
  };

  const handleLogout = async () => {
    await logoutAction();
    setCurrentUser(null);
    setCurrentView(ViewType.DASHBOARD);
    setProjects([]);
    toast.success('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  const handleCreateProject = async (project: Project) => {
    const result = await createProjectAction(project);
    if (result.success) {
      toast.success('Project created successfully!');
      await loadProjects();
      setCurrentView(ViewType.DASHBOARD);
    } else {
      toast.error(result.error || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (project: Project) => {
    const result = await updateProjectAction(project);
    if (result.success) {
      toast.success('Project updated successfully!');
      await loadProjects();
      setEditingProject(null);
      setCurrentView(ViewType.DASHBOARD);
    } else {
      toast.error(result.error || 'Failed to update project');
    }
  };

  const handleEditRequest = (project: Project) => {
    setEditingProject(project);
    setCurrentView(ViewType.NEW_PROJECT);
  };

  if (loading) return null;
  if (!currentUser) return <Auth onLogin={handleLogin} />;

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: 
        return <Dashboard projects={projects} />;
      case ViewType.NEW_PROJECT: 
        return <ProjectForm onAdd={handleCreateProject} onUpdate={handleUpdateProject} projectToEdit={editingProject || undefined} />;
      case ViewType.UPCOMING: 
        return <ProjectList projects={projects} type="upcoming" currentUser={currentUser} onEdit={handleEditRequest} />;
      case ViewType.COMPLETED: 
        return <ProjectList projects={projects} type="completed" currentUser={currentUser} onEdit={handleEditRequest} />;
      case ViewType.HISTORY: 
        return <History projects={projects} />;
      default: 
        return <Dashboard projects={projects} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 print:bg-white">
      <Sidebar 
        user={currentUser} 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
