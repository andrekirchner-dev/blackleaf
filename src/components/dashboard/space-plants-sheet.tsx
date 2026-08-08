"use client";

import { useState } from "react";
import type { GrowSpace, Plant } from "@/lib/types";
import { useFertilizers } from "@/hooks/use-fertilizers";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import { getSpaceMeta } from "@/lib/space-constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiaryForm } from "@/components/diary/diary-form";
import { Button } from "@/components/ui/button";
import { BookOpen, Leaf, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  space: GrowSpace;
  plants: Plant[];
  open: boolean;
  onClose: () => void;
  onDiarySuccess: () => void;
}

export function SpacePlantsSheet({ space, plants, open, onClose, onDiarySuccess }: Props) {
  const meta = getSpaceMeta(space.type);
  const [diaryPlantId, setDiaryPlantId] = useState<string | null>(null);
  const { fertilizers } = useFertilizers();
  const diaryPlant = plants.find((p) => p.id === diaryPlantId);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <SheetTitle className="text-base font-semibold text-foreground">{space.name}</SheetTitle>
                <p className="text-xs text-muted-foreground">{meta.label} · {plants.length} {plants.length === 1 ? "planta" : "plantas"}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {plants.length === 0 ? (
              <div className="py-10 text-center">
                <Leaf size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma planta neste espaço.</p>
              </div>
            ) : (
              plants.map((plant) => (
                <div
                  key={plant.id}
                  className="flex items-center gap-3 bg-background border border-border rounded-xl px-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">{plant.name}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                        STAGE_COLORS[plant.stage]
                      )}>
                        {STAGE_LABELS[plant.stage]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{plant.strain}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDiaryPlantId(plant.id)}
                      className="h-7 px-2 text-xs border-border gap-1"
                    >
                      <BookOpen size={11} />
                      Diário
                    </Button>
                    <Link href={`/plants/${plant.id}`} onClick={onClose}>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <ChevronRight size={13} className="text-muted-foreground" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pb-4">
            <Link href={`/spaces/${space.id}`} onClick={onClose}>
              <Button variant="outline" className="w-full border-border text-xs">
                Ver detalhes do espaço
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!diaryPlantId} onOpenChange={(v) => !v && setDiaryPlantId(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Registro rápido — {diaryPlant?.name}
            </DialogTitle>
          </DialogHeader>
          {diaryPlantId && (
            <DiaryForm
              plants={plants}
              fertilizers={fertilizers}
              defaultPlantId={diaryPlantId}
              onSuccess={() => {
                setDiaryPlantId(null);
                onDiarySuccess();
              }}
              onCancel={() => setDiaryPlantId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
