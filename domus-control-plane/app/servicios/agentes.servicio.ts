import 'server-only'

export type EstadoAgente = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'

export type Agente = {
  id: string
  nombreCompleto: string
  nombreInmobiliaria: string | null
  email: string
  telefono: string | null
  vendedorId: string | null
  estado: EstadoAgente
}

export type AgentesFilters = {
  inmobiliariaId?: string
}

export type AgenteUpdateInput = {
  nombreCompleto?: string
  nombreInmobiliaria?: string
  email?: string
  telefono?: string
  vendedorId?: string
  estado?: EstadoAgente
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

function normalizeAgente(raw: unknown): Agente {
  const item = raw as Partial<Agente>

  return {
    id: item.id ?? 'sin-id',
    nombreCompleto: item.nombreCompleto ?? 'Sin nombre',
    nombreInmobiliaria: item.nombreInmobiliaria ?? null,
    email: item.email ?? 'Sin email',
    telefono: item.telefono ?? null,
    vendedorId: item.vendedorId ?? null,
    estado: item.estado ?? 'PENDIENTE',
  }
}

function buildAgentesParams(filters: AgentesFilters) {
  const params = new URLSearchParams()
  if (filters.inmobiliariaId) params.set('inmobiliariaId', filters.inmobiliariaId)
  const query = params.toString()

  return query ? `?${query}` : ''
}

export async function fetchAgentes(filters: AgentesFilters = {}) {
  const payload = await schedulingFetch(`/api/admin/agentes${buildAgentesParams(filters)}`)
  const data = unwrapApiData(payload)

  return Array.isArray(data) ? data.map(normalizeAgente) : []
}

export async function updateAgente(id: string, data: AgenteUpdateInput) {
  const payload = await schedulingFetch(`/api/admin/agentes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  const responseData = unwrapApiData(payload)

  return responseData ? normalizeAgente(responseData) : null
}

export async function deleteAgente(id: string) {
  await schedulingFetch(`/api/admin/agentes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
