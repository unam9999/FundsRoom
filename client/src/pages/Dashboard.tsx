import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, Boxes, ClipboardCheck, PackageOpen, UsersRound } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { api } from '../lib/api'
import type { DashboardStats } from '../types'
import { Badge, Card, Empty } from '../components/ui'
import { dateTime, money } from '../lib/utils'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
function buildChartData(movements: import('../types').StockMovement[]) {
  const counts: Record<string, number> = {}
  DAYS.forEach(d => counts[d] = 0)
  movements.forEach(m => {
    const day = DAYS[new Date(m.created_at).getDay()]
    counts[day] = (counts[day] || 0) + m.quantity
  })
  return DAYS.map(d => ({ day: d, value: counts[d] }))
}
export function Dashboard({refreshKey=0}:{refreshKey?:number}){
 const [data,setData]=useState<DashboardStats|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('')
 useEffect(()=>{setLoading(true);api.dashboard.stats().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[refreshKey])
 if(loading)return <PageSkeleton/>
 if(error)return <div className="error-state"><h2>Couldn't load the workspace</h2><p>{error}</p></div>
 if(!data)return null
 const chartData = buildChartData(data.recentMovements)
 const today = new Date().toLocaleDateString('en-IN',{weekday:'long'}).toUpperCase()
 const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
 return <div className="dashboard-page">
  <div className="page-hero"><div><p className="eyebrow">{today} · OPERATIONS</p><h1>{greeting}<span>.</span></h1><p className="hero-sub">A live pulse of what needs attention across XYZ Company.</p></div><div className="hero-orbit"><div className="orbit-core"><Activity size={19}/></div><span className="orbit-dot d1"/><span className="orbit-dot d2"/><span className="orbit-dot d3"/></div></div>
  <div className="metric-grid">
   <Metric icon={<UsersRound/>} label="Customers" value={data.customers.total} sub={`${data.customers.active} active`} tone="violet"/>
   <Metric icon={<Boxes/>} label="Products" value={data.products.total} sub={`${data.products.lowStockCount} need attention`} tone="blue" alert={data.products.lowStockCount>0}/>
   <Metric icon={<ClipboardCheck/>} label="Challans" value={data.challans.total} sub={`${data.challans.draft} drafts · ${data.challans.confirmed} confirmed`} tone="green"/>
   <Metric icon={<PackageOpen/>} label="Follow-ups" value={data.followUps.upcomingCount} sub="Next 7 days" tone="orange"/>
  </div>
  <div className="dashboard-grid">
   <Card className="chart-card"><div className="section-head"><div><p className="eyebrow">STOCK MOVEMENTS — THIS WEEK</p><h3>Activity by day</h3></div><Badge tone="success">Real data</Badge></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".34"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#747b8d',fontSize:11}}/><Tooltip contentStyle={{background:'#161922',border:'1px solid #2a2f3b',borderRadius:12,color:'#fff'}}/><Area type="monotone" dataKey="value" stroke="#9b7bff" strokeWidth={2.5} fill="url(#v)"/></AreaChart></ResponsiveContainer></div></Card>
   <Card className="focus-card"><div className="section-head"><div><p className="eyebrow">NEEDS ATTENTION</p><h3>Low stock</h3></div><ArrowUpRight size={18}/></div>{data.products.lowStock.length===0?<Empty title="Stock looks healthy" description="Nothing is below its minimum threshold."/>:<div className="focus-list">{data.products.lowStock.slice(0,5).map(p=><div className="focus-row" key={p.id}><div className="product-avatar">{p.name.slice(0,1)}</div><div className="focus-copy"><b>{p.name}</b><span>{p.sku}</span></div><div className="stock-number"><strong>{p.current_stock}</strong><small>/ {p.minimum_stock}</small></div></div>)}</div>}</Card>
   <Card className="wide-card"><div className="section-head"><div><p className="eyebrow">RECENT DOCUMENTS</p><h3>Sales challans</h3></div><a href="/challans">View all <ArrowUpRight size={14}/></a></div><div className="table-wrap"><table><thead><tr><th>Challan</th><th>Customer</th><th>Items</th><th>Created</th><th>Status</th></tr></thead><tbody>{data.challans.recent.slice(0,6).map(c=><tr key={c.id}><td><b className="mono">{c.challan_number}</b></td><td>{c.customer?.business_name||c.customer?.name}</td><td>{c._count?.items||0} lines</td><td>{dateTime(c.created_at)}</td><td><StatusBadge status={c.status}/></td></tr>)}</tbody></table></div></Card>
   <Card className="activity-card"><div className="section-head"><div><p className="eyebrow">ACTIVITY STREAM</p><h3>Stock movement</h3></div></div><div className="activity-list">{data.recentMovements.slice(0,6).map(m=><div className="activity-row" key={m.id}><div className={`movement-dot ${m.movement_type==='IN'?'in':'out'}`}>{m.movement_type}</div><div><b>{m.product?.name}</b><span>{m.reason||'Inventory adjustment'} · {dateTime(m.created_at)}</span></div><strong className={m.movement_type==='IN'?'positive':'negative'}>{m.movement_type==='IN'?'+':'-'}{m.quantity}</strong></div>)}</div></Card>
  </div>
 </div>
}
function Metric({icon,label,value,sub,tone,alert}:{icon:any;label:string;value:number;sub:string;tone:string;alert?:boolean}){return <Card className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-copy"><span>{label}</span><strong>{value.toLocaleString('en-IN')}</strong><small className={alert?'attention':''}>{sub}</small></div><ArrowUpRight size={16} className="metric-arrow"/></Card>}
function StatusBadge({status}:{status:string}){return <Badge tone={status==='CONFIRMED'?'success':status==='DRAFT'?'warning':'danger'}>{status}</Badge>}
function PageSkeleton(){return <div className="skeleton-page"><div className="skeleton-title"/><div className="skeleton-metrics">{[1,2,3,4].map(i=><div key={i} className="skeleton-card"/>)}</div><div className="skeleton-large"/></div>}
