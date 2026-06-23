"use server";

import { revalidatePath } from "next/cache";
import {
  updatePropertyStatus,
  deletePropiedad,
  getPropiedades,
} from "@/app/servicios/propiedades.servicio";
import type { PropertyStatus, PropertyCardDTO, PaginationMeta } from "@/app/servicios/propiedades.servicio";

interface SectionResult {
  data: PropertyCardDTO[];
  meta: PaginationMeta;
}

export async function getPropiedadesSeccionesAction(filters: Record<string, string>): Promise<{
  publishedResult: SectionResult;
  draftResult: SectionResult;
  archivedResult: SectionResult;
  totalCountByStatus: { published: number; draft: number; archived: number };
  error?: string;
}> {
  try {
    const sharedFilters: Record<string, string> = { limit: "12", ...filters };

    const publishedPage = sharedFilters.publishedPage ?? "1";
    const draftPage = sharedFilters.draftPage ?? "1";
    const archivedPage = sharedFilters.archivedPage ?? "1";
    delete sharedFilters.publishedPage;
    delete sharedFilters.draftPage;
    delete sharedFilters.archivedPage;

    const [published, draft, archived] = await Promise.all([
      getPropiedades({ ...sharedFilters, status: "PUBLISHED", page: publishedPage }),
      getPropiedades({ ...sharedFilters, status: "DRAFT", page: draftPage }),
      getPropiedades({ ...sharedFilters, status: "ARCHIVED", page: archivedPage }),
    ]);

    return {
      publishedResult: published,
      draftResult: draft,
      archivedResult: archived,
      totalCountByStatus: {
        published: published.meta.total,
        draft: draft.meta.total,
        archived: archived.meta.total,
      },
    };
  } catch {
    return {
      publishedResult: { data: [], meta: { total: 0, page: 1, pageSize: 12, totalPages: 0, hasNextPage: false, hasPrevPage: false } },
      draftResult: { data: [], meta: { total: 0, page: 1, pageSize: 12, totalPages: 0, hasNextPage: false, hasPrevPage: false } },
      archivedResult: { data: [], meta: { total: 0, page: 1, pageSize: 12, totalPages: 0, hasNextPage: false, hasPrevPage: false } },
      totalCountByStatus: { published: 0, draft: 0, archived: 0 },
      error: "No se pudieron cargar las propiedades.",
    };
  }
}

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
