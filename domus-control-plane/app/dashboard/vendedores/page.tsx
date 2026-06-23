import { clerkClient } from "@clerk/nextjs/server";
import { getVendedores } from "@/app/servicios/vendedor.servicio";
import { getPropiedades } from "@/app/servicios/propiedades.servicio";
import VendedorPanel from "@/app/componentes/dashboard/VendedorPanel";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const vendedores = await getVendedores();

  const allProperties = await getPropiedades({ limit: "500" });
  const propCountMap: Record<string, number> = {};
  for (const p of allProperties.data) {
    const sellerId = p.seller?.id;
    if (sellerId) {
      propCountMap[sellerId] = (propCountMap[sellerId] ?? 0) + 1;
    }
  }

  function hasSellerRole(user: Awaited<ReturnType<typeof client.users.getUser>>): boolean {
    const unsafeMd = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
    const roles = unsafeMd.roles;
    if (Array.isArray(roles)) return roles.some((r) => String(r).toLowerCase() === "seller");
    const publicMd = user.publicMetadata as Record<string, unknown> | undefined;
    const pubRoles = publicMd?.roles;
    if (Array.isArray(pubRoles)) return pubRoles.some((r) => String(r).toLowerCase() === "seller");
    if (typeof publicMd?.role === "string" && publicMd.role.toLowerCase() === "seller") return true;
    return false;
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

  return (
    <VendedorPanel
      vendedores={vendedores.map((v) => ({
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
      }))}
    />
  );
}
