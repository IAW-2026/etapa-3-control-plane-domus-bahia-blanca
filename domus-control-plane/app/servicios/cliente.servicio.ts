import "server-only";

const BASE_URL = process.env.BUYER_APP_BASE_URL || "";
const API_KEY = process.env.BUYER_APP_API_KEY || "";

const headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json",
};

export async function fetchClientsApi(page: number, search: string = "") {
  const res = await fetch(`${BASE_URL}/api/external/users?page=${page}&search=${search}`, { 
    headers,
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error("Error fetching clients");
  }
  
  return res.json();
}

export async function toggleRoleApi(userId: string) {
  const res = await fetch(`${BASE_URL}/api/external/users/${userId}/role`, {
    method: "PATCH",
    headers,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Error al cambiar el rol");
  }
  
  return res.json();
}

export async function deleteUserApi(userId: string) {
  const res = await fetch(`${BASE_URL}/api/external/users/${userId}`, {
    method: "DELETE",
    headers,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Error al eliminar usuario");
  }
  
  return res.json();
}