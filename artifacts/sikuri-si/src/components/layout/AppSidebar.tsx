import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, BookOpen, Layers, Target, Map, FileText, Settings, Users, CheckSquare, ListTree } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isMenuActive = (href: string) => {
    if (href === "/dashboard" && location === "/dashboard") return true;
    if (href !== "/dashboard" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-foreground leading-none">SIKURI SI</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Sistem Kurikulum</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isMenuActive("/dashboard")} tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isMenuActive("/mata-kuliah")} tooltip="Mata Kuliah">
                <Link href="/mata-kuliah">
                  <BookOpen className="h-4 w-4" />
                  <span>Mata Kuliah</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CPL & CPMK</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/cpl")}>
                  <Link href="/cpl">
                    <Target className="h-4 w-4" />
                    <span>CPL Prodi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/cpmk")}>
                  <Link href="/cpmk">
                    <CheckSquare className="h-4 w-4" />
                    <span>CPMK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/sub-cpmk")}>
                  <Link href="/sub-cpmk">
                    <ListTree className="h-4 w-4" />
                    <span>Sub-CPMK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pemetaan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/pemetaan/cpl-mk")}>
                  <Link href="/pemetaan/cpl-mk">
                    <Map className="h-4 w-4" />
                    <span>CPL × Mata Kuliah</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/pemetaan/cpl-bk")}>
                  <Link href="/pemetaan/cpl-bk">
                    <Map className="h-4 w-4" />
                    <span>CPL × Bahan Kajian</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/pemetaan/bk-mk")}>
                  <Link href="/pemetaan/bk-mk">
                    <Map className="h-4 w-4" />
                    <span>Bahan Kajian × MK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/pemetaan/cpl-pl")}>
                  <Link href="/pemetaan/cpl-pl">
                    <Map className="h-4 w-4" />
                    <span>CPL × Profil Lulusan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/pemetaan/cpl-cpmk-mk")}>
                  <Link href="/pemetaan/cpl-cpmk-mk">
                    <Layers className="h-4 w-4" />
                    <span>Hierarki CPL → MK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isMenuActive("/rps")}>
                <Link href="/rps">
                  <FileText className="h-4 w-4" />
                  <span>RPS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Referensi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/referensi/profil-lulusan")}>
                  <Link href="/referensi/profil-lulusan">
                    <Settings className="h-4 w-4" />
                    <span>Profil Lulusan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/referensi/bahan-kajian")}>
                  <Link href="/referensi/bahan-kajian">
                    <Settings className="h-4 w-4" />
                    <span>Bahan Kajian</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMenuActive("/referensi/cpl-sndikti")}>
                  <Link href="/referensi/cpl-sndikti">
                    <Settings className="h-4 w-4" />
                    <span>CPL SN-Dikti</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isMenuActive("/admin/users")}>
                    <Link href="/admin/users">
                      <Users className="h-4 w-4" />
                      <span>Pengguna</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
