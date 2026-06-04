import { useListCplSndikti } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const KELOMPOK_COLORS: Record<string, string> = {
  "SIKAP": "bg-blue-100 text-blue-800",
  "KETERAMPILAN UMUM": "bg-green-100 text-green-800",
  "KETERAMPILAN KHUSUS": "bg-orange-100 text-orange-800",
  "PENGETAHUAN": "bg-purple-100 text-purple-800",
};

export default function CplSndiktiPage() {
  const { data, isLoading } = useListCplSndikti();

  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, c) => {
    if (!acc[c.kelompok]) acc[c.kelompok] = [];
    acc[c.kelompok]!.push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5" data-testid="page-cpl-sndikti">
      <div>
        <h1 className="text-2xl font-bold">CPL SN-Dikti</h1>
        <p className="text-sm text-muted-foreground">Standar Nasional Pendidikan Tinggi — Capaian Pembelajaran (hanya baca)</p>
      </div>

      {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />) :
        Object.entries(grouped).map(([kelompok, items]) => (
          <Card key={kelompok}>
            <CardHeader className="py-3 px-4 bg-muted/30 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KELOMPOK_COLORS[kelompok] ?? "bg-gray-100 text-gray-700"}`}>{kelompok}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {(items ?? []).map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20" data-testid={`row-sndikti-${c.id}`}>
                      <td className="px-4 py-2.5 w-20">
                        <Badge variant="outline" className="text-xs font-mono">{c.kode}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.deskripsi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
}
