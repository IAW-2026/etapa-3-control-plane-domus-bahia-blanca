import { apiFetch } from "./api-cliente";

export interface VendedorDTO {
  id: string;
  fullName: string;
  email: string;
  agencyName: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  propertyCount?: number;
}

export async function getVendedores(): Promise<VendedorDTO[]> {
  const res = await apiFetch<{ success: boolean; data: VendedorDTO[] }>("/api/sellers");
  return res.data;
}

export async function deleteVendedor(id: string): Promise<{ deletedId: string }> {
  const res = await apiFetch<{ success: boolean; data: { deletedId: string } }>(
    `/api/sellers/${id}`,
    { method: "DELETE" },
  );
  return res.data;
}

export async function deactivateVendedor(id: string): Promise<{ deactivatedId: string }> {
  const res = await apiFetch<{ success: boolean; data: { deactivatedId: string } }>(
    `/api/sellers/${id}/deactivate`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function activateVendedor(id: string): Promise<{ activatedId: string }> {
  const res = await apiFetch<{ success: boolean; data: { activatedId: string } }>(
    `/api/sellers/${id}/activate`,
    { method: "PATCH" },
  );
  return res.data;
}
