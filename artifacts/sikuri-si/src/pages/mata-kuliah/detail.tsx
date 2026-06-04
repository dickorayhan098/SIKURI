import { useParams, Link } from "wouter";
import { useGetMataKuliah, useListCpl, useListCpmk } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText } from "lucide-react";

const TIPE_COLORS: Record<string, string> = {
  WAJIB: "bg-blue-100 text-blue-800", PILIHAN: "bg-green-100 text-green-800",
  MKDK: "bg-orange-100 text-orange-800", MKWK: "bg-purple-100 text-purple-800", CAPSTONE: "bg-red-100 text-red-800",
};

export default function MataKuliahDetail() {
  const { id } = useParams<{ id: string }>();
  const mkId = Number(id);

  const { data: mk, isLoading: mkLoading } = useGetMataKuliah(mkId);
  const { data: cpls } = useListCpl();
  const { data: cpmks } = useListCpmk();

  if (mkLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  );

  if (!mk) return <div className="text-center py-20 text-muted-foreground">Mata kuliah tidak ditemukan</div>;

  return (
    <div className="space-y-6" data-testid="page-mk-detail">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/mata-kuliah"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{mk.nama}</h1>
          <p className="text-sm text-muted-foreground">{mk.kode} — Semester {mk.semester} — {mk.sks} SKS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Umum</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Kode", value: mk.kode },
              { label: "Nama", value: mk.nama },
              { label: "SKS", value: mk.sks },
              { label: "Semester", value: mk.semester },
              { label: "Tipe", value: <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPE_COLORS[mk.tipe] ?? ""}`}>{mk.tipe}</span> },
              { label: "Dosen Pengampu", value: mk.dosenPengampu ?? "-" },
              { label: "Status Aktif", value: mk.isAktif ? "Aktif" : "Nonaktif" },
              { label: "MBKM", value: mk.mbkm ? "Ya" : "Tidak" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">CPL Terkait</CardTitle></CardHeader>
            <CardContent>
              {cpls && cpls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cpls.map((cpl) => (
                    <Badge key={cpl.id} variant="outline" className="text-xs" data-testid={`badge-cpl-${cpl.id}`}>{cpl.kode}</Badge>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Belum ada CPL yang dipetakan</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">CPMK Terkait</CardTitle></CardHeader>
            <CardContent>
              {cpmks && cpmks.length > 0 ? (
                <div className="space-y-2">
                  {cpmks.filter(c => c.cplKode).map((cpmk) => (
                    <div key={cpmk.id} className="flex items-start gap-2 text-sm" data-testid={`item-cpmk-${cpmk.id}`}>
                      <Badge variant="secondary" className="text-xs shrink-0">{cpmk.kode}</Badge>
                      <span className="text-muted-foreground">{cpmk.deskripsi}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Belum ada CPMK</p>}
            </CardContent>
          </Card>

          {mk.statusRps && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/rps">
                <FileText className="h-4 w-4 mr-2" />
                Lihat RPS ({mk.statusRps})
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
