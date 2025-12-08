import { create } from 'zustand';
import api from '@/lib/api';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
  };
}

interface FoldersState {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFolders: () => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<Folder>;
  updateFolder: (id: string, name?: string, color?: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useFoldersStore = create<FoldersState>((set) => ({
  folders: [],
  isLoading: false,
  error: null,

  fetchFolders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/folders');
      set({ folders: response.data.folders, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch folders', 
        isLoading: false 
      });
    }
  },

  createFolder: async (name: string, color?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/folders', { name, color });
      const newFolder = response.data.folder;
      
      set((state) => ({ 
        folders: [newFolder, ...state.folders],
        isLoading: false 
      }));
      
      return newFolder;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create folder', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateFolder: async (id: string, name?: string, color?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/folders/${id}`, { name, color });
      const updatedFolder = response.data.folder;
      
      set((state) => ({
        folders: state.folders.map((folder) => 
          folder.id === id ? updatedFolder : folder
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update folder', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteFolder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/folders/${id}`);
      
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete folder', 
        isLoading: false 
      });
      throw error;
    }
  },
}));
