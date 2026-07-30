"use client";

import Link from "next/link";
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
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plants", label: "Plantas", icon: Leaf },
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
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
          <LeafIcon />
        </div>
        <div>
          <span className="font-bold text-lg leading-tight text-foreground">
            Black<span className="text-primary">leaf</span>
          </span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Grow Monitor</p>
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

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 4 7 4 14C4 18.418 7.582 22 12 22C16.418 22 20 18.418 20 14C20 7 12 2 12 2Z" fill="oklch(0.65 0.19 142)" fillOpacity="0.85" />
      <line x1="12" y1="15" x2="12" y2="22" stroke="oklch(0.65 0.19 142)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
