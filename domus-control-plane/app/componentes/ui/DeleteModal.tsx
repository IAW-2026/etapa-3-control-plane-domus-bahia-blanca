"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, UserX, UserCheck } from "lucide-react";

interface DeleteModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "delete" | "deactivate" | "activate";
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({
  title,
  description,
  confirmLabel,
  variant = "delete",
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isDeactivate = variant === "deactivate";
  const isActivate = variant === "activate";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="rounded-2xl max-w-sm w-full p-6 space-y-5 animate-scale-in"
        style={{
          background: "var(--bg-card)",
          border: "1.5px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isActivate
                ? "rgba(34, 197, 94, 0.1)"
                : isDeactivate
                  ? "rgba(201, 123, 99, 0.1)"
                  : "rgba(239,68,68,0.1)",
            }}
          >
            {isActivate ? (
              <UserCheck className="w-5 h-5" style={{ color: "#22c55e" }} />
            ) : isDeactivate ? (
              <UserX className="w-5 h-5" style={{ color: "var(--accent)" }} />
            ) : (
              <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-domus-text">
              {isActivate ? "Activar vendedor" : isDeactivate ? "Desactivar vendedor" : "Eliminar propiedad"}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {description ??
                (isActivate
                  ? "Se le otorgará el permiso de seller."
                  : isDeactivate
                    ? "Se le quitará el permiso de seller."
                    : "Esta acción no se puede deshacer.")}
            </p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {isActivate ? (
            <>
              Se activará a <span className="font-semibold text-domus-text">&quot;{title}&quot;</span>.{" "}
              El usuario obtendrá acceso a funciones de seller.
            </>
          ) : isDeactivate ? (
            <>
              Se desactivará a <span className="font-semibold text-domus-text">&quot;{title}&quot;</span>.{" "}
              El usuario conservará su cuenta pero perderá acceso a funciones de seller.
            </>
          ) : (
            <>
              Se eliminará permanentemente{" "}
              <span className="font-semibold text-domus-text">&quot;{title}&quot;</span>{" "}
              junto con toda su multimedia y datos asociados.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              isActivate ? "btn-primary" : isDeactivate ? "btn-secondary" : "btn-danger"
            }`}
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
          >
            {isActivate ? (
              <>
                <UserCheck className="w-4 h-4" />
                Activar
              </>
            ) : isDeactivate ? (
              <>
                <UserX className="w-4 h-4" />
                Desactivar
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {confirmLabel ?? "Eliminar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
