"use client";

import { AlertCircle } from "lucide-react";

interface Props {
  error: string | null;
  onClose: () => void;
}

export default function ActionErrorModal({ error, onClose }: Props) {
  if (!error) return null;

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
          <AlertCircle
            size={32}
            style={{
              color: "#DC2626",
            }}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Acción no permitida
        </h3>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {error}
        </p>

        <button
          onClick={onClose}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e5e7eb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          style={{
            backgroundColor: "#f3f4f6",
            color: "#374151",
          }}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}