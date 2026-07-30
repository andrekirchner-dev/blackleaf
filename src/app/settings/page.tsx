"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User size={16} className="text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || ""}
              alt={user?.displayName || ""}
              className="w-14 h-14 rounded-full border-2 border-primary/30"
            />
            <div>
              <p className="font-semibold text-foreground">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={logout}
            className="gap-2 w-full sm:w-auto"
          >
            <LogOut size={15} />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
