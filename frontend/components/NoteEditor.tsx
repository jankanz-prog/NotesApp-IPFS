'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteStatus } from '@/store/notesStore';
import { 
  Star, Trash2, Maximize2, Minimize2, ChevronLeft, 
  Clock, CheckCircle, XCircle, Loader2, Link as LinkIcon,
  Save, Palette, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NoteEditorProps {
  note: Note;
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  onSyncToChain: (note: Note) => Promise<void>;
  isWalletConnected: boolean;
  isSaving?: boolean;
  isSyncing?: boolean;
  onNoteChange?: (note: Note) => void;
}

const COLORS = [
  '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#ef4444'
];

const StatusBadge = ({ status, txHash }: { status: NoteStatus; txHash?: string | null }) => {
  const badges = {
    PENDING: { icon: Clock, color: 'bg-mauve/20 text-mauve/70', label: 'Pending' },
    SUBMITTED: { icon: Loader2, color: 'bg-yellow-500/20 text-yellow-400', label: 'Submitted' },
    CONFIRMED: { icon: CheckCircle, color: 'bg-green-500/20 text-green-400', label: 'Confirmed' },
    FAILED: { icon: XCircle, color: 'bg-red-500/20 text-red-400', label: 'Failed' },
  };

  const badge = badges[status];
  const Icon = badge.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${badge.color}`}>
        <Icon className={`w-3.5 h-3.5 ${status === 'SUBMITTED' ? 'animate-spin' : ''}`} />
        {badge.label}
      </span>
      {txHash && status === 'CONFIRMED' && (
        <motion.a
          whileHover={{ scale: 1.05 }}
          href={`https://preview.cardanoscan.io/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-mauve-magic hover:text-mauve hover:underline font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          View TX
        </motion.a>
      )}
    </div>
  );
};

export default function NoteEditor({
  note,
  onBack,
  onUpdate,
  onDelete,
  onToggleFavorite,
  onSyncToChain,
  isWalletConnected,
  isSaving = false,
  isSyncing = false,
  onNoteChange,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color || '');
  const [importance, setImportance] = useState(note.importance);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || '');
    setImportance(note.importance);
  }, [note]);

  // Auto-save with debounce
  useEffect(() => {
    if ((!title && !content) || 
        (title === note.title && content === note.content && 
         color === (note.color || '') && importance === note.importance)) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      onUpdate(note.id, { title, content, color, importance });
      const updatedNote = { ...note, title, content, color, importance };
      if (onNoteChange) {
        onNoteChange(updatedNote);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, content, color, importance, note.id, note.title, note.content, note.color, note.importance, onUpdate, onNoteChange]);

  const handleSave = async () => {
    try {
      await onUpdate(note.id, { title, content, color, importance });
      const updatedNote = { ...note, title, content, color, importance };
      if (onNoteChange) {
        onNoteChange(updatedNote);
      }
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await onDelete(note.id);
        toast.success('Note deleted');
        onBack();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex flex-col h-full bg-nightfall-darkest ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Minimal Toolbar */}
      <div className="px-6 py-4 border-b border-mauve/10 glass-dark flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-mauve" />
          </motion.button>

          {/* Color Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
            >
              <Palette className="w-5 h-5 text-mauve" />
            </motion.button>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 p-4 glass-dark rounded-xl shadow-xl z-10 border border-mauve/20"
                >
                  <p className="text-xs font-semibold text-mauve/70 mb-3">Choose Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-md ${
                          color === c ? 'border-mauve scale-110 ring-2 ring-offset-2 ring-royal-violet' : 'border-mauve/30'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(note.id)}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
          >
            <Star
              className={`w-5 h-5 transition-all ${
                note.favorite || note.isFavorite
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-mauve/60'
              }`}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2.5 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge - Top Right */}
          <StatusBadge status={note.status} txHash={note.txHash} />
          
          {isSaving && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-mauve/60 flex items-center gap-1.5 font-medium"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </motion.span>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-royal-violet to-lavender-purple hover:from-lavender-purple hover:to-mauve-magic text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSyncToChain({ ...note, title, content, color, importance })}
            disabled={!isWalletConnected || isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg ${
              isWalletConnected
                ? 'bg-gradient-to-r from-lavender-purple to-mauve-magic hover:from-mauve-magic hover:to-mauve text-white'
                : 'bg-nightfall-dark text-mauve/40 cursor-not-allowed border border-mauve/20'
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Sync to Chain
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-mauve" />
            ) : (
              <Maximize2 className="w-5 h-5 text-mauve" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Distraction-Free Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-nightfall-darkest">
        <div className="max-w-4xl mx-auto">
          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-5xl font-bold border-none focus:outline-none bg-transparent mb-8 text-mauve placeholder-mauve/40"
            placeholder="Note title..."
          />
          <motion.textarea
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[600px] text-lg border-none focus:outline-none bg-transparent resize-none text-mauve placeholder-mauve/40 leading-relaxed"
            placeholder="Start writing..."
          />
        </div>
      </div>
    </motion.div>
  );
}
