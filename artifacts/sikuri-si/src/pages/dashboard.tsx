import { useGetDashboardStats, useGetDashboardSksPerSemester, useGetDashboardKelengkapan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Target, CheckSquare, GraduationCap, FileText, CheckCircle } from "lucide-react";

function StatCard({ title, value, icon: Icon, color }: { title: string; value?: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {value !== undefined ? (
              <p className="text-3xl font-bold mt-1">{value}</p>
            ) : (
              <Skeleton className="h-9 w-16 mt-1" />
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KelengkapanItem({ label, value, total }: { label: string; value?: number; total?: number }) {
  const pct = total && total > 0 ? Math.round(((value ?? 0) / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value ?? "—"}/{total ?? "—"} ({pct}%)</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: sksData } = useGetDashboardSksPerSemester();
  const { data: kelengkapan } = useGetDashboardKelengkapan();

  const chartData = sksData?.map((s) => ({
    name: `Smt ${s.semester}`,
    sks: s.totalSks,
    mk: s.jumlahMk,
  })) ?? [];

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Ringkasan kurikulum Program Studi S1 Sistem Informasi</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Mata Kuliah" value={stats?.totalMataKuliah} icon={BookOpen} color="bg-blue-600" />
        <StatCard title="CPL Prodi" value={stats?.totalCpl} icon={Target} color="bg-indigo-600" />
        <StatCard title="CPMK" value={stats?.totalCpmk} icon={CheckSquare} color="bg-violet-600" />
        <StatCard title="Total SKS" value={stats?.totalSks} icon={GraduationCap} color="bg-sky-600" />
        <StatCard title="Dokumen RPS" value={stats?.totalRps} icon={FileText} color="bg-cyan-600" />
        <StatCard title="RPS Lengkap" value={stats?.rpsLengkap} icon={CheckCircle} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SKS per Semester Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribusi SKS per Semester</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                    formatter={(v, n) => [v, n === "sks" ? "Total SKS" : "Jumlah MK"]}
                  />
                  <Bar dataKey="sks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mk" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kelengkapan Dokumen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Kelengkapan Dokumen Kurikulum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <KelengkapanItem label="RPS Tersusun" value={kelengkapan?.rpsTersusun} total={kelengkapan?.rpsTersusunTotal} />
            <KelengkapanItem label="Pemetaan CPL-MK" value={kelengkapan?.pemetaanCplMk} total={kelengkapan?.pemetaanCplMkTotal} />
            <KelengkapanItem label="CPMK Terdefinisi" value={kelengkapan?.cpmkTerdefinisi} total={kelengkapan?.cpmkTerdefinisiTotal} />
            <KelengkapanItem label="Sub-CPMK Terisi" value={kelengkapan?.subCpmkTerisi} total={kelengkapan?.subCpmkTerisiTotal} />
            <KelengkapanItem label="Bobot Penilaian" value={kelengkapan?.bobotPenilaian} total={kelengkapan?.bobotPenilaianTotal} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
