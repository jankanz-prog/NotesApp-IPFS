'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFoldersStore, Folder } from '@/store/foldersStore';
import { useNotesStore } from '@/store/notesStore';
import { Folder as FolderIcon, Plus, Star, Archive, X, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  selectedFolder: Folder | null;
  viewMode: 'all' | 'favorites' | 'archived';
  onFolderSelect: (folder: Folder | null) => void;
  onViewModeChange: (mode: 'all' | 'favorites' | 'archived') => void;
  onNewNote: () => void;
}

export default function Sidebar({
  selectedFolder,
  viewMode,
  onFolderSelect,
  onViewModeChange,
  onNewNote,
}: SidebarProps) {
  const { folders, createFolder, deleteFolder } = useFoldersStore();
  const { notes } = useNotesStore();
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderInput(false);
      toast.success('Folder created');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const favoriteCount = notes.filter(n => n.favorite || n.isFavorite).length;
  const archivedCount = notes.filter(n => n.isArchived).length;

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-64 glass-dark border-r border-mauve/20 flex flex-col h-full shadow-xl"
    >
      {/* Header with Premium Button */}
      <div className="p-4 border-b border-mauve/20">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-royal-violet via-lavender-purple to-mauve-magic hover:from-lavender-purple hover:via-mauve-magic hover:to-mauve text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(123,44,191,0.5)] font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </motion.button>
      </div>

      {/* View Mode Tabs */}
      <div className="p-4 border-b border-mauve/20">
        <div className="flex gap-2 bg-nightfall-dark/50 p-1.5 rounded-xl border border-mauve/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange('all')}
            className={`flex-1 px-3 py-2.5 text-sm rounded-lg transition-all font-medium ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-royal-violet to-lavender-purple text-white shadow-md'
                : 'text-mauve/70 hover:text-mauve'
            }`}
          >
            All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange('favorites')}
            className={`flex-1 px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium ${
              viewMode === 'favorites'
                ? 'bg-gradient-to-r from-royal-violet to-lavender-purple text-white shadow-md'
                : 'text-mauve/70 hover:text-mauve'
            }`}
          >
            <Star className={`w-4 h-4 ${viewMode === 'favorites' ? 'fill-current' : ''}`} />
            {favoriteCount > 0 && (
              <span className="text-xs font-semibold">{favoriteCount}</span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange('archived')}
            className={`flex-1 px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium ${
              viewMode === 'archived'
                ? 'bg-gradient-to-r from-royal-violet to-lavender-purple text-white shadow-md'
                : 'text-mauve/70 hover:text-mauve'
            }`}
          >
            <Archive className="w-4 h-4" />
            {archivedCount > 0 && (
              <span className="text-xs font-semibold">{archivedCount}</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Folders Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-mauve/60 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Folders
          </h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFolderInput(!showFolderInput)}
            className="p-1.5 hover:bg-mauve/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-mauve/60" />
          </motion.button>
        </div>

        {/* New Folder Input */}
        <AnimatePresence>
          {showFolderInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Folder name..."
                  className="flex-1 px-3 py-2 text-sm border-2 border-mauve/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-violet bg-nightfall-dark/60 text-mauve placeholder-mauve/40"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateFolder}
                  className="px-3 py-2 bg-gradient-to-r from-royal-violet to-lavender-purple hover:from-lavender-purple hover:to-mauve-magic text-white rounded-lg transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowFolderInput(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-2 bg-nightfall-dark hover:bg-nightfall-accent-dark rounded-lg transition-colors border border-mauve/20"
                >
                  <X className="w-4 h-4 text-mauve" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Notes Button */}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFolderSelect(null)}
          className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all mb-2 flex items-center justify-between group ${
            !selectedFolder
              ? 'bg-gradient-to-r from-royal-violet/30 to-lavender-purple/30 text-mauve border-2 border-royal-violet/50 shadow-sm'
              : 'text-mauve/80 hover:bg-mauve/10 border-2 border-transparent hover:border-mauve/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4" />
            <span className="font-semibold">All Notes</span>
          </div>
          <span className="text-xs font-medium text-mauve/60 bg-nightfall-dark px-2 py-0.5 rounded-full">
            {notes.filter(n => !n.folderId).length}
          </span>
        </motion.button>

        {/* Folder List */}
        {folders.map((folder) => {
          const folderNotes = notes.filter(n => n.folderId === folder.id);
          const isSelected = selectedFolder?.id === folder.id;

          return (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
            >
              <button
                onClick={() => onFolderSelect(folder)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all flex items-center justify-between group mb-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-royal-violet/30 to-lavender-purple/30 text-mauve border-2 border-royal-violet/50 shadow-sm'
                    : 'text-mauve/80 hover:bg-mauve/10 border-2 border-transparent hover:border-mauve/20'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ChevronRight className="w-4 h-4 text-mauve/40" />
                  <FolderIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-mauve/60 bg-nightfall-dark px-2 py-0.5 rounded-full">
                    {folderNotes.length}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this folder? Notes will move to default folder.')) {
                        deleteFolder(folder.id);
                        if (isSelected) {
                          onFolderSelect(null);
                        }
                        toast.success('Folder deleted');
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </motion.button>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
}
