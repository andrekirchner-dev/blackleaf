"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Leaf,
  BookOpen,
  Thermometer,
  Settings,
  LogOut,
  FlaskConical,
  LayoutGrid,
  ShoppingCart,
  Bug,
  Scissors,
  Microscope,
  Stethoscope,
  ChevronDown,
  ChevronLeft,
  Beaker,
  CalendarDays,
  Archive,
  Trophy,
  Wind,
  Sun,
  Zap,
  Droplets,
  Users,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  collapsible?: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Cultivo",
    collapsible: true,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/spaces", label: "Espaços", icon: LayoutGrid },
      { href: "/plants", label: "Plantas", icon: Leaf },
      { href: "/seeds", label: "Banco de Sementes", icon: Beaker },
      { href: "/environment", label: "Ambiente", icon: Thermometer },
      { href: "/nutrients", label: "Nutrientes", icon: FlaskConical },
    ],
  },
  {
    label: "Diário",
    collapsible: false,
    items: [
      { href: "/diary", label: "Diário", icon: BookOpen },
      { href: "/calendar", label: "Calendário", icon: CalendarDays },
      { href: "/harvest", label: "Colheitas", icon: Trophy },
      { href: "/archive", label: "Arquivo", icon: Archive },
    ],
  },
  {
    label: "Compras",
    collapsible: false,
    items: [
      { href: "/shopping", label: "Lista de Compras", icon: ShoppingCart },
    ],
  },
  {
    label: "Social",
    collapsible: false,
    items: [
      { href: "/community", label: "Comunidade", icon: Users },
    ],
  },
  {
    label: "Ferramentas",
    collapsible: false,
    items: [
      { href: "/tools/pests", label: "Identificação de Pragas", icon: Bug },
      { href: "/tools/diseases", label: "Diagnóstico de Doenças", icon: Stethoscope },
      { href: "/tools/nutrients", label: "Diagnóstico Nutricional", icon: Microscope },
      { href: "/tools/training", label: "Guia de Treinamento", icon: Scissors },
      { href: "/tools/vpd", label: "Calculadora VPD", icon: Wind },
      { href: "/tools/dli", label: "Calculadora DLI", icon: Sun },
      { href: "/tools/energy", label: "Custo de Energia", icon: Zap },
      { href: "/tools/flush", label: "Flush & Colheita", icon: Droplets },
    ],
  },
];

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link href={item.href} title={collapsed ? item.label : undefined}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative flex items-center rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer overflow-hidden",
          collapsed
            ? "justify-center h-9 w-full"
            : "gap-2.5 px-3 py-2",
          active
            ? "text-primary"
            : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
        )}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active-bg"
            className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        {active && !collapsed && (
          <motion.div
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        <Icon
          size={15}
          className={cn(
            "relative z-10 transition-colors shrink-0",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
        {!collapsed && (
          <>
            <span className="relative z-10 truncate text-[13px]">{item.label}</span>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,197,94,0.8)] shrink-0"
              />
            )}
          </>
        )}
      </motion.div>
    </Link>
  );
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
  defaultOpen = true,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  defaultOpen?: boolean;
}) {
  const hasActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed={true} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {group.collapsible ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-1 group"
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            {group.label}
          </span>
          <ChevronDown
            size={11}
            className={cn(
              "text-muted-foreground/40 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      ) : (
        <p className="px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
          {group.label}
        </p>
      )}

      <AnimatePresence initial={false}>
        {(!group.collapsible || open) && (
          <motion.div
            initial={group.collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={false} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col min-h-screen bg-sidebar border-r border-sidebar-border shrink-0 transition-[width] duration-200 overflow-hidden",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-3 py-5 border-b border-sidebar-border">
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
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-base leading-tight tracking-wider uppercase">
              <span className="text-foreground">Black</span>
              <span className="text-accent">leaf</span>
            </span>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
              Grow Monitor
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 py-4 space-y-4 overflow-y-auto scrollbar-thin",
          collapsed ? "px-1.5" : "px-3"
        )}
      >
        {NAV_GROUPS.map((group, i) => (
          <NavGroupSection
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={collapsed}
            defaultOpen={i < 2}
          />
        ))}
      </nav>

      {/* Bottom controls */}
      <div className={cn("pb-2 space-y-1", collapsed ? "px-1.5" : "px-3")}>
        <NavLink
          item={{ href: "/settings", label: "Configurações", icon: Settings }}
          pathname={pathname}
          collapsed={collapsed}
        />
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={cn(
            "w-full flex items-center rounded-xl py-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors",
            collapsed ? "justify-center" : "gap-2 px-3"
          )}
        >
          <ChevronLeft
            size={14}
            className={cn(
              "shrink-0 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-[13px]">Recolher</span>}
        </button>
      </div>

      {/* User Footer */}
      <div
        className={cn(
          "py-4 border-t border-sidebar-border",
          collapsed ? "px-1.5" : "px-3"
        )}
      >
        {user && (
          <motion.div
            className={cn(
              "flex items-center gap-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-default",
              collapsed ? "justify-center px-0" : "px-3"
            )}
            whileHover={{ x: collapsed ? 0 : 1 }}
          >
            <img
              src={user.photoURL || "/avatar-placeholder.png"}
              alt={user.displayName || "User"}
              className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover shrink-0"
            />
            {!collapsed && (
              <>
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
              </>
            )}
          </motion.div>
        )}
      </div>
    </aside>
  );
}
