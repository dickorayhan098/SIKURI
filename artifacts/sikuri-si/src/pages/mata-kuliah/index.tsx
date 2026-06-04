import { useState } from "react";
import { useListMataKuliah, useCreateMataKuliah, useUpdateMataKuliah, useDeleteMataKuliah, getListMataKuliahQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

import type { MataKuliah } from "@workspace/api-client-react";

const TIPE_COLORS: Record<string, string> = {
  WAJIB: "bg-blue-100 text-blue-800",
  PILIHAN: "bg-green-100 text-green-800",
  MKDK: "bg-orange-100 text-orange-800",
  MKWK: "bg-purple-100 text-purple-800",
  CAPSTONE: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  LENGKAP: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  REVIEW: "bg-blue-100 text-blue-800",
  REVISI: "bg-red-100 text-red-800",
};

const EMPTY_FORM = { kode: "", nama: "", sks: 3, semester: 1, tipe: "WAJIB", kelompok: "", dosenPengampu: "", isAktif: true, mbkm: false };

export default function MataKuliahPage() {
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [filterTipe, setFilterTipe] = useState<string>("all");
  const [editItem, setEditItem] = useState<MataKuliah | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: mataKuliahs, isLoading } = useListMataKuliah();
  const createMutation = useCreateMataKuliah();
  const updateMutation = useUpdateMataKuliah();
  const deleteMutation = useDeleteMataKuliah();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListMataKuliahQueryKey() });

  const filtered = (mataKuliahs ?? []).filter((mk) => {
    const matchSearch = !search || mk.nama.toLowerCase().includes(search.toLowerCase()) || mk.kode.toLowerCase().includes(search.toLowerCase());
    const matchSem = filterSemester === "all" || mk.semester === Number(filterSemester);
    const matchTipe = filterTipe === "all" || mk.tipe === filterTipe;
    return matchSearch && matchSem && matchTipe;
  });

  const openCreate = () => { setForm(EMPTY_FORM); setIsCreate(true); setEditItem(null); };
  const openEdit = (mk: MataKuliah) => { setForm({ kode: mk.kode ?? "", nama: mk.nama ?? "", sks: mk.sks ?? 3, semester: mk.semester ?? 1, tipe: mk.tipe ?? "WAJIB", kelompok: mk.kelompok ?? "", dosenPengampu: mk.dosenPengampu ?? "", isAktif: mk.isAktif ?? true, mbkm: mk.mbkm ?? false }); setEditItem(mk); setIsCreate(false); };
  const closeModal = () => { setEditItem(null); setIsCreate(false); };

  const handleSave = async () => {
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ data: { ...form, kelompok: form.kelompok || undefined, dosenPengampu: form.dosenPengampu || undefined } });
        toast({ title: "Mata kuliah berhasil ditambahkan" });
      } else if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: { ...form, kelompok: form.kelompok || undefined, dosenPengampu: form.dosenPengampu || undefined } });
        toast({ title: "Mata kuliah berhasil diperbarui" });
      }
      invalidate();
      closeModal();
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (mk: MataKuliah) => {
    if (!confirm(`Hapus mata kuliah "${mk.nama}"?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: mk.id });
      toast({ title: "Mata kuliah dihapus" });
      invalidate();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5" data-testid="page-mata-kuliah">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mata Kuliah</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar mata kuliah kurikulum</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-mk">
          <Plus className="h-4 w-4 mr-2" /> Tambah MK
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari kode atau nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-mk" />
        </div>
        <Select value={filterSemester} onValueChange={setFilterSemester}>
          <SelectTrigger className="w-36" data-testid="select-semester">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Semester</SelectItem>
            {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterTipe} onValueChange={setFilterTipe}>
          <SelectTrigger className="w-36" data-testid="select-tipe">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            {["WAJIB","PILIHAN","MKDK","MKWK","CAPSTONE"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Mata Kuliah</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-16">SKS</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Smt</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipe</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status RPS</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Tidak ada data</td></tr>
                ) : filtered.map((mk) => (
                  <tr key={mk.id} className="border-b hover:bg-muted/30 transition-colors" data-testid={`row-mk-${mk.id}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{mk.kode}</td>
                    <td className="px-4 py-3">
                      <Link href={`/mata-kuliah/${mk.id}`} className="hover:underline font-medium">{mk.nama}</Link>
                      {mk.mbkm && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">MBKM</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{mk.sks}</td>
                    <td className="px-4 py-3 text-center">{mk.semester}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPE_COLORS[mk.tipe] ?? "bg-gray-100 text-gray-700"}`}>{mk.tipe}</span>
                    </td>
                    <td className="px-4 py-3">
                      {mk.statusRps ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[mk.statusRps] ?? "bg-gray-100 text-gray-700"}`}>{mk.statusRps}</span>
                      ) : <span className="text-xs text-muted-foreground">Belum ada</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8" data-testid={`link-detail-mk-${mk.id}`}>
                          <Link href={`/mata-kuliah/${mk.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mk)} data-testid={`button-edit-mk-${mk.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(mk)} data-testid={`button-delete-mk-${mk.id}`}>
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

      {/* Form Modal */}
      <Dialog open={isCreate || !!editItem} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Tambah Mata Kuliah" : "Edit Mata Kuliah"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kode MK</Label>
                <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="SI101" data-testid="input-kode-mk" />
              </div>
              <div className="space-y-1.5">
                <Label>SKS</Label>
                <Input type="number" min={1} max={6} value={form.sks} onChange={(e) => setForm({ ...form, sks: Number(e.target.value) })} data-testid="input-sks-mk" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Mata Kuliah</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Basis Data" data-testid="input-nama-mk" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: Number(v) })}>
                  <SelectTrigger data-testid="select-semester-form"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipe</Label>
                <Select value={form.tipe} onValueChange={(v) => setForm({ ...form, tipe: v })}>
                  <SelectTrigger data-testid="select-tipe-form"><SelectValue /></SelectTrigger>
                  <SelectContent>{["WAJIB","PILIHAN","MKDK","MKWK","CAPSTONE"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Dosen Pengampu</Label>
              <Input value={form.dosenPengampu} onChange={(e) => setForm({ ...form, dosenPengampu: e.target.value })} placeholder="Nama dosen" data-testid="input-dosen-mk" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-mk">
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
