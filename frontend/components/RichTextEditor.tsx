'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Link, Code, Quote, Undo, Redo, AlignLeft, AlignCenter,
  AlignRight, Image, FileText, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2,
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    { id: 'bold', icon: Bold, command: 'bold', label: 'Bold', shortcut: 'Ctrl+B' },
    { id: 'italic', icon: Italic, command: 'italic', label: 'Italic', shortcut: 'Ctrl+I' },
    { id: 'underline', icon: Underline, command: 'underline', label: 'Underline', shortcut: 'Ctrl+U' },
    { id: 'strikethrough', icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
    { id: 'hr', icon: Minus, command: 'insertHorizontalRule', label: 'Horizontal Rule' },
    { id: 'h1', icon: Heading1, command: 'formatBlock', value: '<h1>', label: 'Heading 1' },
    { id: 'h2', icon: Heading2, command: 'formatBlock', value: '<h2>', label: 'Heading 2' },
    { id: 'h3', icon: Heading3, command: 'formatBlock', value: '<h3>', label: 'Heading 3' },
    { id: 'ul', icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
    { id: 'ol', icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
    { id: 'quote', icon: Quote, command: 'formatBlock', value: '<blockquote>', label: 'Quote' },
    { id: 'code', icon: Code, command: 'formatBlock', value: '<pre>', label: 'Code Block' },
    { id: 'link', icon: Link, command: 'link', label: 'Link', onClick: insertLink },
    { id: 'image', icon: Image, command: 'image', label: 'Image', onClick: insertImage },
    { id: 'align-left', icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
    { id: 'align-center', icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
    { id: 'align-right', icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
    { id: 'undo', icon: Undo, command: 'undo', label: 'Undo' },
    { id: 'redo', icon: Redo, command: 'redo', label: 'Redo' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Floating Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-50 glass-dark rounded-xl p-2 shadow-2xl border border-mauve/20"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center gap-1">
              {toolbarButtons.slice(0, 8).map((btn) => {
                const Icon = btn.icon;
                return (
                  <motion.button
                    key={btn.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => btn.onClick ? btn.onClick() : execCommand(btn.command, btn.value || null)}
                    className="p-2 hover:bg-mauve/10 rounded-lg transition-colors"
                    title={btn.label}
                  >
                    <Icon className="w-4 h-4 text-mauve" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toolbar */}
      <div className="mb-4 p-3 glass-light rounded-xl border border-mauve/20 flex items-center gap-2 flex-wrap">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <motion.button
              key={btn.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => btn.onClick ? btn.onClick() : execCommand(btn.command, btn.value || null)}
              className="p-2 hover:bg-mauve/10 rounded-lg transition-colors group relative"
              title={btn.label + (btn.shortcut ? ` (${btn.shortcut})` : '')}
            >
              <Icon className="w-4 h-4 text-mauve/70 group-hover:text-mauve" />
            </motion.button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        className="min-h-[600px] p-6 text-lg text-mauve/90 bg-transparent rounded-xl border border-mauve/10 focus:border-mauve/30 focus:outline-none transition-all leading-relaxed prose prose-invert prose-purple max-w-none
          [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-mauve
          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-mauve
          [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-mauve
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
          [&_li]:mb-2
          [&_blockquote]:border-l-4 [&_blockquote]:border-mauve/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-mauve/70
          [&_pre]:bg-nightfall-dark [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
          [&_code]:bg-nightfall-dark [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm
          [&_a]:text-mauve-magic [&_a]:underline [&_a]:hover:text-mauve
          [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
          [&_hr]:border-mauve/20 [&_hr]:my-6"
        style={{
          outline: 'none',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}

