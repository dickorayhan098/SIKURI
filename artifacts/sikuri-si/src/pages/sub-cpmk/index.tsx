import { useState } from "react";
import { useListSubCpmk, useListCpmk, useListMataKuliah, useCreateSubCpmk, useUpdateSubCpmk, useDeleteSubCpmk, getListSubCpmkQueryKey, getListCpmkQueryKey, getListMataKuliahQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import type { SubCpmk } from "@workspace/api-client-react";
const EMPTY_FORM = { kode: "", cpmkId: 0, mkId: 0, deskripsi: "", urutan: 1 };

export default function SubCpmkPage() {
  const [editItem, setEditItem] = useState<SubCpmk | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: subCpmks, isLoading } = useListSubCpmk();
  const { data: cpmks } = useListCpmk();
  const { data: mataKuliahs } = useListMataKuliah();
  const createMutation = useCreateSubCpmk();
  const updateMutation = useUpdateSubCpmk();
  const deleteMutation = useDeleteSubCpmk();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListSubCpmkQueryKey() });

  const grouped = (subCpmks ?? []).reduce<Record<number, SubCpmk[]>>((acc, s) => {
    if (!acc[s.mkId]) acc[s.mkId] = [];
    acc[s.mkId].push(s);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!form.cpmkId || !form.mkId) { toast({ title: "Pilih CPMK dan Mata Kuliah", variant: "destructive" }); return; }
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ data: form });
        toast({ title: "Sub-CPMK berhasil ditambahkan" });
      } else if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: { kode: form.kode, deskripsi: form.deskripsi, urutan: form.urutan } });
        toast({ title: "Sub-CPMK berhasil diperbarui" });
      }
      await invalidate();
      setEditItem(null); setIsCreate(false);
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (s: SubCpmk) => {
    if (!confirm(`Hapus Sub-CPMK "${s.kode}"?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: s.id });
      toast({ title: "Sub-CPMK dihapus" });
      await invalidate();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5" data-testid="page-sub-cpmk">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub-CPMK</h1>
          <p className="text-sm text-muted-foreground">Sub Capaian Pembelajaran Mata Kuliah</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setIsCreate(true); setEditItem(null); }} data-testid="button-add-sub-cpmk">
          <Plus className="h-4 w-4 mr-2" /> Tambah
        </Button>
      </div>

      {isLoading ? <Skeleton className="h-40 w-full" /> : Object.entries(grouped).map(([mkId, items]) => {
        const mk = mataKuliahs?.find(m => m.id === Number(mkId));
        return (
          <Card key={mkId}>
            <CardHeader className="py-3 px-4 bg-muted/30 border-b">
              <CardTitle className="text-sm font-semibold">
                <span className="font-mono text-primary mr-2">{mk?.kode}</span>{mk?.nama}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {items.sort((a, b) => a.urutan - b.urutan).map((s) => {
                    const cpmk = cpmks?.find(c => c.id === s.cpmkId);
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20" data-testid={`row-sub-cpmk-${s.id}`}>
                        <td className="px-4 py-2.5 w-8 text-muted-foreground">{s.urutan}</td>
                        <td className="px-4 py-2.5 w-24"><Badge variant="outline" className="text-xs">{s.kode}</Badge></td>
                        <td className="px-4 py-2.5 text-muted-foreground">{s.deskripsi}</td>
                        <td className="px-4 py-2.5 w-24"><Badge variant="secondary" className="text-xs">{cpmk?.kode ?? s.cpmkId}</Badge></td>
                        <td className="px-4 py-2.5 w-20">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm({ kode: s.kode, cpmkId: s.cpmkId, mkId: s.mkId, deskripsi: s.deskripsi, urutan: s.urutan }); setEditItem(s); setIsCreate(false); }} data-testid={`button-edit-sub-cpmk-${s.id}`}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(s)} data-testid={`button-delete-sub-cpmk-${s.id}`}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={isCreate || !!editItem} onOpenChange={() => { setEditItem(null); setIsCreate(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isCreate ? "Tambah Sub-CPMK" : "Edit Sub-CPMK"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mata Kuliah</Label>
                <Select value={form.mkId ? String(form.mkId) : undefined} onValueChange={(v) => setForm({ ...form, mkId: Number(v) })} disabled={!!editItem}>
                  <SelectTrigger data-testid="select-mk-sub-cpmk"><SelectValue placeholder="Pilih MK..." /></SelectTrigger>
                  <SelectContent>{(mataKuliahs ?? []).map(m => <SelectItem key={m.id} value={String(m.id)}>{m.kode} — {m.nama}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>CPMK Induk</Label>
                <Select value={form.cpmkId ? String(form.cpmkId) : undefined} onValueChange={(v) => setForm({ ...form, cpmkId: Number(v) })} disabled={!!editItem}>
                  <SelectTrigger data-testid="select-cpmk-sub-cpmk"><SelectValue placeholder="Pilih CPMK..." /></SelectTrigger>
                  <SelectContent>{(cpmks ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.kode}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kode</Label>
                <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="SUB01" data-testid="input-kode-sub-cpmk" />
              </div>
              <div className="space-y-1.5">
                <Label>Urutan</Label>
                <Input type="number" min={1} value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} data-testid="input-urutan-sub-cpmk" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} data-testid="input-deskripsi-sub-cpmk" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setIsCreate(false); }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-sub-cpmk">
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
