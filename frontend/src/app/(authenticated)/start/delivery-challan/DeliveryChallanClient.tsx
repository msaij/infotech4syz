"use client";
import React, { useEffect, useState, useRef } from "react";

// Type definition for the delivery challan table data
interface ChallanTableData {
  columns: string[];
  data: Record<string, any>[];
}

export default function DeliveryChallanClient() {
  // State for live SSE data, search filter, context menu, edit modal, and menu dropdown
  const [sseData, setSseData] = useState<ChallanTableData>({ columns: [], data: [] });
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: Record<string, any> | null } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; row: Record<string, any> | null }>({ open: false, row: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Subscribe to FastAPI SSE for live delivery challan updates
  useEffect(() => {
    const evtSource = new EventSource("http://localhost:8001/sse/delivery-challan");
    evtSource.onmessage = (event) => {
      try {
        setSseData(JSON.parse(event.data));
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
    };
    if (contextMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenu]);

  // Close the menu dropdown on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Filter table rows based on search input
  const filteredRows = sseData.data.filter((row) =>
    sseData.columns.some((col) =>
      String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  // Show context menu on right-click of a row
  const handleContextMenu = (e: React.MouseEvent, row: Record<string, any>) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, row });
  };

  // Copy row data to clipboard in a readable format
  const handleCopyRow = async (row: Record<string, any>) => {
    const { challan_number, date, customer_name, items } = row;
    const formatted = `Challan Number: ${challan_number}\nDate: ${date}\nCustomer Name: ${customer_name}\nItems: ${items}`;
    try {
      await navigator.clipboard.writeText(formatted);
    } catch {
      // fallback or error
    }
    setContextMenu(null);
  };

  // Open edit modal for a row
  const handleEditRow = (row: Record<string, any>) => {
    setEditModal({ open: true, row });
    setContextMenu(null);
  };

  // Close edit modal
  const closeEditModal = () => setEditModal({ open: false, row: null });

  // Render the UI: search, menu, table, context menu, and edit modal
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-8" id="delivery-challan-root">
      {/* Search and menu bar aligned right */}
      <div className="my-2 w-full flex justify-start" id="search-menu-bar-row">
        <div className="flex items-center max-w-sm relative" id="search-menu-bar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
            id="search-input"
          />
          <div className="ml-2 flex-shrink-0 flex items-center h-full relative">
            <button
              type="button"
              className="focus:outline-none flex items-center h-full"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open menu"
              style={{ minWidth: 0 }}
            >
              <span className="material-symbols-outlined text-2xl text-zinc-500 align-middle">more_vert</span>
            </button>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 top-10 z-50 bg-white border border-zinc-300 rounded-md shadow-lg py-1 w-40 animate-fade-in" id="bulk-menu">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800"
                  onClick={() => { setMenuOpen(false); /* TODO: Implement bulk edit */ }}
                >
                  Bulk Edit
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800"
                  onClick={() => { setMenuOpen(false); /* TODO: Implement select options */ }}
                >
                  Select Options
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Table of delivery challans */}
      <div className="my-8 w-full overflow-x-auto rounded-xl shadow-lg" id="challan-table-wrapper">
        <table className="min-w-full border border-zinc-200 bg-white text-zinc-800 rounded-xl overflow-hidden" id="challan-table">
          <thead className="bg-zinc-100">
            <tr>
              {sseData.columns.map((col) => (
                <th key={col} className="px-5 py-3 border-b text-left font-bold uppercase tracking-wider text-sm">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-blue-50 transition cursor-pointer group relative"
                onContextMenu={(e) => handleContextMenu(e, row)}
                data-row-index={idx}
              >
                {sseData.columns.map((col) => (
                  <td key={col} className="px-5 py-3 border-b group-hover:bg-blue-50 transition-all">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Context Menu for row actions */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-50 bg-white border border-zinc-300 rounded-md shadow-lg py-1 w-40 animate-fade-in"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            id="row-context-menu"
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800"
              onClick={() => handleEditRow(contextMenu.row!)}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-blue-100 text-zinc-800"
              onClick={() => handleCopyRow(contextMenu.row!)}
            >
              Copy Row
            </button>
          </div>
        )}
        {/* Edit Modal for row editing */}
        {editModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" id="edit-modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full relative" id="edit-modal">
              <h2 className="text-xl font-bold mb-4">Edit Row</h2>
              <pre className="bg-zinc-100 rounded p-4 text-sm overflow-x-auto mb-4">{JSON.stringify(editModal.row, null, 2)}</pre>
              <button
                className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-700 text-2xl font-bold"
                onClick={closeEditModal}
                aria-label="Close"
              >
                ×
              </button>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={closeEditModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
