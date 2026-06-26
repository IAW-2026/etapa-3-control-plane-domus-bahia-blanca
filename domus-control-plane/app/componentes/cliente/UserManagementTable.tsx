"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import UserRow from "./UserRow";
import DeleteUserModal from "./DeleteUserModal";
import ActionErrorModal from "./ActionErrorModal";
import { toggleAdminRole, deleteUserAccount } from "@/app/acciones/cliente.acciones";

export interface UserDTO {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
}

interface Props {
  users: UserDTO[];
  currentPage: number;
  totalPages: number;
}

export default function UserManagementTable({
  users,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [optimisticRoles, setOptimisticRoles] = useState<Record<string, string[]>>({});
  const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(new Set());
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const executeSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term.trim()) {
      params.set("search", term.trim());
    } else {
      params.delete("search");
    }
    
    params.set("page", "1"); 
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setSearchTerm("");
    executeSearch("");
  };

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggle = (userId: string, currentRoles: string[]) => {
    const isAdmin = currentRoles.includes("admin");
    const newRoles = isAdmin
      ? currentRoles.filter((r) => r !== "admin")
      : [...currentRoles, "admin"];

    setOptimisticRoles((prev) => ({ ...prev, [userId]: newRoles }));
    setLoadingId(userId);

    startTransition(async () => {
      const res = await toggleAdminRole(userId);
      if (!res?.success) {
        setActionError(res?.error || "Error al cambiar el rol");
        setOptimisticRoles((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
      }
      setLoadingId(null);
    });
  };

  const confirmDeleteAction = async () => {
    if (!userToDelete) return;
    const userId = userToDelete;

    setUserToDelete(null);
    setHiddenUsers((prev) => new Set(prev).add(userId));
    setLoadingId(userId);

    startTransition(async () => {
      const res = await deleteUserAccount(userId);
      if (!res?.success) {
        setActionError(res?.error || "Error al eliminar el usuario");
        setHiddenUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
      setLoadingId(null);
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
        
        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gestión de Clientes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los roles y accesos de los clientes registrados.
            </p>
          </div>

          {/* CONTROLES DE BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              {/* Le sacamos la lupita gris de acá adentro */}
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") executeSearch(searchTerm);
                }}
                className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-domus-primary focus:border-domus-primary placeholder-gray-400 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* NUEVO BOTÓN DE BUSCAR: Verde Domus + Lupa */}
            <button
              onClick={() => executeSearch(searchTerm)}
              className="flex items-center gap-2 px-4 py-2 bg-domus-primary hover:bg-domus-primary/90 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.filter((u) => !hiddenUsers.has(u.id)).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                users
                  .filter((u) => !hiddenUsers.has(u.id))
                  .map((user) => {
                    const roles = optimisticRoles[user.id] || user.roles || [];
                    return (
                      <UserRow
                        key={user.id}
                        user={user}
                        roles={roles}
                        isWorking={loadingId === user.id && isPending}
                        onToggle={() => handleToggle(user.id, roles)}
                        onDelete={() => setUserToDelete(user.id)}
                      />
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Página <span className="font-semibold">{currentPage}</span> de{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteUserModal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteAction}
      />

      <ActionErrorModal
        error={actionError}
        onClose={() => setActionError(null)}
      />
    </>
  );
}