import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Printer,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export interface DayBookRow {
  id: string | number;
  sl_no: number;
  date: string; // e.g. "1/7/2024"
  on: string; // e.g. "2/7/2024"
  from: string; // e.g. "SBC RWL STATION"
  to: string; // e.g. "FULL LOCAL\nKIA DROP"
  time: string; // e.g. "4:45AM"
  pax_phone: string; // e.g. "9884037975"
  passenger_name?: string;
  status?: string;
}

// Active trips helper: pending, today's ongoing, and future trips
// Excludes completed and cancelled trips, while preserving older trips that remain pending
export function isActiveTrip(status?: string | null): boolean {
  if (!status) return true;
  const s = status.trim().toLowerCase();
  return !["completed", "cancelled", "canceled", "done"].includes(s);
}

// Compact date formatting helper (e.g. "1/7/2024")
function formatCompactDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    // If it's already compact like 1/7/2024 or 01/07/2024
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parts[2];
        if (!isNaN(d) && !isNaN(m)) return `${d}/${m}/${y}`;
      }
      return dateStr;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch {}
  return dateStr || "";
}

// Compact time formatting helper (e.g. "4:45AM", "10:30AM")
function extractCompactTime(notes?: string | null, timeStr?: string | null): string {
  if (timeStr && timeStr.trim()) {
    return timeStr.trim();
  }
  if (notes) {
    const m = notes.match(/Time:\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AaPp][Mm])?)/i);
    if (m && m[1]) {
      const raw = m[1].trim();
      if (/am|pm/i.test(raw)) return raw.replace(/\s+/g, "").toUpperCase();
      const [hh, mm] = raw.split(":");
      let h = parseInt(hh, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${h}:${mm}${ampm}`;
    }
  }
  return "4:45AM";
}

export function DayBookReportsManager() {
  const [rows, setRows] = useState<DayBookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add / Edit Entry
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DayBookRow | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    on: "",
    from: "",
    to: "",
    time: "",
    pax_phone: "",
    passenger_name: "",
  });

  // Fetch live PostgreSQL day book entries (Only active trips: pending, ongoing, future)
  const fetchLiveEntries = async () => {
    setLoading(true);
    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";
      const headers: Record<string, string> = { "x-admin-key": adminKey };

      const res = await fetch("/api/business/day_book_entries?active=1&limit=500", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rows)) {
          // Strictly filter only active trips (pending, ongoing, future - excluding completed/cancelled)
          // Older trips remain visible if they are still pending
          const activeRecords = data.rows.filter((r: any) => isActiveTrip(r.status));

          const liveMapped: DayBookRow[] = activeRecords.map((r: any, idx: number) => ({
            id: r.id,
            sl_no: idx + 1,
            date: formatCompactDate(r.booking_date || r.created_at),
            on: formatCompactDate(r.travel_date || r.booking_date || r.created_at),
            from: (r.from_location || "SBC").toUpperCase(),
            to: (r.to_location || "LOCAL DROP").toUpperCase(),
            time: extractCompactTime(r.notes, r.pickup_time),
            pax_phone: r.passenger_phone || "—",
            passenger_name: r.passenger_name || "",
            status: r.status || "Pending",
          }));

          setRows(liveMapped);
          return;
        }
      }
      setRows([]);
    } catch (err) {
      console.warn("Failed to fetch day book entries:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEntries();
  }, []);

  // Mark Trip as Done -> Save status as 'Completed' in database and immediately remove from Day Book view
  // Financial amounts and booking records are strictly preserved without being modified
  const handleMarkTripDone = async (row: DayBookRow) => {
    if (savingId) return; // Prevent duplicate clicks
    setSavingId(row.id);

    try {
      const adminKey =
        sessionStorage.getItem("fortune_admin_key") ||
        localStorage.getItem("fortune_admin_key") ||
        "Admin@fortunetourism2026";

      // 1. Update status to 'Completed' in PostgreSQL
      const res = await fetch("/api/business/day_book_entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          id: row.id,
          status: "Completed",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Failed to complete trip (status ${res.status})`);
      }

      // 2. Immediately remove row from Day Book view and re-sequence SL NO
      setRows((prev) => {
        const remaining = prev.filter((r) => r.id !== row.id);
        return remaining.map((r, idx) => ({
          ...r,
          sl_no: idx + 1,
        }));
      });

      toast.success(`Trip #${row.sl_no} (${row.passenger_name || row.pax_phone}) marked as Completed!`);
    } catch (err: any) {
      console.error("Trip Done error:", err);
      toast.error(err.message || "Failed to mark trip as done. Please try again.");
      // Row remains visible if saving fails
    } finally {
      setSavingId(null);
    }
  };

  // Filter rows by search query while strictly enforcing active trips rule
  const filteredRows = useMemo(() => {
    const activeOnly = rows.filter((r) => isActiveTrip(r.status));
    if (!searchQuery.trim()) return activeOnly;
    const q = searchQuery.toLowerCase().trim();
    return activeOnly.filter((r) => {
      return (
        String(r.sl_no).includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.on.toLowerCase().includes(q) ||
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.time.toLowerCase().includes(q) ||
        r.pax_phone.toLowerCase().includes(q) ||
        (r.passenger_name && r.passenger_name.toLowerCase().includes(q))
      );
    });
  }, [rows, searchQuery]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingRow(null);
    const now = new Date();
    const today = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setFormData({
      date: today,
      on: today,
      from: "",
      to: "",
      time: "4:45AM",
      pax_phone: "",
      passenger_name: "",
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (row: DayBookRow) => {
    setEditingRow(row);
    setFormData({
      date: row.date,
      on: row.on,
      from: row.from,
      to: row.to,
      time: row.time,
      pax_phone: row.pax_phone,
      passenger_name: row.passenger_name || "",
    });
    setModalOpen(true);
  };

  // Delete Row
  const handleDeleteRow = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this Day Book row?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id).map((r, i) => ({ ...r, sl_no: i + 1 })));
    toast.success("Row deleted from Day Book");

    if (typeof id === "number") {
      try {
        await fetch(`/api/business/day_book_entries?id=${id}`, {
          method: "DELETE",
          headers: { "x-admin-key": "Admin@fortunetourism2026" },
        });
      } catch (err) {
        console.warn("Delete error:", err);
      }
    }
  };

  // Save Row (Add or Edit)
  const handleSaveRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to) {
      toast.error("Please enter FROM and TO locations.");
      return;
    }

    if (editingRow) {
      const updated: DayBookRow = {
        ...editingRow,
        date: formData.date,
        on: formData.on,
        from: formData.from.toUpperCase(),
        to: formData.to.toUpperCase(),
        time: formData.time.toUpperCase(),
        pax_phone: formData.pax_phone,
        passenger_name: formData.passenger_name,
      };
      setRows((prev) => prev.map((r) => (r.id === editingRow.id ? updated : r)));
      toast.success("Day Book entry updated!");

      if (typeof editingRow.id === "number") {
        try {
          await fetch("/api/business/day_book_entries", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": "Admin@fortunetourism2026",
            },
            body: JSON.stringify({
              id: editingRow.id,
              from_location: formData.from.toUpperCase(),
              to_location: formData.to.toUpperCase(),
              passenger_phone: formData.pax_phone,
              passenger_name: formData.passenger_name,
              notes: `Time: ${formData.time}`,
            }),
          });
        } catch (err) {
          console.warn("Update error:", err);
        }
      }
    } else {
      const newId = `DB-LOCAL-${Date.now()}`;
      const newRow: DayBookRow = {
        id: newId,
        sl_no: rows.length + 1,
        date: formData.date,
        on: formData.on,
        from: formData.from.toUpperCase(),
        to: formData.to.toUpperCase(),
        time: formData.time.toUpperCase(),
        pax_phone: formData.pax_phone,
        passenger_name: formData.passenger_name,
      };
      setRows((prev) => [...prev, newRow].map((r, i) => ({ ...r, sl_no: i + 1 })));
      toast.success("New Day Book entry saved!");

      try {
        await fetch("/api/business/day_book_entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "Admin@fortunetourism2026",
          },
          body: JSON.stringify({
            booking_date: new Date().toISOString(),
            travel_date: new Date().toISOString(),
            from_location: formData.from.toUpperCase(),
            to_location: formData.to.toUpperCase(),
            passenger_phone: formData.pax_phone,
            passenger_name: formData.passenger_name || "Customer",
            notes: `Time: ${formData.time}`,
            status: "Pending",
          }),
        });
      } catch (err) {
        console.warn("Insert error:", err);
      }
    }

    setModalOpen(false);
  };

  // Export to Excel CSV
  const handleExportCSV = () => {
    const headers = [
      "SL NO",
      "DATE",
      "ON",
      "FROM",
      "TO",
      "TIME",
      "Pax ph no",
    ];
    const csvRows = filteredRows.map((r) => [
      r.sl_no,
      `"${r.date}"`,
      `"${r.on}"`,
      `"${r.from.replace(/"/g, '""')}"`,
      `"${r.to.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${r.time}"`,
      `"${r.pax_phone}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Day_Book_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel Day Book exported successfully!");
  };

  // Print Table
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full py-4 px-2 sm:px-4">
      {/* Top Header & Actions Bar */}
      <div className="w-full max-w-5xl mx-auto mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Clearly Visible High-Contrast Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Day Book
        </h2>

        {/* Right: Search Filter & Action Group (Refresh Only) */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Search Filter */}
          <div className="relative flex-1 sm:w-64 max-w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, from, to, date..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-gray-400 rounded-none focus:outline-none focus:border-black font-medium text-slate-800 shadow-2xs"
            />
          </div>

          {/* Action Button: Refresh Only */}
          <button
            type="button"
            onClick={fetchLiveEntries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-400 text-slate-900 font-bold hover:bg-slate-100 transition cursor-pointer text-xs shrink-0 shadow-2xs disabled:opacity-50"
            title="Refresh Day Book"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-700" : "text-slate-800"}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Register Container */}
      <div className="w-full max-w-5xl mx-auto overflow-x-auto bg-white border border-gray-400 shadow-xs">
        <table className="w-full text-xs border-collapse border border-gray-400 font-sans select-text">
          {/* Target Header Structure:
              Dark/black header cells with white text
              Grouped header over FROM / TO / TIME: "Remainder display up Departure Time"
              Prominent TRIP DONE action column
          */}
          <thead>
            <tr className="bg-black text-white text-xs font-bold text-center">
              <th
                rowSpan={2}
                className="border border-gray-400 py-2 px-2.5 whitespace-nowrap text-center align-middle w-14"
              >
                SL NO
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 py-2 px-2.5 whitespace-nowrap text-center align-middle w-24"
              >
                DATE
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 py-2 px-2.5 whitespace-nowrap text-center align-middle w-24"
              >
                ON
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 py-2 px-4 text-center align-middle tracking-wide uppercase text-[11px]"
              >
                Remainder display up Departure Time
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 py-2 px-3 whitespace-nowrap text-center align-middle w-28"
              >
                Pax ph no
              </th>
              <th
                rowSpan={2}
                className="border border-gray-400 py-2 px-3 text-center align-middle w-32 bg-[#0d6535] text-white font-black tracking-wide text-xs uppercase print:hidden"
              >
                Trip Done
              </th>
            </tr>
            <tr className="bg-black text-white text-xs font-bold text-center">
              <th className="border border-gray-400 py-1 px-3 whitespace-nowrap text-center">
                FROM
              </th>
              <th className="border border-gray-400 py-1 px-3 whitespace-nowrap text-center">
                TO
              </th>
              <th className="border border-gray-400 py-1 px-2.5 whitespace-nowrap text-center w-20">
                TIME
              </th>
            </tr>
          </thead>

          {/* Table Body:
              SL NO, DATE, ON: White cells with thin grey borders
              FROM, TO, TIME, Pax ph no: Green-filled cells (#c6efce)
          */}
          <tbody className="divide-y divide-gray-400 font-sans">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-slate-600 border border-gray-400 bg-white"
                >
                  {rows.length === 0 ? (
                    <div className="py-4">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                      <p className="text-sm font-bold text-slate-900">No pending or upcoming trips.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        All trips have been completed or no active trips are currently scheduled.
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-bold text-slate-900">No active trips match your search.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try searching with a different passenger phone, location, or date.
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="hover:opacity-90 transition-opacity">
                  {/* 1. SL NO */}
                  <td className="py-1.5 px-2.5 text-center font-medium text-slate-900 border border-gray-400 bg-white whitespace-nowrap">
                    {r.sl_no}
                  </td>

                  {/* 2. DATE */}
                  <td className="py-1.5 px-2.5 text-center font-medium text-slate-900 border border-gray-400 bg-white whitespace-nowrap">
                    {r.date}
                  </td>

                  {/* 3. ON */}
                  <td className="py-1.5 px-2.5 text-center font-medium text-slate-900 border border-gray-400 bg-white whitespace-nowrap">
                    {r.on}
                  </td>

                  {/* 4. FROM (Green-filled data cell) */}
                  <td className="py-1.5 px-3 text-left font-semibold text-slate-900 border border-gray-400 bg-[#c6efce] whitespace-nowrap">
                    {r.from}
                  </td>

                  {/* 5. TO (Green-filled data cell, supports multiline like FULL LOCAL / KIA DROP) */}
                  <td className="py-1.5 px-3 text-left font-semibold text-slate-900 border border-gray-400 bg-[#c6efce] leading-snug whitespace-pre-line">
                    {r.to}
                  </td>

                  {/* 6. TIME (Green-filled data cell, compact e.g. 4:45AM) */}
                  <td className="py-1.5 px-2.5 text-center font-semibold text-slate-900 border border-gray-400 bg-[#c6efce] whitespace-nowrap">
                    {r.time}
                  </td>

                  {/* 7. Pax ph no (Green-filled data cell) */}
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900 border border-gray-400 bg-[#c6efce] whitespace-nowrap tracking-wide">
                    {r.pax_phone}
                  </td>

                  {/* Row Actions: Prominent Standalone "Trip Done" button */}
                  <td className="py-2 px-2 text-center border border-gray-400 bg-white whitespace-nowrap print:hidden">
                    <button
                      type="button"
                      onClick={() => handleMarkTripDone(r)}
                      disabled={savingId === r.id}
                      className="w-full min-w-[95px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#107c41] hover:bg-[#0d6535] active:bg-[#0a4d29] text-white font-extrabold text-xs rounded shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Mark Trip #${r.sl_no} as Completed`}
                    >
                      {savingId === r.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{savingId === r.id ? "Saving..." : "Trip Done"}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Compact Footer Status */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-400 flex items-center justify-between text-[11px] text-slate-600 select-none">
          <span>
            Active Trips: <strong className="text-slate-900">{filteredRows.length}</strong>
          </span>
          <span className="text-[10px] text-slate-500">
            Fortune Tourism Day Book Register · Live Active Trips
          </span>
        </div>
      </div>

      {/* Add / Edit Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-gray-400 shadow-2xl p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                {editingRow ? "Edit Day Book Row" : "New Day Book Entry"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRow} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">DATE</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 1/7/2024"
                    className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ON (Travel Date)</label>
                  <input
                    type="text"
                    required
                    value={formData.on}
                    onChange={(e) => setFormData({ ...formData, on: e.target.value })}
                    placeholder="e.g. 2/7/2024"
                    className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">FROM</label>
                <input
                  type="text"
                  required
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  placeholder="e.g. SBC RWL STATION"
                  className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-semibold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">TO</label>
                <textarea
                  rows={2}
                  required
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="e.g. FULL LOCAL&#10;KIA DROP"
                  className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-semibold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">TIME</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 4:45AM"
                    className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-semibold text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Pax ph no</label>
                  <input
                    type="text"
                    required
                    value={formData.pax_phone}
                    onChange={(e) => setFormData({ ...formData, pax_phone: e.target.value })}
                    placeholder="e.g. 9884037975"
                    className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Passenger Name (Optional)</label>
                <input
                  type="text"
                  value={formData.passenger_name}
                  onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-2 py-1.5 border border-gray-400 focus:outline-none focus:border-black text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-gray-400 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white font-bold hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRow ? "Update Row" : "Save Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
