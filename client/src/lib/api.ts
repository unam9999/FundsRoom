import type { ApiError, User } from '../types';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const TOKEN_KEY = 'xyz_session_token';
const USER_KEY = 'xyz_session_user';

export const session = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  getUser: (): User|null => { try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; } },
  set: (token:string,user:User) => { sessionStorage.setItem(TOKEN_KEY,token); sessionStorage.setItem(USER_KEY,JSON.stringify(user)); },
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); },
};

export async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
  const token = session.getToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type','application/json');
  if (token) headers.set('Authorization',`Bearer ${token}`);
  const response = await fetch(`${BASE}${path}`, {...options,headers});
  let payload:any = null;
  try { payload = await response.json(); } catch { /* empty */ }
  if (response.status === 401) { session.clear(); window.dispatchEvent(new Event('xyz:unauthorized')); }
  if (!response.ok) {
    const err = payload as ApiError;
    throw new Error(err?.error?.message || `Request failed (${response.status})`);
  }
  return payload?.data as T;
}

export const apiClient = {
  login: (email:string,password:string) => api<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  me: () => api<User>('/auth/me'),
  dashboard: () => api<any>('/dashboard/stats'),
  customers: (params:string='') => api<any>(`/customers${params}`),
  customer: (id:string) => api<any>(`/customers/${id}`),
  createCustomer: (body:any) => api<any>('/customers',{method:'POST',body:JSON.stringify(body)}),
  updateCustomer: (id:string,body:any) => api<any>(`/customers/${id}`,{method:'PUT',body:JSON.stringify(body)}),
  deleteCustomer: (id:string) => api<any>(`/customers/${id}`,{method:'DELETE'}),
  addFollowUp: (id:string,body:any) => api<any>(`/customers/${id}/followups`,{method:'POST',body:JSON.stringify(body)}),
  products: (params:string='') => api<any>(`/products${params}`),
  product: (id:string) => api<any>(`/products/${id}`),
  categories: () => api<string[]>('/products/categories'),
  createProduct: (body:any) => api<any>('/products',{method:'POST',body:JSON.stringify(body)}),
  updateProduct: (id:string,body:any) => api<any>(`/products/${id}`,{method:'PUT',body:JSON.stringify(body)}),
  deleteProduct: (id:string) => api<any>(`/products/${id}`,{method:'DELETE'}),
  inventory: (params:string='') => api<any>(`/inventory${params}`),
  movements: (params:string='') => api<any>(`/inventory/movements${params}`),
  createMovement: (body:any) => api<any>('/inventory/movements',{method:'POST',body:JSON.stringify(body)}),
  challans: (params:string='') => api<any>(`/challans${params}`),
  challan: (id:string) => api<any>(`/challans/${id}`),
  createChallan: (body:any) => api<any>('/challans',{method:'POST',body:JSON.stringify(body)}),
  confirmChallan: (id:string) => api<any>(`/challans/${id}/confirm`,{method:'POST'}),
  cancelChallan: (id:string) => api<any>(`/challans/${id}/cancel`,{method:'POST'}),
};
