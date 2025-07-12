import React from 'react';

interface DeleteConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => void;
  selectedCount: number;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, onCancel, onDelete, selectedCount }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Delete Challan{selectedCount > 1 ? 's' : ''}?</h2>
        <p className="mb-6">Are you sure you want to delete {selectedCount} selected challan{selectedCount > 1 ? 's' : ''}?</p>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-zinc-200 rounded hover:bg-zinc-300" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 