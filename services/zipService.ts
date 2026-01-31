import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Project, File } from '../types';

export const exportProjectToZip = async (project: Project) => {
  const zip = new JSZip();
  const rootFolder = zip.folder(project.name) || zip;

  // Helper to build folder structure map
  const getPath = (file: File): string => {
      if (!file.parentId) return file.name;
      const parent = project.files.find(f => f.id === file.parentId);
      if (!parent) return file.name;
      return `${getPath(parent)}/${file.name}`;
  };

  project.files.forEach((file) => {
    if (file.type === 'file') {
        // Construct path based on parents
        let currentPath = file.name;
        let currentParentId = file.parentId;
        while(currentParentId) {
            const parent = project.files.find(f => f.id === currentParentId);
            if(parent) {
                currentPath = `${parent.name}/${currentPath}`;
                currentParentId = parent.parentId;
            } else {
                break;
            }
        }
        rootFolder.file(currentPath, file.content);
    }
    // We don't explicitly create empty folders in this simple zip logic, 
    // but files inside them will create the path.
  });

  // Add metadata
  rootFolder.file('project.json', JSON.stringify({
    id: project.id,
    name: project.name,
    created: project.created,
    activeFileId: project.activeFileId,
    notes: project.notes
  }, null, 2));

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${project.name.replace(/\s+/g, '_')}.zip`);
};

export const importProjectFromZip = async (file: globalThis.File): Promise<Project> => {
  const zip = await JSZip.loadAsync(file);
  const files: File[] = [];
  let projectMeta: Partial<Project> = {};

  // Find the root folder if it exists, otherwise use root
  const entries: Array<{path: string, obj: JSZip.JSZipObject}> = [];
  zip.forEach((path, obj) => entries.push({path, obj}));

  // We need to reconstruct the flat file list with parentIds from paths
  // Map of path string -> id
  const pathIdMap = new Map<string, string>();
  
  // Create root implicitly
  
  for (const {path, obj} of entries) {
    if (path.endsWith('project.json')) {
        const content = await obj.async('string');
        try {
            projectMeta = JSON.parse(content);
        } catch (e) {
            console.warn("Invalid project.json", e);
        }
        continue;
    }
    
    if (obj.dir) {
        // It's a directory
        // Strip trailing slash
        const dirPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const parts = dirPath.split('/');
        const name = parts.pop() || '';
        const parentPath = parts.join('/');
        
        // If it's a top level folder in zip (often the project name), we might skip or treat as root content
        // But here we want to replicate structure.
        
        // Check if this directory is actually just the project wrapper folder
        if (parts.length === 0 && name === projectMeta.name) {
             continue; // Skip root wrapper
        }
        
        const id = crypto.randomUUID();
        pathIdMap.set(dirPath, id);
        
        const parentId = parts.length > 0 && pathIdMap.get(parentPath) ? pathIdMap.get(parentPath)! : null;

        files.push({
            id,
            parentId,
            name,
            type: 'folder',
            content: '',
            language: 'plaintext',
            isOpen: false
        });
    } else {
        // It's a file
        const parts = path.split('/');
        const name = parts.pop() || path;
        const parentPath = parts.join('/');
        
        const content = await obj.async('string');
        const isCSharp = name.endsWith('.cs');
        
        const id = crypto.randomUUID();
        // If parent path isn't mapped (because zip didn't have explicit dir entry), we might need to create folders? 
        // For simplicity, flattening to root if folder not found, OR implement folder creation on fly.
        // Let's rely on standard zips having dir entries or implicit logic.
        
        // Better: ensure logic handles implicit folders.
        // For now, if parent not found, null (root).
        let parentId = pathIdMap.get(parentPath) || null;

        // If the path included the project name as root folder, adjust
        if (!parentId && parts.length > 0 && parts[0] === projectMeta.name) {
             // Try getting path without root
             const subParts = parts.slice(1);
             const subParentPath = subParts.join('/');
             parentId = pathIdMap.get(parts.join('/')) || pathIdMap.get(subParentPath) || null;
        }

        files.push({
            id,
            parentId,
            name,
            type: 'file',
            content,
            language: isCSharp ? 'csharp' : 'plaintext'
        });
    }
  }

  // Fallback: if no files found (maybe empty zip?), ensure at least one
  if (files.filter(f => f.type === 'file').length === 0) {
      // Add default file
      files.push({
          id: crypto.randomUUID(),
          parentId: null,
          name: 'Program.cs',
          type: 'file',
          content: '',
          language: 'csharp'
      });
  }

  const firstFile = files.find(f => f.type === 'file');

  return {
    id: projectMeta.id || crypto.randomUUID(),
    name: projectMeta.name || file.name.replace('.zip', ''),
    created: projectMeta.created || Date.now(),
    lastModified: Date.now(),
    activeFileId: projectMeta.activeFileId && files.find(f => f.id === projectMeta.activeFileId) ? projectMeta.activeFileId : firstFile!.id,
    files: files,
    notes: projectMeta.notes || ''
  };
};