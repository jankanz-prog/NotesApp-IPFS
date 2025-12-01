'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotesStore } from '@/store/notesStore';
import { ArrowLeft, Save, Trash2, Star, Palette } from 'lucide-react';

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5];

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  
  const { user, initializeAuth } = useAuthStore();
  const { fetchNoteById, updateNote, deleteNote, toggleFavorite, currentNote, isLoading } = useNotesStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('');
  const [importance, setImportance] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (noteId) {
      fetchNoteById(noteId);
    }
  }, [user, noteId, router, fetchNoteById]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setColor(currentNote.color || '');
      setImportance(currentNote.importance);
    }
  }, [currentNote]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNote(noteId, { title, content, color, importance });
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this note?')) {
      await deleteNote(noteId);
      router.push('/notes');
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(noteId);
  };

  if (!user || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">Loading...</div>;
  }

  if (!currentNote) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900">Note not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-6 py-4 flex justify-between items-center">
          <Link
            href="/notes"
            className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Toggle Favorite"
            >
              <Star
                className={`w-5 h-5 ${
                  currentNote.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                }`}
              />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
              title="Delete Note"
            >
              <Trash2 className="w-5 h-5" />
            </button>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-300 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
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

            {/* Importance Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">Importance:</span>
              <div className="flex gap-2">
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
              </div>
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
      </main>
    </div>
  );
}
