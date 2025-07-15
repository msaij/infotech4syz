// ContextMenu.tsx
// Right-click context menu for delivery challan table rows. Provides actions like copy, edit, and delete (single or multiple).

import React, { useEffect, useState } from 'react';

interface ContextMenuProps {
  contextMenu: { x: number; y: number; row: Record<string, any> | null } | null;
  setContextMenu: (val: { x: number; y: number; row: Record<string, any> | null } | null) => void;
  handleEditRow: (row: Record<string, any>) => void;
  handleCopyRows: (row: Record<string, any>) => void;
  selected: string[];
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ contextMenu, setContextMenu, handleEditRow, handleCopyRows, selected, contextMenuRef }) => {
  // State for menu position (avoids hydration errors)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (contextMenu) {
      // Only run on client
      setPosition({
        top: typeof window !== 'undefined' ? Math.min(contextMenu.y, window.innerHeight - 120) : contextMenu.y,
        left: typeof window !== 'undefined' ? Math.min(contextMenu.x, window.innerWidth - 200) : contextMenu.x,
      });
    }
  }, [contextMenu]);

  if (!contextMenu) return null;
  return (
    // Context menu container, positioned at cursor
    <div
      ref={contextMenuRef}
      className="fixed z-50 bg-white border border-zinc-300 rounded-lg shadow-lg py-2 w-48 animate-fade-in"
      style={position}
      id="row-context-menu"
    >
      {/* Edit action */}
      <button
        className="w-full text-left px-4 py-3 hover:bg-blue-100 text-zinc-800 flex items-center gap-2"
        onClick={() => handleEditRow(contextMenu.row!)}
      >
        <span className="material-symbols-outlined text-lg">edit</span>
        Edit
      </button>
      {/* Copy action (single or multiple) */}
      <button
        className="w-full text-left px-4 py-3 hover:bg-blue-100 text-zinc-800 flex items-center gap-2"
        onClick={() => { handleCopyRows(contextMenu.row!); setContextMenu(null); }}
      >
        <span className="material-symbols-outlined text-lg">content_copy</span>
        {selected.length > 1 && contextMenu.row && selected.includes(contextMenu.row.id) ? 'Copy Rows' : 'Copy Row'}
      </button>

    </div>
  );
};

export default ContextMenu; 