import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Users, ClipboardCheck, FileQuestion, UsersRound, Grid3x3, History, FileBarChart, Database, Settings, LogOut, Search, Bell
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Empleados", icon: Users },
  { to: "/evaluation/new", label: "Nueva evaluación", icon: ClipboardCheck },
  { to: "/questions", label: "Cuestionarios", icon: FileQuestion },
  { to: "/client-types", label: "Tipos de clientes", icon: UsersRound },
  { to: "/eligibility", label: "Matriz de competencias", icon: Grid3x3 },
  { to: "/history", label: "Resultados", icon: FileBarChart },
  { to: "/history", label: "Historial", icon: History },
  { to: "/reports", label: "Reportes", icon: FileBarChart },
  { to: "/questions", label: "Banco de preguntas", icon: Database },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export default function Layout() {
  const loc = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-[#14243A] text-white flex flex-col">
        <div className="p-6 text-xl font-bold">CRM Assessment</div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {nav.map((n, i) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link key={i} to={n.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? "bg-[#2563EB]" : "hover:bg-white/10"}`}>
                <Icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 text-sm text-white/80 hover:text-white"><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="font-semibold text-[#14243A]">CRM Assessment</div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
              <input className="pl-8 pr-3 py-1.5 border rounded-lg text-sm" placeholder="Buscar..." />
            </div>
            <Bell size={18} className="text-gray-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm">{user?.fullName?.[0]}</div>
              <div className="text-sm">
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
