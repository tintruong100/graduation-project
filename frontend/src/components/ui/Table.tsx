import { cn } from "@/lib/utils";

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
}

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
}: TableProps<T>) {
  const getKey = (row: T, index: number): string => {
    if (!rowKey) return String(index);
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn("p-4 font-semibold text-gray-600 text-sm whitespace-nowrap", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <span className="inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={getKey(row, index)} className="hover:bg-blue-50/30 transition-colors">
                  {columns.map((col) => {
                    const value = getNestedValue(row, String(col.key));
                    return (
                      <td key={String(col.key)} className={cn("p-4 text-sm text-gray-700", col.className)}>
                        {col.render ? col.render(value, row, index) : String(value ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
