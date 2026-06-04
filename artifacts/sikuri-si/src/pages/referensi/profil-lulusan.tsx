import { useState } from "react";
import { useListProfilLulusan, useCreateProfilLulusan, useUpdateProfilLulusan, useDeleteProfilLulusan, getListProfilLulusanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import type { ProfilLulusan } from "@workspace/api-client-react";
const EMPTY = { kode: "", deskripsi: "", tipe: "", referensi: "" };

export default function ProfilLulusanPage() {
  const [editItem, setEditItem] = useState<ProfilLulusan | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListProfilLulusan();
  const createMut = useCreateProfilLulusan();
  const updateMut = useUpdateProfilLulusan();
  const deleteMut = useDeleteProfilLulusan();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListProfilLulusanQueryKey() });

  const handleSave = async () => {
    try {
      const payload = { kode: form.kode, deskripsi: form.deskripsi, tipe: form.tipe || undefined, referensi: form.referensi || undefined };
      if (isCreate) { await createMut.mutateAsync({ data: payload }); toast({ title: "Profil lulusan ditambahkan" }); }
      else if (editItem) { await updateMut.mutateAsync({ id: editItem.id, data: payload }); toast({ title: "Profil lulusan diperbarui" }); }
      invalidate(); setEditItem(null); setIsCreate(false);
    } catch { toast({ title: "Gagal menyimpan", variant: "destructive" }); }
  };

  const handleDelete = async (pl: ProfilLulusan) => {
    if (!confirm(`Hapus "${pl.kode}"?`)) return;
    try { await deleteMut.mutateAsync({ id: pl.id }); toast({ title: "Dihapus" }); invalidate(); }
    catch { toast({ title: "Gagal menghapus", variant: "destructive" }); }
  };

  return (
    <div className="space-y-5" data-testid="page-profil-lulusan">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Profil Lulusan</h1><p className="text-sm text-muted-foreground">Referensi profil lulusan program studi</p></div>
        <Button onClick={() => { setForm(EMPTY); setIsCreate(true); setEditItem(null); }} data-testid="button-add-pl"><Plus className="h-4 w-4 mr-2" />Tambah</Button>
      </div>
      <div className="grid gap-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />) : (data ?? []).map((pl) => (
          <Card key={pl.id} data-testid={`card-pl-${pl.id}`}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <span className="font-bold text-indigo-700 text-sm">{pl.kode}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{pl.deskripsi}</p>
                  {pl.tipe && <p className="text-xs text-muted-foreground mt-1">Tipe: {pl.tipe}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ kode: pl.kode, deskripsi: pl.deskripsi, tipe: pl.tipe ?? "", referensi: pl.referensi ?? "" }); setEditItem(pl); setIsCreate(false); }} data-testid={`button-edit-pl-${pl.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(pl)} data-testid={`button-delete-pl-${pl.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isCreate || !!editItem} onOpenChange={() => { setEditItem(null); setIsCreate(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isCreate ? "Tambah" : "Edit"} Profil Lulusan</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="PL1" data-testid="input-kode-pl" /></div>
              <div className="space-y-1.5"><Label>Tipe</Label><Input value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} placeholder="Profesional / Akademik" data-testid="input-tipe-pl" /></div>
            </div>
            <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} data-testid="input-deskripsi-pl" /></div>
            <div className="space-y-1.5"><Label>Referensi</Label><Input value={form.referensi} onChange={(e) => setForm({ ...form, referensi: e.target.value })} data-testid="input-referensi-pl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setIsCreate(false); }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-pl">{createMut.isPending || updateMut.isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
