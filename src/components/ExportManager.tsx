import React, { useState } from "react";
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  DocumentIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { SearchResult, ExportRequest } from "../types";
import toast from "react-hot-toast";

interface ExportManagerProps {
  searchResults?: SearchResult[];
  onExportComplete?: (request: ExportRequest) => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({
  searchResults = [],
  onExportComplete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "excel">(
    "csv",
  );

  const [exportOptions, setExportOptions] = useState({
    includeContactInfo: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeSocialProfiles: true,
    includeBio: true,
  });

  const handleExport = async () => {
    if (searchResults.length === 0) {
      toast.error("No data selected to export");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading(`Preparing ${exportFormat.toUpperCase()}...`);

    try {
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch(`/api/exports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          format: exportFormat,   // 'csv', 'pdf', or 'excel'
          data: searchResults,    // Raw data
          options: exportOptions, // { includeSkills: true, etc. }
        }),
      });

      if (!response.ok) throw new Error("Server failed to generate file");

      const result = await response.json();

      if (result.downloadUrl) {
        // Trigger the browser download
        const link = document.createElement("a");
        // Ensure the path is absolute for the server
        link.href = result.downloadUrl.startsWith('http') 
                    ? result.downloadUrl 
                    : `${window.location.origin}${result.downloadUrl}`;
        
        // Let the file extension be determined by the server's generated path
        link.setAttribute("download", ""); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Download started!", { id: toastId });
      }
    } catch (error: any) {
      toast.error("Export failed", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      id: "csv" as const,
      name: "CSV",
      icon: TableCellsIcon,
      color: "text-green-600",
    },
    {
      id: "excel" as const,
      name: "Excel",
      icon: DocumentIcon,
      color: "text-blue-600",
    },
    {
      id: "pdf" as const,
      name: "PDF",
      icon: DocumentTextIcon,
      color: "text-red-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-linkedin p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Export Results
          </h2>
          <p className="text-sm text-gray-500">
            Selected: {searchResults.length} contacts
          </p>
        </div>
        <DocumentArrowDownIcon className="h-8 w-8 text-linkedin-blue opacity-20" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {formatOptions.map((f) => (
          <button
            key={f.id}
            onClick={() => setExportFormat(f.id)}
            className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${
              exportFormat === f.id
                ? "border-linkedin-blue bg-blue-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <f.icon className={`h-6 w-6 mb-1 ${f.color}`} />
            <span className="text-xs font-bold">{f.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Include in File
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(exportOptions).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-linkedin-blue border-gray-300 rounded focus:ring-linkedin-blue"
              />
              <span className="ml-2 text-xs font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, " $1").replace("include ", "")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting || searchResults.length === 0}
        className="w-full flex items-center justify-center py-3 bg-linkedin-blue hover:bg-linkedin-darkBlue disabled:bg-gray-200 text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
      >
        {isExporting ? (
          <ClockIcon className="h-5 w-5 animate-spin" />
        ) : (
          <>Generate {exportFormat.toUpperCase()}</>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center text-[10px] text-gray-400">
        <CheckIcon className="h-3 w-3 mr-1 text-green-500" />
        Activity will be logged to your analytics dashboard
      </div>
    </div>
  );
};

export default ExportManager;
