import { useMemo, useState, type ReactNode } from "react";

type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  renderCell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState: ReactNode;
}

function compareValues(a: string | number, b: string | number, direction: SortDirection): number {
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  const textA = String(a).toLowerCase();
  const textB = String(b).toLowerCase();

  if (textA === textB) {
    return 0;
  }

  if (direction === "asc") {
    return textA > textB ? 1 : -1;
  }

  return textA < textB ? 1 : -1;
}

export default function Table<T>({ columns, rows, rowKey, emptyState }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return rows;
    }

    const selectedColumn = columns.find((column) => column.key === sortKey);
    if (!selectedColumn?.sortValue) {
      return rows;
    }

    return [...rows].sort((a, b) =>
      compareValues(selectedColumn.sortValue!(a), selectedColumn.sortValue!(b), sortDirection)
    );
  }, [columns, rows, sortDirection, sortKey]);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) {
      return;
    }

    if (sortKey === column.key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column.key);
    setSortDirection("asc");
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500",
                  column.sortable ? "cursor-pointer select-none" : "",
                  column.headerClassName ?? "",
                ]
                  .join(" ")
                  .trim()}
                onClick={() => handleSort(column)}
                scope="col"
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortKey === column.key ? (
                    <span aria-hidden="true">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sortedRows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors duration-200 hover:bg-indigo-50/45">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    "whitespace-nowrap px-4 py-3 align-middle text-slate-700",
                    column.cellClassName ?? "",
                  ]
                    .join(" ")
                    .trim()}
                >
                  {column.renderCell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
