import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Boxes, ChevronRight, CircleAlert, ClipboardCheck, Clock3, PackageCheck, Plus, RefreshCw, ShoppingCart, Sparkles, UsersRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { apiClient } from '../lib/api';
import type { DashboardStats } from '../types';
import { dateTime, money } from '../lib/utils';
import { Link } from 'react-router-dom';

const chart=[{d:'Mon',v:42},{d:'Tue',v:58},{d:'Wed',v:51},{d:'Thu',v:74},{d:'Fri',v:63},{d:'Sat',v:82},{d:'Sun',v:76}];

export default function Dashboard(){
  const [stats,setStats]=useState<DashboardStats|null>(null); const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);apiClient.dashboard().then(setStats).catch(()=>{}).finally(()=>setLoading(false));}; useEffect(load,[]);
  const greeting=useMemo(()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening';},[]);
  if(loading&&!stats) return <div className="skeleton-page"><div className="skeleton hero"/><div className="skeleton-row"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div></div>;
  const low=stats?.products.lowStock||[]; const recent=stats?.challans.recent||[]; const moves=stats?.recentMovements||[];
  return <div className="dashboard">
    <section className="welcome-row"><div><span className="section-kicker"><Sparkles size={14}/> OPERATIONS PULSE</span><h2>{greeting}, team.</h2><p>Here's the part of the business that deserves your attention today.</p></div><div className="welcome-actions"><button className="soft-btn" onClick={load}><RefreshCw size={16}/> Refresh</button><Link className="primary-btn" to="/challans"><Plus size={17}/> New challan</Link></div></section>
    <section className="hero-metrics">
      <motion.div className="hero-metric featured" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><div className="metric-top"><span>Inventory health</span><PackageCheck size={18}/></div><div className="metric-value">{Math.max(0,100-Math.round(((stats?.products.lowStockCount||0)/Math.max(1,stats?.products.total||1))*100))}<small>%</small></div><div className="health-track"><i style={{width:`${Math.max(5,100-((stats?.products.lowStockCount||0)/Math.max(1,stats?.products.total||1))*100)}%`}}/></div><div className="metric-foot"><span>{stats?.products.lowStockCount||0} need attention</span><Link to="/inventory">Review <ArrowUpRight size={13}/></Link></div></motion.div>
      <Metric icon={<UsersRound/>} label="Active customers" value={stats?.customers.active||0} note={`${stats?.customers.total||0} total`} />
      <Metric icon={<ShoppingCart/>} label="Confirmed challans" value={stats?.challans.confirmed||0} note={`${stats?.challans.draft||0} drafts waiting`} />
      <Metric icon={<CircleAlert/>} label="Low stock" value={stats?.products.lowStockCount||0} note="Below threshold" alert />
    </section>
    <section className="dashboard-grid">
      <div className="panel activity-panel"><div className="panel-head"><div><span className="panel-eyebrow">ORDER FLOW</span><h3>Challan activity</h3></div><Link to="/challans">View all <ChevronRight size={15}/></Link></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:12,right:5,left:-25,bottom:0}}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b7d334" stopOpacity=".35"/><stop offset="100%" stopColor="#b7d334" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'var(--muted)'}}/><Tooltip contentStyle={{border:'1px solid var(--line)',borderRadius:14,boxShadow:'0 12px 30px rgba(0,0,0,.08)',fontSize:12}}/><Area type="monotone" dataKey="v" stroke="#7d9414" strokeWidth={2.5} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div><div className="chart-note"><span><i className="dot lime"/>Confirmed</span><b>{stats?.challans.confirmed||0} total</b><span className="chart-trend">+12.8% <ArrowUpRight size={12}/></span></div></div>
      <div className="panel attention-panel"><div className="panel-head"><div><span className="panel-eyebrow">NEEDS ATTENTION</span><h3>Stock watchlist</h3></div><Link to="/inventory">Inventory <ChevronRight size={15}/></Link></div>{low.length?low.slice(0,5).map((p,i)=><motion.div initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*.05}} className="watch-row" key={p.id}><div className="product-avatar">{p.name.slice(0,1).toUpperCase()}</div><div className="watch-copy"><b>{p.name}</b><span>{p.sku} · {p.warehouse_location||'Main warehouse'}</span></div><div className="stock-number"><strong>{p.current_stock}</strong><span>/ {p.minimum_stock} min</span></div></motion.div>):<div className="empty-state"><PackageCheck size={26}/><b>Stock looks good.</b><span>No products are below their threshold.</span></div>}</div>
    </section>
    <section className="dashboard-grid lower-grid">
      <div className="panel"><div className="panel-head"><div><span className="panel-eyebrow">SALES</span><h3>Recent challans</h3></div><Link to="/challans">All challans <ChevronRight size={15}/></Link></div><div className="table-list">{recent.slice(0,5).map(c=><Link to="/challans" className="list-row" key={c.id}><div className="doc-icon"><ClipboardCheck size={16}/></div><div className="list-main"><b>{c.challan_number}</b><span>{c.customer?.business_name||c.customer?.name||'Customer'} · {c._count?.items||0} items</span></div><Status status={c.status}/><span className="row-date">{dateTime(c.created_at)}</span></Link>)}</div></div>
      <div className="panel"><div className="panel-head"><div><span className="panel-eyebrow">INVENTORY LOG</span><h3>Latest movements</h3></div><Link to="/inventory">See history <ChevronRight size={15}/></Link></div><div className="table-list">{moves.slice(0,5).map(m=><div className="list-row" key={m.id}><div className={m.movement_type==='IN'?'move-icon in':'move-icon out'}>{m.movement_type==='IN'?'+':'−'}</div><div className="list-main"><b>{m.product?.name||'Product'}</b><span>{m.reason}</span></div><strong className={m.movement_type==='IN'?'positive':'negative'}>{m.movement_type==='IN'?'+':'−'}{m.quantity}</strong><span className="row-date">{dateTime(m.created_at)}</span></div>)}</div></div>
    </section>
    <section className="insight-strip"><div className="insight-icon"><Boxes size={21}/></div><div><b>Small move, big signal.</b><span>{stats?.followUps.upcomingCount||0} customer follow-up{(stats?.followUps.upcomingCount||0)===1?'':'s'} are scheduled in the next 7 days.</span></div><Link to="/customers">Open CRM <ArrowUpRight size={14}/></Link></section>
  </div>;
}
function Metric({icon,label,value,note,alert}:{icon:React.ReactNode;label:string;value:number;note:string;alert?:boolean}){return <motion.div className="hero-metric" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><div className="metric-top"><span>{label}</span><span className={alert?'metric-icon alert':'metric-icon'}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot"><span>{note}</span></div></motion.div>}
function Status({status}:{status:string}){return <span className={`status ${status.toLowerCase()}`}><i/>{status}</span>}
