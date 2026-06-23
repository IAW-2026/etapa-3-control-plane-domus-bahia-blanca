"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FilterX, Building2, CheckCircle2, Archive,
  ChevronDown, Minus, ChevronLeft, ChevronRight,
} from "lucide-react";
import { BaseFilterBar, type BaseFilters } from "@/app/componentes/ui/BaseFilterBar";
import { FilterSelect } from "@/app/componentes/ui/FilterSelect";
import { BasePropertyCard } from "@/app/componentes/ui/BasePropertyCard";
import { Toast } from "@/app/componentes/ui/Toast";
import { DeleteModal } from "@/app/componentes/ui/DeleteModal";
import { cambiarEstadoPropiedadAction, eliminarPropiedadAction } from "@/app/acciones/propiedades.acciones";
import { PROPERTY_STATUS_CONFIG } from "@/app/lib/property-types";
import type { PropertyCardDTO, PaginationMeta } from "@/app/servicios/propiedades.servicio";
import type { PropertyStatus } from "@/app/servicios/propiedades.servicio";

interface SectionResult {
  data: PropertyCardDTO[];
  meta: PaginationMeta;
}

interface PropiedadesPanelProps {
  publishedResult: SectionResult;
  draftResult: SectionResult;
  archivedResult: SectionResult;
  totalCountByStatus: { published: number; draft: number; archived: number };
}

