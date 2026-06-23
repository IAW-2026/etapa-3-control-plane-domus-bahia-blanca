import { getPropiedades } from "@/app/servicios/propiedades.servicio";
import PropiedadesPanel from "@/app/componentes/dashboard/PropiedadesPanel";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const sharedFilters: Record<string, string> = {
    limit: String(PAGE_SIZE),
  };
  if (params.search) sharedFilters.search = params.search;
  if (params.type) sharedFilters.type = params.type;
  if (params.operation) sharedFilters.operation = params.operation;
  if (params.agencyName) sharedFilters.agencyName = params.agencyName;
  if (params.addressSearch) sharedFilters.addressSearch = params.addressSearch;
  if (params.currency) sharedFilters.currency = params.currency;
  if (params.priceMin) sharedFilters.priceMin = params.priceMin;
  if (params.priceMax) sharedFilters.priceMax = params.priceMax;

  const publishedPage = params.publishedPage ?? "1";
  const draftPage = params.draftPage ?? "1";
  const archivedPage = params.archivedPage ?? "1";

  const [published, draft, archived] = await Promise.all([
    getPropiedades({ ...sharedFilters, status: "PUBLISHED", page: publishedPage }),
    getPropiedades({ ...sharedFilters, status: "DRAFT", page: draftPage }),
    getPropiedades({ ...sharedFilters, status: "ARCHIVED", page: archivedPage }),
  ]);

  const totalCountByStatus = {
    published: published.meta.total,
    draft: draft.meta.total,
    archived: archived.meta.total,
  };

  return (
    <PropiedadesPanel
      publishedResult={published}
      draftResult={draft}
      archivedResult={archived}
      totalCountByStatus={totalCountByStatus}
    />
  );
}
