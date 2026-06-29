"use server";

import { revalidatePath } from "next/cache";
import { deleteVendedor, deactivateVendedor, activateVendedor, getVendedores } from "@/app/servicios/vendedor.servicio";
import { getPropiedades } from "@/app/servicios/propiedades.servicio";
import { clerkClient } from "@clerk/nextjs/server";

export interface VendedorRow {
  id: string;
  fullName: string;
  email: string;
  agencyName: string | null;
  contactPhone: string | null;
  imageUrl: string | null;
  propertyCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function hasSellerRole(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>): boolean {
  const unsafeMd = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
  const roles = unsafeMd.roles;
  if (Array.isArray(roles)) return roles.some((r) => String(r).toLowerCase() === "seller");
  const publicMd = user.publicMetadata as Record<string, unknown> | undefined;
  const pubRoles = publicMd?.roles;
  if (Array.isArray(pubRoles)) return pubRoles.some((r) => String(r).toLowerCase() === "seller");
  if (typeof publicMd?.role === "string" && publicMd.role.toLowerCase() === "seller") return true;
  return false;
}

export async function getVendedoresFullAction(): Promise<{ vendedores: VendedorRow[]; error?: string }> {
  try {
    const [vendedores, allProperties] = await Promise.all([
      getVendedores(),
      getPropiedades({ limit: "500" }),
    ]);

    const propCountMap: Record<string, number> = {};
    for (const p of allProperties.data) {
      const sellerId = p.seller?.id;
      if (sellerId) {
        propCountMap[sellerId] = (propCountMap[sellerId] ?? 0) + 1;
      }
    }

    const client = await clerkClient();
    const imageMap: Record<string, string | null> = {};
    const activeMap: Record<string, boolean> = {};
    await Promise.all(
      vendedores.map(async (v) => {
        try {
          const user = await client.users.getUser(v.id);
          imageMap[v.id] = user.imageUrl;
          activeMap[v.id] = hasSellerRole(user);
        } catch {
          imageMap[v.id] = null;
          activeMap[v.id] = false;
        }
      }),
    );

    return {
      vendedores: vendedores.map((v) => ({
        id: v.id,
        fullName: v.fullName,
        email: v.email,
        agencyName: v.agencyName,
        contactPhone: v.contactPhone,
        imageUrl: imageMap[v.id] ?? null,
        propertyCount: propCountMap[v.id] ?? 0,
        isActive: activeMap[v.id] ?? false,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
    };
  } catch {
    return { vendedores: [], error: "No se pudieron cargar los vendedores." };
  }
}

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
