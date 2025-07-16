// DeliveryChallanClient.tsx
// Main client component for the Delivery Challan feature. 
// Handles table display, CRUD operations, context menu, and integration with Django REST API and FastAPI SSE.
// Includes comprehensive filtering system for challan data.

"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/app/components/access-providers/auth-context';

// Type definition for the delivery challan table data
interface ChallanTableData {
  columns: string[];
  data: Record<string, any>[];
}

// Filter state interface - defines all available filter options
interface FilterState {
  dateFrom: string;           // Start date for challan date range filter
  dateTo: string;             // End date for challan date range filter
  client: string;             // Client name filter (exact match)
  invoiceSubmission: 'all' | 'submitted' | 'not-submitted';  // Invoice submission status filter
  invoiceDateFrom: string;    // Start date for invoice date range filter
  invoiceDateTo: string;      // End date for invoice date range filter
  podDateFrom: string;        // Start date for POD upload date range filter
  podDateTo: string;          // End date for POD upload date range filter
}

// CSV export function for downloading challan data
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

// Import all delivery challan components
import DeliveryChallanToolbar from './DeliveryChallanToolbar';
import DeliveryChallanMobileList from './DeliveryChallanMobileList';
import DeliveryChallanTable from './DeliveryChallanTable';
import EditModal from './EditModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContextMenu from './ContextMenu';
import DeliveryChallanFilterSummary from './DeliveryChallanFilterSummary';
import DeliveryChallanFilterStatus from './DeliveryChallanFilterStatus';

