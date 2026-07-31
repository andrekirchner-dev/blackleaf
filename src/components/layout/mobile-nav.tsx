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
} from "lucide-react";

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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
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
              <nav className="flex-1 px-3 py-4 space-y-0.5">
                {nav.map(({ href, label, icon: Icon }, i) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden",
                          active
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />
                        )}
                        <Icon
                          size={17}
                          className={active ? "text-primary" : "text-muted-foreground"}
                        />
                        {label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User footer */}
              {user && (
                <div className="px-5 py-4 border-t border-sidebar-border flex items-center gap-3">
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
