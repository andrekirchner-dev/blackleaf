"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPlant } from "@/lib/plants";
import type { Plant } from "@/lib/types";
import { PlantForm } from "@/components/plants/plant-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlant(id).then(setPlant).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
      </div>
    );
  }
  if (!plant) {
    return <p className="text-center text-muted-foreground py-24">Planta não encontrada.</p>;
  }
  return <PlantForm plant={plant} />;
}
