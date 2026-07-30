"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Leaf, BookOpen, Thermometer, Menu, X, FlaskConical, Settings, LayoutGrid } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plants", label: "Plantas", icon: Leaf },
  { href: "/spaces", label: "Espaços", icon: LayoutGrid },
  { href: "/diary", label: "Diário", icon: BookOpen },
  { href: "/environment", label: "Ambiente", icon: Thermometer },
  { href: "/nutrients", label: "Nutrientes", icon: FlaskConical },
  { href: "/settings", label: "Config", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7">
            <Image src="/logo-icon.png" alt="Blackleaf" fill className="object-contain" />
          </div>
          <span className="font-bold text-base tracking-wider uppercase">
            <span className="text-foreground">Black</span>
            <span className="text-accent">leaf</span>
          </span>
        </div>
        <button onClick={() => setOpen(true)} className="text-foreground p-1">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
              <span className="font-bold text-xl tracking-wider uppercase">
              <span className="text-foreground">Black</span>
              <span className="text-accent">leaf</span>
            </span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="px-5 py-4 border-t border-sidebar-border flex items-center gap-3">
                <img src={user.photoURL || ""} alt="" className="w-8 h-8 rounded-full border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName}</p>
                </div>
                <button onClick={logout} className="text-xs text-muted-foreground hover:text-destructive">Sair</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
