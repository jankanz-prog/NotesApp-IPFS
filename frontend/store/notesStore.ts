import { create } from 'zustand';
import api from '@/lib/api';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  drawing?: string | null;
  favorite: boolean;
  importance: number;
  color?: string | null;
  ipfsHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  fetchNoteById: (id: string) => Promise<void>;
  createNote: (noteData: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notes');
      set({ notes: response.data.notes, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch notes', 
        isLoading: false 
      });
    }
  },

  fetchNoteById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/notes/${id}`);
      set({ currentNote: response.data.note, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch note', 
        isLoading: false 
      });
    }
  },

  createNote: async (noteData: Partial<Note>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/notes', noteData);
      const newNote = response.data.note;
      
      set((state) => ({ 
        notes: [newNote, ...state.notes],
        isLoading: false 
      }));
      
      return newNote;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create note', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateNote: async (id: string, noteData: Partial<Note>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/notes/${id}`, noteData);
      const updatedNote = response.data.note;
      
      set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? updatedNote : note
        ),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update note', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/notes/${id}`);
      
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete note', 
        isLoading: false 
      });
      throw error;
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      const response = await api.patch(`/notes/${id}/favorite`);
      const updatedNote = response.data.note;
      
      set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? updatedNote : note
        ),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to toggle favorite'
      });
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },
}));
