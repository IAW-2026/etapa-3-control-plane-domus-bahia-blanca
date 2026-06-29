"use client";

import { Shield, Trash2 } from "lucide-react";
import { UserDTO } from "./UserManagementTable";

interface Props {
  user: UserDTO;
  roles: string[];
  isWorking: boolean;

  onToggle: () => void;
  onDelete: () => void;
}

export default function UserRow({
  user,
  roles,
  isWorking,
  onToggle,
  onDelete,
}: Props) {
  const isAdmin = roles.includes("admin");

  return (
    <tr className="hover:bg-gray-50 transition-colors">

      <td className="px-6 py-4 font-medium text-gray-900">
        {user.nombre}
      </td>

      <td className="px-6 py-4 text-gray-600">
        {user.email}
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
            isAdmin
              ? "bg-domus-primary/10 text-domus-primary border-domus-primary/20"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {isAdmin
            ? "Administrador"
            : "Comprador"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">

          <button
            onClick={onToggle}
            disabled={isWorking}
            title={isAdmin ? "Quitar rol admin" : "Hacer admin"}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#eefcf2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isAdmin
                ? "text-domus-primary"
                : "text-gray-400 hover:text-domus-primary"
            }`}
          >
            <Shield
              size={20}
              strokeWidth={2}
              fill={isAdmin ? "currentColor" : "none"}
            />
          </button>

          <button
            onClick={onDelete}
            disabled={isWorking}
            title="Eliminar usuario"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={20} />
          </button>

        </div>
      </td>

    </tr>
  );
}