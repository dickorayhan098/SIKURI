import { useState } from "react";
import { useListCpmk, useListCpl, useCreateCpmk, useUpdateCpmk, useDeleteCpmk, getListCpmkQueryKey, getListCplQueryKey } from "@workspace/api-client-react";
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

import type { Cpmk } from "@workspace/api-client-react";
const EMPTY_FORM = { kode: "", cplProdiId: 0, deskripsi: "" };

export default function CpmkPage() {
  const [editItem, setEditItem] = useState<Cpmk | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: cpmks, isLoading } = useListCpmk();
  const { data: cpls } = useListCpl();
  const createMutation = useCreateCpmk();
  const updateMutation = useUpdateCpmk();
  const deleteMutation = useDeleteCpmk();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListCpmkQueryKey() });

  const grouped = (cpmks ?? []).reduce<Record<string, Cpmk[]>>((acc, c) => {
    const key = c.cplKode ?? "Tanpa CPL";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!form.cplProdiId) { toast({ title: "Pilih CPL terlebih dahulu", variant: "destructive" }); return; }
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ data: form });
        toast({ title: "CPMK berhasil ditambahkan" });
      } else if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: form });
        toast({ title: "CPMK berhasil diperbarui" });
      }
      await invalidate();
      setEditItem(null); setIsCreate(false);
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (c: Cpmk) => {
    if (!confirm(`Hapus CPMK "${c.kode}"?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: c.id });
      toast({ title: "CPMK dihapus" });
      await invalidate();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5" data-testid="page-cpmk">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CPMK</h1>
          <p className="text-sm text-muted-foreground">Capaian Pembelajaran Mata Kuliah</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setIsCreate(true); setEditItem(null); }} data-testid="button-add-cpmk">
          <Plus className="h-4 w-4 mr-2" /> Tambah CPMK
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : Object.entries(grouped).map(([cplKode, items]) => (
        <Card key={cplKode}>
          <CardHeader className="py-3 px-4 bg-muted/30 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Badge className="text-xs">{cplKode}</Badge>
              <span className="text-muted-foreground font-normal">{cpls?.find(c => c.kode === cplKode)?.deskripsi?.slice(0, 80) ?? ""}{items.length > 0 ? "" : ""}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20" data-testid={`row-cpmk-${c.id}`}>
                    <td className="px-4 py-3 w-24">
                      <Badge variant="outline" className="text-xs font-mono">{c.kode}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.deskripsi}</td>
                    <td className="px-4 py-3 w-20">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm({ kode: c.kode, cplProdiId: c.cplProdiId, deskripsi: c.deskripsi }); setEditItem(c); setIsCreate(false); }} data-testid={`button-edit-cpmk-${c.id}`}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(c)} data-testid={`button-delete-cpmk-${c.id}`}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isCreate || !!editItem} onOpenChange={() => { setEditItem(null); setIsCreate(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isCreate ? "Tambah CPMK" : "Edit CPMK"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>CPL Induk</Label>
              <Select value={form.cplProdiId ? String(form.cplProdiId) : undefined} onValueChange={(v) => setForm({ ...form, cplProdiId: Number(v) })}>
                <SelectTrigger data-testid="select-cpl-cpmk"><SelectValue placeholder="Pilih CPL..." /></SelectTrigger>
                <SelectContent>{(cpls ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.kode} — {c.deskripsi?.slice(0, 50) ?? ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kode CPMK</Label>
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="CPMK01" data-testid="input-kode-cpmk" />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} data-testid="input-deskripsi-cpmk" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setIsCreate(false); }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-cpmk">
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
