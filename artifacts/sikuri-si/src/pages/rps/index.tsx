import { useState } from "react";
import { useListRps, useListMataKuliah, useCreateRps, useDeleteRps, getListRpsQueryKey, getListMataKuliahQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  LENGKAP: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
  REVISI: "bg-red-100 text-red-800 border-red-200",
  BELUM: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function RpsPage() {
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState({ mkId: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: rpsList, isLoading } = useListRps();
  const { data: mataKuliahs } = useListMataKuliah(undefined, { query: { queryKey: getListMataKuliahQueryKey() } });
  const createMutation = useCreateRps();
  const deleteMutation = useDeleteRps();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListRpsQueryKey() });

  const filtered = (rpsList ?? []).filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSmt = filterSemester === "all" || String(r.mkSemester) === filterSemester;
    return matchStatus && matchSmt;
  });

  const handleCreate = async () => {
    if (!form.mkId) { toast({ title: "Pilih mata kuliah", variant: "destructive" }); return; }
    try {
      await createMutation.mutateAsync({ data: { mkId: Number(form.mkId) } });
      toast({ title: "RPS berhasil dibuat" });
      invalidate();
      setIsCreate(false);
    } catch {
      toast({ title: "Gagal membuat RPS", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus RPS untuk "${nama}"?`)) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "RPS dihapus" });
      invalidate();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5" data-testid="page-rps">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rencana Pembelajaran Semester</h1>
          <p className="text-sm text-muted-foreground">Kelola dokumen RPS semua mata kuliah</p>
        </div>
        <Button onClick={() => setIsCreate(true)} data-testid="button-add-rps">
          <Plus className="h-4 w-4 mr-2" /> Buat RPS
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {["DRAFT","REVIEW","LENGKAP","REVISI"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSemester} onValueChange={setFilterSemester}>
          <SelectTrigger className="w-40" data-testid="select-filter-semester">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Semester</SelectItem>
            {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kode MK</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Mata Kuliah</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Smt</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dosen Pengembang</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Belum ada RPS</td></tr>
                ) : filtered.map((rps) => (
                  <tr key={rps.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`row-rps-${rps.id}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{rps.mkKode ?? "-"}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/rps/${rps.id}`} className="hover:underline">{rps.mkNama ?? "-"}</Link>
                    </td>
                    <td className="px-4 py-3 text-center">{rps.mkSemester ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[rps.status] ?? STATUS_COLORS.BELUM}`}>{rps.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{rps.dosenPengembang ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild data-testid={`link-rps-${rps.id}`}>
                          <Link href={`/rps/${rps.id}`}><FileText className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(rps.id, rps.mkNama ?? "")} data-testid={`button-delete-rps-${rps.id}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreate} onOpenChange={setIsCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Buat RPS Baru</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1.5">
              <Label>Pilih Mata Kuliah</Label>
              <Select value={form.mkId} onValueChange={(v) => setForm({ mkId: v })}>
                <SelectTrigger data-testid="select-mk-rps"><SelectValue placeholder="Pilih mata kuliah..." /></SelectTrigger>
                <SelectContent>
                  {(mataKuliahs ?? []).map(mk => <SelectItem key={mk.id} value={String(mk.id)}>{mk.kode} — {mk.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreate(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-rps">
              {createMutation.isPending ? "Membuat..." : "Buat RPS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
