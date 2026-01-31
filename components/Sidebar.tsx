import React, { useRef, useState } from 'react';
import { Project, File } from '../types';
import { FileCode, FileText, Plus, FolderPlus, Settings, Info, Upload, Edit2, Trash2, X, ChevronRight, ChevronDown, BookOpen, Folder, FolderOpen } from 'lucide-react';

interface SidebarProps {
  project: Project;
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (parentId: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  onToggleFolder: (folderId: string) => void;
  onOpenSettings: () => void;
  onExport: () => void;
  onImport: (file: globalThis.File) => void;
  onSaveAs: () => void; 
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpenNotes: () => void;
  onOpenAbout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  project, 
  activeFileId, 
  onSelectFile, 
  onAddFile, 
  onAddFolder,
  onToggleFolder,
  onOpenSettings,
  onExport,
  onImport,
  onSaveAs,
  onRenameFile,
  onDeleteFile,
  isMobile,
  isOpen,
  onClose,
  onOpenNotes,
  onOpenAbout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextMenuItemId, setContextMenuItemId] = useState<string | null>(null);
  const [contextMenuItemType, setContextMenuItemType] = useState<'file'|'folder'|null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onImport(e.target.files[0]);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const openContextMenu = (id: string, name: string, type: 'file'|'folder', e: React.MouseEvent) => {
      e.stopPropagation();
      setContextMenuItemId(id);
      setContextMenuItemType(type);
      setRenameValue(name);
  };

  const closeContextMenu = () => {
      setContextMenuItemId(null);
      setContextMenuItemType(null);
      setRenameValue('');
  };

  const handleRenameSubmit = () => {
      if(contextMenuItemId && renameValue) {
          onRenameFile(contextMenuItemId, renameValue);
          closeContextMenu();
      }
  };

  const handleDeleteSubmit = () => {
      if(contextMenuItemId) {
          if(project.files.filter(f => f.type === 'file').length <= 1 && contextMenuItemType === 'file') {
              alert("Cannot delete the last file.");
              return;
          }
          onDeleteFile(contextMenuItemId);
          closeContextMenu();
      }
  };

  const handleAddFileInContext = () => {
      if(contextMenuItemId && contextMenuItemType === 'folder') {
          onAddFile(contextMenuItemId);
          closeContextMenu();
      }
  };
  
  const handleAddFolderInContext = () => {
      if(contextMenuItemId && contextMenuItemType === 'folder') {
          onAddFolder(contextMenuItemId);
          closeContextMenu();
      }
  };

