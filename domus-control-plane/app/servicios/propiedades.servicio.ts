import { apiFetch } from "./api-cliente";

export type PropertyStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export interface PropertyCardDTO {
  id: string;
  title: string | null;
  address: string | null;
  price: number;
  currency: string;
  propertyType: string;
  operationType: string;
  status: string;
  views: number;
  updatedAt: string | null;
  multimedia: { fileUrl: string; fileType: string }[];
  seller: { id: string; fullName: string; agencyName: string | null; email: string } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getPropiedades(
  filters: Record<string, string> = {},
): Promise<{ data: PropertyCardDTO[]; meta: PaginationMeta }> {
  const params = new URLSearchParams(filters);
  const res = await apiFetch<{ success: boolean; data: PropertyCardDTO[]; meta: PaginationMeta }>(
    `/api/properties/all?${params}`,
  );
  return { data: res.data, meta: res.meta };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
): Promise<void> {
  await apiFetch(`/api/properties/${propertyId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deletePropiedad(propertyId: string): Promise<{ deletedId: string }> {
  const res = await apiFetch<{ success: boolean; data: { deletedId: string } }>(
    `/api/properties/${propertyId}`,
    { method: "DELETE" },
  );
  return res.data;
}
