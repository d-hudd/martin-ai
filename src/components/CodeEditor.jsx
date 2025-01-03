"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  FileCode, 
  FolderPlus, 
  FilePlus, 
  Save,
  X,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus
} from 'lucide-react';


// Dynamic import of Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="p-4 text-cyan-400">Loading editor...</div>
});

// Notification Component
const Notification = ({ message, type = 'success' }) => (
  <div className={`
    fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm
    ${type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
  `}>
    {message}
  </div>
);

// New File/Folder Dialog
const CreateDialog = ({ type, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
        <h3 className="text-cyan-400 mb-4">Create New {type}</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${type.toLowerCase()} name`}
          className="bg-[#2d2d2d] text-white px-3 py-2 rounded w-full mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

const CodeEditor = ({ 
  isOpen, 
  onClose, 
  initialFile,
  onEditorReady, // New prop to notify when editor is ready
  editorRef // New prop to store editor reference
  }) => {
  // ... Rest of your component code stays exactly the same ...

  const [files, setFiles] = useState([
    { 
      name: 'src',
      type: 'folder',
      expanded: true,
      children: [
        { name: 'index.js', type: 'file', language: 'javascript', content: '// Your code here' }
      ]
    }
  ]);
  
  const [currentFile, setCurrentFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [notification, setNotification] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // File Operations
  const handleSave = async () => {
    if (!currentFile) return;

    try {
      // Construct the full path
      const fullPath = [...currentPath, currentFile.name].join('/');
      
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: fullPath,
          content: editorContent
        })
      });

      if (!response.ok) throw new Error('Failed to save file');

      // Update file in state
      updateFileContent(currentFile.name, editorContent);
      showNotification('File saved successfully!', 'success');

    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save file', 'error');
    }
  };

  const createFile = async (name) => {
    try {
      const extension = name.includes('.') ? '' : '.js';
      const fileName = name + extension;
      const newFile = {
        name: fileName,
        type: 'file',
        language: getLanguage(fileName),
        content: ''
      };

      // Add file to current directory in the file tree
      addToFileTree(fileName, 'file');
      showNotification(`File ${fileName} created successfully!`, 'success');

    } catch (error) {
      console.error('Create file error:', error);
      showNotification('Failed to create file', 'error');
    }
  };

  const createFolder = async (name) => {
    try {
      const newFolder = {
        name,
        type: 'folder',
        expanded: true,
        children: []
      };

      // Add folder to current directory in the file tree
      addToFileTree(name, 'folder');
      showNotification(`Folder ${name} created successfully!`, 'success');

    } catch (error) {
      console.error('Create folder error:', error);
      showNotification('Failed to create folder', 'error');
    }
  };

  // Utility Functions
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown'
    };
    return languageMap[ext] || 'plaintext';
  };

  const updateFileContent = (fileName, content) => {
    const updateInTree = (items) => {
      return items.map(item => {
        if (item.type === 'file' && item.name === fileName) {
          return { ...item, content };
        }
        if (item.children) {
          return { ...item, children: updateInTree(item.children) };
        }
        return item;
      });
    };
    setFiles(updateInTree(files));
  };

  const addToFileTree = (name, type) => {
    const addToPath = (items, path) => {
      if (path.length === 0) {
        if (type === 'file') {
          return [...items, {
            name,
            type: 'file',
            language: getLanguage(name),
            content: ''
          }];
        } else {
          return [...items, {
            name,
            type: 'folder',
            expanded: true,
            children: []
          }];
        }
      }

      return items.map(item => {
        if (item.name === path[0] && item.type === 'folder') {
          return {
            ...item,
            children: addToPath(item.children, path.slice(1))
          };
        }
        return item;
      });
    };

    setFiles(addToPath(files, currentPath));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [currentFile, editorContent]);

  // Render Functions
  const renderFileTree = (items, path = []) => {
    return items.map((item) => (
      <div key={item.name} style={{ paddingLeft: path.length * 12 + 'px' }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer group"
              onClick={() => {
                const updateExpanded = (items) => {
                  return items.map(i => {
                    if (i.name === item.name) {
                      return { ...i, expanded: !i.expanded };
                    }
                    if (i.children) {
                      return { ...i, children: updateExpanded(i.children) };
                    }
                    return i;
                  });
                };
                setFiles(updateExpanded(files));
              }}
            >
              {item.expanded ? 
                <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                <ChevronRight className="w-4 h-4 text-gray-400" />
              }
              <FolderOpen className="w-4 h-4 ml-1 text-cyan-400" />
              <span className="ml-1 text-sm text-gray-300">{item.name}</span>
            </div>
            {item.expanded && (
              <div>
                {renderFileTree(item.children, [...path, item.name])}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`
              flex items-center py-1 px-2 cursor-pointer group
              ${currentFile?.name === item.name ? 'bg-gray-800' : 'hover:bg-gray-800'}
            `}
            onClick={() => {
              setCurrentFile(item);
              setEditorContent(item.content);
              setCurrentPath(path);
            }}
          >
            <FileCode className="w-4 h-4 ml-5 text-cyan-400" />
            <span className="ml-1 text-sm text-gray-300">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-4 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-800 shadow-2xl flex flex-col">
        {/* Title Bar */}
        <div className="flex items-center justify-between h-8 bg-[#1f1f1f] border-b border-gray-800 px-3">
          <span className="text-gray-400 text-sm">
            {currentFile ? currentFile.name : 'Select a file'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateDialog('file')}
              className="text-gray-400 hover:text-white"
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateDialog('folder')}
              className="text-gray-400 hover:text-white"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={!currentFile}
              className="text-gray-400 hover:text-white disabled:opacity-50"
              title="Save File (Ctrl/Cmd + S)"
            >
              <Save className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* File Explorer */}
          <div className="w-60 bg-[#1f1f1f] border-r border-gray-800">
            <div className="p-2 text-sm text-gray-400 font-bold flex justify-between items-center">
              <span>EXPLORER</span>
              <button
                onClick={() => setShowCreateDialog('file')}
                className="text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-gray-300">
              {renderFileTree(files)}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-w-0">
            {currentFile ? (
              <MonacoEditor
                height="100%"
                language={currentFile.language}
                value={editorContent}
                theme="vs-dark"
                onChange={setEditorContent}
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 10 },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a file to edit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateDialog
          type={showCreateDialog}
          onSubmit={showCreateDialog === 'file' ? createFile : createFolder}
          onClose={() => setShowCreateDialog(null)}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
};

export default CodeEditor;