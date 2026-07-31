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
  ChevronDown,
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
      { href: "/environment", label: "Ambiente", icon: Thermometer },
      { href: "/nutrients", label: "Nutrientes", icon: FlaskConical },
    ],
  },
  {
    label: "Diário",
    collapsible: false,
    items: [
      { href: "/diary", label: "Diário", icon: BookOpen },
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
    label: "Ferramentas",
    collapsible: true,
    items: [
      { href: "/tools/pests", label: "Identificação de Pragas", icon: Bug },
      { href: "/tools/nutrients", label: "Diagnóstico Nutricional", icon: Microscope },
      { href: "/tools/training", label: "Guia de Treinamento", icon: Scissors },
    ],
  },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer overflow-hidden",
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
        {active && (
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
        <span className="relative z-10 truncate text-[13px]">{item.label}</span>
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,197,94,0.8)] shrink-0"
          />
        )}
      </motion.div>
    </Link>
  );
}

function NavGroupSection({
  group,
  pathname,
  defaultOpen = true,
}: {
  group: NavGroup;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const hasActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

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
                <NavLink key={item.href} item={item} pathname={pathname} />
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
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group, i) => (
          <NavGroupSection
            key={group.label}
            group={group}
            pathname={pathname}
            defaultOpen={i < 2}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2">
        <NavLink
          item={{ href: "/settings", label: "Configurações", icon: Settings }}
          pathname={pathname}
        />
      </div>

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
