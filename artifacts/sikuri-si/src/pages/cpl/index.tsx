import { useState } from "react";
import { useListCpl, useCreateCpl, useUpdateCpl, useDeleteCpl, getListCplQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import type { CplProdi } from "@workspace/api-client-react";
const EMPTY_FORM = { kode: "", deskripsi: "" };

export default function CplPage() {
  const [editItem, setEditItem] = useState<CplProdi | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: cpls, isLoading } = useListCpl();
  const createMutation = useCreateCpl();
  const updateMutation = useUpdateCpl();
  const deleteMutation = useDeleteCpl();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListCplQueryKey() });

  const openCreate = () => { setForm(EMPTY_FORM); setIsCreate(true); setEditItem(null); };
  const openEdit = (cpl: CplProdi) => { setForm({ kode: cpl.kode, deskripsi: cpl.deskripsi }); setEditItem(cpl); setIsCreate(false); };
  const closeModal = () => { setEditItem(null); setIsCreate(false); };

  const handleSave = async () => {
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ data: form });
        toast({ title: "CPL berhasil ditambahkan" });
      } else if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: form });
        toast({ title: "CPL berhasil diperbarui" });
      }
      invalidate();
      closeModal();
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (cpl: CplProdi) => {
    if (!confirm(`Hapus CPL "${cpl.kode}"?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: cpl.id });
      toast({ title: "CPL dihapus" });
      invalidate();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5" data-testid="page-cpl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CPL Prodi</h1>
          <p className="text-sm text-muted-foreground">Capaian Pembelajaran Lulusan Program Studi</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-cpl">
          <Plus className="h-4 w-4 mr-2" /> Tambah CPL
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
        ) : (cpls ?? []).map((cpl) => (
          <Card key={cpl.id} data-testid={`card-cpl-${cpl.id}`}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary text-sm">{cpl.kode}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{cpl.deskripsi}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{cpl.jumlahMk} MK</Badge>
                    <Badge variant="outline" className="text-xs">{cpl.jumlahCpmk} CPMK</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cpl)} data-testid={`button-edit-cpl-${cpl.id}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cpl)} data-testid={`button-delete-cpl-${cpl.id}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreate || !!editItem} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreate ? "Tambah CPL" : "Edit CPL"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Kode CPL</Label>
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="CPL01" data-testid="input-kode-cpl" />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Kemampuan yang harus dimiliki lulusan..." rows={4} data-testid="input-deskripsi-cpl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-cpl">
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
