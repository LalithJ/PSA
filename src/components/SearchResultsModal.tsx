import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SearchResult, Person } from "../types";
import ViewPersonProfile from "./ViewPersonProfile";
import ExportManager from "./ExportManager";
import { revealContact } from "../services/database";

interface Props {
  results: SearchResult[]; // Initial results from Laravel
  onClose: () => void;
}

const SearchResultsModal: React.FC<Props> = ({ results, onClose }) => {
  // 1. Local state to allow instant UI updates when data is revealed
  const [localResults, setLocalResults] = useState<SearchResult[]>(results);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loadingReveal, setLoadingReveal] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "credits";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Sync local state if props change
  useEffect(() => {
    setLocalResults(results);
  }, [results]);

  // Watch localResults and log when it changes
  useEffect(() => {
    if (localResults.length > 0) {
      console.log("DEBUG: localResults now has data:", localResults);
      localResults.forEach((r) =>
        console.log("DEBUG: person in SearchResultsModal:", r.person),
      );
    }
  }, [localResults]);

  const handleReveal = async (personId: string, type: "email" | "phone") => {
    setLoadingReveal({ id: personId, type });

    try {
      const data = await revealContact(personId, type);

      if (data && data.value) {
        // 1. Success
        updateLocalResult(personId, type, data.value);
      } else if (data && data.status === "not_found") {
        // 2. Exact "Not Found" check from your old code
        setNotification({
          show: true,
          message: "Contact information not found for this profile.",
          type: "error",
        });
      } else {
        // 3. YOUR MISSING FALLBACK
        // If data is null or response is "Transaction failed", show credits error
        setNotification({
          show: true,
          message: "Insufficient credits to reveal this contact.",
          type: "error",
        });
      }
    } catch (error) {
      // Ensuring the UI still responds even if the network/request fails
      console.error("Reveal failed", error);
      setNotification({
        show: true,
        message: "Insufficient credits to reveal this contact.",
        type: "error",
      });
    } finally {
      setLoadingReveal(null);
    }
  };

  // Helper to update our SearchResult array
  const updateLocalResult = (
    personId: string,
    type: "email" | "phone",
    value: string,
  ) => {
    setLocalResults((prev) =>
      prev.map((item) => {
        if (item.person.id === personId) {
          return {
            ...item,
            access_map: { ...item.access_map, [type]: true },
            person: { ...item.person, [type]: value },
          };
        }
        return item;
      }),
    );
    setLoadingReveal(null); // Stop the spinner once we have the data
  };

  // The "Watchman" - Polling the status endpoint
  const startPolling = (personId: string, type: "email" | "phone") => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/people/${personId}/status`);
        const result = await response.json();

        // If the Python script has updated the record to 'verified'
        if (result.email_status === "verified" && result[type]) {
          clearInterval(interval);
          updateLocalResult(personId, type, result[type]);
        }
      } catch (err) {
        console.error("Polling error", err);
        clearInterval(interval);
        setLoadingReveal(null);
      }
    }, 3000); // Check every 3 seconds
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f7] antialiased">
      {/* CREDIT NOTIFICATION RIBBON */}
      {notification.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md animate-in slide-in-from-top duration-300">
          <div className="mx-4 bg-white/80 backdrop-blur-xl border border-black/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
              {/* You need to ensure InformationCircleIcon is imported from @heroicons/react */}
              <InformationCircleIcon className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-black">
                {notification.message}
              </p>
              <p className="text-[11px] text-gray-500">
                Add credits to your plan to continue searching.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/plans")}
              className="bg-[#007aff] text-white text-[11px] font-bold px-4 py-2 rounded-full hover:bg-[#0055b3] transition-all"
            >
              Buy
            </button>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 flex shrink-0 items-center h-[60px] px-6 bg-white/75 backdrop-blur-2xl border-b border-black/10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#007aff] hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Search</span>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-4"></div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 text-[#007aff] hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[13px] font-medium"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export Data</span>
        </button>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-tight text-gray-400">
            {selectedIds.size} / {localResults.length} Selected
          </span>
        </div>
      </div>

      {/* EXPORT MODAL */}
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
              <ExportManager searchResults={selectedData} />
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="flex-1 overflow-hidden p-5 flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto bg-white border border-black/10 shadow-sm rounded-xl flex flex-col overflow-hidden flex-1">
          <div className="grid grid-cols-[50px_1.5fr_1.2fr_1fr_2fr_1fr_1fr] bg-white border-b border-black/5 sticky top-0 z-30 py-3">
            <div className="flex justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#007aff]"
                checked={selectedIds.size === localResults.length}
                onChange={toggleSelectAll}
              />
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4">
              Title
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4">
              Full Name
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4">
              Location
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4">
              Organization
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4 text-center">
              Email
            </div>
            <div className="text-[10px] font-bold text-[#86868b] uppercase px-4 text-center">
              Phone
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#fafafa]">
            {localResults.map((result) => (
              <div
                key={result.person.id}
                className={`border-b border-black/[0.03] ${expandedId === result.person.id ? "bg-white" : "hover:bg-[#fbfbfd]"}`}
              >
                <div
                  className="grid grid-cols-[50px_1.5fr_1.2fr_1fr_2fr_1fr_1fr] items-center py-4 relative cursor-default"
                  onClick={() =>
                    setExpandedId(
                      expandedId === result.person.id ? null : result.person.id,
                    )
                  }
                >
                  {selectedIds.has(result.person.id) && (
                    <div className="absolute left-0 h-full w-[4px] bg-[#007aff]" />
                  )}
                  <div
                    className="flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-[#007aff]"
                      checked={selectedIds.has(result.person.id)}
                      onChange={() => toggleSelect(result.person.id)}
                    />
                  </div>
                  <div className="px-4 text-[13px] font-semibold text-[#1d1d1f] truncate">
                    {result.person.position}
                  </div>
                  <div className="px-4 text-[14px] font-bold text-black">
                    {result.person.firstName} {result.person.lastName}
                  </div>
                  <div className="px-4 text-[13px] text-[#86868b]">
                    {result.person.location || "Remote"}
                  </div>
                  <div className="px-4 text-[13px] text-[#424245] truncate">
                    {result.person.company}
                  </div>

                  {/* EMAIL CELL */}
                  <div
                    className="px-4 flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {result.access_map?.email ? (
                      <span className="text-[12px] font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded border border-blue-100 select-all">
                        {result.person.email}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReveal(result.person.id, "email")}
                        disabled={loadingReveal?.id === result.person.id}
                        className="text-[10px] font-bold px-3 py-1.5 bg-[#007aff] text-white rounded-full hover:bg-[#0055b3] transition-all w-20 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {loadingReveal?.id === result.person.id &&
                        loadingReveal?.type === "email" ? (
                          <span className="flex justify-center items-center">
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </span>
                        ) : (
                          "REVEAL"
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
                      <span className="text-[12px] font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded border border-blue-100 select-all">
                        {result.person.phone}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReveal(result.person.id, "phone")}
                        disabled={
                          loadingReveal?.id === result.person.id &&
                          loadingReveal?.type === "phone"
                        }
                        className="text-[10px] font-bold px-3 py-1.5 bg-[#007aff] text-white rounded-full hover:bg-[#0055b3] transition-all w-20 disabled:opacity-50"
                      >
                        {loadingReveal?.id === result.person.id &&
                        loadingReveal?.type === "phone"
                          ? "..."
                          : "REVEAL"}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${expandedId === result.person.id ? "max-h-[600px]" : "max-h-0"}`}
                >
                  <div className="p-8 bg-white border-t border-black/5">
                    <ViewPersonProfile person={result.person} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsModal;
