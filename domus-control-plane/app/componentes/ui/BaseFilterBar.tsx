"use client";

import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { FilterSelect } from "./FilterSelect";

export interface BaseFilters {
  search?: string;
  propertyType?: string;
  operationType?: string;
  addressSearch?: string;
}

export const PROPERTY_TYPE_OPTIONS = [
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Departamento" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "INTERNAL_APARTMENT", label: "Departamento Interno" },
  { value: "COUNTRY_HOUSE", label: "Casa Quinta / Cabaña" },
  { value: "LAND", label: "Terreno" },
  { value: "FARM", label: "Campos / Chacras" },
  { value: "COMMERCIAL_PREMISES", label: "Local Comercial" },
  { value: "OFFICE", label: "Oficina / Consultorio" },
  { value: "WAREHOUSE", label: "Galpón" },
  { value: "GARAGE", label: "Cochera" },
  { value: "BUSINESS", label: "Fondo de Comercio" },
];

export const OPERATION_TYPE_OPTIONS = [
  { value: "SALE", label: "Venta" },
  { value: "RENT", label: "Alquiler" },
];

interface BaseFilterBarProps<TFilters extends BaseFilters> {
  filters: TFilters;
  setFilters: React.Dispatch<React.SetStateAction<TFilters>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveFilters: boolean;
  onClear: () => void;
  onApply?: () => void;
  extraFilters?: React.ReactNode;
  searchPlaceholder?: string;
  showSearchButton?: boolean;
}

export function BaseFilterBar<TFilters extends BaseFilters>({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onClear,
  onApply,
  extraFilters,
  searchPlaceholder = "Buscar por título...",
  showSearchButton = false,
}: BaseFilterBarProps<TFilters>) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
            onKeyDown={(e) => e.key === "Enter" && onApply?.()}
            className="input-base pl-9 pr-4"
            style={{ padding: "0.625rem 1rem 0.625rem 2.5rem" }}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className={`btn ${showFilters ? "btn-primary" : "btn-secondary"} flex items-center gap-2`}
          style={{ padding: "0.625rem 1rem" }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
              aria-label="Filtros activos"
            />
          )}
        </button>

        {showSearchButton && (
          <button
            type="button"
            onClick={onApply}
            className="btn btn-primary"
            style={{ padding: "0.625rem 1.25rem" }}
          >
            Buscar
          </button>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="btn btn-secondary flex items-center gap-1.5"
            style={{ padding: "0.625rem 0.875rem" }}
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {showFilters && (
        <div
          className="card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-up"
          style={{ animationDuration: "0.2s" }}
        >
          <FilterSelect
            value={filters.propertyType ?? ""}
            onChange={(v) =>
              setFilters((f) => ({ ...f, propertyType: v || undefined }))
            }
            label="Tipo"
            options={PROPERTY_TYPE_OPTIONS}
          />

          <FilterSelect
            value={filters.operationType ?? ""}
            onChange={(v) =>
              setFilters((f) => ({ ...f, operationType: v || undefined }))
            }
            label="Operación"
            options={OPERATION_TYPE_OPTIONS}
          />

          <div className="space-y-1">
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Dirección / Zona
            </p>
            <div className="relative">
              <MapPin
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Ej: Alem 7..."
                value={filters.addressSearch ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    addressSearch: e.target.value || undefined,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && onApply?.()}
                className="input-base pl-8"
                style={{
                  padding: "0.5rem 0.75rem 0.5rem 2rem",
                  fontSize: "0.8125rem",
                }}
              />
            </div>
          </div>

          {extraFilters}
        </div>
      )}
    </div>
  );
}
