import { useGetPemetaanCplPl, useTogglePemetaanCplPl, getGetPemetaanCplPlQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MatrixPage } from "./MatrixPage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PemetaanCplPl() {
  const { data, isLoading } = useGetPemetaanCplPl();
  const toggleMutation = useTogglePemetaanCplPl();
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
      await qc.invalidateQueries({ queryKey: getGetPemetaanCplPlQueryKey() });
      setLocalMatrix(null);
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
      title="Pemetaan CPL × Profil Lulusan"
      subtitle="Matriks hubungan antara CPL Prodi dan Profil Lulusan"
      rows={data?.cpls?.map(cpl => ({ id: cpl.id, kode: cpl.kode }))}
      cols={data?.profilLulusans?.map(pl => ({ id: pl.id, kode: pl.kode }))}
      matrix={matrix}
      isLoading={isLoading}
      onToggle={handleToggle}
      rowLabel="CPL"
      colLabel="Profil Lulusan"
    />
  );
}
