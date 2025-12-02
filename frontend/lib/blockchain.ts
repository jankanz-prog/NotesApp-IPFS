import { Blaze, Blockfrost, Core, WebWallet } from '@blaze-cardano/sdk';

// Blockfrost provider for Preview network
const getProvider = () => {
  const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_BLOCKFROST_PROJECT_ID is not set');
  }
  return new Blockfrost({
    network: 'cardano-preview',
    projectId,
  });
};

// Unique label for NotesApp metadata (avoid reserved labels)
const NOTES_APP_LABEL = 42819n;

// Helper function: Format content with chunking for 64-byte limit
const formatContent = (content: string): Core.Metadatum => {
  if (content.length <= 64) {
    return Core.Metadatum.newText(content);
  }
  
  // Split into 64-character chunks
  const chunks = content.match(/.{1,64}/g) || [];
  const list = new Core.MetadatumList();
  
  chunks.forEach(chunk => {
    list.add(Core.Metadatum.newText(chunk));
  });
  
  return Core.Metadatum.newList(list);
};

export type NoteAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface NoteMetadata {
  noteId: string;
  title: string;
  content: string;
  action: NoteAction;
  folderId?: string | null;
}

interface TransactionResult {
  txHash: string;
  success: boolean;
  error?: string;
}

/**
 * Send a transaction with note metadata to the Cardano blockchain
 */
export const sendNoteTransaction = async (
  walletApi: any,
  noteMetadata: NoteMetadata
): Promise<TransactionResult> => {
  try {
    const provider = getProvider();
    const wallet = new WebWallet(walletApi);
    const blaze = await Blaze.from(provider, wallet);

    // Get wallet address for self-payment (minimum ADA)
    const walletAddressHex = await walletApi.getChangeAddress();
    const walletAddress = Core.Address.fromBytes(
      Core.HexBlob(walletAddressHex)
    ).toBech32();

    // Build transaction with minimum ADA payment to self
    // This is required because Cardano transactions must have outputs
    const tx = blaze
      .newTransaction()
      .payLovelace(
        Core.Address.fromBech32(walletAddress),
        2_000_000n // 2 ADA minimum for self-payment
      );

    // --- METADATA CONSTRUCTION ---
    const metadata = new Map<bigint, Core.Metadatum>();
    const metadatumMap = new Core.MetadatumMap();

    // Insert action (CREATE, UPDATE, DELETE)
    metadatumMap.insert(
      Core.Metadatum.newText('action'),
      Core.Metadatum.newText(noteMetadata.action)
    );

    // Insert note_id
    metadatumMap.insert(
      Core.Metadatum.newText('note_id'),
      Core.Metadatum.newText(noteMetadata.noteId)
    );

    // Insert title (with chunking if needed)
    metadatumMap.insert(
      Core.Metadatum.newText('title'),
      formatContent(noteMetadata.title)
    );

    // Insert content (with chunking if needed)
    metadatumMap.insert(
      Core.Metadatum.newText('content'),
      formatContent(noteMetadata.content)
    );

    // Insert folder_id if present
    if (noteMetadata.folderId) {
      metadatumMap.insert(
        Core.Metadatum.newText('folder_id'),
        Core.Metadatum.newText(noteMetadata.folderId)
      );
    }

    // Insert timestamp
    metadatumMap.insert(
      Core.Metadatum.newText('created_at'),
      Core.Metadatum.newText(new Date().toISOString())
    );

    // Wrap and set metadata
    const metadatum = Core.Metadatum.newMap(metadatumMap);
    metadata.set(NOTES_APP_LABEL, metadatum);
    const finalMetadata = new Core.Metadata(metadata);
    tx.setMetadata(finalMetadata);

    // Complete, sign, and submit
    const completedTx = await tx.complete();
    console.log('Transaction built:', completedTx.toCbor());

    const signedTx = await blaze.signTransaction(completedTx);
    console.log('Transaction signed');

    const txHash = await blaze.provider.postTransactionToChain(signedTx);
    console.log('Transaction submitted. Hash:', txHash);

    return {
      txHash,
      success: true,
    };
  } catch (error: any) {
    console.error('Transaction error:', error);
    return {
      txHash: '',
      success: false,
      error: error.message || 'Transaction failed',
    };
  }
};

/**
 * Check if a transaction has been confirmed on-chain
 */
export const checkTransactionStatus = async (txHash: string): Promise<'pending' | 'confirmed' | 'not_found'> => {
  try {
    const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_BLOCKFROST_PROJECT_ID is not set');
    }

    const response = await fetch(
      `https://cardano-preview.blockfrost.io/api/v0/txs/${txHash}`,
      {
        headers: {
          'project_id': projectId,
        },
      }
    );

    if (response.status === 200) {
      return 'confirmed';
    } else if (response.status === 404) {
      return 'pending';
    } else {
      return 'not_found';
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return 'not_found';
  }
};
