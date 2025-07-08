"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";

// Type definition for the delivery challan table data
interface ChallanTableData {
  columns: string[];
  data: Record<string, any>[];
}

function exportToCSV(rows: Record<string, any>[], columns: string[], filename: string) {
  // Always include pod_entry_date if not present
  const cols = (columns || []).filter(col => col !== 'acknowledgement_copy');
  if (!cols.includes('pod_entry_date')) cols.push('pod_entry_date');
  const csvRows = [cols.join(",")];
  for (const row of rows) {
    csvRows.push(cols.map(col => {
      let val = row[col];
      if (col === 'date' && val) {
        try {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            val = `${day}-${month}-${year}`;
          }
        } catch (e) {}
      }
      if (col === 'pod_entry_date' && val) {
        try {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hour = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            val = `${day}-${month}-${year} ${hour}:${min}`;
          }
        } catch (e) {}
      }
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    }).join(","));
  }
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DeliveryChallanClient() {
  // State for live SSE data, search filter, context menu, edit modal, and menu dropdown
  const [sseData, setSseData] = useState<ChallanTableData>({ columns: [], data: [] });
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: Record<string, any> | null } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; row: Record<string, any> | null }>({ open: false, row: null });
  const [addModal, setAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to FastAPI SSE for live delivery challan updates
  useEffect(() => {
    const evtSource = new EventSource(`${process.env.NEXT_PUBLIC_FASTAPI_URL_local}/api/v1/sse/delivery-challan`);
    evtSource.onmessage = (event) => {
      try {
        setSseData(JSON.parse(event.data));
        setLoading(false);
      } catch {}
    };
    return () => evtSource.close();
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    };
    if (contextMenu || menuOpen || downloadOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenu, menuOpen, downloadOpen]);

  // Memoized derived data
  const filteredRows = useMemo(() => (
    (sseData.data || []).filter((row) =>
      (sseData.columns || []).some((col) =>
        String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )
  ), [sseData.data, sseData.columns, search]);

  const baseColumns = useMemo(() => (
    (sseData.columns || []).filter(col => col !== 'id' && col !== 'acknowledgement_copy' && col !== 'created_at' && col !== 'updated_at')
  ), [sseData.columns]);
  const endColumns = useMemo(() => (
    ['created_at', 'updated_at'].filter(col => (sseData.columns || []).includes(col))
  ), [sseData.columns]);
  const orderedColumns = useMemo(() => ([...baseColumns, ...endColumns]), [baseColumns, endColumns]);
  const allIds = useMemo(() => filteredRows.map(row => row.id), [filteredRows]);
  const isAllSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
  const isIndeterminate = selected.length > 0 && !isAllSelected;

  // Handlers
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) setSelected([]);
    else setSelected(allIds);
  }, [isAllSelected, allIds]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }, []);

  const handleDownload = useCallback((type: 'all' | 'selected' | 'filtered') => {
    let rows: Record<string, any>[] = [];
    if (type === 'all') rows = sseData.data;
    else if (type === 'selected') rows = (sseData.data || []).filter(row => selected.includes(row.id));
    else if (type === 'filtered') rows = filteredRows;
    exportToCSV(rows, (sseData.columns || []).filter(col => col !== 'id'), `challans_${type}.csv`);
    setDownloadOpen(false);
  }, [sseData.data, sseData.columns, selected, filteredRows]);

  // Add/Edit/Delete handlers (API integration needed)
  const handleAdd = useCallback((data: Record<string, any>) => {
    // TODO: Integrate with backend
    setAddModal(false);
  }, []);
  const handleEdit = useCallback((data: Record<string, any>) => {
    // TODO: Integrate with backend
    setEditModal({ open: false, row: null });
  }, []);
  const handleDelete = useCallback(() => {
    // TODO: Integrate with backend
    setDeleteConfirm(false);
    setSelected([]);
  }, []);

  // Show context menu on right-click of a row
  const handleContextMenu = useCallback((e: React.MouseEvent, row: Record<string, any>) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, row });
  }, []);

  // Copy row data to clipboard in a readable format
  const handleCopyRows = useCallback(async (rowArg?: Record<string, any>) => {
    const copyFields = [
      { key: 'challan_number', label: 'Challan Number' },
      { key: 'date', label: 'Date' },
      { key: 'customer', label: 'Customer Name' },
      { key: 'dc_summary', label: 'Description' },
    ];
    let rows: Record<string, any>[] = [];
    if (rowArg) {
      if (!selected.includes(rowArg.id) || selected.length === 1) {
        rows = [rowArg];
      } else {
        rows = (sseData.data || []).filter(row => selected.includes(row.id));
      }
    } else {
      rows = (sseData.data || []).filter(row => selected.includes(row.id));
    }
    if (!rows.length) return;
    let text = '';
    rows.forEach((row, idx) => {
      const block = copyFields.map(({ key, label }) => {
        let val = row[key];
        if (key === 'date' && val) {
          try {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              val = `${day}-${month}-${year}`;
            }
          } catch (e) {}
        }
        return `${label}: ${val ?? ''}`;
      }).join('\n');
      text += block;
      if (rows.length > 1 && idx < rows.length - 1) {
        text += '\n\n-\n\n';
      }
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, [sseData.data, selected]);

  // Open edit modal for a row
  const handleEditRow = (row: Record<string, any>) => {
    setEditModal({ open: true, row });
    setContextMenu(null);
  };

  // Close edit modal
  const closeEditModal = () => setEditModal({ open: false, row: null });

  // Render the UI: search, menu, table, context menu, and edit modal
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-8" id="delivery-challan-root">
      {/* Toolbar */}
      <div className="w-full flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search challans..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white text-base"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-zinc-800 transition text-sm flex items-center gap-1 min-w-[80px] justify-center" 
            onClick={() => setAddModal(true)}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="hidden sm:inline">Add</span>
          </button>
          <button 
            className="bg-white border border-zinc-300 px-4 py-2 rounded-lg font-semibold text-zinc-800 hover:bg-zinc-100 transition disabled:opacity-50 text-sm flex items-center gap-1 min-w-[80px] justify-center" 
            disabled={selected.length === 0} 
            onClick={() => setEditModal({ open: true, row: sseData.data.find(row => row.id === selected[0]) || null })}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            <span className="hidden sm:inline">Edit</span>
            {selected.length > 1 && <span className="sm:hidden">({selected.length})</span>}
          </button>
          <button 
            className="bg-white border border-zinc-300 px-4 py-2 rounded-lg font-semibold text-zinc-800 hover:bg-zinc-100 transition disabled:opacity-50 text-sm flex items-center gap-1 min-w-[80px] justify-center" 
            disabled={selected.length === 0} 
            onClick={() => setDeleteConfirm(true)}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span className="hidden sm:inline">Delete</span>
            {selected.length > 1 && <span className="sm:hidden">({selected.length})</span>}
          </button>
          
          {/* Download Dropdown */}
          <div className="relative">
            <button 
              className="bg-white border border-zinc-300 px-4 py-2 rounded-lg font-semibold text-zinc-800 hover:bg-zinc-100 transition text-sm flex items-center gap-1 min-w-[80px] justify-center" 
              onClick={() => setDownloadOpen(open => !open)}
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Download</span>
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

      {/* Mobile Card View */}
      <div className="w-full md:hidden space-y-4">
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
                  onChange={(e) => {
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
                onClick={(e) => {
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
                <span className="font-medium">
                  {row.date ? (() => {
                    try {
                      const date = new Date(row.date);
                      if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      }
                    } catch (e) {}
                    return row.date;
                  })() : 'N/A'}
                </span>
              </div>
              {row.invoice_number && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Invoice:</span>
                  <span className="font-medium">{row.invoice_number}</span>
                </div>
              )}
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

      {/* Desktop Table View */}
      <div className="hidden md:block my-4 w-full overflow-x-auto rounded-xl shadow-lg" id="challan-table-wrapper">
        <table className="min-w-full border border-zinc-200 bg-white text-zinc-800 rounded-xl overflow-hidden" id="challan-table">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-2 py-2 border-b">
                <input type="checkbox" checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={toggleSelectAll} />
              </th>
              {orderedColumns.map((col) => (
                <th key={col} className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">
                  {col === 'proof_of_delivery' ? 'Proof of Delivery' :
                   col === 'pod_upload_date' ? 'POD Upload Date' :
                   col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </th>
              ))}
              {/* Add POD Upload Date column if not present */}
              {!orderedColumns.includes('pod_upload_date') && (
                <th className="px-4 py-2 border-b text-left font-bold uppercase tracking-wider text-xs">POD Upload Date</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 10 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {/* Checkbox cell */}
                  <td className="px-2 py-2 border-b">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  {/* Dynamic columns */}
                  {(orderedColumns.length > 0
                    ? orderedColumns
                    : Array.from({ length: 6 })
                  ).map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-2 border-b">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                  {/* POD Upload Date cell if not present */}
                  {!orderedColumns.includes('pod_upload_date') && (
                    <td className="px-4 py-2 border-b">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              // Real data rows
              filteredRows.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`hover:bg-blue-50 transition cursor-pointer group relative ${selected.includes(row.id) ? 'bg-blue-50' : ''}`}
                onContextMenu={e => handleContextMenu(e, row)}
                data-row-index={idx}
              >
                <td className="px-2 py-2 border-b">
                  <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelectRow(row.id)} />
                </td>
                {orderedColumns.map((col) => {
                  let displayValue = row[col];
                  if (col === 'date' && row[col]) {
                    try {
                      const date = new Date(row[col]);
                      if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        displayValue = `${day}-${month}-${year}`;
                      }
                    } catch (e) {}
                  }
                  if (col === 'pod_upload_date' && row[col]) {
                    try {
                      const date = new Date(row[col]);
                      if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hour = String(date.getHours()).padStart(2, '0');
                        const min = String(date.getMinutes()).padStart(2, '0');
                        displayValue = `${day}-${month}-${year} ${hour}:${min}`;
                      }
                    } catch (e) {}
                  }
                  return (
                    <td key={col} className={`px-4 py-2 border-b group-hover:bg-blue-50 transition-all text-sm ${(col === 'date' || col === 'pod_upload_date') ? 'whitespace-nowrap' : 'truncate max-w-0'}`} title={String(row[col] || '')}>{displayValue}</td>
                  );
                })}
                {/* Add POD Upload Date cell if not present */}
                {!orderedColumns.includes('pod_upload_date') && (
                  <td className="px-4 py-2 border-b group-hover:bg-blue-50 transition-all text-sm">-</td>
                )}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Context Menu for row actions */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-zinc-300 rounded-lg shadow-lg py-2 w-48 animate-fade-in"
          style={{ 
            top: Math.min(contextMenu.y, window.innerHeight - 120), 
            left: Math.min(contextMenu.x, window.innerWidth - 200) 
          }}
          id="row-context-menu"
        >
          <button
            className="w-full text-left px-4 py-3 hover:bg-blue-100 text-zinc-800 flex items-center gap-2"
            onClick={() => handleEditRow(contextMenu.row!)}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-3 hover:bg-blue-100 text-zinc-800 flex items-center gap-2"
            onClick={() => { handleCopyRows(contextMenu.row!); setContextMenu(null); }}
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            {selected.length > 1 && contextMenu.row && selected.includes(contextMenu.row.id) ? 'Copy Rows' : 'Copy Row'}
          </button>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Challan</h2>
            {/* TODO: Replace with actual form fields for your columns */}
            <form onSubmit={e => { e.preventDefault(); handleAdd({}); }}>
              <div className="mb-4">(Form fields go here)</div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-700 text-2xl font-bold" 
                  onClick={() => setAddModal(false)} 
                  aria-label="Close"
                >
                  ×
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Challan</h2>
            {/* TODO: Replace with actual form fields for your columns, prefilled with editModal.row */}
            <form onSubmit={e => { e.preventDefault(); handleEdit(editModal.row || {}); }}>
              <div className="mb-4">(Form fields go here)</div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-700 text-2xl font-bold" 
                  onClick={closeEditModal} 
                  aria-label="Close"
                >
                  ×
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Challan{selected.length > 1 ? 's' : ''}?</h2>
            <p className="mb-6">Are you sure you want to delete {selected.length} selected challan{selected.length > 1 ? 's' : ''}?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-zinc-200 rounded hover:bg-zinc-300" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
