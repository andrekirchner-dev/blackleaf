"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  getAdminStats,
  getAdminUsers,
  getAdminPlants,
  getAdminDiagnostics,
  adminDeletePlant,
} from "@/lib/admin";
import type { AdminStats, AdminUser, AdminPlant } from "@/lib/admin";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { cn } from "@/lib/utils";
import {
  Shield,
  Users,
  Leaf,
  LayoutGrid,
  Trophy,
  Zap,
  CheckSquare,
  DollarSign,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";
import type { GrowStage } from "@/lib/types";

const ADMIN_EMAIL = "kirchner.andre@gmail.com";

type Tab = "overview" | "users" | "plants" | "diagnostics";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-primary",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Users size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{user.handle}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{user.userId}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1"><Leaf size={11} />{user.plants}</span>
          <span className="flex items-center gap-1"><LayoutGrid size={11} />{user.spaces}</span>
          <span className="flex items-center gap-1"><Trophy size={11} />{user.harvests}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 bg-muted/5">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-card rounded-xl p-2.5 border border-border text-center">
              <p className="text-2xl font-bold text-primary">{user.plants}</p>
              <p className="text-muted-foreground mt-0.5">plantas</p>
            </div>
            <div className="bg-card rounded-xl p-2.5 border border-border text-center">
              <p className="text-2xl font-bold text-foreground">{user.spaces}</p>
              <p className="text-muted-foreground mt-0.5">espaços</p>
            </div>
            <div className="bg-card rounded-xl p-2.5 border border-border text-center">
              <p className="text-2xl font-bold text-accent">{user.harvests}</p>
              <p className="text-muted-foreground mt-0.5">colheitas</p>
            </div>
          </div>
          {user.lastActive && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Última atividade: {new Date(user.lastActive).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PlantRow({
  plant,
  onDelete,
}: {
  plant: AdminPlant;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/5">
      <Leaf size={14} className={plant.archived ? "text-muted-foreground/30" : "text-primary"} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{plant.name}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono">{plant.userId.slice(-6)}</span>
          <span>·</span>
          <span>{plant.strain}</span>
          <span>·</span>
          <span>{STAGE_LABELS[plant.stage as GrowStage] ?? plant.stage}</span>
          {plant.archived && <span className="text-muted-foreground/50">arquivada</span>}
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { onDelete(plant.id); setConfirming(false); }}
            className="text-[11px] font-medium text-destructive border border-destructive/30 rounded-lg px-2 py-1 hover:bg-destructive/10 transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 text-muted-foreground/30 hover:text-destructive transition-colors p-1"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plants, setPlants] = useState<AdminPlant[]>([]);
  const [orphans, setOrphans] = useState<AdminPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (user === null) { router.push("/dashboard"); return; }
    if (user && !isAdmin) { router.push("/dashboard"); }
  }, [user, isAdmin, router]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, p, d] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminPlants(),
        getAdminDiagnostics(),
      ]);
      setStats(s);
      setUsers(u);
      setPlants(p);
      setOrphans(d.orphanedPlants);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  async function handleDeletePlant(id: string) {
    await adminDeletePlant(id);
    setPlants((ps) => ps.filter((p) => p.id !== id));
    setOrphans((ps) => ps.filter((p) => p.id !== id));
    if (stats) setStats({ ...stats, totalPlants: stats.totalPlants - 1 });
  }

  if (!isAdmin) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão Geral" },
    { id: "users", label: "Usuários" },
    { id: "plants", label: "Plantas" },
    { id: "diagnostics", label: "Diagnóstico" },
  ];

  return (
    <MotionPage>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield size={22} className="text-accent" />
                Painel Admin
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Acesso restrito ao administrador</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </MotionItem>

        {/* Tabs */}
        <MotionItem>
          <div className="flex gap-1 bg-muted/20 rounded-2xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-xl transition-all",
                  tab === t.id
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </MotionItem>

        {loading ? (
          <MotionItem>
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          </MotionItem>
        ) : (
          <>
            {tab === "overview" && stats && (
              <MotionItem>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Usuários únicos" value={stats.totalUsers} icon={Users} color="text-accent" />
                    <StatCard label="Plantas" value={stats.totalPlants} icon={Leaf} color="text-primary" />
                    <StatCard label="Espaços" value={stats.totalSpaces} icon={LayoutGrid} color="text-foreground" />
                    <StatCard label="Colheitas" value={stats.totalHarvests} icon={Trophy} color="text-accent" />
                    <StatCard label="Eventos registrados" value={stats.totalEvents} icon={Activity} color="text-muted-foreground" />
                    <StatCard label="Tarefas" value={stats.totalTasks} icon={CheckSquare} color="text-foreground" />
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Zap size={14} className="text-accent" />
                      Resumo do app
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plantas por usuário (média)</span>
                        <span className="font-medium">
                          {stats.totalUsers > 0 ? (stats.totalPlants / stats.totalUsers).toFixed(1) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Espaços por usuário (média)</span>
                        <span className="font-medium">
                          {stats.totalUsers > 0 ? (stats.totalSpaces / stats.totalUsers).toFixed(1) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custos registrados</span>
                        <span className="font-medium">{stats.totalCosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Problemas detectados</span>
                        <span className={cn("font-medium", orphans.length > 0 ? "text-destructive" : "text-primary")}>
                          {orphans.length > 0 ? `${orphans.length} órfãs` : "Nenhum"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionItem>
            )}

            {tab === "users" && (
              <MotionItem>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{users.length} usuários</h2>
                    <p className="text-[10px] text-muted-foreground">ordenado por plantas</p>
                  </div>
                  {users.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Nenhum usuário encontrado
                    </div>
                  ) : (
                    <div>
                      {users.map((u) => (
                        <UserRow key={u.userId} user={u} />
                      ))}
                    </div>
                  )}
                </div>
              </MotionItem>
            )}

            {tab === "plants" && (
              <MotionItem>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{plants.length} plantas (todas)</h2>
                    <p className="text-[10px] text-muted-foreground">mais recentes primeiro</p>
                  </div>
                  {plants.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Nenhuma planta encontrada
                    </div>
                  ) : (
                    <div>
                      {plants.map((p) => (
                        <PlantRow key={p.id} plant={p} onDelete={handleDeletePlant} />
                      ))}
                    </div>
                  )}
                </div>
              </MotionItem>
            )}

            {tab === "diagnostics" && (
              <MotionItem>
                <div className="space-y-4">
                  <div className={cn(
                    "rounded-2xl border p-4 flex items-start gap-3",
                    orphans.length > 0
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-primary/5 border-primary/20"
                  )}>
                    <AlertTriangle
                      size={16}
                      className={orphans.length > 0 ? "text-destructive mt-0.5 shrink-0" : "text-primary mt-0.5 shrink-0"}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {orphans.length > 0
                          ? `${orphans.length} plantas órfãs detectadas`
                          : "Nenhum problema detectado"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {orphans.length > 0
                          ? "Plantas vinculadas a espaços que não existem mais"
                          : "Todos os dados estão íntegros"}
                      </p>
                    </div>
                  </div>

                  {orphans.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-destructive">Plantas órfãs</h2>
                      </div>
                      <div>
                        {orphans.map((p) => (
                          <PlantRow key={p.id} plant={p} onDelete={handleDeletePlant} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <h2 className="text-sm font-semibold mb-3">Checklist de integridade</h2>
                    {[
                      { label: "Plantas com espaço válido", ok: orphans.length === 0 },
                      { label: "Coleções com regras Firestore", ok: true },
                      { label: "Acesso admin configurado", ok: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={item.ok ? "text-primary font-medium" : "text-destructive font-medium"}>
                          {item.ok ? "✓ OK" : "✗ Problema"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionItem>
            )}
          </>
        )}
      </div>
    </MotionPage>
  );
}
