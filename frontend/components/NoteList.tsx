'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteStatus } from '@/store/notesStore';
import { Star, Clock, CheckCircle, XCircle, Loader2, Link as LinkIcon, BookOpen, Pin } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  searchQuery: string;
  onNoteSelect: (note: Note) => void;
  isLoading?: boolean;
}

const StatusBadge = memo(({ status }: { status: NoteStatus }) => {
  const badges = {
    PENDING: { icon: Clock, color: 'bg-mauve/20 text-mauve/70', label: 'Pending' },
    SUBMITTED: { icon: Loader2, color: 'bg-yellow-500/20 text-yellow-400', label: 'Submitted' },
    CONFIRMED: { icon: CheckCircle, color: 'bg-green-500/20 text-green-400', label: 'Confirmed' },
    FAILED: { icon: XCircle, color: 'bg-red-500/20 text-red-400', label: 'Failed' },
  };

  const badge = badges[status];
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
      <Icon className={`w-3 h-3 ${status === 'SUBMITTED' ? 'animate-spin' : ''}`} />
      {badge.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

const NoteCard = memo(({ 
  note, 
  isSelected, 
  onSelect 
}: { 
  note: Note; 
  isSelected: boolean; 
  onSelect: (note: Note) => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(note)}
      className={`w-full text-left p-4 rounded-2xl mb-3 transition-all border-2 ${
        isSelected
          ? 'bg-gradient-to-br from-royal-violet/40 to-lavender-purple/40 border-royal-violet shadow-lg shadow-royal-violet/30'
          : 'glass-light border-mauve/20 hover:border-mauve/40 hover:shadow-md'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: note.color || (isSelected ? '#7b2cbf' : 'rgba(224, 170, 255, 0.3)'),
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {(note as any).isPinned && (
            <Pin className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
          <h3 className={`font-bold text-sm truncate ${
            isSelected ? 'text-mauve' : 'text-mauve/90'
          }`}>
            {note.title || 'Untitled'}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {(note.favorite || note.isFavorite) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
          )}
        </div>
      </div>
      
      <p className={`text-xs line-clamp-2 mb-3 leading-relaxed ${
        isSelected ? 'text-mauve/80' : 'text-mauve/60'
      }`}>
        {note.content || 'No content'}
      </p>
      
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={note.status} />
        {note.txHash && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            href={`https://preview.cardanoscan.io/transaction/${note.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-mauve-magic hover:text-mauve hover:underline font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            View TX
          </motion.a>
        )}
        <span className={`text-xs ml-auto font-medium ${
          isSelected ? 'text-mauve/60' : 'text-mauve/50'
        }`}>
          {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.button>
  );
});

NoteCard.displayName = 'NoteCard';

export default function NoteList({
  notes,
  selectedNote,
  searchQuery,
  onNoteSelect,
  isLoading = false,
}: NoteListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-royal-violet border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full text-mauve/60 p-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-royal-violet/30 to-lavender-purple/30 flex items-center justify-center mb-4 shadow-lg border border-mauve/20"
        >
          <BookOpen className="w-10 h-10 text-mauve-magic" />
        </motion.div>
        <p className="text-base font-semibold mb-1 text-mauve/80">No notes found</p>
        <p className="text-sm text-mauve/60 text-center">
          {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 scrollbar-hide">
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
            >
              <NoteCard
                note={note}
                isSelected={selectedNote?.id === note.id}
                onSelect={onNoteSelect}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
