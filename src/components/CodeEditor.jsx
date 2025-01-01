"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  FolderOpen, 
  Settings, 
  Search, 
  GitBranch, 
  Terminal, 
  Package, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Bug 
} from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

const CodeEditor = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([
    { 
      name: 'src',
      type: 'folder',
      expanded: true,
      children: [
        { 
          name: 'app',
          type: 'folder',
          expanded: true,
          children: [
            { name: 'page.js', type: 'file', language: 'javascript', content: '// Next.js page component' },
            { name: 'layout.js', type: 'file', language: 'javascript', content: '// Layout configuration' },
          ]
        },
        { 
          name: 'components',
          type: 'folder',
          expanded: true,
          children: [
            { name: 'ChatBox.jsx', type: 'file', language: 'javascript', content: '// Chat interface component' },
            { name: 'CodeEditor.jsx', type: 'file', language: 'javascript', content: '// Code editor component' }
          ]
        },
        { name: 'styles.css', type: 'file', language: 'css', content: '/* Global styles */' },
      ]
    },
    { 
      name: 'public',
      type: 'folder',
      expanded: false,
      children: [
        { name: 'favicon.ico', type: 'file', language: 'plaintext', content: '// Icon file' },
      ]
    }
  ]);
  
  const [activeFile, setActiveFile] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [selectedSidebarIcon, setSelectedSidebarIcon] = useState('files');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  
  const sidebarIcons = [
    { id: 'files', Icon: FileCode, tooltip: 'Explorer' },
    { id: 'search', Icon: Search, tooltip: 'Search' },
    { id: 'git', Icon: GitBranch, tooltip: 'Source Control' },
    { id: 'debug', Icon: Bug, tooltip: 'Run and Debug' },
    { id: 'extensions', Icon: Package, tooltip: 'Extensions' }
  ];

  const handleFileClick = (file) => {
    if (file.type === 'file') {
      setActiveFile(file);
      if (!openTabs.find(tab => tab.name === file.name)) {
        setOpenTabs([...openTabs, file]);
      }
      setActiveTab(file.name);
    }
  };

  const closeTab = (tabName, e) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(tab => tab.name !== tabName);
    setOpenTabs(newTabs);
    if (activeTab === tabName) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].name);
        setActiveFile(newTabs[newTabs.length - 1]);
      } else {
        setActiveTab(null);
        setActiveFile(null);
      }
    }
  };

  const toggleFolder = (folderPath) => {
    const updateFolderExpanded = (items) => {
      return items.map(item => {
        if (item.type === 'folder') {
          if (item.name === folderPath) {
            return { ...item, expanded: !item.expanded };
          }
          if (item.children) {
            return { ...item, children: updateFolderExpanded(item.children) };
          }
        }
        return item;
      });
    };
    setFiles(updateFolderExpanded(files));
  };

  const renderFolder = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.name} style={{ paddingLeft: `${level * 12}px` }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleFolder(item.name)}
            >
              {item.expanded ? 
                <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                <ChevronRight className="w-4 h-4 text-gray-400" />
              }
              <FolderOpen className="w-4 h-4 ml-1 text-cyan-400" />
              <span className="ml-1 text-sm text-gray-300">{item.name}</span>
            </div>
            {item.expanded && renderFolder(item.children, level + 1)}
          </div>
        ) : (
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer ${
              activeTab === item.name ? 'bg-gray-800' : ''
            }`}
            onClick={() => handleFileClick(item)}
          >
            <FileCode className="w-4 h-4 ml-5 text-cyan-400" />
            <span className="ml-1 text-sm text-gray-300">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-4 z-50"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div 
            className="relative w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-800 shadow-2xl"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between h-8 bg-[#1f1f1f] border-b border-gray-800 px-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Quantum Code Matrix</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex h-[calc(100%-2rem)]">
              {/* Activity Bar */}
              <div className="w-12 bg-[#1f1f1f] border-r border-gray-800">
                {sidebarIcons.map(({ id, Icon, tooltip }) => (
                  <div
                    key={id}
                    className={`p-3 cursor-pointer hover:bg-gray-800 ${
                      selectedSidebarIcon === id ? 'border-l-2 border-cyan-400 bg-gray-800' : ''
                    }`}
                    onClick={() => setSelectedSidebarIcon(id)}
                    title={tooltip}
                  >
                    <div className="text-gray-400 hover:text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="w-60 bg-[#1f1f1f] border-r border-gray-800">
                <div className="p-2 text-sm text-gray-400 font-bold">EXPLORER</div>
                <div className="text-gray-300">
                  {renderFolder(files)}
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 flex flex-col">
                {/* Tabs */}
                <div className="h-9 bg-[#1f1f1f] border-b border-gray-800 flex items-center">
                  {openTabs.map((tab) => (
                    <div
                      key={tab.name}
                      onClick={() => {
                        setActiveTab(tab.name);
                        setActiveFile(tab);
                      }}
                      className={`
                        flex items-center h-8 px-3 border-r border-gray-800 cursor-pointer
                        ${activeTab === tab.name ? 'bg-[#1e1e1e]' : 'bg-[#1f1f1f]'}
                      `}
                    >
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="ml-2 text-sm text-gray-300">{tab.name}</span>
                      <button
                        onClick={(e) => closeTab(tab.name, e)}
                        className="ml-2 text-gray-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Editor */}
                <div className="flex-1 bg-[#1e1e1e]">
                  {activeFile ? (
                    <MonacoEditor
                      height="100%"
                      defaultLanguage={activeFile.language}
                      defaultValue={activeFile.content}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'all',
                        fontFamily: 'monospace',
                        automaticLayout: true,
                        padding: { top: 10 },
                        lineNumbers: 'on',
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Select a file to edit
                    </div>
                  )}
                </div>

                {/* Terminal */}
                {showTerminal && (
                  <div className="h-48 bg-[#1f1f1f] border-t border-gray-800">
                    <div className="flex items-center justify-between p-2 border-b border-gray-800">
                      <span className="text-sm text-gray-400">Terminal</span>
                      <button onClick={() => setShowTerminal(false)}>
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="p-2">
                      <span className="text-gray-300">$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        className="ml-2 bg-transparent border-none outline-none text-gray-300 w-full"
                        placeholder="Enter command..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#1f1f1f] border-t border-gray-800 flex items-center px-3">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="text-gray-400 hover:text-white text-sm flex items-center"
              >
                <Terminal className="w-4 h-4 mr-1" />
                Terminal
              </button>
              <div className="flex-1" />
              <span className="text-gray-400 text-sm">
                {activeFile?.language || 'Plain Text'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CodeEditor;