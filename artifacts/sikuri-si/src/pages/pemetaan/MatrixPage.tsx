import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Row { id: number; kode: string; nama?: string; }
interface Col { id: number; kode: string; nama?: string; }

interface MatrixPageProps {
  title: string;
  subtitle: string;
  rows: Row[] | undefined;
  cols: Col[] | undefined;
  matrix: Record<number, Record<number, boolean>> | undefined;
  isLoading: boolean;
  onToggle: (rowId: number, colId: number) => void;
  isToggling?: boolean;
  rowLabel: string;
  colLabel: string;
}

export function MatrixPage({
  title, subtitle, rows, cols, matrix, isLoading, onToggle, rowLabel, colLabel,
}: MatrixPageProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="matrix-loading">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const rowsData = rows ?? [];
  const colsData = cols ?? [];

  return (
    <div className="space-y-5" data-testid={`matrix-${title}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-r border-b px-3 py-2 text-left font-semibold text-muted-foreground sticky left-0 bg-muted/50 z-10 min-w-[160px]">
                {rowLabel} / {colLabel}
              </th>
              {colsData.map((col) => (
                <th key={col.id} className="border-r border-b px-2 py-2 text-center font-semibold min-w-[60px]" data-testid={`col-header-${col.id}`}>
                  <div className="writing-mode-vertical" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {col.kode}
                  </div>
                </th>
              ))}
              <th className="border-b px-2 py-2 text-center font-medium text-muted-foreground min-w-[48px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {rowsData.map((row) => {
              const rowData = matrix?.[row.id] ?? {};
              const total = colsData.filter(col => rowData[col.id]).length;
              const isEmpty = total === 0;
              return (
                <tr key={row.id} className={`border-b hover:bg-muted/20 transition-colors ${isEmpty ? "bg-red-50/50" : ""}`} data-testid={`matrix-row-${row.id}`}>
                  <td className={`border-r px-3 py-2 sticky left-0 z-10 font-medium ${isEmpty ? "bg-red-50" : "bg-card"}`}>
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">{row.kode}</span>
                      {row.nama && <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{row.nama}</span>}
                    </div>
                  </td>
                  {colsData.map((col) => {
                    const active = rowData[col.id] ?? false;
                    return (
                      <td key={col.id} className="border-r px-1 py-1 text-center" data-testid={`cell-${row.id}-${col.id}`}>
                        <button
                          onClick={() => onToggle(row.id, col.id)}
                          className={`w-9 h-9 rounded transition-all text-sm font-bold border ${
                            active
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background border-border hover:bg-muted text-muted-foreground"
                          }`}
                          data-testid={`toggle-${row.id}-${col.id}`}
                        >
                          {active ? "✓" : ""}
                        </button>
                      </td>
                    );
                  })}
                  <td className={`px-2 py-2 text-center font-semibold ${isEmpty ? "text-red-500" : "text-primary"}`}>
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">Baris berwarna merah = belum ada pemetaan. Klik sel untuk toggle.</p>
    </div>
  );
}
