"use client";

import { Building2, MapPin, Eye, Calendar } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  DUPLEX: "Dúplex",
  INTERNAL_APARTMENT: "Depto. Interno",
  COUNTRY_HOUSE: "Casa Quinta",
  LAND: "Terreno",
  FARM: "Campo",
  COMMERCIAL_PREMISES: "Local Comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Galpón",
  GARAGE: "Cochera",
  BUSINESS: "Fondo de Comercio",
};

const OP_LABEL: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
};

export interface BasePropertyCardProps {
  propertyId: string;
  propertyTitle?: string;
  propertyAddress?: string;
  propertyImage?: string;
  propertyType?: string;
  operationType?: "SALE" | "RENT";
  statusBadge?: React.ReactNode;
  infoChips?: React.ReactNode;
  actions?: React.ReactNode;
  views?: number;
  sellerName?: string;
  dateLabel?: string;
}

export function BasePropertyCard({
  propertyId,
  propertyTitle,
  propertyAddress,
  propertyImage,
  propertyType,
  operationType,
  statusBadge,
  infoChips,
  actions,
  views,
  sellerName,
  dateLabel,
}: BasePropertyCardProps) {
  const tipoLabel = propertyType ? TYPE_LABEL[propertyType] ?? propertyType : null;
  const opLabel = operationType ? OP_LABEL[operationType] ?? operationType : null;

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{
        border: "1.5px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <div className="flex gap-0">
        <div
          className="w-24 sm:w-32 flex-shrink-0 relative overflow-hidden self-stretch"
          style={{ background: "var(--bg-secondary)", minHeight: "108px" }}
        >
          {propertyImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={propertyImage}
              alt={propertyTitle ?? "Propiedad"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2">
              <Building2
                className="w-7 h-7"
                style={{ color: "var(--primary)", opacity: 0.45 }}
              />
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {opLabel && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }}
              >
                {opLabel}
              </span>
            )}
            {tipoLabel && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }}
              >
                {tipoLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 p-3 sm:p-4 min-w-0 flex flex-col justify-between gap-2">
          <div className="min-w-0">
            {propertyTitle ? (
              <p className="text-sm font-bold text-domus-text truncate leading-snug">
                {propertyTitle}
              </p>
            ) : (
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Prop. #{propertyId.slice(-6)}
              </p>
            )}
            {propertyAddress && (
              <span
                className="flex items-center gap-1 text-xs mt-0.5 truncate"
                style={{ color: "var(--text-muted)" }}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {propertyAddress}
              </span>
            )}
          </div>

          {infoChips && (
            <div className="flex flex-wrap gap-x-3 gap-y-1">{infoChips}</div>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {sellerName && (
              <span
                className="text-[11px] font-medium flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Building2 className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                {sellerName}
              </span>
            )}
            {views !== undefined && views > 0 && (
              <span
                className="text-[11px] font-medium flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Eye className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                {views}
              </span>
            )}
            {dateLabel && (
              <span
                className="text-[11px] font-medium flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
              >
                <Calendar className="w-3 h-3" />
                {dateLabel}
              </span>
            )}
          </div>

          {statusBadge && <div>{statusBadge}</div>}
        </div>
      </div>

      {actions && (
        <div
          className="flex items-center justify-end gap-2 px-4 py-2.5 border-t"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export function InfoChip({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}:
      </span>
      <span
        className="text-xs font-semibold truncate max-w-[120px]"
        style={{ color: highlight ? "var(--primary)" : "var(--text-main)" }}
      >
        {value}
      </span>
    </div>
  );
}
