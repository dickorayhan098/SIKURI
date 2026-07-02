import { useParams, Link } from "wouter";
import { useState } from "react";
import { useGetRps, useUpdateRps, useUpdateRpsStatus, useUpsertRpsPertemuan, useListSubCpmk, getGetRpsQueryKey, getListSubCpmkQueryKey } from "@workspace/api-client-react";
import type { RpsStatusUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  LENGKAP: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  REVIEW: "bg-blue-100 text-blue-800",
  REVISI: "bg-red-100 text-red-800",
};

type Pertemuan = {
  pertemuanKe: number;
  subCpmkId?: number | null;
  materi?: string | null;
  metodePembelajaran?: string | null;
  aktivitas?: string | null;
  media?: string | null;
  waktuMenit?: number | null;
  referensi?: string | null;
  indikator?: string | null;
  bobotNilai?: number | null;
};

function initPertemuans(): Pertemuan[] {
  return Array.from({ length: 16 }, (_, i) => ({ pertemuanKe: i + 1, materi: null, metodePembelajaran: null, aktivitas: null, media: null, waktuMenit: 100, referensi: null, indikator: null, bobotNilai: null, subCpmkId: null }));
}

export default function RpsDetail() {
  const { id } = useParams<{ id: string }>();
  const rpsId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: rps, isLoading } = useGetRps(rpsId, { query: { enabled: !!rpsId, queryKey: getGetRpsQueryKey(rpsId) } });
  const { data: subCpmks } = useListSubCpmk(undefined, { query: { queryKey: getListSubCpmkQueryKey() } });
  const updateMutation = useUpdateRps();
  const statusMutation = useUpdateRpsStatus();
  const pertemuanMutation = useUpsertRpsPertemuan();

  const [pertemuans, setPertemuans] = useState<Pertemuan[] | null>(null);
  const [headerForm, setHeaderForm] = useState<Record<string, string> | null>(null);

  const effectivePertemuans = pertemuans ?? (rps?.pertemuans?.length ? rps.pertemuans.map(p => ({ pertemuanKe: p.pertemuanKe, subCpmkId: p.subCpmkId, materi: p.materi, metodePembelajaran: p.metodePembelajaran, aktivitas: p.aktivitas, media: p.media, waktuMenit: p.waktuMenit, referensi: p.referensi, indikator: p.indikator, bobotNilai: p.bobotNilai })) : initPertemuans());

  const header = headerForm ?? {
    kodeDokumen: rps?.kodeDokumen || (rps?.mkKode ? `RPS/${rps.mkKode}` : ""),
    tanggalPenyusunan: rps?.tanggalPenyusunan ?? "",
    dosenPengembang: rps?.dosenPengembang || (rps as any)?.mkDosenPengampu || "",
    koordinatorBk: rps?.koordinatorBk ?? "",
    kaprodi: rps?.kaprodi ?? "",
  };

  const setCell = (idx: number, field: keyof Pertemuan, value: unknown) => {
    setPertemuans((prev) => {
      const base = prev ?? effectivePertemuans;
      const next = [...base];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveHeader = async () => {
    try {
      await updateMutation.mutateAsync({ id: rpsId, data: header as Record<string, string> });
      qc.invalidateQueries({ queryKey: getGetRpsQueryKey(rpsId) });
      toast({ title: "Header RPS disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan header", variant: "destructive" });
    }
  };

  const handleSavePertemuan = async () => {
    try {
      await pertemuanMutation.mutateAsync({ id: rpsId, data: { pertemuans: effectivePertemuans } });
      qc.invalidateQueries({ queryKey: getGetRpsQueryKey(rpsId) });
      toast({ title: "Pertemuan berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan pertemuan", variant: "destructive" });
    }
  };

  const handleChangeStatus = async (status: string) => {
    try {
      await statusMutation.mutateAsync({ id: rpsId, data: { status: status as RpsStatusUpdateStatus } });
      qc.invalidateQueries({ queryKey: getGetRpsQueryKey(rpsId) });
      toast({ title: `Status RPS diubah ke ${status}` });
    } catch {
      toast({ title: "Gagal mengubah status", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div>;
  if (!rps) return <div className="text-center py-20 text-muted-foreground">RPS tidak ditemukan</div>;

  const mkSubCpmks = (subCpmks ?? []).filter(s => s.mkId === rps.mkId);

  return (
    <div className="space-y-6" data-testid="page-rps-detail">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rps"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{rps.mkNama ?? "RPS"}</h1>
            <p className="text-sm text-muted-foreground">{rps.mkKode} — Semester {rps.mkSemester}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[rps.status] ?? "bg-gray-100 text-gray-700"}`}>{rps.status}</span>
          <Select onValueChange={handleChangeStatus} value="">
            <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-status-rps">
              <SelectValue placeholder="Ubah status..." />
            </SelectTrigger>
            <SelectContent>
              {["DRAFT", "REVIEW", "LENGKAP", "REVISI"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Informasi Dokumen</CardTitle>
            <Button size="sm" onClick={handleSaveHeader} disabled={updateMutation.isPending} data-testid="button-save-header">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Header"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: "kodeDokumen", label: "Kode Dokumen" },
              { key: "tanggalPenyusunan", label: "Tanggal Penyusunan" },
              { key: "dosenPengembang", label: "Dosen Pengampu" },
              { key: "koordinatorBk", label: "Koordinator BK" },
              { key: "kaprodi", label: "Kaprodi" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Input
                  type={key === "tanggalPenyusunan" ? "date" : "text"}
                  value={header[key] ?? ""}
                  onChange={(e) => setHeaderForm({ ...header, [key]: e.target.value })}
                  className="h-8 text-sm"
                  data-testid={`input-rps-${key}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pertemuan */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Rencana Pertemuan (16 Pertemuan)</CardTitle>
            <Button size="sm" onClick={handleSavePertemuan} disabled={pertemuanMutation.isPending} data-testid="button-save-pertemuan">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {pertemuanMutation.isPending ? "Menyimpan..." : "Simpan Pertemuan"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-2 py-2 text-center font-medium w-10 border-r">Ke</th>
                  <th className="px-2 py-2 text-left font-medium w-32 border-r">Sub-CPMK</th>
                  <th className="px-2 py-2 text-left font-medium min-w-[180px] border-r">Materi</th>
                  <th className="px-2 py-2 text-left font-medium w-32 border-r">Metode</th>
                  <th className="px-2 py-2 text-left font-medium w-28 border-r">Aktivitas</th>
                  <th className="px-2 py-2 text-left font-medium w-24 border-r">Media</th>
                  <th className="px-2 py-2 text-center font-medium w-16 border-r">Waktu</th>
                  <th className="px-2 py-2 text-left font-medium w-28 border-r">Indikator</th>
                  <th className="px-2 py-2 text-center font-medium w-14">Bobot</th>
                </tr>
              </thead>
              <tbody>
                {effectivePertemuans.map((p, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/20" data-testid={`row-pertemuan-${p.pertemuanKe}`}>
                    <td className="px-2 py-1.5 text-center font-semibold border-r">{p.pertemuanKe}</td>
                    <td className="px-1 py-1.5 border-r">
                      <Select value={p.subCpmkId ? String(p.subCpmkId) : "__none"} onValueChange={(v) => setCell(idx, "subCpmkId", v === "__none" ? null : Number(v))}>
                        <SelectTrigger className="h-7 text-xs w-full" data-testid={`select-subcpmk-${p.pertemuanKe}`}>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">—</SelectItem>
                          {mkSubCpmks.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.kode}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1.5 border-r">
                      <Textarea value={p.materi ?? ""} onChange={(e) => setCell(idx, "materi", e.target.value || null)} className="h-8 min-h-0 text-xs resize-none" rows={1} data-testid={`input-materi-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 border-r">
                      <Input value={p.metodePembelajaran ?? ""} onChange={(e) => setCell(idx, "metodePembelajaran", e.target.value || null)} className="h-7 text-xs" data-testid={`input-metode-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 border-r">
                      <Input value={p.aktivitas ?? ""} onChange={(e) => setCell(idx, "aktivitas", e.target.value || null)} className="h-7 text-xs" data-testid={`input-aktivitas-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 border-r">
                      <Input value={p.media ?? ""} onChange={(e) => setCell(idx, "media", e.target.value || null)} className="h-7 text-xs" data-testid={`input-media-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 text-center border-r">
                      <Input type="number" value={p.waktuMenit ?? ""} onChange={(e) => setCell(idx, "waktuMenit", e.target.value ? Number(e.target.value) : null)} className="h-7 text-xs text-center w-14" data-testid={`input-waktu-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 border-r">
                      <Input value={p.indikator ?? ""} onChange={(e) => setCell(idx, "indikator", e.target.value || null)} className="h-7 text-xs" data-testid={`input-indikator-${p.pertemuanKe}`} />
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <Input type="number" value={p.bobotNilai ?? ""} onChange={(e) => setCell(idx, "bobotNilai", e.target.value ? Number(e.target.value) : null)} className="h-7 text-xs text-center w-12" data-testid={`input-bobot-${p.pertemuanKe}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
