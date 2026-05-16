import { useMemo, useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import { cn } from "../../lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  searchValue?: (row: T) => string;
  className?: string;
  pinned?: boolean;
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  compact = true,
  title = "Operational records",
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  compact?: boolean;
  title?: string;
}) {
  const [sortKey, setSortKey] = useState<string>(columns[0]?.key ?? "");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((column) => [column.key, true])),
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((column) => (column.searchValue?.(row) ?? String(column.sortValue?.(row) ?? "")).toLowerCase().includes(term)),
    );
  }, [columns, query, rows]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const column = columns.find((item) => item.key === sortKey);
        if (!column?.sortValue) return 0;
        const av = column.sortValue(a);
        const bv = column.sortValue(b);
        return (av > bv ? 1 : av < bv ? -1 : 0) * (direction === "asc" ? 1 : -1);
      }),
    [columns, direction, filtered, sortKey],
  );

  const shown = columns.filter((column) => visible[column.key]);

  return (
    <div className="table-shell premium-table-shell">
      <div className="table-command-bar">
        <div>
          <p className="eyebrow">Dense table console</p>
          <h2>{title}</h2>
        </div>
        <input
          className="input table-search"
          placeholder="Quick filter visible records…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
          Export / Print
        </button>
      </div>
      <div className="table-tools">
        <div className="column-toggles">
          {columns.map((column) => (
            <label key={column.key}>
              <input
                type="checkbox"
                checked={visible[column.key]}
                onChange={(event) => setVisible((state) => ({ ...state, [column.key]: event.target.checked }))}
              />
              {column.header}
            </label>
          ))}
        </div>
        <span>{sorted.length} / {rows.length} records</span>
      </div>
      <div className="table-viewport" tabIndex={0}>
        <table className={compact ? "data-table compact" : "data-table"}>
          <thead>
            <tr>
              {shown.map((column) => (
                <th key={column.key} className={cn(column.className, column.pinned && "pinned-col")}>
                  <button
                    type="button"
                    onClick={() => {
                      setSortKey(column.key);
                      setDirection((current) => (sortKey === column.key && current === "asc" ? "desc" : "asc"));
                    }}
                  >
                    {column.header}{sortKey === column.key ? (direction === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={getRowId(row)} onClick={() => onRowClick?.(row)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onRowClick?.(row); }}>
                {shown.map((column) => (
                  <td key={column.key} className={cn(column.className, column.pinned && "pinned-col")}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && <EmptyState />}
    </div>
  );
}
