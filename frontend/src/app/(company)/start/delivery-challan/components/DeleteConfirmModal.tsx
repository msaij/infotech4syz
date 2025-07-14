import React from 'react';

interface DeleteConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => void;
  selectedCount: number;
  isLoading?: boolean;
  itemsToDelete?: Array<{
    id: string;
    challan_number: string;
    customer: string;
    date: string;
  }>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, onCancel, onDelete, selectedCount, isLoading = false, itemsToDelete = [] }) => {
  if (!open) return null;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Delete Challan{selectedCount > 1 ? 's' : ''}?</h2>
        <p className="mb-4 text-zinc-600">Are you sure you want to delete {selectedCount} selected challan{selectedCount > 1 ? 's' : ''}?</p>
        
        {/* Summary statistics */}
        {itemsToDelete && itemsToDelete.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">Summary:</div>
              <div>• Total items: {itemsToDelete.length}</div>
              <div>• Unique customers: {new Set(itemsToDelete.map(item => item.customer)).size}</div>
              {itemsToDelete.length > 1 && (
                <div>• Multiple items selected for deletion</div>
              )}
            </div>
          </div>
        )}
        
        {/* Show items to be deleted */}
        {itemsToDelete && itemsToDelete.length > 0 ? (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-zinc-700 mb-2">Items to be deleted:</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded p-3 bg-zinc-50">
              {itemsToDelete.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-zinc-800">{item.challan_number}</div>
                    <div className="text-zinc-600">{item.customer}</div>
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {formatDate(item.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="p-3 border border-yellow-200 rounded bg-yellow-50 text-yellow-800 text-sm">
              <span className="font-medium">Note:</span> No specific items are shown. This may happen if the data has been updated since selection.
            </div>
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-zinc-200 rounded hover:bg-zinc-300" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed" onClick={onDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 