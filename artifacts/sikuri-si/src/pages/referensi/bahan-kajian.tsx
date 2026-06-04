import { useState } from "react";
import { useListBahanKajian, useCreateBahanKajian, useUpdateBahanKajian, useDeleteBahanKajian, getListBahanKajianQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import type { BahanKajian } from "@workspace/api-client-react";
const EMPTY = { kode: "", nama: "" };

export default function BahanKajianPage() {
  const [editItem, setEditItem] = useState<BahanKajian | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListBahanKajian();
  const createMut = useCreateBahanKajian();
  const updateMut = useUpdateBahanKajian();
  const deleteMut = useDeleteBahanKajian();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListBahanKajianQueryKey() });

  const handleSave = async () => {
    try {
      if (isCreate) { await createMut.mutateAsync({ data: form }); toast({ title: "Bahan kajian ditambahkan" }); }
      else if (editItem) { await updateMut.mutateAsync({ id: editItem.id, data: form }); toast({ title: "Bahan kajian diperbarui" }); }
      invalidate(); setEditItem(null); setIsCreate(false);
    } catch { toast({ title: "Gagal menyimpan", variant: "destructive" }); }
  };

  const handleDelete = async (bk: BahanKajian) => {
    if (!confirm(`Hapus "${bk.kode}"?`)) return;
    try { await deleteMut.mutateAsync({ id: bk.id }); toast({ title: "Dihapus" }); invalidate(); }
    catch { toast({ title: "Gagal menghapus", variant: "destructive" }); }
  };

  return (
    <div className="space-y-5" data-testid="page-bahan-kajian">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Bahan Kajian</h1><p className="text-sm text-muted-foreground">Referensi bahan kajian kurikulum</p></div>
        <Button onClick={() => { setForm(EMPTY); setIsCreate(true); setEditItem(null); }} data-testid="button-add-bk"><Plus className="h-4 w-4 mr-2" />Tambah</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Kode</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Bahan Kajian</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">{[1,2,3].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
              )) : (data ?? []).map((bk) => (
                <tr key={bk.id} className="border-b hover:bg-muted/20" data-testid={`row-bk-${bk.id}`}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{bk.kode}</td>
                  <td className="px-4 py-3">{bk.nama}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm({ kode: bk.kode, nama: bk.nama }); setEditItem(bk); setIsCreate(false); }} data-testid={`button-edit-bk-${bk.id}`}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(bk)} data-testid={`button-delete-bk-${bk.id}`}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={isCreate || !!editItem} onOpenChange={() => { setEditItem(null); setIsCreate(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isCreate ? "Tambah" : "Edit"} Bahan Kajian</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="BK01" data-testid="input-kode-bk" /></div>
            <div className="space-y-1.5"><Label>Nama</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Algoritma dan Struktur Data" data-testid="input-nama-bk" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setIsCreate(false); }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-bk">{createMut.isPending || updateMut.isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
