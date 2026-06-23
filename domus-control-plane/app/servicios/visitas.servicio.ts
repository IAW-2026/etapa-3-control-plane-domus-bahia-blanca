import 'server-only'
import { getVendedores, type VendedorDTO } from '@/app/servicios/vendedor.servicio'

export type EstadoTurno = 'PENDIENTE_AGENTE' | 'PRE_ACEPTADO' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO'
export type EstadoTurnoComprador = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO'

export type Visita = {
  id: string
  propiedadId: string
  compradorId: string
  vendedorId: string
  nombreInmobiliaria: string | null
  nombreComprador: string | null
  agenteId: string | null
  agenteNombre: string | null
  fechaHoraSolicitada: string | null
  estado: EstadoTurno
  estadoComprador: EstadoTurnoComprador
  observaciones: string | null
  creadoEn: string
  tituloPropiedad: string | null
  direccion: string | null
}

export type VisitasFilters = {
  inmobiliariaId?: string
  compradorId?: string
  nombreComprador?: string
  agenteNombre?: string
  estado?: EstadoTurno | ''
}

function readEnvValue(...values: (string | undefined)[]) {
  return values.find((value) => {
    const normalized = value?.trim().toLowerCase()
    return normalized && normalized !== 'undefined' && normalized !== 'null'
  })?.trim()
}

function readEnvUrl(defaultUrl: string, ...values: (string | undefined)[]) {
  const value = readEnvValue(...values) ?? defaultUrl
  return value.replace(/\/$/, '')
}

function buildApiUrl(baseUrl: string, path: string) {
  return new URL(path, `${baseUrl}/`).toString()
}

function getSchedulingConfig() {
  const baseUrl = readEnvUrl(
    'https://proyecto-c-shipping-domus-bahia.vercel.app',
    process.env.SCHEDULING_APP_BASE_URL
  )
  const apiKey = readEnvValue(process.env.SCHEDULING_APP_API_KEY)

  return { baseUrl, apiKey }
}

function sellerDisplayName(seller: VendedorDTO) {
  return seller.agencyName ?? seller.fullName ?? seller.email ?? seller.id
}

function normalizeVisita(raw: unknown, sellersById = new Map<string, string>()): Visita {
  const item = raw as Partial<Visita> & {
    propiedad?: {
      nombrePropiedad?: string | null
      direccion?: string | null
      nombreInmobiliaria?: string | null
    }
    agente?: {
      nombreCompleto?: string | null
    } | null
  }

  const vendedorId = item.vendedorId ?? 'sin-vendedor'

  return {
    id: item.id ?? 'sin-id',
    propiedadId: item.propiedadId ?? 'sin-propiedad',
    compradorId: item.compradorId ?? 'sin-comprador',
    vendedorId,
    nombreInmobiliaria: item.nombreInmobiliaria ?? item.propiedad?.nombreInmobiliaria ?? sellersById.get(vendedorId) ?? null,
    nombreComprador: item.nombreComprador ?? null,
    agenteId: item.agenteId ?? null,
    agenteNombre: item.agenteNombre ?? item.agente?.nombreCompleto ?? null,
    fechaHoraSolicitada: item.fechaHoraSolicitada ?? null,
    estado: item.estado ?? 'PENDIENTE_AGENTE',
    estadoComprador: item.estadoComprador ?? 'PENDIENTE',
    observaciones: item.observaciones ?? null,
    creadoEn: item.creadoEn ?? new Date().toISOString(),
    tituloPropiedad: item.tituloPropiedad ?? item.propiedad?.nombrePropiedad ?? null,
    direccion: item.direccion ?? item.propiedad?.direccion ?? null,
  }
}

async function parseJsonResponse(response: Response, label: string) {
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`${label} error ${response.status}: ${text.slice(0, 200)}`)
  }

  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(`${label} no devolvio JSON: ${text.slice(0, 200)}`)
  }
}

