// DeliveryChallanClient.tsx
// Main client component for the Delivery Challan feature. Handles table display, CRUD operations, context menu, and integration with Django REST API and FastAPI SSE.

"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useMutation } from '@tanstack/react-query';

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

// At the top, import the new components (assume they are in the same directory for now):
import DeliveryChallanToolbar from './DeliveryChallanToolbar';
import DeliveryChallanMobileList from './DeliveryChallanMobileList';
import DeliveryChallanTable from './DeliveryChallanTable';
import EditModal from './EditModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContextMenu from './ContextMenu';

export default function DeliveryChallanClient() {
  // --- State Management ---
  // State for live SSE data, search filter, context menu, edit modal, and menu dropdown
  const [sseData, setSseData] = useState<ChallanTableData>({ columns: [], data: [] });
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: Record<string, any> | null } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; row: Record<string, any> | null }>({ open: false, row: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const res = await fetch(`${API_URL}/api/csrf/`, { credentials: "include" });
      const data = await res.json();
      setCsrfToken(data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  // --- SSE Subscription ---
  // Subscribe to FastAPI SSE for live delivery challan updates
  useEffect(() => {
    const evtSource = new EventSource(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/v1/sse/delivery-challan`);
    evtSource.onmessage = (event) => {
      try {
        setSseData(JSON.parse(event.data));
        setLoading(false);
      } catch {}
    };
    return () => evtSource.close();
  }, []);

  // --- Outside Click Handlers ---
  // Close context menu, menu, and download dropdown on outside click
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

  // --- Table Data Derivation ---
  // Memoized derived data for filtered rows and column order
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

  // --- Selection Handlers ---
  // Handlers for selecting/unselecting rows
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) setSelected([]);
    else setSelected(allIds);
  }, [isAllSelected, allIds]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }, []);

  // --- Download Handler ---
  // Handles CSV export for all/selected/filtered rows
  const handleDownload = useCallback((type: 'all' | 'selected' | 'filtered') => {
    let rows: Record<string, any>[] = [];
    if (type === 'all') rows = sseData.data;
    else if (type === 'selected') rows = (sseData.data || []).filter(row => selected.includes(row.id));
    else if (type === 'filtered') rows = filteredRows;
    exportToCSV(rows, (sseData.columns || []).filter(col => col !== 'id'), `challans_${type}.csv`);
    setDownloadOpen(false);
  }, [sseData.data, sseData.columns, selected, filteredRows]);

  // --- React Query Mutations for CRUD ---
  // Add, edit, and delete mutations using Django REST API
  const addChallanMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const res = await fetch(`${API_URL}/api/deliverychallan/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: { 'X-CSRFToken': csrfToken },
      });
      if (!res.ok) throw new Error('Failed to add challan');
      return res.json();
    },
  });

  const editChallanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Record<string, any> }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const res = await fetch(`${API_URL}/api/deliverychallan/${id}/`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
        headers: { 'X-CSRFToken': csrfToken },
      });
      if (!res.ok) throw new Error('Failed to update challan');
      return res.json();
    },
  });

  const deleteChallanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/deliverychallan/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrfToken },
      });
      if (!res.ok) {
        if (res.status === 404) {
          console.error(`DELETE 404: Challan with id ${id} not found.`);
          throw new Error('This challan no longer exists or was already deleted.');
        } else {
          console.error(`DELETE ERROR: Status ${res.status} for id ${id}`);
          throw new Error('Failed to delete challan');
        }
      }
      return id;
    },
  });

  // --- CRUD Handlers ---
  // Add, edit, and delete handlers for modal and context menu
  // Add handler
  const handleAdd = async (data: Record<string, any>) => {
    try {
      await addChallanMutation.mutateAsync(data);
      // SSE will update the table
    } catch (e) {
      alert('Error adding challan.');
    }
  };

  // Edit handler
  const handleEdit = async (data: Record<string, any>) => {
    if (!editModal.row?.id) return;
    try {
      await editChallanMutation.mutateAsync({ id: editModal.row.id, data });
    setEditModal({ open: false, row: null });
      // SSE will update the table
    } catch (e) {
      alert('Error updating challan.');
    }
  };

  // Delete handler
  const handleDelete = async (ids?: string[]) => {
    const idsToDelete = ids ?? selected;
    try {
      await Promise.all(idsToDelete.map(async id => {
        try {
          await deleteChallanMutation.mutateAsync(id);
        } catch (e) {
          console.error(`Error deleting challan with id ${id}:`, e);
          alert(e instanceof Error ? e.message : 'Error deleting challan(s).');
        }
      }));
    setDeleteConfirm(false);
    setSelected([]);
      // SSE will update the table
    } catch (e) {
      // This catch is for unexpected Promise.all errors
      console.error('Unexpected error in handleDelete:', e);
      alert('Unexpected error deleting challan(s).');
    }
  };

  // --- Context Menu Handlers ---
  // Right-click context menu logic for row actions
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

  // --- Modal Handlers ---
  // Open/close edit modal
  // Open edit modal for a row
  const handleEditRow = (row: Record<string, any>) => {
    setEditModal({ open: true, row });
    setContextMenu(null);
  };

  // Close edit modal
  const closeEditModal = () => setEditModal({ open: false, row: null });

  // Add this function:
  const handleDeleteRow = (row: Record<string, any>) => {
    handleDelete([row.id]);
  };

  // --- Render UI ---
  // Renders toolbar, table, context menu, modals, and mobile list
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-8" id="delivery-challan-root">
      <DeliveryChallanToolbar
        search={search}
        setSearch={setSearch}
        showAddRow={false}
        setShowAddRow={() => {}}
        selected={selected}
        setEditModal={setEditModal}
        setDeleteConfirm={setDeleteConfirm}
        setDownloadOpen={setDownloadOpen}
        downloadOpen={downloadOpen}
        handleDownload={handleDownload}
        downloadRef={downloadRef}
      />
      <DeliveryChallanMobileList
        filteredRows={filteredRows}
        selected={selected}
        toggleSelectRow={toggleSelectRow}
        handleContextMenu={handleContextMenu}
        showAddModal={false}
        setShowAddModal={() => {}}
        // ...other props as needed
      />
      <div className="hidden md:block w-full">
        <DeliveryChallanTable
          filteredRows={filteredRows}
          selected={selected}
          toggleSelectRow={toggleSelectRow}
          onEdit={handleEditRow}
          onDelete={handleDeleteRow}
          handleContextMenu={handleContextMenu}
          contextMenuRowId={contextMenu?.row?.id}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          toggleSelectAll={toggleSelectAll}
        />
      </div>
      <ContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        handleEditRow={handleEditRow}
        handleCopyRows={handleCopyRows}
        selected={selected}
        contextMenuRef={contextMenuRef}
        onDelete={handleDeleteRow}
      />
      <EditModal
        open={editModal.open}
        row={editModal.row}
        onClose={closeEditModal}
        onSave={handleEdit}
      />
      <DeleteConfirmModal
        open={deleteConfirm}
        onCancel={() => setDeleteConfirm(false)}
        onDelete={handleDelete}
        selectedCount={selected.length}
      />
    </div>
  );
}