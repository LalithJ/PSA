import React, { useState, useEffect } from "react";
import { useSearch } from "../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"; // Using 20/solid for a tighter UI feel
import { SearchHistory, SearchFilter } from "../types";
import ExportManager from "./ExportManager";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { getSearchHistory, deleteSearchHistory } from "../services/database";

const SearchHistoryManager: React.FC = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearches, setSelectedSearches] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "results" | "query">("date");
  const [showExportManager, setShowExportManager] = useState(false);

  const { performSearch } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSearchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const history = await getSearchHistory(user.id, 100);
        setSearchHistory(history);
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    loadSearchHistory();
  }, [user]);

  // Logic Helpers
  const totalResults = searchHistory.reduce(
    (sum, s) => sum + (s.resultsCount || 0),
    0,
  );

  const filteredHistory = searchHistory
    .filter((search) => {
      const now = new Date();
      const searchDate = new Date(search.createdAt);
      if (filterType === "today")
        return searchDate.toDateString() === now.toDateString();
      if (filterType === "week")
        return now.getTime() - searchDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (filterType === "month")
        return now.getTime() - searchDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "results")
        return (b.resultsCount || 0) - (a.resultsCount || 0);
      if (sortBy === "query")
        return (a.query || "").localeCompare(b.query || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDeleteSearch = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const success = await deleteSearchHistory(id);
      if (success) {
        setSearchHistory((prev) => prev.filter((s) => s.id !== id));
        setSelectedSearches((prev) => prev.filter((itemId) => itemId !== id));
        toast.success("Deleted");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSearches.length === 0) return;
    try {
      const deletePromises = selectedSearches.map((id) =>
        deleteSearchHistory(id),
      );
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        setSearchHistory((prev) =>
          prev.filter((search) => !selectedSearches.includes(search.id)),
        );
        setSelectedSearches([]);
        toast.success(`${successCount} records deleted`);
      }
    } catch (error) {
      toast.error("Bulk delete failed");
    }
  };

  const handleRestore = async (search: SearchHistory) => {
    if (!user?.id) return;
    try {
      await performSearch(search.query, search.filters, user.id);
      navigate("/search");
    } catch (err) {
      toast.error("Failed to restore");
    }
  };

  const toggleSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setSelectedSearches((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-mono text-[11px] uppercase tracking-widest">
        Initialising Archive...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] antialiased">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Search History</h1>
            <p className="text-[12px] text-gray-500 font-medium">
              Manage and export lead generation logs
            </p>
          </div>
          <button
            onClick={() => setShowExportManager(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-[13px] font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4 text-gray-400" />
            Export CSV
          </button>
        </div>

        {/* Stats Row - Compact */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Logs",
              val: searchHistory.length,
              color: "text-gray-900",
            },
            {
              label: "Data Points",
              val: totalResults.toLocaleString(),
              color: "text-gray-900",
            },
            {
              label: "Avg Yield",
              val: Math.round(totalResults / (searchHistory.length || 1)),
              color: "text-gray-900",
            },
            {
              label: "Selected",
              val: selectedSearches.length,
              color: "text-blue-600",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {s.label}
              </p>
              <p className={`text-lg font-bold tabular-nums ${s.color}`}>
                {s.val}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="sticky top-4 z-30 flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg shadow-md mb-4">
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-50 border-gray-200 rounded text-[12px] font-bold px-2 py-1 focus:ring-1 focus:ring-black outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border-gray-200 rounded text-[12px] font-bold px-2 py-1 focus:ring-1 focus:ring-black outline-none"
            >
              <option value="date">Newest First</option>
              <option value="results">Most Results</option>
              <option value="query">Alphabetical</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {selectedSearches.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 text-red-600 text-[12px] font-black px-2 py-1 hover:bg-red-50 rounded transition-colors"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete ({selectedSearches.length})
              </button>
            )}
            <button
              onClick={() =>
                setSelectedSearches(
                  selectedSearches.length === filteredHistory.length
                    ? []
                    : filteredHistory.map((h) => h.id),
                )
              }
              className="text-gray-500 hover:text-black text-[12px] font-bold px-2"
            >
              {selectedSearches.length === filteredHistory.length
                ? "Clear"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Table-like List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {filteredHistory.map((search) => (
              <div
                key={search.id}
                onClick={() => handleRestore(search)}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSearches.includes(search.id)}
                  onChange={(e) => toggleSelect(e, search.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-gray-900 truncate">
                      {search.query || "Advanced Search"}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDeleteSearch(e, search.id)}
                          className="p-1 hover:text-red-600 text-gray-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 overflow-hidden">
                    <span className="shrink-0 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                      {search.resultsCount} hits
                    </span>
                    <div className="flex gap-1 overflow-hidden">
                      {Object.entries(search.filters).map(([key, val]) => {
                        if (!val || (Array.isArray(val) && val.length === 0))
                          return null;
                        return (
                          <span
                            key={key}
                            className="text-[11px] text-gray-400 truncate"
                          >
                            <span className="capitalize">{key}:</span>{" "}
                            <span className="text-gray-600">
                              {Array.isArray(val) ? val.join(",") : val}
                            </span>
                            <span className="ml-1 text-gray-300">/</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-300 group-hover:text-black shrink-0" />
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-[13px] font-bold text-gray-400">
                  No records found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Export Modal */}
      {showExportManager && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-tight text-gray-500">
                Export Archive
              </h3>
              <button
                onClick={() => setShowExportManager(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <ExportManager
                searchResults={[]}
                onExportComplete={() => setShowExportManager(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistoryManager;
