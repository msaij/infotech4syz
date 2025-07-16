// DeliveryChallanToolbar.tsx
// Toolbar for delivery challan table. Contains search, filters, add, and download actions.

import React from 'react';
import DeliveryChallanFilters from './DeliveryChallanFilters';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  client: string;
  invoiceSubmission: 'all' | 'submitted' | 'not-submitted';
  invoiceDateFrom: string;
  invoiceDateTo: string;
  podDateFrom: string;
  podDateTo: string;
}

interface DeliveryChallanToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  showAddRow: boolean;
  setShowAddRow: (show: boolean) => void;
  selected: string[];
  setEditModal: (val: any) => void;
  setDeleteConfirm: (val: boolean) => void;
  setDownloadOpen: (val: any) => void;
  downloadOpen: boolean;
  handleDownload: (type: 'all' | 'selected' | 'filtered') => void;
  downloadRef: React.RefObject<HTMLDivElement | null>;
  // New filter props
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  clients: string[];
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
}

// Main toolbar component
const DeliveryChallanToolbar: React.FC<DeliveryChallanToolbarProps> = ({
  search, setSearch, selected, setEditModal, setDeleteConfirm, setDownloadOpen, downloadOpen, handleDownload, downloadRef,
  filters, setFilters, clients, filtersOpen, setFiltersOpen
}) => {
  return (
    // Toolbar container with responsive layout
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2 mb-6">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search challans..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-3 h-10 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white text-sm w-full sm:w-56"
        style={{ minWidth: 0 }}
      />
      
      {/* Filters component */}
      <DeliveryChallanFilters
        filters={filters}
        setFilters={setFilters}
        clients={clients}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
      />
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Add Challan button */}
        <button
          className="bg-blue-600 text-white px-4 h-10 rounded-lg font-semibold hover:bg-blue-700 transition text-sm shadow flex items-center"
          onClick={() => setEditModal({ open: true, row: null })}
        >
          + Add Challan
        </button>
        {/* Delete Selected button */}
        {selected.length > 0 && (
          <button
            className="bg-red-600 text-white px-4 h-10 rounded-lg font-semibold hover:bg-red-700 transition text-sm shadow flex items-center gap-1"
            onClick={() => setDeleteConfirm(true)}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Delete Selected ({selected.length})
          </button>
        )}
        {/* Download button and dropdown */}
        <div className="relative">
          <button
            className="bg-white border border-zinc-300 px-4 h-10 rounded-lg font-semibold text-zinc-800 hover:bg-zinc-100 transition text-sm flex items-center gap-1 min-w-[40px] justify-center"
            onClick={() => setDownloadOpen((open: boolean) => !open)}
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
          {downloadOpen && (
            <div ref={downloadRef} className="absolute right-0 top-12 z-50 bg-white border border-zinc-300 rounded-lg shadow-lg py-2 w-48 animate-fade-in">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800 text-sm" onClick={() => handleDownload('all')}>
                Download All
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800 text-sm" onClick={() => handleDownload('selected')} disabled={selected.length === 0}>
                Download Selected{selected.length > 0 ? ` (${selected.length})` : ""}
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800 text-sm" onClick={() => handleDownload('filtered')}>
                Download Filtered
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanToolbar; 