export default function DeliveryChallanClient() {
  // Get authFetch from auth context
  const { authFetch } = useAuth();
  
  // --- State Management ---
  // Core data and UI state
  const [sseData, setSseData] = useState<ChallanTableData>({ columns: [], data: [] });
  const [search, setSearch] = useState("");  // Text search filter
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: Record<string, any> | null } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; row: Record<string, any> | null }>({ open: false, row: null });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);  // Selected row IDs
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);  // Filter dropdown state
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state - manages all filter criteria
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',             // Challan date range start
    dateTo: '',               // Challan date range end
    client: '',               // Client filter
    invoiceSubmission: 'all', // Invoice submission status (all/submitted/not-submitted)
    invoiceDateFrom: '',      // Invoice date range start
    invoiceDateTo: '',        // Invoice date range end
    podDateFrom: '',          // POD upload date range start
    podDateTo: ''             // POD upload date range end
  });

  const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';

  // --- SSE Subscription ---
  // Subscribe to FastAPI SSE for live delivery challan updates
  useEffect(() => {
    const evtSource = new EventSource(`${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001'}/api/v1/sse/delivery-challan`);
    evtSource.onmessage = (event) => {
      try {
        setSseData(JSON.parse(event.data));
        setLoading(false);
      } catch {}
    };
    return () => evtSource.close();
  }, []);

  // --- Outside Click Handlers ---
  // Close context menu, menu, download dropdown, and filters on outside click
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
      // Filters dropdown is handled within the DeliveryChallanFilters component
    };
    if (contextMenu || menuOpen || downloadOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenu, menuOpen, downloadOpen]);

  // --- Keyboard Shortcuts ---
  // Handle keyboard shortcuts for delete and other actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key for selected rows
      if (e.key === 'Delete' && selected.length > 0) {
        e.preventDefault();
        setDeleteConfirm(true);
      }
      // Escape key to close modals and dropdowns
      if (e.key === 'Escape') {
        if (editModal.open) {
          closeEditModal();
        }
        if (deleteConfirm) {
          setDeleteConfirm(false);
        }
        if (contextMenu) {
          setContextMenu(null);
        }
        if (filtersOpen) {
          setFiltersOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected, editModal.open, deleteConfirm, contextMenu, filtersOpen, setFiltersOpen]);

  // --- Table Data Derivation ---
  // Memoized derived data for filtered rows and column order
  // This is the core filtering logic that applies all filter criteria
  const filteredRows = useMemo(() => {
    let filtered = (sseData.data || []);
    
    // Apply text search filter across all columns
    if (search) {
      filtered = filtered.filter((row) =>
        (sseData.columns || []).some((col) =>
          String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    
    // Apply challan date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((row) => {
        if (!row.date) return false;
        try {
          const rowDate = new Date(row.date);
          const fromDate = new Date(filters.dateFrom);
          return !isNaN(rowDate.getTime()) && rowDate >= fromDate;
        } catch (e) {
          return false;
        }
      });
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter((row) => {
        if (!row.date) return false;
        try {
          const rowDate = new Date(row.date);
          const toDate = new Date(filters.dateTo);
          return !isNaN(rowDate.getTime()) && rowDate <= toDate;
        } catch (e) {
          return false;
        }
      });
    }
    
    // Apply client filter (exact match)
    if (filters.client) {
      filtered = filtered.filter((row) => 
        row.client_name === filters.client
      );
    }
    
    // Apply invoice submission filter
    // This filters by the boolean invoice_submission field from the database
    if (filters.invoiceSubmission !== 'all') {
      filtered = filtered.filter((row) => {
        // Handle boolean conversion properly - convert any truthy/falsy value to boolean
        const isSubmitted = Boolean(row.invoice_submission);
        return filters.invoiceSubmission === 'submitted' ? isSubmitted : !isSubmitted;
      });
    }
    
    // Apply invoice date range filter
    // This filters challans that have invoice dates within the specified range
    if (filters.invoiceDateFrom) {
      filtered = filtered.filter((row) => {
        if (!row.invoice_date) return false;  // Skip challans without invoice dates
        try {
          const rowDate = new Date(row.invoice_date);
          const fromDate = new Date(filters.invoiceDateFrom);
          return !isNaN(rowDate.getTime()) && rowDate >= fromDate;
        } catch (e) {
          return false;  // Skip invalid dates
        }
      });
    }
    
    if (filters.invoiceDateTo) {
      filtered = filtered.filter((row) => {
        if (!row.invoice_date) return false;  // Skip challans without invoice dates
        try {
          const rowDate = new Date(row.invoice_date);
          const toDate = new Date(filters.invoiceDateTo);
          return !isNaN(rowDate.getTime()) && rowDate <= toDate;
        } catch (e) {
          return false;  // Skip invalid dates
        }
      });
    }
    
    // Apply POD upload date range filter
    // This filters challans that have POD upload dates within the specified range
    if (filters.podDateFrom) {
      filtered = filtered.filter((row) => {
        if (!row.pod_upload_date) return false;  // Skip challans without POD upload dates
        try {
          const rowDate = new Date(row.pod_upload_date);
          const fromDate = new Date(filters.podDateFrom);
          return !isNaN(rowDate.getTime()) && rowDate >= fromDate;
        } catch (e) {
          return false;  // Skip invalid dates
        }
      });
    }
    
    if (filters.podDateTo) {
      filtered = filtered.filter((row) => {
        if (!row.pod_upload_date) return false;  // Skip challans without POD upload dates
        try {
          const rowDate = new Date(row.pod_upload_date);
          const toDate = new Date(filters.podDateTo);
          return !isNaN(rowDate.getTime()) && rowDate <= toDate;
        } catch (e) {
          return false;  // Skip invalid dates
        }
      });
    }
    
    return filtered;
  }, [sseData.data, sseData.columns, search, filters]);

  // Extract unique clients for filter dropdown
  // This creates a sorted list of all client names for the client filter
  const clients = useMemo(() => {
    const clientSet = new Set<string>();
    (sseData.data || []).forEach(row => {
      if (row.client_name) {
        clientSet.add(row.client_name);
      }
    });
    return Array.from(clientSet).sort();
  }, [sseData.data]);

  // Column ordering and selection logic
  const baseColumns = useMemo(() => (
    (sseData.columns || []).filter(col => col !== 'id' && col !== 'acknowledgement_copy' && col !== 'created_at' && col !== 'updated_at')
  ), [sseData.columns]);
  const endColumns = useMemo(() => (
    ['created_at', 'updated_at'].filter(col => (sseData.columns || []).includes(col))
  ), [sseData.columns]);
  const orderedColumns = useMemo(() => ([...baseColumns, ...endColumns]), [baseColumns, endColumns]);
  
  // Selection state management
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
  
  // Add new challan mutation
  const addChallanMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await authFetch(`${API_URL}/api/v1/company/delivery-challan/`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add challan');
      return res.json();
    },
  });

  // Edit existing challan mutation
  const editChallanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: FormData }) => {
      const res = await authFetch(`${API_URL}/api/v1/company/delivery-challan/${id}/`, {
        method: 'PATCH',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to update challan');
      return res.json();
    },
  });

  // Delete challan mutation
  const deleteChallanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${API_URL}/api/v1/company/delivery-challan/${id}/`, {
        method: 'DELETE',
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
  
  // Unified save handler for add/edit
  const handleSave = async (data: Record<string, any>) => {
    try {
      // Handle file upload properly
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'proof_of_delivery' && value instanceof FileList) {
            formData.append(key, value[0]);
          } else {
            formData.append(key, value);
          }
        }
      });

      if (editModal.row?.id) {
        // Editing existing challan
        await editChallanMutation.mutateAsync({ id: editModal.row.id, data: formData });
        alert('Challan updated successfully!');
      } else {
        // Adding new challan
        await addChallanMutation.mutateAsync(formData);
        alert('Challan added successfully!');
      }
      setEditModal({ open: false, row: null });
      // SSE will update the table
    } catch (e) {
      console.error('Error saving challan:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      alert(editModal.row?.id ? `Error updating challan: ${errorMessage}` : `Error adding challan: ${errorMessage}`);
    }
  };

  // Delete handler with batch support
  const handleDelete = async (ids?: string[]) => {
    const idsToDelete = ids ?? selected;
    if (idsToDelete.length === 0) return;
    
    setIsDeleting(true);
    try {
      const results = await Promise.allSettled(idsToDelete.map(async id => {
        try {
          await deleteChallanMutation.mutateAsync(id);
          return { id, success: true };
        } catch (e) {
          console.error(`Error deleting challan with id ${id}:`, e);
          return { id, success: false, error: e instanceof Error ? e.message : 'Unknown error' };
        }
      }));

      // Count successes and failures
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failed = results.length - successful;

      // Show appropriate message
      if (successful > 0 && failed === 0) {
        alert(`Successfully deleted ${successful} challan${successful > 1 ? 's' : ''}!`);
      } else if (successful > 0 && failed > 0) {
        alert(`Deleted ${successful} challan${successful > 1 ? 's' : ''}, but failed to delete ${failed} challan${failed > 1 ? 's' : ''}.`);
      } else {
        alert('Failed to delete any challans. Please try again.');
      }

      setDeleteConfirm(false);
      setSelected([]);
      // SSE will update the table
    } catch (e) {
      // This catch is for unexpected Promise.allSettled errors
      console.error('Unexpected error in handleDelete:', e);
      alert('Unexpected error deleting challan(s).');
    } finally {
      setIsDeleting(false);
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
      { key: 'client_name', label: 'Client Name' },
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

  // --- Render UI ---
  // Renders toolbar, table, context menu, modals, and mobile list
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-8" id="delivery-challan-root">
      {/* Main toolbar with search, filters, and action buttons */}
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
        filters={filters}
        setFilters={setFilters}
        clients={clients}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />
      
      {/* Filter summary showing active filters as removable chips */}
      <DeliveryChallanFilterSummary
        filters={filters}
        setFilters={setFilters}
      />
      
      {/* Filter status showing result count and active filter details */}
      <DeliveryChallanFilterStatus
        filters={filters}
        totalRows={sseData.data?.length || 0}
        filteredRows={filteredRows.length}
      />
      
      {/* Mobile list view for smaller screens */}
      <DeliveryChallanMobileList
        filteredRows={filteredRows}
        selected={selected}
        toggleSelectRow={toggleSelectRow}
        handleContextMenu={handleContextMenu}
        setEditModal={setEditModal}
      />
      
      {/* Desktop table view */}
      <div className="hidden md:block w-full">
        <DeliveryChallanTable
          filteredRows={filteredRows}
          selected={selected}
          toggleSelectRow={toggleSelectRow}
          onEdit={handleEditRow}
          handleContextMenu={handleContextMenu}
          contextMenuRowId={contextMenu?.row?.id}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          toggleSelectAll={toggleSelectAll}
        />
      </div>
      
      {/* Context menu for right-click actions */}
      <ContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        handleEditRow={handleEditRow}
        handleCopyRows={handleCopyRows}
        selected={selected}
        contextMenuRef={contextMenuRef}
      />
      
      {/* Edit/Add modal */}
      <EditModal
        open={editModal.open}
        row={editModal.row}
        onClose={closeEditModal}
        onSave={handleSave}
        isLoading={addChallanMutation.isPending || editChallanMutation.isPending}
      />
      
      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={deleteConfirm}
        onCancel={() => setDeleteConfirm(false)}
        onDelete={() => handleDelete()}
        selectedCount={selected.length}
        isLoading={isDeleting}
        itemsToDelete={sseData.data?.filter(row => selected.includes(row.id)).map(row => ({
          id: row.id,
          challan_number: row.challan_number,
          customer: row.client_name,
          date: row.date
        }))}
      />
    </div>
  );
}