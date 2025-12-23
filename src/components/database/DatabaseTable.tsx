"use client";

/**
 * Database Table Component
 * 
 * A Notion-style editable table with:
 * - Multiple column types (text, number, checkbox, select)
 * - Inline editing
 * - Add/delete rows
 * - Add/delete columns
 * - Automatic totals for number columns
 */

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  ChevronDown,
  Calculator,
} from "lucide-react";

// Column type definition
export interface Column {
  id: string;
  name: string;
  type: "text" | "number" | "checkbox" | "select";
  options?: string[]; // For select type
}

// Row type definition
export interface Row {
  id: string;
  data: Record<string, unknown>;
}

interface DatabaseTableProps {
  columns: Column[];
  rows: Row[];
  onAddRow: () => void;
  onUpdateRow: (rowId: string, data: Record<string, unknown>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (column: Column) => void;
  onUpdateColumn: (columnId: string, updates: Partial<Column>) => void;
  onDeleteColumn: (columnId: string) => void;
  color?: string | null;
  showTotals?: boolean; // Show totals row for number columns
}

export function DatabaseTable({
  columns,
  rows,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  color,
  showTotals = true,
}: DatabaseTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<Column["type"]>("text");

  // Calculate totals for number columns
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    columns.forEach((col) => {
      if (col.type === "number") {
        totals[col.id] = rows.reduce((sum, row) => {
          const value = Number(row.data[col.id]) || 0;
          return sum + value;
        }, 0);
      }
    });
    
    return totals;
  }, [columns, rows]);

  // Check if there are any number columns
  const hasNumberColumns = columns.some((col) => col.type === "number");

  // Calculate item subtotals (price × quantity) if both columns exist
  const itemSubtotals = useMemo(() => {
    const priceCol = columns.find((c) => c.name.toLowerCase().includes("price"));
    const qtyCol = columns.find((c) => c.name.toLowerCase().includes("qty") || c.name.toLowerCase().includes("quantity"));
    
    if (!priceCol || !qtyCol) return null;
    
    const subtotals: Record<string, number> = {};
    rows.forEach((row) => {
      const price = Number(row.data[priceCol.id]) || 0;
      const qty = Number(row.data[qtyCol.id]) || 1;
      subtotals[row.id] = price * qty;
    });
    
    return { subtotals, total: Object.values(subtotals).reduce((a, b) => a + b, 0) };
  }, [columns, rows]);

  // Handle cell value change
  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      const row = rows.find((r) => r.id === rowId);
      if (row) {
        onUpdateRow(rowId, { ...row.data, [columnId]: value });
      }
    },
    [rows, onUpdateRow]
  );

  // Add new column
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn: Column = {
      id: `col_${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
      options: newColumnType === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    
    onAddColumn(newColumn);
    setNewColumnName("");
    setNewColumnType("text");
    setShowAddColumn(false);
  };

  // Get cell display value
  const getCellValue = (row: Row, column: Column): unknown => {
    return row.data[column.id] ?? (column.type === "checkbox" ? false : "");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr>
            <th className="w-8 p-2 bg-[var(--background)] border-b border-r border-[var(--border)]" />
            {columns.map((column) => (
              <th
                key={column.id}
                className="relative p-0 bg-[var(--background)] border-b border-r border-[var(--border)] text-left font-medium text-sm min-w-[150px]"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <span 
                    className="truncate"
                    style={color ? { color } : undefined}
                  >
                    {column.name}
                  </span>
                  <button
                    onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                    className="p-1 rounded hover:bg-[var(--card-hover)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Column menu */}
                {showColumnMenu === column.id && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        onDeleteColumn(column.id);
                        setShowColumnMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete column
                    </button>
                  </div>
                )}
              </th>
            ))}
            {/* Subtotal column header */}
            {itemSubtotals && (
              <th className="p-2 bg-[var(--background)] border-b border-r border-[var(--border)] text-left text-sm font-medium min-w-[80px]">
                <span style={color ? { color } : undefined}>Subtotal</span>
              </th>
            )}
            {/* Add column button */}
            <th className="p-2 bg-[var(--background)] border-b border-[var(--border)] w-10">
              <button
                onClick={() => setShowAddColumn(!showAddColumn)}
                className="p-1 rounded hover:bg-[var(--card-hover)] text-[var(--muted)]"
                title="Add column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="group">
              {/* Row actions */}
              <td className="p-1 border-b border-r border-[var(--border)] bg-[var(--background)]">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-[var(--muted)] cursor-grab">
                    <GripVertical className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors"
                    title="Delete row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </td>
              
              {/* Cells */}
              {columns.map((column) => (
                <td
                  key={`${row.id}-${column.id}`}
                  className="p-0 border-b border-r border-[var(--border)] bg-[var(--card)]"
                >
                  <CellEditor
                    column={column}
                    value={getCellValue(row, column)}
                    isEditing={editingCell?.rowId === row.id && editingCell?.columnId === column.id}
                    onStartEdit={() => setEditingCell({ rowId: row.id, columnId: column.id })}
                    onEndEdit={() => setEditingCell(null)}
                    onChange={(value) => handleCellChange(row.id, column.id, value)}
                    color={color}
                  />
                </td>
              ))}
              {/* Row subtotal for shopping lists */}
              <td className="border-b border-[var(--border)] px-2 text-sm">
                {itemSubtotals && itemSubtotals.subtotals[row.id] > 0 && (
                  <span 
                    className="font-medium opacity-70"
                    style={color ? { color } : undefined}
                  >
                    ${itemSubtotals.subtotals[row.id].toFixed(2)}
                  </span>
                )}
              </td>
            </tr>
          ))}
          
          {/* Totals row */}
          {showTotals && hasNumberColumns && !itemSubtotals && (
            <tr className="bg-[var(--background)] font-medium">
              <td className="p-2 border-t-2 border-[var(--border)]">
                <Calculator className="w-4 h-4 text-[var(--muted)]" />
              </td>
              {columns.map((column) => (
                <td
                  key={`total-${column.id}`}
                  className="px-3 py-2 border-t-2 border-r border-[var(--border)] text-sm"
                >
                  {column.type === "number" ? (
                    <span style={color ? { color } : undefined}>
                      {column.name.toLowerCase().includes("price") 
                        ? `$${columnTotals[column.id]?.toFixed(2) || "0.00"}`
                        : columnTotals[column.id] || 0
                      }
                    </span>
                  ) : column.id === columns[0]?.id ? (
                    <span className="text-[var(--muted)]">Total</span>
                  ) : null}
                </td>
              ))}
              <td className="border-t-2 border-[var(--border)]" />
            </tr>
          )}

          {/* Add row button */}
          <tr>
            <td colSpan={columns.length + (itemSubtotals ? 3 : 2)} className="p-0">
              <button
                onClick={onAddRow}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New row
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Grand total card for shopping lists */}
      {itemSubtotals && (
        <div 
          className="mt-4 p-4 rounded-xl border-2 flex items-center justify-between"
          style={{ 
            borderColor: color || "var(--border)",
            backgroundColor: color ? `${color}10` : "var(--card)",
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: color || "var(--garden-500)" }}
            >
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Grand Total</p>
              <p className="text-2xl font-bold" style={color ? { color } : undefined}>
                ${itemSubtotals.total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-[var(--muted)]">
            {rows.length} {rows.length === 1 ? "item" : "items"}
          </div>
        </div>
      )}

      {/* Add column modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddColumn(false)}>
          <div 
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4">Add Column</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name"
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as Column["type"])}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="select">Select</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColumn}
                  className="flex-1 px-4 py-2 bg-garden-600 hover:bg-garden-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Cell editor component
interface CellEditorProps {
  column: Column;
  value: unknown;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onChange: (value: unknown) => void;
  color?: string | null;
}

function CellEditor({
  column,
  value,
  isEditing,
  onStartEdit,
  onEndEdit,
  onChange,
  color,
}: CellEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSelect, setShowSelect] = useState(false);

  // Handle save on blur or enter
  const handleSave = () => {
    onChange(localValue);
    onEndEdit();
  };

  // Checkbox type
  if (column.type === "checkbox") {
    const isChecked = Boolean(value);
    return (
      <div className="flex items-center justify-center h-10">
        <button
          onClick={() => onChange(!isChecked)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isChecked
              ? "bg-garden-500 border-garden-500 text-white"
              : "border-[var(--border)] hover:border-garden-500"
          }`}
        >
          {isChecked && <Check className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // Select type
  if (column.type === "select") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowSelect(!showSelect)}
          className="w-full h-10 px-3 text-left text-sm hover:bg-[var(--card-hover)] transition-colors flex items-center justify-between"
        >
          {value ? (
            <span 
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: color ? `${color}20` : "var(--card-hover)",
                color: color || "inherit",
              }}
            >
              {String(value)}
            </span>
          ) : (
            <span className="text-[var(--muted)]">Select...</span>
          )}
          <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
        </button>
        
        {showSelect && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50">
            {column.options?.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setShowSelect(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--card-hover)] transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Text/Number type
  if (isEditing) {
    return (
      <input
        type={column.type === "number" ? "number" : "text"}
        value={String(localValue)}
        onChange={(e) => setLocalValue(column.type === "number" ? Number(e.target.value) : e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onEndEdit();
        }}
        className="w-full h-10 px-3 bg-[var(--background)] border-2 border-garden-500 focus:outline-none text-sm"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className="h-10 px-3 flex items-center cursor-text hover:bg-[var(--card-hover)] transition-colors text-sm"
    >
      {value !== "" && value !== undefined ? (
        <span>{String(value)}</span>
      ) : (
        <span className="text-[var(--muted)]">Empty</span>
      )}
    </div>
  );
}

