import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import type { User } from "@workspace/api-client-react";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  KAPRODI: "bg-purple-100 text-purple-800",
  DOSEN: "bg-blue-100 text-blue-800",
  OPERATOR: "bg-gray-100 text-gray-700",
};

const EMPTY = { nama: "", email: "", password: "", role: "OPERATOR", isAktif: true };

export default function AdminUsersPage() {
  const [editItem, setEditItem] = useState<User | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();
  const invalidate = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const handleSave = async () => {
    try {
      if (isCreate) {
        await createMut.mutateAsync({ data: { nama: form.nama, email: form.email, password: form.password, role: form.role, isAktif: form.isAktif } });
        toast({ title: "Pengguna ditambahkan" });
      } else if (editItem) {
        await updateMut.mutateAsync({ id: editItem.id, data: { nama: form.nama, email: form.email, role: form.role, isAktif: form.isAktif } });
        toast({ title: "Pengguna diperbarui" });
      }
      invalidate(); setEditItem(null); setIsCreate(false);
    } catch { toast({ title: "Gagal menyimpan", variant: "destructive" }); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Hapus pengguna "${u.nama}"?`)) return;
    try { await deleteMut.mutateAsync({ id: u.id }); toast({ title: "Pengguna dihapus" }); invalidate(); }
    catch { toast({ title: "Gagal menghapus", variant: "destructive" }); }
  };

  return (
    <div className="space-y-5" data-testid="page-admin-users">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Manajemen Pengguna</h1><p className="text-sm text-muted-foreground">Kelola akun pengguna SIKURI SI</p></div>
        <Button onClick={() => { setForm(EMPTY); setIsCreate(true); setEditItem(null); }} data-testid="button-add-user"><Plus className="h-4 w-4 mr-2" />Tambah Pengguna</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Login Terakhir</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">{[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
              )) : (data ?? []).map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/30" data-testid={`row-user-${u.id}`}>
                  <td className="px-4 py-3 font-medium">{u.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] ?? "bg-gray-100"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={u.isAktif ? "default" : "outline"} className="text-xs">{u.isAktif ? "Aktif" : "Nonaktif"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("id-ID") : "Belum pernah"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ nama: u.nama, email: u.email, password: "", role: u.role, isAktif: u.isAktif }); setEditItem(u); setIsCreate(false); }} data-testid={`button-edit-user-${u.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(u)} data-testid={`button-delete-user-${u.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{isCreate ? "Tambah" : "Edit"} Pengguna</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Nama Lengkap</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} data-testid="input-nama-user" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-email-user" /></div>
            {isCreate && <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="input-password-user" /></div>}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger data-testid="select-role-user"><SelectValue /></SelectTrigger>
                <SelectContent>{["ADMIN","KAPRODI","DOSEN","OPERATOR"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isAktif} onCheckedChange={(v) => setForm({ ...form, isAktif: v })} data-testid="switch-aktif-user" />
              <Label>Akun Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setIsCreate(false); }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-user">{createMut.isPending || updateMut.isPending ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
