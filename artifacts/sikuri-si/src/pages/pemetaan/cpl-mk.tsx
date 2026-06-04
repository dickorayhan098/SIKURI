import { useGetPemetaanCplMk, useTogglePemetaanCplMk, getGetPemetaanCplMkQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MatrixPage } from "./MatrixPage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PemetaanCplMk() {
  const { data, isLoading } = useGetPemetaanCplMk();
  const toggleMutation = useTogglePemetaanCplMk();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [localMatrix, setLocalMatrix] = useState<Record<number, Record<number, boolean>> | null>(null);

  const matrix = localMatrix ?? (data?.matrix as Record<number, Record<number, boolean>> | undefined);

  const handleToggle = async (rowId: number, colId: number) => {
    const current = (matrix?.[rowId]?.[colId]) ?? false;
    setLocalMatrix((prev) => {
      const base = prev ?? (data?.matrix as Record<number, Record<number, boolean>> ?? {});
      return { ...base, [rowId]: { ...(base[rowId] ?? {}), [colId]: !current } };
    });
    try {
      await toggleMutation.mutateAsync({ data: { rowId, colId } });
      qc.invalidateQueries({ queryKey: getGetPemetaanCplMkQueryKey() });
    } catch {
      setLocalMatrix((prev) => {
        const base = prev ?? {};
        return { ...base, [rowId]: { ...(base[rowId] ?? {}), [colId]: current } };
      });
      toast({ title: "Gagal menyimpan pemetaan", variant: "destructive" });
    }
  };

  return (
    <MatrixPage
      title="Pemetaan CPL × Mata Kuliah"
      subtitle="Matriks hubungan antara CPL Prodi dan Mata Kuliah"
      rows={data?.mataKuliahs?.map(mk => ({ id: mk.id, kode: mk.kode, nama: mk.nama }))}
      cols={data?.cpls?.map(cpl => ({ id: cpl.id, kode: cpl.kode }))}
      matrix={matrix}
      isLoading={isLoading}
      onToggle={handleToggle}
      rowLabel="Mata Kuliah"
      colLabel="CPL"
    />
  );
}
