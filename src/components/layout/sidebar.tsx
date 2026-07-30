"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Leaf,
  BookOpen,
  Thermometer,
  Settings,
  LogOut,
  FlaskConical,
  LayoutGrid,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plants", label: "Plantas", icon: Leaf },
  { href: "/spaces", label: "Espaços", icon: LayoutGrid },
  { href: "/diary", label: "Diário", icon: BookOpen },
  { href: "/environment", label: "Ambiente", icon: Thermometer },
  { href: "/nutrients", label: "Nutrientes", icon: FlaskConical },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="relative w-8 h-8 shrink-0">
          <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" />
        </div>
        <div>
          <span className="font-bold text-base leading-tight tracking-wider uppercase">
            <span className="text-foreground">Black</span>
            <span className="text-accent">leaf</span>
          </span>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Grow Monitor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon size={17} className={active ? "text-primary" : "text-muted-foreground"} />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <img
              src={user.photoURL || "/avatar-placeholder.png"}
              alt={user.displayName || "User"}
              className="w-8 h-8 rounded-full border border-border object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{user.displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

