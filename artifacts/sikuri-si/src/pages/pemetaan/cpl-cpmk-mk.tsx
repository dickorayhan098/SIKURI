import { useGetPemetaanCplMkCpmk } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PemetaanCplCpmkMk() {
  const { data, isLoading } = useGetPemetaanCplMkCpmk();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="page-pemetaan-hierarki">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hierarki CPL → CPMK → Mata Kuliah</h1>
        <p className="text-sm text-muted-foreground">Visualisasi hierarki pemetaan capaian pembelajaran</p>
      </div>

      <div className="space-y-4">
        {(data ?? []).map((cpl) => (
          <Card key={cpl.cplId} data-testid={`card-cpl-hierarchy-${cpl.cplId}`}>
            <CardHeader className="py-3 px-4 bg-primary/5 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge className="text-xs bg-primary">{cpl.cplKode}</Badge>
                <span className="text-muted-foreground font-normal">{cpl.cplDeskripsi.slice(0, 100)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {cpl.cpmks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Belum ada CPMK untuk CPL ini</p>
              ) : (
                <div className="space-y-3">
                  {cpl.cpmks.map((cpmk) => (
                    <div key={cpmk.cpmkId} className="pl-4 border-l-2 border-primary/20" data-testid={`cpmk-hierarchy-${cpmk.cpmkId}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="outline" className="text-xs shrink-0">{cpmk.cpmkKode}</Badge>
                        <span className="text-sm text-muted-foreground">{cpmk.cpmkDeskripsi}</span>
                      </div>
                      {cpmk.mataKuliahs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pl-4">
                          {cpmk.mataKuliahs.map((mk) => (
                            <Badge key={mk.id} variant="secondary" className="text-xs" data-testid={`mk-hierarchy-${mk.id}`}>
                              {mk.kode}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground pl-4 italic">Belum dipetakan ke mata kuliah</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
