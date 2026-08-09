"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Leaf,
  BookOpen,
  Thermometer,
  Menu,
  X,
  FlaskConical,
  Settings,
  LayoutGrid,
  LogOut,
  ShoppingCart,
  Bug,
  Scissors,
  Microscope,
  Stethoscope,
  ChevronDown,
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
      { href: "/tools/pests", label: "Pragas", icon: Bug },
      { href: "/tools/diseases", label: "Doenças", icon: Stethoscope },
      { href: "/tools/nutrients", label: "Diagnóstico", icon: Microscope },
      { href: "/tools/training", label: "Treinamento", icon: Scissors },
      { href: "/tools/vpd", label: "VPD", icon: Wind },
      { href: "/tools/dli", label: "DLI", icon: Sun },
      { href: "/tools/energy", label: "Energia", icon: Zap },
      { href: "/tools/flush", label: "Flush", icon: Droplets },
    ],
  },
];

function MobileGroupSection({
  group,
  pathname,
  onClose,
  itemIndex,
}: {
  group: NavGroup;
  pathname: string;
  onClose: () => void;
  itemIndex: number;
}) {
  const hasActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [open, setOpen] = useState(!group.collapsible || hasActive || itemIndex < 2);

  return (
    <div className="space-y-0.5">
      {group.collapsible ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-1.5 group"
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            {group.label}
          </span>
          <ChevronDown
            size={11}
            className={cn("text-muted-foreground/40 transition-transform", open && "rotate-180")}
          />
        </button>
      ) : (
        <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
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
              {group.items.map((item, i) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all overflow-hidden",
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />
                      )}
                      <Icon
                        size={16}
                        className={active ? "text-primary" : "text-muted-foreground"}
                      />
                      {item.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm animate-glow-pulse" />
            <Image
              src="/logo-icon.png"
              alt="Blackleaf"
              fill
              className="object-contain relative z-10"
            />
          </div>
          <span className="font-bold text-base tracking-wider uppercase">
            <span className="text-foreground">Black</span>
            <span className="text-accent">leaf</span>
          </span>
        </div>
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.9 }}
          className="text-foreground p-1"
        >
          <Menu size={22} />
        </motion.button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm animate-glow-pulse" />
                    <Image
                      src="/logo-icon.png"
                      alt="Blackleaf"
                      fill
                      className="object-contain relative z-10"
                    />
                  </div>
                  <span className="font-bold text-xl tracking-wider uppercase">
                    <span className="text-foreground">Black</span>
                    <span className="text-accent">leaf</span>
                  </span>
                </div>
                <motion.button
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
                {NAV_GROUPS.map((group, i) => (
                  <MobileGroupSection
                    key={group.label}
                    group={group}
                    pathname={pathname}
                    onClose={() => setOpen(false)}
                    itemIndex={i}
                  />
                ))}

                {/* Settings at bottom of nav */}
                <div className="pt-2">
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      pathname === "/settings"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <Settings size={16} className={pathname === "/settings" ? "text-primary" : "text-muted-foreground"} />
                    Configurações
                  </Link>
                </div>
              </nav>

              {/* User footer */}
              {user && (
                <div className="px-5 py-4 border-t border-sidebar-border flex items-center gap-3 shrink-0">
                  <img
                    src={user.photoURL || ""}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">
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
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Sair"
                  >
                    <LogOut size={15} />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
