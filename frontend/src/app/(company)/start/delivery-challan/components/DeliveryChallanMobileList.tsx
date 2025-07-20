import React from 'react';

interface DeliveryChallanMobileListProps {
  filteredRows: Record<string, any>[];
  selected: string[];
  toggleSelectRow: (id: string) => void;
  handleContextMenu: (e: React.MouseEvent, row: Record<string, any>) => void;
  setEditModal: (modal: { open: boolean; row: Record<string, any> | null }) => void;
}

const DeliveryChallanMobileList: React.FC<DeliveryChallanMobileListProps> = ({ filteredRows, selected, toggleSelectRow, handleContextMenu, setEditModal }) => {
  return (
    <div className="w-full md:hidden space-y-4 relative">
      {/* Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-blue-700 transition"
        onClick={() => setEditModal({ open: true, row: null })}
        aria-label="Add New Challan"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
      {/* Card List */}
      {filteredRows.map((row, idx) => (
        <div
          key={row.id || idx}
          className={`bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition ${
            selected.includes(row.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => toggleSelectRow(row.id)}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={e => {
                  e.stopPropagation();
                  toggleSelectRow(row.id);
                }}
                className="w-4 h-4"
              />
              <h3 className="font-semibold text-lg text-zinc-800">
                {row.challan_number || 'N/A'}
              </h3>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                handleContextMenu(e, row);
              }}
              className="p-2 hover:bg-zinc-100 rounded-full transition"
            >
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
          {/* Card Content */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Customer:</span>
              <span className="font-medium">{row.customer || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Date:</span>
              <span className="font-medium">{row.date || 'N/A'}</span>
            </div>
            {row.invoice_number && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Invoice:</span>
                <span className="font-medium">{row.invoice_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-600">Status:</span>
              <span className={`font-medium px-2 py-1 text-xs rounded ${
                row.invoice_submission 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {row.invoice_submission ? 'Submitted' : 'Pending'}
              </span>
            </div>
            {row.dc_summary && (
              <div className="pt-2 border-t border-zinc-100">
                <span className="text-zinc-600 block mb-1">Summary:</span>
                <span className="text-sm">{row.dc_summary}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryChallanMobileList; 