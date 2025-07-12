import React from 'react';

// DeliveryChallanTable.tsx
// Table component for displaying delivery challan data with selection, context menu, and status badges.

interface DeliveryChallanTableProps {
  filteredRows: Record<string, any>[];
  selected: string[];
  toggleSelectRow: (id: string) => void;
  onEdit: (row: Record<string, any>) => void;
  onDelete: (row: Record<string, any>) => void;
  handleContextMenu: (e: React.MouseEvent, row: Record<string, any>) => void;
  contextMenuRowId?: string;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleSelectAll: () => void;
}

// Main table component
const DeliveryChallanTable: React.FC<DeliveryChallanTableProps> = ({ filteredRows, selected, toggleSelectRow, onEdit, onDelete, handleContextMenu, contextMenuRowId, isAllSelected, isIndeterminate, toggleSelectAll }) => {
  return (
    // Table container with responsive overflow and shadow
    <div className="my-4 w-full overflow-x-auto rounded-xl shadow-lg">
      <table className="min-w-full border border-zinc-200 bg-white text-zinc-800 rounded-xl overflow-hidden">
        <thead className="bg-zinc-100">
          <tr>
            {/* Select/unselect all checkbox in header */}
            <th className="pl-3 pr-2 py-2 border-b">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={toggleSelectAll}
                aria-label={isAllSelected ? "Unselect all" : "Select all"}
                className="align-middle"
              />
            </th>
            {/* Column headers for challan fields */}
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Challan No.</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Date</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Customer</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Description</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Delivery Executives</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Invoice No.</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Invoice Date</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Invoice Submission</th>
            <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">Acknowledgement</th>
            <th className="px-4 py-2 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {/* Render each row with selection, context menu, and status badges */}
          {filteredRows.map((row, idx) => (
            <tr
              key={row.id || idx}
              className={`hover:bg-blue-50 transition cursor-pointer group relative ${selected.includes(row.id) ? 'bg-blue-50' : ''} ${contextMenuRowId === row.id ? 'bg-blue-100' : ''}`}
              onContextMenu={e => handleContextMenu(e, row)}
            >
              {/* Row selection checkbox */}
              <td className="pl-3 pr-2 py-2 border-b">
                <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelectRow(row.id)} className="align-middle" />
              </td>
              {/* Challan fields */}
              <td className="px-4 py-2 border-b text-sm">{row.challan_number}</td>
              <td className="px-4 py-2 border-b text-sm">{row.date}</td>
              <td className="px-4 py-2 border-b text-sm">{row.customer}</td>
              <td className="px-4 py-2 border-b text-sm">{row.dc_summary}</td>
              <td className="px-4 py-2 border-b text-sm">{row.delivery_executives}</td>
              <td className="px-4 py-2 border-b text-sm">{row.invoice_number}</td>
              <td className="px-4 py-2 border-b text-sm">{row.invoice_date}</td>
              <td className="px-4 py-2 border-b text-sm">
                {row.invoice_submission ? (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700">Submitted</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Pending</span>
                )}
              </td>
              <td className="px-4 py-2 border-b text-sm">
                {row.proof_of_delivery ? (
                  <a href={row.proof_of_delivery} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ack File</a>
                ) : 'N/A'}
              </td>
              <td className="px-4 py-2 border-b"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryChallanTable; 