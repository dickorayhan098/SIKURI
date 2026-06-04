import { useGetPemetaanBkMk, useTogglePemetaanBkMk, getGetPemetaanBkMkQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MatrixPage } from "./MatrixPage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PemetaanBkMk() {
  const { data, isLoading } = useGetPemetaanBkMk();
  const toggleMutation = useTogglePemetaanBkMk();
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
      qc.invalidateQueries({ queryKey: getGetPemetaanBkMkQueryKey() });
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
      title="Pemetaan Bahan Kajian × Mata Kuliah"
      subtitle="Matriks hubungan antara Bahan Kajian dan Mata Kuliah"
      rows={data?.mataKuliahs?.map(mk => ({ id: mk.id, kode: mk.kode, nama: mk.nama }))}
      cols={data?.bahanKajians?.map(bk => ({ id: bk.id, kode: bk.kode, nama: bk.nama }))}
      matrix={matrix}
      isLoading={isLoading}
      onToggle={handleToggle}
      rowLabel="Mata Kuliah"
      colLabel="Bahan Kajian"
    />
  );
}
