"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import BuyerManagementTable, { UserDTO } from "@/app/componentes/cliente/UserManagementTable";
import { getClientsAction } from "@/app/acciones/cliente.acciones";
import { Loader2, AlertCircle } from "lucide-react";

export default function ClientePanel() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  
  const searchTerm = searchParams.get("search") || "";

  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      setError(null);
      const res = await getClientsAction(currentPage, searchTerm);

      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.totalPages);
      } else {
        setError(res.error || "No se pudieron cargar los clientes.");
      }
    });
  }, [currentPage, searchTerm]);

  if (isPending && users.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <Loader2 className="w-8 h-8 text-domus-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-200 mt-8">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-red-700">Error de conexión</h3>
        <p className="text-red-600 text-center mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <BuyerManagementTable 
        users={users}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}