interface PropertyFilters extends BaseFilters {
  agencyName?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PropiedadesPanel({
  publishedResult,
  draftResult,
  archivedResult,
  totalCountByStatus,
}: PropiedadesPanelProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [showArchiveToast, setShowArchiveToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PropertyCardDTO | null>(null);

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");
  const totalFiltered =
    publishedResult.meta.total + draftResult.meta.total + archivedResult.meta.total;
  const totalAll =
    totalCountByStatus.published +
    totalCountByStatus.draft +
    totalCountByStatus.archived;

  const triggerPublishToast = useCallback(() => {
    setShowPublishToast(true);
    setTimeout(() => setShowPublishToast(false), 3500);
  }, []);

  const triggerArchiveToast = useCallback(() => {
    setShowArchiveToast(true);
    setTimeout(() => setShowArchiveToast(false), 3500);
  }, []);

  function buildParams(overrides: Record<string, string | undefined> = {}) {
    const p = new URLSearchParams();
    if (filters.search) p.set("search", filters.search);
    if (filters.propertyType) p.set("type", filters.propertyType);
    if (filters.operationType) p.set("operation", filters.operationType);
    if (filters.agencyName) p.set("agencyName", filters.agencyName);
    if (filters.addressSearch) p.set("addressSearch", filters.addressSearch);
    if (filters.currency) p.set("currency", filters.currency);
    if (filters.minPrice !== undefined) p.set("priceMin", String(filters.minPrice));
    if (filters.maxPrice !== undefined) p.set("priceMax", String(filters.maxPrice));
    const cur = new URLSearchParams(window.location.search);
    for (const key of ["publishedPage", "draftPage", "archivedPage"]) {
      const v = overrides[key] ?? cur.get(key);
      if (v && v !== "1") p.set(key, v);
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v && v !== "1") p.set(k, v);
      else p.delete(k);
    }
    return p.toString();
  }

  function applyFilters() {
    const p = new URLSearchParams();
    if (filters.search) p.set("search", filters.search);
    if (filters.propertyType) p.set("type", filters.propertyType);
    if (filters.operationType) p.set("operation", filters.operationType);
    if (filters.agencyName) p.set("agencyName", filters.agencyName);
    if (filters.addressSearch) p.set("addressSearch", filters.addressSearch);
    if (filters.currency) p.set("currency", filters.currency);
    if (filters.minPrice !== undefined) p.set("priceMin", String(filters.minPrice));
    if (filters.maxPrice !== undefined) p.set("priceMax", String(filters.maxPrice));
    router.push(`/dashboard/propiedades?${p.toString()}`);
  }

  function clearFilters() {
    setFilters({});
    router.push("/dashboard/propiedades");
  }

  function goToPage(pageKey: "publishedPage" | "draftPage" | "archivedPage", page: number) {
    router.push(`/dashboard/propiedades?${buildParams({ [pageKey]: String(page) })}`);
  }

  async function handleStatusChange(propertyId: string, status: PropertyStatus) {
    const res = await cambiarEstadoPropiedadAction(propertyId, status);
    if (res.ok) {
      if (status === "PUBLISHED") triggerPublishToast();
      if (status === "ARCHIVED") triggerArchiveToast();
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await eliminarPropiedadAction(target.id);
  }

  const extraFilters = (
    <>
      <div className="space-y-1">
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          Agencia / Inmobiliaria
        </p>
        <div className="relative">
          <Building2
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Ej: RE/MAX..."
            value={filters.agencyName ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, agencyName: e.target.value || undefined }))
            }
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="input-base pl-8"
            style={{ padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.8125rem" }}
          />
        </div>
      </div>
      <FilterSelect
        value={filters.currency ?? ""}
        onChange={(v) => setFilters((f) => ({ ...f, currency: v || undefined }))}
        label="Moneda"
        options={[
          { value: "USD", label: "USD" },
          { value: "ARS", label: "ARS" },
        ]}
      />
      <div className="flex gap-2 col-span-2 sm:col-span-1">
        <input
          type="number"
          placeholder="Precio mín."
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className="input-base"
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
        />
        <input
          type="number"
          placeholder="Máx."
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className="input-base"
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <Toast
        visible={showPublishToast}
        icon={<CheckCircle2 className="w-5 h-5" />}
        message="Propiedad publicada"
        color="var(--primary)"
        glowColor="rgba(63,91,75,0.4)"
      />
      <Toast
        visible={showArchiveToast}
        icon={<Archive className="w-5 h-5" />}
        message="Propiedad archivada"
        color="rgba(156,163,175,0.8)"
        glowColor="rgba(156,163,175,0.4)"
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="greeting-heading text-3xl sm:text-4xl font-bold tracking-tight">
            Gestión de Propiedades
          </h1>
          <p className="text-sm mt-0.5 text-domus-textSoft">
            Todas las propiedades del sistema
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            {hasActiveFilters
              ? `${totalFiltered} de ${totalAll}`
              : totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <FilterX className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      <BaseFilterBar
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        extraFilters={extraFilters}
        showSearchButton
        searchPlaceholder="Buscar por título, ciudad..."
      />

      <PropertySection
        title="Publicadas"
        accentColor="var(--primary)"
        accentBg="var(--primary-muted)"
        indicatorColor="#22c55e"
        result={publishedResult}
        cardStatus="PUBLISHED"
        hasFilters={hasActiveFilters}
        realTotal={totalCountByStatus.published}
        emptyMessage="No hay propiedades publicadas."
        onPageChange={(p) => goToPage("publishedPage", p)}
        onStatusChange={handleStatusChange}
        onDelete={(p) => setDeleteTarget(p)}
        defaultOpen
      />

      <PropertySection
        title="Borradores"
        accentColor="var(--accent)"
        accentBg="var(--accent-muted)"
        indicatorColor="#f59e0b"
        result={draftResult}
        cardStatus="DRAFT"
        hasFilters={hasActiveFilters}
        realTotal={totalCountByStatus.draft}
        emptyMessage="No hay borradores."
        onPageChange={(p) => goToPage("draftPage", p)}
        onStatusChange={handleStatusChange}
        onDelete={(p) => setDeleteTarget(p)}
        defaultOpen
      />

      <PropertySection
        title="Archivadas"
        accentColor="var(--text-secondary)"
        accentBg="var(--bg-secondary)"
        indicatorColor="#9ca3af"
        result={archivedResult}
        cardStatus="ARCHIVED"
        hasFilters={hasActiveFilters}
        realTotal={totalCountByStatus.archived}
        emptyMessage="No hay propiedades archivadas."
        onPageChange={(p) => goToPage("archivedPage", p)}
        onStatusChange={handleStatusChange}
        onDelete={(p) => setDeleteTarget(p)}
        defaultOpen={false}
      />

      {deleteTarget &&
        createPortal(
          <DeleteModal
            title={deleteTarget.title ?? "esta propiedad"}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />,
          document.body,
        )}
    </div>
  );
}

// ─── Property Section ──────────────────────────────────────────────────────────

interface PropertySectionProps {
  title: string;
  accentColor: string;
  accentBg: string;
  indicatorColor: string;
  result: SectionResult;
  cardStatus: string;
  hasFilters: boolean;
  realTotal: number;
  emptyMessage: string;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onDelete: (property: PropertyCardDTO) => void;
  defaultOpen?: boolean;
}

function PropertySection({
  title,
  accentColor,
  accentBg,
  indicatorColor,
  result,
  cardStatus,
  hasFilters,
  realTotal,
  emptyMessage,
  onPageChange,
  onStatusChange,
  onDelete,
  defaultOpen = true,
}: PropertySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const { data: properties, meta } = result;
  const isFilterEmpty = hasFilters && properties.length === 0 && realTotal > 0;
  const isReallyEmpty = !hasFilters && meta.total === 0;

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        border: "2px solid var(--border)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-150 group"
        style={{
          borderBottom: open ? "2px solid var(--border)" : "none",
          background: open ? "var(--bg-card)" : "var(--bg-secondary)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              background: indicatorColor,
              boxShadow: `0 0 0 3px ${indicatorColor}22`,
            }}
          />
          <h2 className="text-base font-bold text-domus-text">{title}</h2>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: accentBg, color: accentColor }}
          >
            {meta.total}
          </span>
          {isFilterEmpty && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1"
              style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <FilterX className="w-2.5 h-2.5" />
              Sin coincidencias
            </span>
          )}
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 group-hover:opacity-80"
          style={{
            background: open ? accentBg : "var(--bg-secondary)",
            color: open ? accentColor : "var(--text-secondary)",
            border: `1.5px solid ${open ? accentColor + "40" : "var(--border)"}`,
          }}
        >
          {open ? (
            <>
              <Minus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ocultar</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mostrar</span>
            </>
          )}
        </span>
      </button>

      {open && (
        <div className="p-5 animate-fade-up" style={{ animationDuration: "0.25s" }}>
          {isReallyEmpty && (
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-12 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <Building2
                className="w-10 h-10 mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm font-medium text-domus-textSoft">
                {emptyMessage}
              </p>
            </div>
          )}

          {isFilterEmpty && (
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 text-center gap-2"
              style={{ borderColor: "var(--border)" }}
            >
              <FilterX className="w-8 h-8 mb-1" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-semibold text-domus-textSoft">
                No se encontraron propiedades para este filtro
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Hay {realTotal} propiedad{realTotal !== 1 ? "es" : ""} en esta sección.
                Probá ajustar o limpiar los filtros.
              </p>
            </div>
          )}

          {properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((p) => {
                const config = PROPERTY_STATUS_CONFIG[cardStatus] ?? {
                  dot: "#9ca3af",
                  label: cardStatus,
                };
                return (
                  <BasePropertyCard
                    key={p.id}
                    propertyId={p.id}
                    propertyTitle={p.title ?? undefined}
                    propertyAddress={p.address ?? undefined}
                    propertyImage={p.multimedia[0]?.fileUrl}
                    propertyType={p.propertyType}
                    operationType={p.operationType as "SALE" | "RENT"}
                    views={p.views}
                    sellerName={p.seller?.agencyName ?? p.seller?.fullName ?? undefined}
                    dateLabel={p.updatedAt ? `Pub: ${formatDate(p.updatedAt)}` : undefined}
                    statusBadge={
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: config.dot }}
                        />
                        {config.label}
                      </span>
                    }
                    infoChips={
                      <>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "var(--primary)" }}
                        >
                          {p.currency} ${Number(p.price).toLocaleString("es-AR")}
                        </span>
                      </>
                    }
                    actions={
                      <div className="flex gap-2 flex-wrap justify-end">
                        {cardStatus === "DRAFT" && (
                          <button
                            onClick={() => onStatusChange(p.id, "PUBLISHED")}
                            className="btn btn-primary"
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                          >
                            Publicar
                          </button>
                        )}
                        {cardStatus === "PUBLISHED" && (
                          <button
                            onClick={() => onStatusChange(p.id, "ARCHIVED")}
                            className="btn btn-secondary"
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                          >
                            Archivar
                          </button>
                        )}
                        {cardStatus === "ARCHIVED" && (
                          <button
                            onClick={() => onStatusChange(p.id, "PUBLISHED")}
                            className="btn btn-primary"
                            style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                          >
                            Republicar
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(p)}
                          className="btn btn-danger"
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {meta.totalPages > 1 && (
            <Pagination
              meta={meta}
              accentColor={accentColor}
              accentBg={accentBg}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </section>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  meta,
  accentColor,
  accentBg,
  onPageChange,
}: {
  meta: PaginationMeta;
  accentColor: string;
  accentBg: string;
  onPageChange: (page: number) => void;
}) {
  const pages = buildPageRange(meta.page, meta.totalPages);

  return (
    <div
      className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <button
        type="button"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrevPage}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30"
        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-8 text-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-150"
            style={{
              background: p === meta.page ? accentBg : "var(--bg-secondary)",
              color: p === meta.page ? accentColor : "var(--text-secondary)",
              border:
                p === meta.page
                  ? `1.5px solid ${accentColor}40`
                  : "1.5px solid transparent",
            }}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30"
        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span
        className="ml-2 text-xs hidden sm:block"
        style={{ color: "var(--text-muted)" }}
      >
        Página {meta.page} de {meta.totalPages}
      </span>
    </div>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | "…")[] = [];
  const add = (n: number) => {
    if (!result.includes(n)) result.push(n);
  };
  add(1);
  if (current > 3) result.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++)
    add(p);
  if (current < total - 2) result.push("…");
  add(total);
  return result;
}