async function schedulingFetch(path: string, init?: RequestInit) {
  const { baseUrl, apiKey } = getSchedulingConfig()

  if (!apiKey) {
    throw new Error('Falta configurar SCHEDULING_APP_API_KEY')
  }

  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('X-API-Key', apiKey)

  const response = await fetch(buildApiUrl(baseUrl, path), {
    ...init,
    headers,
    cache: 'no-store',
  })

  return parseJsonResponse(response, 'Scheduling API')
}

function unwrapApiData(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return (payload as { data: unknown }).data
  }

  return payload
}

function buildEstadoParams(estado?: EstadoTurno | '') {
  const params = new URLSearchParams()
  if (estado) params.set('estado', estado)
  const query = params.toString()
  return query ? `?${query}` : ''
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesField(value: string | null | undefined, search: string | undefined) {
  const tokens = normalizeSearchText(search).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  const searchable = normalizeSearchText(value)
  return tokens.every((token) => searchable.includes(token))
}

function hasAnyFilter(filters: VisitasFilters) {
  return Boolean(
    filters.inmobiliariaId ||
      filters.compradorId ||
      filters.nombreComprador?.trim() ||
      filters.agenteNombre?.trim() ||
      filters.estado
  )
}

export async function fetchVisitas(filters: VisitasFilters) {
  if (!hasAnyFilter(filters)) {
    return { visitas: [], mocked: false }
  }

  const vendedores = await getVendedores()
  const vendedoresById = new Map(vendedores.map((vendedor) => [vendedor.id, sellerDisplayName(vendedor)]))
  const query = buildEstadoParams(filters.estado)

  if (filters.compradorId) {
    const payload = await schedulingFetch(`/api/turnos/comprador/${encodeURIComponent(filters.compradorId)}${query}`)
    const visitas = Array.isArray(payload)
      ? payload.map((item) => normalizeVisita(item, vendedoresById)).filter((visita) =>
          matchesField(visita.nombreComprador ?? visita.compradorId, filters.nombreComprador) &&
          matchesField(visita.agenteNombre ?? visita.agenteId, filters.agenteNombre)
        )
      : []
    return { visitas, mocked: false }
  }

  const vendedoresToQuery = filters.inmobiliariaId
    ? vendedores.filter((vendedor) => vendedor.id === filters.inmobiliariaId)
    : vendedores

  const visitsBySeller = await Promise.all(
    vendedoresToQuery.map(async (vendedor) => {
      const payload = await schedulingFetch(`/api/turnos/inmobiliaria/${encodeURIComponent(vendedor.id)}${query}`)
      return Array.isArray(payload) ? payload.map((item) => normalizeVisita(item, vendedoresById)) : []
    })
  )

  const visitas = visitsBySeller.flat().filter((visita) =>
    matchesField(visita.nombreComprador ?? visita.compradorId, filters.nombreComprador) &&
    matchesField(visita.agenteNombre ?? visita.agenteId, filters.agenteNombre)
  )

  return { visitas, mocked: false }
}

export async function resolverVisita(turnoId: string, estado: EstadoTurno) {
  const vendedores = await getVendedores().catch(() => [])
  const vendedoresById = new Map(vendedores.map((vendedor) => [vendedor.id, sellerDisplayName(vendedor)]))
  const payload = await schedulingFetch(`/api/admin/turnos/${encodeURIComponent(turnoId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
  const data = unwrapApiData(payload)

  return data ? normalizeVisita(data, vendedoresById) : null
}

export async function cancelarVisita(compradorId: string, turnoId: string) {
  await schedulingFetch(
    `/api/turnos/comprador/${encodeURIComponent(compradorId)}/turno/${encodeURIComponent(turnoId)}`,
    { method: 'PATCH' }
  )
}

export async function borrarVisita(turnoId: string) {
  await schedulingFetch(`/api/admin/turnos/${encodeURIComponent(turnoId)}`, {
    method: 'DELETE',
  })
}
