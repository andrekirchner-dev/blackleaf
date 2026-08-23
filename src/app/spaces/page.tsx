"use client";

import { useState } from "react";
import { useSpaces } from "@/hooks/use-spaces";
import { usePlants } from "@/hooks/use-plants";
import { SpaceCard } from "@/components/spaces/space-card";
import { SpaceForm } from "@/components/spaces/space-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, Plus } from "lucide-react";
import type { GrowSpace } from "@/lib/types";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";

export default function SpacesPage() {
  const { spaces, loading, refresh } = useSpaces();
  const { plants } = usePlants();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<GrowSpace | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setSheetOpen(true);
  }

  function openEdit(space: GrowSpace) {
    setEditing(space);
    setSheetOpen(true);
  }

  function handleSuccess() {
    setSheetOpen(false);
    refresh();
  }

  return (
    <MotionPage>
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <MotionItem>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <LayoutGrid size={20} className="text-primary" />
            Espaços de Cultivo
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie suas tendas, armários e ambientes de grow
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={15} />
          Novo Espaço
        </Button>
      </div>
      </MotionItem>

      {/* Content */}
      <MotionItem>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="rounded-2xl" style={{ aspectRatio: "3/4" }} />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">⛺</span>
          <p className="text-foreground font-semibold">Nenhum espaço cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Crie seu primeiro espaço de cultivo para organizar suas plantas
          </p>
          <Button onClick={openCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={15} />
            Criar Espaço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              plants={plants}
              onEdit={openEdit}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}
      </MotionItem>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-foreground">
              {editing ? "Editar Espaço" : "Novo Espaço"}
            </SheetTitle>
          </SheetHeader>
          <SpaceForm
            space={editing}
            onSuccess={handleSuccess}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
    </MotionPage>
  );
}
