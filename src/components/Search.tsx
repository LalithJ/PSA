import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Search as SearchIcon,
  MapPin,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Mail,
  Phone,
  ChevronRight,
  Loader2,
  Info,
  X,
} from "lucide-react";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/AuthContext";
import { revealContact } from "../services/database";
import { SearchResult } from "../types"; // Ensure this import exists
import ViewPersonProfile from "./ViewPersonProfile";
import ExportManager from "./ExportManager";

const Search: React.FC = () => {
  const { user } = useAuth();
  const { searchResults, performSearch, loading } = useSearch();
  const { register, handleSubmit } = useForm();

  // 1. Local state to manage data updates after a Reveal
  const [localResults, setLocalResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loadingReveal, setLoadingReveal] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  // 2. Sync local results when search context updates
  useEffect(() => {
    setLocalResults(searchResults);
  }, [searchResults]);

  const onSubmit = (data: any) => {
    // 1. Log to verify the main input is being captured
    console.log("Form Raw Data:", data);

    // 2. The backend expects the main search string as 'name' within filters
    const filters = {
      name: data.query || "", // Mapping main query box to name filter
      location: data.location || "",
      company: data.company || "",
      position: data.position || "",
    };

    // 3. Extract the primary search term for context/history
    const searchTerm = data.query || "";

    setSelectedIds(new Set());

    // 4. Pass the cleaned data to the provider
    // performSearch(searchTerm, filters, userId)
    performSearch(searchTerm, filters, user?.id);
  };

  // 3. Fixed Reveal Logic with Local State Update
  const handleReveal = async (personId: string, type: "email" | "phone") => {
    setLoadingReveal({ id: personId, type });

    try {
      const data = await revealContact(personId, type);

      // Check if we got a valid value (email/phone)
      if (data && data.value) {
        setLocalResults((prev) =>
          prev.map((item) => {
            // Use == for flexible string/number ID matching
            if (item.person.id == personId) {
              return {
                ...item,
                // Ensure access_map exists before spreading
                access_map: {
                  ...(item.access_map || {}),
                  [type]: true,
                },
                // Update the actual person data so the UI displays the value
                person: {
                  ...item.person,
                  [type]: data.value,
                },
              };
            }
            return item;
          }),
        );
      } else if (data?.status === "processing") {
        startPolling(personId, type);
      } else {
        // This handles the "No credits" scenario if the backend returns 200 but no value
        setNotification({
          show: true,
          message: "Insufficient credits. Please upgrade your plan.",
        });
      }
    } catch (error: any) {
      // Catching the 403 Forbidden which is the standard "Insufficient Credits" error
      if (error.status === 403 || error.response?.status === 403) {
        setNotification({
          show: true,
          message:
            "Insufficient credits. Please upgrade your plan to reveal more contacts.",
        });
      } else {
        console.error("Reveal Error:", error);
      }
    } finally {
      setLoadingReveal(null);
    }
  };

  const startPolling = (personId: string, type: "email" | "phone") => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/people/${personId}/status`);
        const result = await response.json();
        if (result.email_status === "verified" && result[type]) {
          clearInterval(interval);
          setLocalResults((prev) =>
            prev.map((item) =>
              item.person.id === personId
                ? {
                    ...item,
                    access_map: { ...item.access_map, [type]: true },
                    person: { ...item.person, [type]: result[type] },
                  }
                : item,
            ),
          );
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === localResults.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(localResults.map((r) => r.person.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };
  const selectedData = localResults.filter((r) => selectedIds.has(r.person.id));
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* CREDIT NOTIFICATION RIBBON */}
      {notification.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg animate-in slide-in-from-top duration-300">
          <div className="mx-4 bg-white/95 backdrop-blur-xl border border-amber-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl p-4 flex items-center gap-4">
            {/* Icon */}
            <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
              <InformationCircleIcon className="h-7 w-7 text-amber-600" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">
                Insufficient Credits
              </p>
              <p className="text-[12px] text-slate-500 font-medium">
                {notification.message}
              </p>
            </div>

            {/* THE MISSING BUY BUTTON */}
            <div className="flex items-center gap-2">
              <a
                href="/billing" // Or your specific route: /checkout /pricing
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Buy Credits
              </a>

              {/* Close Button */}
              <button
                onClick={() =>
                  setNotification({ ...notification, show: false })
                }
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LEFT SIDEBAR (Filters) - Fixed 256px width */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Search Filters
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
              Keyword
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("query")}
                placeholder="Name, role..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("location")}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. London"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Company
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("company")}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Stripe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("position")}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. CTO"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Find Leads
          </button>
        </form>
      </aside>

      {/* 3. MAIN CONTENT (Results) */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">Leads</h3>
            {localResults.length > 0 && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                {localResults.length} profiles found
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Selected (
            {selectedIds.size})
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">
                Sourcing profiles...
              </p>
            </div>
          ) : localResults.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-[900px]">
              {/* GRID HEADER */}
              <div className="grid grid-cols-[60px_2fr_1.5fr_1fr_1.5fr_1.5fr] bg-slate-50/50 border-b border-slate-100 py-3 px-2">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === localResults.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                  />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  Contact
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  Role / Company
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  Location
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">
                  Email
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">
                  Phone
                </div>
              </div>

              {/* GRID BODY */}
              {localResults.map((result) => (
                <div
                  key={result.person.id}
                  className={`group border-b border-slate-50 transition-colors ${selectedIds.has(result.person.id) ? "bg-indigo-50/30" : "hover:bg-slate-50/50"}`}
                >
                  <div
                    className="grid grid-cols-[60px_2fr_1.5fr_1fr_1.5fr_1.5fr] items-center py-4 px-2 cursor-pointer"
                    onClick={() =>
                      setExpandedId(
                        expandedId === result.person.id
                          ? null
                          : result.person.id,
                      )
                    }
                  >
                    <div
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(result.person.id)}
                        onChange={() => toggleSelect(result.person.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                      />
                    </div>
                    <div className="px-4">
                      <p className="text-sm font-bold text-slate-900">
                        {result.person.firstName} {result.person.lastName}
                      </p>
                      <button className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 mt-0.5 hover:text-indigo-700">
                        VIEW FULL PROFILE{" "}
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="px-4">
                      <p className="text-[13px] font-semibold text-slate-700 truncate">
                        {result.person.position}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {result.person.company}
                      </p>
                    </div>
                    <div className="px-4 text-[12px] text-slate-500">
                      {result.person.location || "Remote"}
                    </div>

                    {/* EMAIL CELL */}
                    <div
                      className="px-4 flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {result.access_map?.email ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-emerald-700 text-[11px] font-bold select-all">
                          <Mail className="w-3 h-3" /> {result.person.email}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleReveal(result.person.id, "email")
                          }
                          className="px-4 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                        >
                          {loadingReveal?.id === result.person.id &&
                          loadingReveal.type === "email" ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Reveal"
                          )}
                        </button>
                      )}
                    </div>

                    {/* PHONE CELL */}
                    <div
                      className="px-4 flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {result.access_map?.phone ? (
                        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 text-[11px] font-bold select-all">
                          <Phone className="w-3 h-3" /> {result.person.phone}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleReveal(result.person.id, "phone")
                          }
                          className="px-4 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                        >
                          {loadingReveal?.id === result.person.id &&
                          loadingReveal.type === "phone" ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Reveal"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDED PROFILE DATA (PICTURE & DETAILS) */}
                  {expandedId === result.person.id && (
                    <div className="bg-slate-50 border-y border-slate-100 p-8 animate-in slide-in-from-top-2 duration-300">
                      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <ViewPersonProfile person={result.person} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                <SearchIcon className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Find your next customer
              </h3>
              <p className="text-slate-400 max-w-xs mt-2 text-sm">
                Use the filters on the left to search the global database.
              </p>
            </div>
          )}
        </div>
      </main>
      {/* Place this at the very bottom of your Search.tsx before the last </div> */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                Export Manager
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-8">
              {/* CRITICAL: Passing 'selectedData' which is localResults.filter(...) */}
              <ExportManager searchResults={selectedData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Search;
