"use client";

import { useState, useTransition } from "react";
import {
  Trash2, Phone, Mail, Home,
  Calendar, Search, X, User, UserCheck, UserX,
} from "lucide-react";
import { eliminarVendedorAction, desactivarVendedorAction, activarVendedorAction } from "@/app/acciones/vendedor.acciones";
import { DeleteModal } from "@/app/componentes/ui/DeleteModal";

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

interface VendedorPanelProps {
  vendedores: VendedorRow[];
}

export default function VendedorPanel({ vendedores: initialVendedores }: VendedorPanelProps) {
  const [vendedores, setVendedores] = useState<VendedorRow[]>(initialVendedores);
  const [search, setSearch] = useState("");
  const [modalTarget, setModalTarget] = useState<{
    seller: VendedorRow;
    variant: "delete" | "deactivate" | "activate";
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = vendedores.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.agencyName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function handleActivate(seller: VendedorRow) {
    setModalTarget({ seller, variant: "activate" });
  }

  function handleDeactivate(seller: VendedorRow) {
    setModalTarget({ seller, variant: "deactivate" });
  }

  function handleDelete(seller: VendedorRow) {
    setModalTarget({ seller, variant: "delete" });
  }

  function handleModalConfirm() {
    if (!modalTarget) return;
    const { seller, variant } = modalTarget;
    setModalTarget(null);

    startTransition(async () => {
      const action =
        variant === "activate" ? activarVendedorAction
          : variant === "deactivate" ? desactivarVendedorAction
            : eliminarVendedorAction;
      const res = await action(seller.id);
      if (res.ok) {
        setVendedores((prev) =>
          variant === "activate" || variant === "deactivate"
            ? prev.map((s) => (s.id === seller.id ? { ...s, isActive: variant === "activate" } : s))
            : prev.filter((s) => s.id !== seller.id),
        );
      } else {
        setErrors((e) => ({ ...e, [seller.id]: res.error ?? "Error" }));
      }
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="greeting-heading text-3xl sm:text-4xl font-bold tracking-tight">
            Vendedores
          </h1>
          <p className="text-sm mt-0.5 text-domus-textSoft">
            Usuarios con rol de vendedor en el sistema
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
        >
          {vendedores.length} usuario{vendedores.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, email o agencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 pr-8 w-full"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 text-center gap-2 border-domus-secondary">
          <User className="w-10 h-10 mb-1 text-domus-textSoft/60" />
          <p className="text-sm font-semibold text-domus-textSoft">
            {search ? "Sin resultados para la búsqueda" : "No hay vendedores"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((seller) => (
          <div
            key={seller.id}
            className="card p-5 space-y-4 hover-lift animate-fade-up"
            style={{
              opacity: isPending ? 0.7 : 1,
              pointerEvents: isPending ? "none" : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              {seller.imageUrl ? (
                <img
                  src={seller.imageUrl}
                  alt={seller.fullName}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {seller.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm text-domus-text truncate">
                  {seller.fullName}
                </p>
                {seller.agencyName && (
                  <p className="text-xs truncate text-domus-textSoft">
                    {seller.agencyName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-domus-textSoft">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-domus-textSoft/60" />
                <span className="truncate">{seller.email}</span>
              </div>
              {seller.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-domus-textSoft/60" />
                  <span>{seller.contactPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 flex-shrink-0 text-domus-textSoft/60" />
                <span>
                  {seller.propertyCount} propiedad{seller.propertyCount !== 1 ? "es" : ""}
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between text-[10px] pt-2 border-t"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Alta: {formatDate(seller.createdAt)}
              </span>
              <span>Act.: {formatDate(seller.updatedAt)}</span>
            </div>

            {errors[seller.id] && (
              <p className="text-xs font-medium text-red-500">
                {errors[seller.id]}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {seller.isActive ? (
                <button
                  type="button"
                  onClick={() => handleDeactivate(seller)}
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-1.5"
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Desactivar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(seller)}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-1.5"
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Activar
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(seller)}
                className="btn btn-danger flex items-center justify-center gap-1.5"
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.8125rem",
                  flex: "0 0 auto",
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalTarget && (
        <DeleteModal
          title={modalTarget.seller.fullName}
          variant={modalTarget.variant}
          onConfirm={handleModalConfirm}
          onCancel={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