  // Recursive Tree Renderer
  const renderTree = (parentId: string | null, depth: number = 0) => {
    const items = project.files
        .filter(f => f.parentId === parentId)
        .sort((a, b) => {
            // Folders first, then files
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

    return items.map(item => (
        <React.Fragment key={item.id}>
            <div 
                className={`
                    w-full flex items-center space-x-2 px-3 py-1.5 text-sm transition-all duration-200 group relative
                    ${item.type === 'file' && activeFileId === item.id 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-text-muted hover:bg-surface-highlight hover:text-text'
                    }
                `}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                onClick={(e) => {
                    if (item.type === 'folder') {
                        onToggleFolder(item.id);
                    } else {
                        onSelectFile(item.id);
                        if (isMobile) onClose();
                    }
                }}
            >
                {/* Icon */}
                <div className="shrink-0">
                    {item.type === 'folder' ? (
                        <div className="flex items-center space-x-1">
                             {item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                             {item.isOpen ? <FolderOpen size={16} className="text-accent" /> : <Folder size={16} className="text-accent" />}
                        </div>
                    ) : (
                         item.language === 'csharp' 
                            ? <FileCode size={16} className={activeFileId === item.id ? 'text-primary' : 'text-text-muted group-hover:text-text'} /> 
                            : <FileText size={16} className={activeFileId === item.id ? 'text-primary' : 'text-text-muted group-hover:text-text'} />
                    )}
                </div>

                {/* Name */}
                <span className="truncate flex-1 text-left select-none">{item.name}</span>

                {/* Edit Action (Visible on Hover) */}
                <div 
                    onClick={(e) => openContextMenu(item.id, item.name, item.type, e)}
                    className={`
                        p-1 rounded-lg hover:bg-surface text-text-muted transition-opacity
                        ${(activeFileId === item.id || contextMenuItemId === item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                >
                    <Edit2 size={12} />
                </div>
            </div>
            
            {/* Recursively render children if folder is open */}
            {item.type === 'folder' && item.isOpen && renderTree(item.id, depth + 1)}
        </React.Fragment>
    ));
  };

  return (
    <>
        {/* Mobile Overlay */}
        {isMobile && isOpen && (
            <div 
                className="fixed inset-0 bg-black/60 z-30 transition-opacity duration-300"
                onClick={onClose}
            />
        )}
        
        {/* Context Menu Modal */}
        {contextMenuItemId && (
            <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
                <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={closeContextMenu} />
                <div className="relative w-full md:max-w-sm mx-4 bg-surface rounded-t-3xl md:rounded-3xl shadow-2xl border border-border overflow-hidden animate-slide-up md:animate-zoom-in-95" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface-highlight">
                        <h3 className="font-bold text-text">Manage {contextMenuItemType === 'folder' ? 'Folder' : 'File'}</h3>
                        <button onClick={closeContextMenu} className="p-1 hover:bg-surface rounded-full">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Rename</label>
                            <input 
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                            <button 
                                onClick={handleRenameSubmit}
                                className="flex-1 bg-primary text-primary-fg py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                Save
                            </button>
                            <button 
                                onClick={handleDeleteSubmit}
                                className="flex-1 bg-surface-highlight border border-border text-red-500 hover:bg-red-500/10 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95"
                            >
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        </div>
                        
                        {contextMenuItemType === 'folder' && (
                            <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
                                <button onClick={handleAddFileInContext} className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-border hover:bg-surface-highlight transition-all">
                                    <Plus size={16} /> <span className="text-xs font-bold">New File</span>
                                </button>
                                <button onClick={handleAddFolderInContext} className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-border hover:bg-surface-highlight transition-all">
                                    <FolderPlus size={16} /> <span className="text-xs font-bold">New Folder</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <aside className={`
            fixed md:static inset-y-0 left-0 z-40
            w-72 bg-surface-tinted border-r border-border flex flex-col
            transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden lg:flex'}
        `}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-border bg-surface-tinted shrink-0">
                <div className="flex items-center space-x-3 text-primary font-bold text-xl tracking-tight">
                    <img src="https://eldrex.landecs.org/squad/trilan-logo.png" alt="TriLan Logo" className="w-9 h-9 object-contain drop-shadow-md" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">TriLan</span>
                </div>
            </div>

            {/* File Explorer Actions */}
            <div className="p-3 grid grid-cols-2 gap-2 border-b border-border bg-surface-tinted shrink-0">
                 <button 
                    onClick={() => onAddFile(null)}
                    className="flex items-center justify-center space-x-1.5 bg-surface-highlight hover:bg-border text-text text-xs py-2 rounded-lg transition-all font-medium border border-border active:scale-95"
                >
                    <Plus size={14} />
                    <span>File</span>
                </button>
                <button 
                    onClick={() => onAddFolder(null)}
                    className="flex items-center justify-center space-x-1.5 bg-surface-highlight hover:bg-border text-text text-xs py-2 rounded-lg transition-all font-medium border border-border active:scale-95"
                >
                    <FolderPlus size={14} />
                    <span>Folder</span>
                </button>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {renderTree(null)}
                <div className="h-10" />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-surface-tinted shrink-0">
                 <div className="grid grid-cols-4 gap-2">
                    <button 
                        onClick={onOpenSettings} 
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-highlight text-text-muted hover:text-accent transition-all group active:scale-90"
                        title="Settings"
                    >
                        <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                    </button>
                    
                    <button 
                        onClick={onOpenNotes} 
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-highlight text-text-muted hover:text-accent transition-all active:scale-90"
                        title="Notes"
                    >
                        <BookOpen size={20} />
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-highlight text-text-muted hover:text-accent transition-all active:scale-90"
                        title="Import ZIP"
                    >
                        <Upload size={20} />
                    </button>

                    <button 
                        onClick={onOpenAbout}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-surface-highlight text-text-muted hover:text-accent transition-all active:scale-90"
                        title="About"
                    >
                        <Info size={20} />
                    </button>
                 </div>
                 
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".zip" 
                    className="hidden" 
                 />
            </div>
        </aside>
    </>
  );
};

export default Sidebar;