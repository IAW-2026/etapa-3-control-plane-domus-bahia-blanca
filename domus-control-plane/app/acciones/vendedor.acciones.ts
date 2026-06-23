"use server";

import { revalidatePath } from "next/cache";
import { deleteVendedor, deactivateVendedor, activateVendedor } from "@/app/servicios/vendedor.servicio";

export async function eliminarVendedorAction(
  vendedorId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteVendedor(vendedorId);
    revalidatePath("/dashboard/vendedores");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar el vendedor" };
  }
}

export async function desactivarVendedorAction(
  vendedorId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deactivateVendedor(vendedorId);
    revalidatePath("/dashboard/vendedores");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo desactivar el vendedor" };
  }
}

export async function activarVendedorAction(
  vendedorId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await activateVendedor(vendedorId);
    revalidatePath("/dashboard/vendedores");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo activar el vendedor" };
  }
}
