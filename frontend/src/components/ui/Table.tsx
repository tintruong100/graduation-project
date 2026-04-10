"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Loading";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T | ((row: T) => string);
  /** Enable client-side pagination. Default true. */
  paginate?: boolean;
  /** Default rows per page */
  defaultPageSize?: number;
}

const PAGE_SIZES = [10, 25, 50];

function getNestedValue<T>(obj: T, key: string): unknown {
  return key.split(".").reduce((acc: unknown, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

export function Table<T>({
  data,
  columns,
  isLoading,
  emptyMessage = "Không có dữ liệu",
  className,
  rowKey,
  paginate = true,
  defaultPageSize = 10,
}: TableProps<T>) {
  // page is stored together with the data-length snapshot it was set for.
  // When data.length changes (search/filter), effective page resets to 1.
  const [{ page, dataLengthAtSet }, setPageState] = useState({ page: 1, dataLengthAtSet: data.length });
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const effectivePage = dataLengthAtSet === data.length ? page : 1;

  const setPage = (p: number | ((prev: number) => number)) => {
    setPageState((prev) => ({
      page: typeof p === "function" ? p(prev.page) : p,
      dataLengthAtSet: data.length,
    }));
  };

  const totalPages = paginate ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safeCurrentPage = Math.min(effectivePage, totalPages);

  const pageData = useMemo(() => {
    if (!paginate) return data;
    const start = (safeCurrentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, paginate, safeCurrentPage, pageSize]);

  const getKey = (row: T, index: number): string => {
    if (!rowKey) return String(index);
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  };

  // Reset to page 1 when data length changes — handled via compound state (effectivePage)

  if (isLoading) return <TableSkeleton rows={5} cols={columns.length} />;

  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn("px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, index) => (
                <tr
                  key={getKey(row, (safeCurrentPage - 1) * pageSize + index)}
                  className="hover:bg-blue-50/30 transition-colors duration-150"
                >
                  {columns.map((col) => {
                    const value = getNestedValue(row, String(col.key));
                    return (
                      <td key={String(col.key)} className={cn("px-4 py-3 text-sm text-gray-700", col.className)}>
                        {col.render
                          ? col.render(value, row, (safeCurrentPage - 1) * pageSize + index)
                          : String(value ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {paginate && data.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          {/* Left: info + page size */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              {data.length === 0 ? "0" : `${(safeCurrentPage - 1) * pageSize + 1}–${Math.min(safeCurrentPage * pageSize, data.length)}`}
              {" / "}
              <span className="font-semibold text-gray-700">{data.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s} / trang</option>
              ))}
            </select>
          </div>

          {/* Right: page buttons */}
          <div className="flex items-center gap-1">
            <PaginationBtn
              onClick={() => setPage(1)}
              disabled={safeCurrentPage === 1}
              label="«"
              title="Trang đầu"
            />
            <PaginationBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              label="‹"
              title="Trang trước"
            />

            {/* Page numbers */}
            {getPageNumbers(safeCurrentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <PaginationBtn
                  key={p}
                  onClick={() => setPage(p as number)}
                  disabled={false}
                  label={String(p)}
                  active={p === safeCurrentPage}
                />
              )
            )}

            <PaginationBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              label="›"
              title="Trang sau"
            />
            <PaginationBtn
              onClick={() => setPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              label="»"
              title="Trang cuối"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationBtn({
  onClick, disabled, label, title, active,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600",
      )}
    >
      {label}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
