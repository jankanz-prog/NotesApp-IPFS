'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotesStore, Note } from '@/store/notesStore';
import { useFoldersStore, Folder } from '@/store/foldersStore';
import { Plus, BookOpen, LogOut, Star, Trash2, Save, Palette, Folder as FolderIcon, MoreVertical } from 'lucide-react';

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5];

export default function NotesPage() {
  const router = useRouter();
  const { user, logout, initializeAuth, isInitialized } = useAuthStore();
  const { notes, fetchNotes, isLoading, createNote, updateNote, deleteNote, toggleFavorite } = useNotesStore();
  const { folders, fetchFolders, createFolder, deleteFolder } = useFoldersStore();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('');
  const [importance, setImportance] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Wait for auth initialization before redirecting
    if (!isInitialized) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    fetchNotes();
    fetchFolders();
  }, [user, router, fetchNotes, fetchFolders, isInitialized]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setColor(selectedNote.color || '');
      setImportance(selectedNote.importance);
    }
  }, [selectedNote]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        favorite: false,
        importance: 1,
        folderId: selectedFolder?.id || null, // Add to selected folder or default
      });
      setSelectedNote(newNote);
      setSelectedFolder(null); // Go back to main view after creating
    } catch (error) {
      console.error('Failed to create note');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder(newFolderName);
      setNewFolderName('');
      setShowFolderInput(false);
    } catch (error) {
      console.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Delete this folder? Notes will move to default folder.')) {
      await deleteFolder(folderId);
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    try {
      await updateNote(selectedNote.id, { title, content, color, importance });
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    
    if (confirm('Delete this note?')) {
      await deleteNote(selectedNote.id);
      setSelectedNote(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!selectedNote) return;
    await toggleFavorite(selectedNote.id);
  };

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const favoriteNotes = notes.filter(note => note.favorite);
  const importantNotes = notes.filter(note => note.importance >= 4);
  const defaultNotes = notes.filter(note => !note.folderId); // Notes in default folder
  const currentFolderNotes = selectedFolder 
    ? notes.filter(note => note.folderId === selectedFolder.id)
    : defaultNotes;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Notes App</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-900">Hi, {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-900 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-6">
            {/* Favorite Notes */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Favorite Notes</h3>
              {favoriteNotes.length === 0 ? (
                <p className="text-xs text-gray-500">No favorites</p>
              ) : (
                <ul className="space-y-1">
                  {favoriteNotes.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => handleSelectNote(note)}
                        className={`block w-full text-left text-sm truncate px-2 py-1 rounded hover:bg-blue-50 ${
                          selectedNote?.id === note.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-blue-600'
                        }`}
                      >
                        {note.title || 'Untitled'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Important Notes */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Important Notes</h3>
              {importantNotes.length === 0 ? (
                <p className="text-xs text-gray-500">No important notes</p>
              ) : (
                <ul className="space-y-1">
                  {importantNotes.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => handleSelectNote(note)}
                        className={`block w-full text-left text-sm truncate px-2 py-1 rounded hover:bg-orange-50 ${
                          selectedNote?.id === note.id ? 'bg-orange-100 text-orange-700 font-medium' : 'text-orange-600'
                        }`}
                      >
                        {note.title || 'Untitled'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* All Notes */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">All Notes</h3>
              {notes.length === 0 ? (
                <p className="text-xs text-gray-500">No notes yet</p>
              ) : (
                <ul className="space-y-1">
                  {notes.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => handleSelectNote(note)}
                        className={`block w-full text-left text-sm truncate px-2 py-1 rounded hover:bg-gray-100 ${
                          selectedNote?.id === note.id ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-900'
                        }`}
                      >
                        {note.title || 'Untitled'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {!selectedNote ? (
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedFolder ? selectedFolder.name : 'My Notes'}
                </h1>
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  New Note
                </button>
              </div>

              {/* Default Notes (only show if not in a folder) */}
              {!selectedFolder && defaultNotes.length > 0 && (
                <div className="mb-8">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {defaultNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className="p-6 bg-white border border-gray-300 rounded-lg hover:shadow-md transition text-left"
                        style={{ borderLeftWidth: '4px', borderLeftColor: note.color || '#e5e7eb' }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 truncate flex-1">
                            {note.title || 'Untitled'}
                          </h3>
                          {note.favorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {note.content || 'No content'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders (only show if not in a folder) */}
              {!selectedFolder && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Folders</h2>
                    <button
                      onClick={() => setShowFolderInput(!showFolderInput)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      New Folder
                    </button>
                  </div>

                  {showFolderInput && (
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="Folder name..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateFolder}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowFolderInput(false);
                          setNewFolderName('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="group relative p-6 bg-white border border-gray-300 rounded-lg hover:shadow-md transition cursor-pointer"
                        onClick={() => setSelectedFolder(folder)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FolderIcon className="w-12 h-12 text-blue-600" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {folder.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Has {folder._count?.notes || 0} notes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folder Notes View */}
              {selectedFolder && (
                <div>
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="mb-4 text-blue-600 hover:underline"
                  >
                    ← Back to all folders
                  </button>
                  
                  {currentFolderNotes.length === 0 ? (
                    <div className="text-center py-20">
                      <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No notes in this folder yet</p>
                      <button
                        onClick={handleCreateNote}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Note
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {currentFolderNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className="p-6 bg-white border border-gray-300 rounded-lg hover:shadow-md transition text-left"
                          style={{ borderLeftWidth: '4px', borderLeftColor: note.color || '#e5e7eb' }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 truncate flex-1">
                              {note.title || 'Untitled'}
                            </h3>
                            {note.favorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {note.content || 'No content'}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Editor Toolbar */}
              <div className="bg-white border-b border-gray-300 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      title="Back to main view"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>

                    {/* Color Picker */}
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-gray-700" />
                      <div className="flex gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition ${
                              color === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: c }}
                            title={`Color: ${c}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Importance Selector */}
                    <span className="text-sm font-medium text-gray-900 mr-2">Importance:</span>
                    {IMPORTANCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setImportance(level)}
                        className={`w-10 h-10 rounded font-medium transition ${
                          importance === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                    
                    {/* Favorite */}
                    <button
                      onClick={handleToggleFavorite}
                      className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition"
                      title="Toggle Favorite"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          selectedNote.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* Save */}
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Title */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl font-bold border-none focus:outline-none bg-transparent mb-6 text-gray-900 placeholder-gray-400"
                    placeholder="Note title..."
                  />

                  {/* Content */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[500px] text-lg border-none focus:outline-none bg-transparent resize-none text-gray-900 placeholder-gray-400 leading-relaxed"
                    placeholder="Here is the content of notes..."
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
