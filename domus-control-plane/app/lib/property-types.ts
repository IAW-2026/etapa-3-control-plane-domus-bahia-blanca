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

export const PROPERTY_TYPE_SHORT_LABEL: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Dpto.",
  DUPLEX: "Duplex",
  INTERNAL_APARTMENT: "Dpto. Int.",
  COUNTRY_HOUSE: "Casa Q.",
  LAND: "Terreno",
  FARM: "Campo",
  COMMERCIAL_PREMISES: "Local",
  OFFICE: "Oficina",
  WAREHOUSE: "Galpón",
  GARAGE: "Cochera",
  BUSINESS: "F. Com.",
};

export const OPERATION_TYPE_OPTIONS = [
  { value: "SALE", label: "Venta" },
  { value: "RENT", label: "Alquiler" },
];

export const OPERATION_TYPE_LABEL: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
};

export const PROPERTY_STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  PUBLISHED: { dot: "#22c55e", label: "Publicada" },
  DRAFT: { dot: "#f59e0b", label: "Borrador" },
  ARCHIVED: { dot: "#9ca3af", label: "Archivada" },
};
