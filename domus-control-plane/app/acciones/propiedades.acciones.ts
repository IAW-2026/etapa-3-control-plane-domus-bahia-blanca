"use server";

import { revalidatePath } from "next/cache";
import {
  updatePropertyStatus,
  deletePropiedad,
} from "@/app/servicios/propiedades.servicio";
import type { PropertyStatus } from "@/app/servicios/propiedades.servicio";

export async function cambiarEstadoPropiedadAction(
  propertyId: string,
  status: PropertyStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updatePropertyStatus(propertyId, status);
    revalidatePath("/dashboard/propiedades");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado" };
  }
}

export async function eliminarPropiedadAction(
  propertyId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deletePropiedad(propertyId);
    revalidatePath("/dashboard/propiedades");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar la propiedad" };
  }
}
