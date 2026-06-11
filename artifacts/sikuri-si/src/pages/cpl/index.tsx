import { useState } from "react";
import { useListCpl, useCreateCpl, useUpdateCpl, useDeleteCpl, getListCplQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
      await invalidate();
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
      await invalidate();
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

      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scroll-smooth scrollbar-custom">
          <Table className="w-full min-w-[800px] table-fixed">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[110px] font-semibold text-foreground/80 pl-4 py-3">Kode CPL</TableHead>
                <TableHead className="font-semibold text-foreground/80 py-3">Deskripsi</TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground/80 py-3">Pemetaan</TableHead>
                <TableHead className="w-[110px] font-semibold text-foreground/80 text-right pr-4 py-3">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-4 py-3.5"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="py-3.5"><Skeleton className="h-5 w-[85%]" /></TableCell>
                    <TableCell className="py-3.5"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="pr-4 py-3.5 text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (cpls ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Tidak ada data CPL Prodi.
                  </TableCell>
                </TableRow>
              ) : (
                (cpls ?? []).map((cpl) => (
                  <TableRow key={cpl.id} className="hover:bg-muted/10 transition-colors" data-testid={`row-cpl-${cpl.id}`}>
                    <TableCell className="pl-4 py-3.5 align-top">
                      <span className="inline-flex items-center justify-center font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-xs tracking-wider border border-primary/15">
                        {cpl.kode}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 align-top whitespace-normal break-words leading-relaxed text-sm font-normal text-foreground/90 pr-6">
                      {cpl.deskripsi}
                    </TableCell>
                    <TableCell className="py-3.5 align-top">
                      <div className="flex gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-xs font-medium border-border bg-background px-2 py-0.5">
                          {cpl.jumlahMk} MK
                        </Badge>
                        <Badge variant="outline" className="text-xs font-medium border-border bg-background px-2 py-0.5">
                          {cpl.jumlahCpmk} CPMK
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4 py-3.5 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary border-border/80 shadow-2xs transition-all duration-200"
                          onClick={() => openEdit(cpl)}
                          title="Edit CPL"
                          data-testid={`button-edit-cpl-${cpl.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 shadow-2xs transition-all duration-200"
                          onClick={() => handleDelete(cpl)}
                          title="Hapus CPL"
                          data-testid={`button-delete-cpl-${cpl.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
