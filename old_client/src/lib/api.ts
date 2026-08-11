import type { Challan, Customer, DashboardStats, Product, StockMovement, User, FollowUp } from '../types'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
const TOKEN_KEY = 'xyz_erp_token'

export const session = {
  get token() { return sessionStorage.getItem(TOKEN_KEY) },
  set token(value: string | null) { value ? sessionStorage.setItem(TOKEN_KEY, value) : sessionStorage.removeItem(TOKEN_KEY) },
  clear() { sessionStorage.removeItem(TOKEN_KEY) },
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) { super(message); this.name = 'ApiError'; this.status = status; this.code = code }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = session.token
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  let payload: any = null
  try { payload = await response.json() } catch { /* empty body */ }

  if (response.status === 401) session.clear()
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || 'Request failed. Please try again.', response.status, payload?.error?.code)
  }
  return (payload?.data ?? payload) as T
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k,v]) => v !== undefined && s.set(k, String(v)))
  return s.toString() ? `?${s}` : ''
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request<User>('/auth/me'),
  },
  dashboard: { stats: () => request<DashboardStats>('/dashboard/stats') },
  customers: {
    list: (params: Record<string, string | number | undefined> = {}) => request<{ customers: Customer[]; total: number; page: number; limit: number }>(`/customers${qs(params)}`),
    get: (id: string) => request<Customer & { follow_ups: FollowUp[]; challans: Challan[] }>(`/customers/${id}`),
    create: (body: Partial<Customer>) => request<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Customer>) => request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<unknown>(`/customers/${id}`, { method: 'DELETE' }),
    followUp: (id: string, body: { note: string; follow_up_date: string }) => request<FollowUp>(`/customers/${id}/followups`, { method: 'POST', body: JSON.stringify(body) }),
  },
  products: {
    list: (params: Record<string, string | number | boolean | undefined> = {}) => request<{ products: Product[]; total: number; page: number; limit: number }>(`/products${qs(params)}`),
    categories: () => request<string[]>('/products/categories'),
    get: (id: string) => request<Product>(`/products/${id}`),
    create: (body: Partial<Product>) => request<Product>('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Product>) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<unknown>(`/products/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    list: (params: Record<string, string | number | undefined> = {}) => request<{ products: Product[]; total: number; page: number; limit: number }>(`/inventory${qs(params)}`),
    movements: (params: Record<string, string | number | undefined> = {}) => request<{ movements: StockMovement[]; total: number; page: number; limit: number }>(`/inventory/movements${qs(params)}`),
    move: (body: { product_id: string; quantity: number; movement_type: 'IN'|'OUT'; reason?: string }) => request<StockMovement>('/inventory/movements', { method: 'POST', body: JSON.stringify(body) }),
  },
  challans: {
    list: (params: Record<string, string | number | undefined> = {}) => request<{ challans: Challan[]; total: number; page: number; limit: number }>(`/challans${qs(params)}`),
    get: (id: string) => request<Challan>(`/challans/${id}`),
    create: (body: { customer_id: string; items: { product_id: string; quantity: number }[] }) => request<Challan>('/challans', { method: 'POST', body: JSON.stringify(body) }),
    confirm: (id: string) => request<Challan>(`/challans/${id}/confirm`, { method: 'POST' }),
    cancel: (id: string) => request<Challan>(`/challans/${id}/cancel`, { method: 'POST' }),
  },
}
