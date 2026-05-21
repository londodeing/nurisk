/**
 * ConflictDialog - Modal for resolving data conflicts
 */

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ConflictItem } from '@/lib/indexedDB';

interface ConflictDialogProps {
  open: boolean;
  conflict: ConflictItem | null;
  onResolveLocal: (conflictId: string) => Promise<void>;
  onResolveServer: (conflictId: string) => Promise<void>;
  onDismiss: () => void;
}

export function ConflictDialog({
  open,
  conflict,
  onResolveLocal,
  onResolveServer,
  onDismiss,
}: ConflictDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'server'>('local');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    if (!conflict) return;
    
    setIsResolving(true);
    try {
      if (selectedVersion === 'local') {
        await onResolveLocal(conflict.id);
      } else {
        await onResolveServer(conflict.id);
      }
    } finally {
      setIsResolving(false);
    }
  };

  if (!conflict) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onDismiss}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50 p-6">
          {/* Header */}
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
            Konflik Data Terdeteksi
          </Dialog.Title>
          
          <Dialog.Description className="text-sm text-gray-600 mb-4">
            Data yang Anda ubah berbeda dengan versi server. Pilih versi yang ingin digunakan.
          </Dialog.Description>

          {/* Entity info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Entitas</div>
            <div className="font-medium text-gray-900">
              {conflict.entity} #{conflict.entityId}
            </div>
          </div>

          {/* Version comparison */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="version"
                checked={selectedVersion === 'local'}
                onChange={() => setSelectedVersion('local')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Versi Lokal</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatJson(conflict.localVersion)}
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="version"
                checked={selectedVersion === 'server'}
                onChange={() => setSelectedVersion('server')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Versi Server</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatJson(conflict.serverVersion)}
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isResolving ? 'Menyelesaikan...' : 'Gunakan Versi Ini'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Format JSON for display
 */
function formatJson(data: unknown): string {
  if (data === undefined) return '(tidak ada data)';
  if (data === null) return '(null)';
  
  try {
    const str = JSON.stringify(data, null, 2);
    return str.length > 200 ? str.slice(0, 200) + '...' : str;
  } catch {
    return String(data);
  }
}

export default ConflictDialog;