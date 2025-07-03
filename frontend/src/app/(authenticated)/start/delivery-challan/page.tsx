"use client";
import React, { useEffect, useState } from "react";

interface ChallanTableData {
  columns: string[];
  data: Record<string, any>[];
}

export default function DeliveryChallanPage() {
  const [sseData, setSseData] = useState<ChallanTableData>({ columns: [], data: [] });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const evtSource = new EventSource("http://localhost:8001/sse/delivery-challan");
    evtSource.onmessage = (event) => {
      try {
        setSseData(JSON.parse(event.data));
      } catch {}
    };
    return () => evtSource.close();
  }, []);

  // Filter rows based on search input (case-insensitive, matches any cell)
  const filteredRows = sseData.data.filter((row) =>
    sseData.columns.some((col) =>
      String(row[col] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-start p-8">
      <div className="my-2 w-full max-w-6xl">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 px-3 py-2 border border-zinc-300 rounded-md w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="my-8 w-full max-w-6xl">
        <table className="w-full border border-zinc-200 bg-white text-zinc-800 rounded-lg shadow-md">
          <thead className="bg-zinc-100">
            <tr>
              {sseData.columns.map((col) => (
                <th key={col} className="px-4 py-2 border-b text-left font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-zinc-100 transition">
                {sseData.columns.map((col) => (
                  <td key={col} className="px-4 py-2 border-b">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
