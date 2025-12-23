"use client";

/**
 * Export Page
 * 
 * Download your Mind Garden data in various formats
 */

import { useState } from "react";
import {
  Download,
  FileText,
  Database,
  Target,
  Folder,
  FileJson,
  FileSpreadsheet,
  FileCode,
  Check,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";

type ExportType = "all" | "pages" | "databases" | "habits" | "folders";
type ExportFormat = "json" | "csv" | "markdown";

interface ExportOption {
  id: ExportType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  formats: ExportFormat[];
}

const exportOptions: ExportOption[] = [
  {
    id: "all",
    name: "Everything",
    description: "Export all your data in one file",
    icon: <Package className="w-6 h-6" />,
    color: "#10b981",
    formats: ["json", "markdown", "csv"],
  },
  {
    id: "pages",
    name: "Pages",
    description: "All your notes and documents",
    icon: <FileText className="w-6 h-6" />,
    color: "#3b82f6",
    formats: ["json", "markdown", "csv"],
  },
  {
    id: "databases",
    name: "Databases",
    description: "Tables and structured data",
    icon: <Database className="w-6 h-6" />,
    color: "#8b5cf6",
    formats: ["json", "csv", "markdown"],
  },
  {
    id: "habits",
    name: "Habits",
    description: "Habit tracking history",
    icon: <Target className="w-6 h-6" />,
    color: "#f59e0b",
    formats: ["json", "csv", "markdown"],
  },
  {
    id: "folders",
    name: "Folders",
    description: "Your folder structure",
    icon: <Folder className="w-6 h-6" />,
    color: "#ec4899",
    formats: ["json", "markdown"],
  },
];

const formatInfo: Record<ExportFormat, { name: string; icon: React.ReactNode; description: string }> = {
  json: {
    name: "JSON",
    icon: <FileJson className="w-5 h-5" />,
    description: "Best for backups & importing",
  },
  csv: {
    name: "CSV",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    description: "Opens in Excel/Google Sheets",
  },
  markdown: {
    name: "Markdown",
    icon: <FileCode className="w-5 h-5" />,
    description: "Human-readable text format",
  },
};

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState<ExportType>("all");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const selectedOption = exportOptions.find((o) => o.id === selectedType)!;
  const availableFormats = selectedOption.formats;

  // Reset format if not available for selected type
  if (!availableFormats.includes(selectedFormat)) {
    setSelectedFormat(availableFormats[0]);
  }

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const response = await fetch(
        `/api/export?type=${selectedType}&format=${selectedFormat}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `mind-garden-export.${selectedFormat}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
            <Download className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Export Data</h1>
        </div>
        <p className="text-[var(--muted)]">
          Download your Mind Garden data for backup or use elsewhere
        </p>
      </div>

      {/* Export type selection */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--garden-500)]" />
          What to Export
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedType(option.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${selectedType === option.id
                  ? "border-[var(--garden-500)] shadow-lg scale-[1.02]"
                  : "border-[var(--border)] hover:border-[var(--muted)] hover:scale-[1.01]"
                }
              `}
              style={
                selectedType === option.id
                  ? { backgroundColor: `${option.color}10` }
                  : undefined
              }
            >
              {selectedType === option.id && (
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: option.color }}
                >
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
                style={{ backgroundColor: option.color }}
              >
                {option.icon}
              </div>
              <h3 className="font-semibold mb-1">{option.name}</h3>
              <p className="text-sm text-[var(--muted)]">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Format selection */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Export Format</h2>
        <div className="flex flex-wrap gap-3">
          {availableFormats.map((format) => {
            const info = formatInfo[format];
            const isSelected = selectedFormat === format;
            return (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
                  ${isSelected
                    ? "border-[var(--garden-500)] bg-[var(--garden-500)]/10"
                    : "border-[var(--border)] hover:border-[var(--muted)]"
                  }
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? "bg-[var(--garden-500)] text-white" : "bg-[var(--background)]"}
                  `}
                >
                  {info.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium">{info.name}</p>
                  <p className="text-xs text-[var(--muted)]">{info.description}</p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-[var(--garden-500)] ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export preview card */}
      <div className="mb-8 p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <h2 className="font-semibold mb-4">Export Summary</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-[var(--muted)]">Data</p>
            <p className="font-medium flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.name}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Format</p>
            <p className="font-medium flex items-center gap-2">
              {formatInfo[selectedFormat].icon}
              {formatInfo[selectedFormat].name}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Filename</p>
            <p className="font-medium font-mono text-xs bg-[var(--background)] px-2 py-1 rounded">
              mind-garden-export-{selectedType}.{selectedFormat === "markdown" ? "md" : selectedFormat}
            </p>
          </div>
        </div>
      </div>

      {/* Export button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white
            transition-all duration-200
            ${isExporting
              ? "bg-[var(--muted)] cursor-wait"
              : exportSuccess
              ? "bg-green-500"
              : "bg-[var(--garden-500)] hover:bg-[var(--garden-600)] hover:scale-105"
            }
          `}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : exportSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Export
            </>
          )}
        </button>

        {exportSuccess && (
          <p className="text-sm text-green-600 animate-fade-in">
            ✨ Your export is ready!
          </p>
        )}
      </div>

      {/* Help section */}
      <div className="mt-12 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--garden-500)]" />
          Export Tips
        </h3>
        <ul className="text-sm text-[var(--muted)] space-y-1">
          <li>• <strong>JSON</strong> - Best for full backups, can be re-imported later</li>
          <li>• <strong>CSV</strong> - Perfect for opening in spreadsheet apps like Excel or Google Sheets</li>
          <li>• <strong>Markdown</strong> - Human-readable format, great for sharing or printing</li>
          <li>• Export regularly to keep a backup of your important data!</li>
        </ul>
      </div>
    </div>
  );
}

