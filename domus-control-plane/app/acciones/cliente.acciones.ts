"use server";

import { fetchClientsApi, toggleRoleApi, deleteUserApi } from "@/app/servicios/cliente.servicio";

export async function getClientsAction(page: number = 1) {
  try {
    const data = await fetchClientsApi(page);
    return { success: true, users: data.users, currentPage: data.currentPage, totalPages: data.totalPages };
  } catch (error: unknown) {
    console.error("Error getClientsAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

export async function toggleAdminRole(userId: string) {
  try {
    await toggleRoleApi(userId);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await deleteUserApi(userId);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}