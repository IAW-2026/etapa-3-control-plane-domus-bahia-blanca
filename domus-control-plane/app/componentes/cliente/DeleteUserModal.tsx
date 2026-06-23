"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: "#FEE2E2",
          }}
        >
          <AlertTriangle
            size={32}
            style={{
              color: "#DC2626",
            }}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ¿Eliminar este usuario?
        </h3>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Se borrarán todos sus accesos,
          consultas y propiedades guardadas.
          Esta acción no se puede deshacer.
        </p>

        <div className="flex flex-col gap-3">

          <button
            onClick={onConfirm}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#fee2e2")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#fef2f2")
            }
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Sí, eliminar usuario
          </button>

          <button
            onClick={onClose}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#f3f4f6")
            }
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>

        </div>
      </div>
    </div>
  );
}