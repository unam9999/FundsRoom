export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS'
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR'
export type CustomerStatus = 'ACTIVE' | 'INACTIVE'
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
export type MovementType = 'IN' | 'OUT'

export interface User { id: string; name: string; email: string; role: Role; is_active?: boolean }
export interface Customer { id: string; name: string; mobile: string; email?: string | null; business_name?: string | null; gst_number?: string | null; customer_type: CustomerType; address?: string | null; status: CustomerStatus; created_at: string; _count?: { follow_ups: number; challans: number } }
export interface FollowUp { id: string; note: string; follow_up_date: string; created_at: string; creator?: { id: string; name: string; role?: Role }; customer?: Pick<Customer,'id'|'name'|'business_name'> }
export interface Product { id: string; name: string; sku: string; category: string; unit_price: string | number; current_stock: number; minimum_stock: number; warehouse_location?: string | null; created_at: string; updated_at?: string; stock_movements?: StockMovement[] }
export interface StockMovement { id: string; quantity: number; movement_type: MovementType; reason?: string | null; created_at: string; product?: Pick<Product,'id'|'name'|'sku'>; creator?: Pick<User,'id'|'name'> }
export interface ChallanItem { id?: string; product_id: string; product_name_snapshot: string; sku_snapshot: string; unit_price_snapshot: string | number; quantity: number; product?: Product }
export interface Challan { id: string; challan_number: string; customer_id: string; total_quantity: number; status: ChallanStatus; created_at: string; updated_at?: string; customer?: Pick<Customer,'id'|'name'|'business_name'>; creator?: Pick<User,'id'|'name'> & { role?: Role }; items?: ChallanItem[]; _count?: { items: number } }
export interface DashboardStats { customers: { total: number; active: number }; products: { total: number; lowStock: Product[]; lowStockCount: number }; challans: { total: number; draft: number; confirmed: number; recent: Challan[] }; followUps: { upcoming: FollowUp[]; upcomingCount: number }; recentMovements: StockMovement[] }
export interface Paginated<T> { [key: string]: unknown; total: number; page: number; limit: number; }
