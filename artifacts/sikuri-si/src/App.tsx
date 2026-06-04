import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MataKuliah from "@/pages/mata-kuliah/index";
import MataKuliahDetail from "@/pages/mata-kuliah/detail";
import Cpl from "@/pages/cpl/index";
import Cpmk from "@/pages/cpmk/index";
import SubCpmk from "@/pages/sub-cpmk/index";
import PemetaanCplMk from "@/pages/pemetaan/cpl-mk";
import PemetaanCplBk from "@/pages/pemetaan/cpl-bk";
import PemetaanBkMk from "@/pages/pemetaan/bk-mk";
import PemetaanCplPl from "@/pages/pemetaan/cpl-pl";
import PemetaanCplCpmkMk from "@/pages/pemetaan/cpl-cpmk-mk";
import Rps from "@/pages/rps/index";
import RpsDetail from "@/pages/rps/detail";
import ProfilLulusan from "@/pages/referensi/profil-lulusan";
import BahanKajian from "@/pages/referensi/bahan-kajian";
import CplSndikti from "@/pages/referensi/cpl-sndikti";
import AdminUsers from "@/pages/admin/users";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/dashboard");
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={RootRedirect} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      
      <Route path="/mata-kuliah"><ProtectedRoute component={MataKuliah} /></Route>
      <Route path="/mata-kuliah/:id"><ProtectedRoute component={MataKuliahDetail} /></Route>

      <Route path="/cpl"><ProtectedRoute component={Cpl} /></Route>
      <Route path="/cpmk"><ProtectedRoute component={Cpmk} /></Route>
      <Route path="/sub-cpmk"><ProtectedRoute component={SubCpmk} /></Route>

      <Route path="/pemetaan/cpl-mk"><ProtectedRoute component={PemetaanCplMk} /></Route>
      <Route path="/pemetaan/cpl-bk"><ProtectedRoute component={PemetaanCplBk} /></Route>
      <Route path="/pemetaan/bk-mk"><ProtectedRoute component={PemetaanBkMk} /></Route>
      <Route path="/pemetaan/cpl-pl"><ProtectedRoute component={PemetaanCplPl} /></Route>
      <Route path="/pemetaan/cpl-cpmk-mk"><ProtectedRoute component={PemetaanCplCpmkMk} /></Route>

      <Route path="/rps"><ProtectedRoute component={Rps} /></Route>
      <Route path="/rps/:id"><ProtectedRoute component={RpsDetail} /></Route>

      <Route path="/referensi/profil-lulusan"><ProtectedRoute component={ProfilLulusan} /></Route>
      <Route path="/referensi/bahan-kajian"><ProtectedRoute component={BahanKajian} /></Route>
      <Route path="/referensi/cpl-sndikti"><ProtectedRoute component={CplSndikti} /></Route>

      <Route path="/admin/users"><ProtectedRoute component={AdminUsers} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
