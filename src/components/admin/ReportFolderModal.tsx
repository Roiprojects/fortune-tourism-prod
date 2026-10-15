import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  FolderOpen,
  FolderKanban,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  Sparkles,
  BookOpen,
} from "lucide-react";
import logoAsset from "@/assets/fortune-tourism-logo.png";
import {
  REPORT_DEFINITIONS,
  type AccountReportKey,
} from "@/components/admin/AccountsReportsHub";

interface ReportFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (reportKey: AccountReportKey) => void;
}

export function ReportFolderModal({
  isOpen,
  onClose,
  onSelectReport,
}: ReportFolderModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const reportsList = useMemo(() => {
    return REPORT_DEFINITIONS.filter((r) => r.key !== "reports");
  }, []);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reportsList;
    const q = searchQuery.toLowerCase().trim();
    return reportsList.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.shortTitle.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }, [reportsList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#063f2d] via-[#085a3c] to-[#063f2d] text-white px-5 sm:px-7 py-4.5 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src={logoAsset}
                alt="Fortune Tourism"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider">
                  <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Folder</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  8 Specialized Accounting Reports
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight font-serif text-white mt-1">
                Executive Financial &amp; Accounting Reports Folder
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Info */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by title, ledger, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
              Showing <strong className="text-slate-900">{filteredReports.length}</strong> of 8 Reports
            </span>
          </div>
        </div>

        {/* Body: 8 Specialized Play Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredReports.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.key}
                  onClick={() => {
                    onSelectReport(r.key);
                    onClose();
                  }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Card Number Watermark */}
                  <div className="absolute top-3 right-3 text-[10px] font-black text-slate-400/80 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                    Card #{idx + 1}
                  </div>

                  <div>
                    {/* Top Row: Icon + Open Arrow */}
                    <div className="flex items-center justify-between mb-3.5 pr-14">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center ${r.color} group-hover:bg-[#063f2d] group-hover:text-amber-400 transition-all shadow-2xs`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-black text-slate-900 text-sm group-hover:text-[#063f2d] transition leading-snug">
                      {r.title}
                    </h3>

                    {/* Subtitle Description */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {r.subtitle}
                    </p>
                  </div>

                  {/* Card Bottom: Action & Audit Badge */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#063f2d] group-hover:text-amber-700 transition flex items-center gap-1">
                      Open Report
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Ledger
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-white border-t border-slate-200 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All 8 specialized financial reports are synchronized with real-time PostgreSQL database transactions.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectReport("reports");
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Accounts Hub</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
