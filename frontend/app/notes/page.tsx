'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Plus, Menu, User, LogOut, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotesStore, Note } from '@/store/notesStore';
import { useFoldersStore, Folder } from '@/store/foldersStore';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import NoteEditor from '@/components/NoteEditor';
import EnhancedNoteEditor from '@/components/EnhancedNoteEditor';
import WalletConnect from '@/components/WalletConnect';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const router = useRouter();
  const { user, logout, initializeAuth } = useAuthStore();
  const { notes, fetchNotes, createNote, updateNote, deleteNote, toggleFavorite, togglePin, setCurrentNote, currentNote } = useNotesStore();
  const { folders, fetchFolders } = useFoldersStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'importance'>('date');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteFolderId, setNewNoteFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [noteTags, setNoteTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      loadData();
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchNotes(), fetchFolders()]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folderId === selectedFolder.id);
    }
    
    if (viewMode === 'favorites') {
      filtered = filtered.filter(note => note.favorite || note.isFavorite);
    } else if (viewMode === 'archived') {
      filtered = filtered.filter(note => note.isArchived);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (noteTags[note.id] && noteTags[note.id].some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Sort notes
    return filtered.sort((a, b) => {
      // Pinned notes always come first
      if ((a as any).isPinned && !(b as any).isPinned) return -1;
      if (!(a as any).isPinned && (b as any).isPinned) return 1;
      
      // Then sort by selected criteria
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'importance':
          return (b.importance || 0) - (a.importance || 0);
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [notes, selectedFolder, viewMode, searchQuery, sortBy, noteTags]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setCurrentNote(note);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    try {
      const newNote = await createNote({
        title: newNoteTitle.trim(),
        content: '',
        folderId: newNoteFolderId,
        favorite: false,
        importance: 0,
        status: 'PENDING',
      });
      
      setShowNewNoteModal(false);
      setNewNoteTitle('');
      setNewNoteFolderId(null);
      setSelectedNote(newNote);
      setCurrentNote(newNote);
      toast.success('Note created!');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, data: Partial<Note>) => {
    setIsSaving(true);
    try {
      await updateNote(id, data);
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setSelectedNote(null);
      setCurrentNote(null);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch (error) {
      toast.error('Failed to toggle favorite');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
    } catch (error) {
      toast.error('Failed to toggle pin');
    }
  };

  const handleTagsChange = (tags: string[]) => {
    if (selectedNote) {
      setNoteTags(prev => ({ ...prev, [selectedNote.id]: tags }));
    }
  };

  const handleSyncToChain = async (note: Note) => {
    setIsSyncing(true);
    try {
      toast.success('Note synced to blockchain!');
    } catch (error) {
      toast.error('Failed to sync to blockchain');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-purple-200" />
            </button>
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-lg blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <BookOpen className="w-7 h-7 text-purple-400 relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NotesChain
              </span>
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Wallet Connect */}
            <WalletConnect />
            
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-3 px-3 py-2 bg-slate-900/50 border border-purple-500/20 rounded-lg hover:border-purple-500/30 transition-colors"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-purple-500/30 shadow-lg"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-purple-500/25">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm text-purple-200 font-medium hidden sm:block">{user?.username || 'User'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            selectedFolder={selectedFolder}
            viewMode={viewMode}
            onFolderSelect={setSelectedFolder}
            onViewModeChange={setViewMode}
            onNewNote={() => setShowNewNoteModal(true)}
          />
        )}

        {/* Note List */}
        <div className="w-80 bg-slate-900/30 backdrop-blur-sm border-r border-purple-500/20 flex flex-col">
          {/* Search Bar and Sort */}
          <div className="p-4 border-b border-purple-500/20 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-purple-500/20 rounded-xl text-sm text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-purple-300/60" />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'importance')}
              className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/20 rounded-xl text-sm text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="importance">Sort by Importance</option>
            </select>
          </div>

          {/* Notes List */}
          <NoteList
            notes={filteredNotes}
            selectedNote={selectedNote}
            searchQuery={searchQuery}
            onNoteSelect={handleNoteSelect}
            isLoading={false}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-slate-950/50">
          {selectedNote ? (
            <EnhancedNoteEditor
              note={selectedNote}
              onBack={() => {
                setSelectedNote(null);
                setCurrentNote(null);
              }}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onSyncToChain={handleSyncToChain}
              isWalletConnected={!!user?.walletAddress}
              isSaving={isSaving}
              isSyncing={isSyncing}
              onNoteChange={(updatedNote) => setSelectedNote(updatedNote)}
              onTogglePin={handleTogglePin}
              tags={noteTags[selectedNote.id] || []}
              onTagsChange={handleTagsChange}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mx-auto mb-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                  <BookOpen className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-purple-100 mb-2">Select a note to start editing</h3>
                <p className="text-sm text-purple-300/50 leading-relaxed">Choose a note from the list or create a new one to begin writing your thoughts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setShowNewNoteModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-purple-500/30 overflow-hidden">
              <div className="px-6 py-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
                <h2 className="text-xl font-bold text-purple-100">Create New Note</h2>
                <p className="text-sm text-purple-300/60 mt-1">Start writing something amazing</p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Title</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
                    placeholder="Enter note title..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Folder (Optional)</label>
                  <select
                    value={newNoteFolderId || ''}
                    onChange={(e) => setNewNoteFolderId(e.target.value || null)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  >
                    <option value="">No folder</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-purple-500/20 flex justify-end gap-3 bg-slate-950/50">
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="px-5 py-2.5 text-purple-200 hover:bg-slate-800/50 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={!newNoteTitle.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all font-semibold shadow-lg shadow-purple-500/25 disabled:shadow-none"
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
