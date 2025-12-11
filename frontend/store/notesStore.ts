import { create } from 'zustand';
import api from '@/lib/api';

export type NoteStatus = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

export interface Note {
  id: string;
  userId: string;
  folderId?: string | null;
  title: string;
  content: string;
  drawing?: string | null;
  favorite: boolean;
  isFavorite?: boolean; // New field for backward compatibility
  isArchived?: boolean; // New field
  isPinned?: boolean; // New: Pin notes to top
  importance: number;
  color?: string | null;
  ipfsHash?: string | null;
  txHash?: string | null;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string; // New field
  wordCount?: number; // Word count
  readingTime?: number; // Reading time in minutes
  tags?: string[]; // Tags array
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  saveTimeout: NodeJS.Timeout | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  fetchNoteById: (id: string) => Promise<void>;
  createNote: (noteData: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<void>;
  updateNoteLocal: (id: string, noteData: Partial<Note>) => void;
  saveNoteRemote: (id: string, noteData: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  getPendingNotes: () => Note[];
  clearSaveTimeout: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  saveTimeout: null,

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

  togglePin: async (id: string) => {
    try {
      const response = await api.patch(`/notes/${id}/pin`);
      const updatedNote = response.data.note;
      
      set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? updatedNote : note
        ),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to toggle pin'
      });
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  // Update note locally without API call (for optimistic updates)
  updateNoteLocal: (id: string, noteData: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...noteData } : note
      ),
      currentNote: state.currentNote?.id === id 
        ? { ...state.currentNote, ...noteData } 
        : state.currentNote,
    }));
  },

  // Get all notes with PENDING or SUBMITTED status (for background worker)
  getPendingNotes: () => {
    const { notes } = get();
    return notes.filter((note) => 
      note.status === 'PENDING' || note.status === 'SUBMITTED'
    );
  },

  // Save note remotely with debounce (for auto-save)
  saveNoteRemote: async (id: string, noteData: Partial<Note>) => {
    const state = get();
    
    // Clear existing timeout
    if (state.saveTimeout) {
      clearTimeout(state.saveTimeout);
    }
    
    // Update locally immediately (optimistic UI)
    state.updateNoteLocal(id, noteData);
    
    // Set new timeout for remote save (500ms debounce)
    const timeout = setTimeout(async () => {
      try {
        await state.updateNote(id, noteData);
      } catch (error: any) {
        console.error('Auto-save failed:', error);
        // Revert optimistic update on error
        const currentState = get();
        const originalNote = currentState.notes.find(n => n.id === id);
        if (originalNote) {
          state.updateNoteLocal(id, originalNote);
        }
      }
      set({ saveTimeout: null });
    }, 500);
    
    set({ saveTimeout: timeout });
  },

  // Clear save timeout
  clearSaveTimeout: () => {
    const state = get();
    if (state.saveTimeout) {
      clearTimeout(state.saveTimeout);
      set({ saveTimeout: null });
    }
  },
}));
