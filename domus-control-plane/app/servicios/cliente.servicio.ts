interface ClientsResponse {
  users: unknown[];
  currentPage: number;
  totalPages: number;
}

export async function fetchClientsApi(_page: number): Promise<ClientsResponse> {
  throw new Error("cliente.servicio: endpoint no implementado");
}

export async function toggleRoleApi(_userId: string): Promise<void> {
  throw new Error("cliente.servicio: endpoint no implementado");
}

export async function deleteUserApi(_userId: string): Promise<void> {
  throw new Error("cliente.servicio: endpoint no implementado");
}
