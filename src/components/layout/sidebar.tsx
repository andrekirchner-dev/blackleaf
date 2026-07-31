"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
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
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <motion.div
          className="relative w-8 h-8 shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-glow-pulse" />
          <Image
            src="/logo-icon.png"
            alt="Blackleaf"
            fill
            className="object-contain relative z-10"
          />
        </motion.div>
        <div>
          <span className="font-bold text-base leading-tight tracking-wider uppercase">
            <span className="text-foreground">Black</span>
            <span className="text-accent">leaf</span>
          </span>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
            Grow Monitor
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer overflow-hidden",
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
              >
                {/* Active background */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                {/* Active left accent bar */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  size={17}
                  className={cn(
                    "relative z-10 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {user && (
          <motion.div
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-default"
            whileHover={{ x: 1 }}
          >
            <img
              src={user.photoURL || "/avatar-placeholder.png"}
              alt={user.displayName || "User"}
              className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-foreground">
                {user.displayName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut size={15} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
