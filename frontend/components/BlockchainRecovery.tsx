'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { 
  recoverNotesFromBlockchain, 
  getLatestNoteStates, 
  convertToApiFormat 
} from '@/lib/blockchainRecovery';
import { Download, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface RecoveredNote {
  txHash: string;
  action: string;
  noteId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface BlockchainRecoveryProps {
  onRecoveryComplete?: () => void;
}

export default function BlockchainRecovery({ onRecoveryComplete }: BlockchainRecoveryProps) {
  const { isConnected, walletAddressBech32 } = useWalletStore();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredNotes, setRecoveredNotes] = useState<RecoveredNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRecover = async () => {
    if (!walletAddressBech32) {
      setError('Please connect your wallet first');
      return;
    }

    setIsRecovering(true);
    setError(null);
    setRecoveredNotes([]);
    setImportResults(null);

    try {
      // Fetch all notes from blockchain
      const allNotes = await recoverNotesFromBlockchain(walletAddressBech32);
      
      // Get latest state (handle updates/deletes)
      const latestStates = getLatestNoteStates(allNotes);
      
      // Convert to array
      const notesToShow = Array.from(latestStates.values());
      
      setRecoveredNotes(notesToShow);
      
      // Select all by default
      setSelectedNotes(new Set(notesToShow.map(n => n.noteId)));
      
      if (notesToShow.length === 0) {
        setError('No notes found on the blockchain for this wallet');
      }
    } catch (err: any) {
      console.error('Recovery failed:', err);
      setError(err.message || 'Failed to recover notes from blockchain');
    } finally {
      setIsRecovering(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNotes.size === recoveredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(recoveredNotes.map(n => n.noteId)));
    }
  };

  const handleImport = async () => {
    if (selectedNotes.size === 0) return;

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to import notes');
      setIsImporting(false);
      return;
    }

    for (const noteId of selectedNotes) {
      const note = recoveredNotes.find(n => n.noteId === noteId);
      if (!note) continue;

      try {
        const apiData = convertToApiFormat(note as any);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...apiData,
              forceCreate: true, // Skip duplicate warnings
            }),
          }
        );

        if (response.ok || response.status === 201) {
          success++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Failed to import note ${noteId}:`, err);
        failed++;
      }
    }

    setImportResults({ success, failed });
    setIsImporting(false);
    
    if (success > 0 && onRecoveryComplete) {
      onRecoveryComplete();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setRecoveredNotes([]);
    setSelectedNotes(new Set());
    setImportResults(null);
    setError(null);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
        title="Recover notes from blockchain"
      >
        <Download className="w-4 h-4" />
        Recover from Chain
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recover Notes from Blockchain</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Restore notes that were saved on-chain but lost from your database
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* Import Results */}
              {importResults && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Imported {importResults.success} note(s) successfully
                  {importResults.failed > 0 && ` (${importResults.failed} failed)`}
                </div>
              )}

              {/* Scan Button */}
              {recoveredNotes.length === 0 && !isRecovering && (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Scan the blockchain to find notes associated with your wallet
                  </p>
                  <button
                    onClick={handleRecover}
                    disabled={isRecovering}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Scan Blockchain
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isRecovering && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Scanning blockchain for your notes...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                </div>
              )}

              {/* Recovered Notes List */}
              {recoveredNotes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Found {recoveredNotes.length} note(s) on chain
                    </span>
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedNotes.size === recoveredNotes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recoveredNotes.map((note) => (
                      <label
                        key={note.noteId}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          selectedNotes.has(note.noteId)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNotes.has(note.noteId)}
                          onChange={() => toggleNoteSelection(note.noteId)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {note.title || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {note.content.slice(0, 100) || 'No content'}
                            {note.content.length > 100 && '...'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            TX: {note.txHash.slice(0, 16)}... | {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {recoveredNotes.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={handleRecover}
                  disabled={isRecovering}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Rescan
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting || selectedNotes.size === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Import {selectedNotes.size} Note(s)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
