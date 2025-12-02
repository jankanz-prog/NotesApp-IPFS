// Cardano blockchain utilities
// This file should ONLY be imported dynamically on the client side
// to avoid Node.js module issues with @blaze-cardano/sdk

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

// Unique label for NotesApp metadata (avoid reserved labels)
const NOTES_APP_LABEL = BigInt(42819);

/**
 * Convert wallet hex address to bech32 format
 * Must be called on client side only
 */
export const hexToBech32 = async (hexAddress: string): Promise<string> => {
  const { Core } = await import('@blaze-cardano/sdk');
  return Core.Address.fromBytes(Core.HexBlob(hexAddress)).toBech32();
};

/**
 * Send a transaction with note metadata to the Cardano blockchain
 * Must be called on client side only
 */
export const sendNoteTransaction = async (
  walletApi: any,
  noteMetadata: NoteMetadata
): Promise<TransactionResult> => {
  try {
    // Dynamic import to avoid SSR issues
    const { Blaze, Blockfrost, Core, WebWallet } = await import('@blaze-cardano/sdk');
    
    const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_BLOCKFROST_PROJECT_ID is not set');
    }

    const provider = new Blockfrost({
      network: 'cardano-preview',
      projectId,
    });

    const wallet = new WebWallet(walletApi);
    const blaze = await Blaze.from(provider, wallet);

    // Get wallet address for self-payment
    const walletAddressHex = await walletApi.getChangeAddress();
    const walletAddress = Core.Address.fromBytes(
      Core.HexBlob(walletAddressHex)
    ).toBech32();

    // Build transaction with minimum ADA payment to self
    const tx = blaze
      .newTransaction()
      .payLovelace(
        Core.Address.fromBech32(walletAddress),
        BigInt(2_000_000) // 2 ADA minimum
      );

    // --- METADATA CONSTRUCTION ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = new Map<bigint, any>();
    const metadatumMap = new Core.MetadatumMap();

    // Helper function for 64-byte chunking
    const formatContent = (content: string) => {
      if (content.length <= 64) {
        return Core.Metadatum.newText(content);
      }
      const chunks = content.match(/.{1,64}/g) || [];
      const list = new Core.MetadatumList();
      chunks.forEach(chunk => {
        list.add(Core.Metadatum.newText(chunk));
      });
      return Core.Metadatum.newList(list);
    };

    // Insert metadata fields
    metadatumMap.insert(
      Core.Metadatum.newText('action'),
      Core.Metadatum.newText(noteMetadata.action)
    );

    metadatumMap.insert(
      Core.Metadatum.newText('note_id'),
      Core.Metadatum.newText(noteMetadata.noteId)
    );

    metadatumMap.insert(
      Core.Metadatum.newText('title'),
      formatContent(noteMetadata.title)
    );

    metadatumMap.insert(
      Core.Metadatum.newText('content'),
      formatContent(noteMetadata.content)
    );

    if (noteMetadata.folderId) {
      metadatumMap.insert(
        Core.Metadatum.newText('folder_id'),
        Core.Metadatum.newText(noteMetadata.folderId)
      );
    }

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
export const checkTransactionStatus = async (
  txHash: string
): Promise<'pending' | 'confirmed' | 'not_found'> => {
  try {
    const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_BLOCKFROST_PROJECT_ID is not set');
    }

    const response = await fetch(
      `https://cardano-preview.blockfrost.io/api/v0/txs/${txHash}`,
      {
        headers: {
          project_id: projectId,
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
