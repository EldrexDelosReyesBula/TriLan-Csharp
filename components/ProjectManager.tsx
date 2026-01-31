import React, { useState } from 'react';
import { ProjectMetadata } from '../types';
import { FolderPlus, Trash2, FolderOpen, X, Search } from 'lucide-react';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectMetadata[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen, onClose, projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreate = () => {
      if (newProjectName.trim()) {
          onCreateProject(newProjectName);
          setNewProjectName('');
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
      <div 
        className="absolute inset-0 bg-black/60 animate-fade-in" 
        onClick={onClose}
      />
      
      <div className={`
        relative w-full bg-surface shadow-2xl overflow-hidden flex flex-col border border-border
        h-[85vh] rounded-t-[32px] animate-slide-up
        md:h-[80vh] md:max-w-2xl md:rounded-3xl md:animate-in md:zoom-in-95
      `}>
        
        {/* Mobile Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
             <div className="w-12 h-1.5 bg-border rounded-full opacity-50" />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-border bg-surface-highlight flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">My Projects</h2>
                <p className="text-sm text-text-muted">Manage your workspaces</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-highlight border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="New Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary w-full sm:w-48 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button 
                    onClick={handleCreate}
                    disabled={!newProjectName.trim()}
                    className="bg-primary text-primary-fg px-4 py-2 rounded-xl flex items-center font-medium shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 whitespace-nowrap"
                >
                    <FolderPlus size={18} className="mr-2" />
                    Create
                </button>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start custom-scrollbar">
            {filteredProjects.map(p => (
                <div 
                    key={p.id} 
                    onClick={() => { onSelectProject(p.id); onClose(); }}
                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${
                        activeProjectId === p.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent bg-surface-highlight hover:border-accent/30'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2.5 rounded-xl ${activeProjectId === p.id ? 'bg-primary text-primary-fg shadow-lg shadow-primary/30' : 'bg-surface text-accent shadow-sm'}`}>
                            <FolderOpen size={24} />
                        </div>
                        {projects.length > 1 && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete project?')) onDeleteProject(p.id); }}
                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <h3 className="font-bold text-lg truncate mb-1">{p.name}</h3>
                    <div className="text-xs text-text-muted">
                        Edited {new Date(p.lastModified).toLocaleDateString()}
                    </div>
                    
                    {activeProjectId === p.id && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-primary text-primary-fg text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                            Active
                        </div>
                    )}
                </div>
            ))}
            
            {filteredProjects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-text-muted py-12">
                    <FolderOpen size={48} className="mb-4 opacity-20" />
                    <p>No projects found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;