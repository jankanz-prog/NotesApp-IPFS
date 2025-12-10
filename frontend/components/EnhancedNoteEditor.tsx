'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteStatus } from '@/store/notesStore';
import { 
  Star, Trash2, Maximize2, Minimize2, ChevronLeft, 
  Clock, CheckCircle, XCircle, Loader2, Link as LinkIcon,
  Save, Palette, Sparkles, Pin, PinOff, Tag as TagIcon,
  Download, Upload, FileText, Copy, Check, Hash,
  TrendingUp, Eye, Calendar, Clock as ClockIcon
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import toast from 'react-hot-toast';

interface EnhancedNoteEditorProps {
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
  onTogglePin?: (id: string) => Promise<void>;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const COLORS = [
  '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#ef4444'
];

const calculateWordCount = (text: string): number => {
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
};

const calculateReadingTime = (wordCount: number): number => {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};

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

export default function EnhancedNoteEditor({
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
  onTogglePin,
  tags = [],
  onTagsChange,
}: EnhancedNoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color || '');
  const [importance, setImportance] = useState(note.importance);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>(tags);
  const [copied, setCopied] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || '');
    setImportance(note.importance);
    setNoteTags(tags);
  }, [note, tags]);

  // Auto-save with debounce
  useEffect(() => {
    if ((!title && !content) || 
        (title === note.title && content === note.content && 
         color === (note.color || '') && importance === note.importance)) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const wordCount = calculateWordCount(content);
      const readingTime = calculateReadingTime(wordCount);
      onUpdate(note.id, { title, content, color, importance, wordCount, readingTime });
      const updatedNote = { ...note, title, content, color, importance, wordCount, readingTime };
      if (onNoteChange) {
        onNoteChange(updatedNote);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, content, color, importance, note.id, note.title, note.content, note.color, note.importance, onUpdate, onNoteChange]);

  const handleSave = async () => {
    try {
      const wordCount = calculateWordCount(content);
      const readingTime = calculateReadingTime(wordCount);
      await onUpdate(note.id, { title, content, color, importance, wordCount, readingTime });
      const updatedNote = { ...note, title, content, color, importance, wordCount, readingTime };
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

  const handleAddTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      const updatedTags = [...noteTags, newTag.trim()];
      setNoteTags(updatedTags);
      if (onTagsChange) {
        onTagsChange(updatedTags);
      }
      setNewTag('');
      setShowTagInput(false);
      toast.success('Tag added');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = noteTags.filter(tag => tag !== tagToRemove);
    setNoteTags(updatedTags);
    if (onTagsChange) {
      onTagsChange(updatedTags);
    }
    toast.success('Tag removed');
  };

  const handleExport = () => {
    const data = {
      title,
      content,
      tags: noteTags,
      color,
      importance,
      createdAt: note.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Export as Markdown
    const markdown = `# ${title}\n\n${content.replace(/<[^>]*>/g, '')}\n\n---\n\nTags: ${noteTags.join(', ')}\nCreated: ${new Date(note.createdAt).toLocaleString()}`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Note exported as Markdown');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/notes/${note.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex flex-col h-full bg-nightfall-darkest ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Enhanced Toolbar */}
      <div className="px-6 py-4 border-b border-mauve/10 glass-dark flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-mauve" />
          </motion.button>

          {/* Pin Button */}
          {onTogglePin && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTogglePin(note.id)}
              className={`p-2.5 hover:bg-mauve/10 rounded-xl transition-colors ${
                (note as any).isPinned ? 'text-yellow-400' : 'text-mauve/60'
              }`}
            >
              {(note as any).isPinned ? (
                <Pin className="w-5 h-5 fill-yellow-400" />
              ) : (
                <PinOff className="w-5 h-5" />
              )}
            </motion.button>
          )}

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

          {/* Favorite */}
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

          {/* Tags */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
            >
              <TagIcon className="w-5 h-5 text-mauve" />
            </motion.button>
            <AnimatePresence>
              {showTagInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 p-4 glass-dark rounded-xl shadow-xl z-10 border border-mauve/20 min-w-[250px]"
                >
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 bg-nightfall-dark border border-mauve/20 rounded-lg text-mauve text-sm focus:outline-none focus:ring-2 focus:ring-mauve/50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-royal-violet text-white rounded-lg text-sm font-semibold"
                    >
                      Add
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {noteTags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-royal-violet/30 text-mauve text-xs rounded-full"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleExport}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
            title="Export note"
          >
            <Download className="w-5 h-5 text-mauve" />
          </motion.button>

          {/* Copy Link */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyLink}
            className="p-2.5 hover:bg-mauve/10 rounded-xl transition-colors"
            title="Copy link"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-mauve" />
            )}
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2.5 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Statistics */}
          <div className="flex items-center gap-4 text-xs text-mauve/60">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Status Badge */}
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

          {/* Save */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-royal-violet to-lavender-purple hover:from-lavender-purple hover:to-mauve-magic text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>

          {/* Sync to Chain */}
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

          {/* Fullscreen */}
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

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-nightfall-darkest">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-5xl font-bold border-none focus:outline-none bg-transparent mb-6 text-mauve placeholder-mauve/40"
            placeholder="Note title..."
          />

          {/* Tags Display */}
          {noteTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {noteTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-royal-violet/20 text-mauve text-sm rounded-full border border-mauve/20"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing..."
            className="min-h-[600px]"
          />
        </div>
      </div>
    </motion.div>
  );
}

