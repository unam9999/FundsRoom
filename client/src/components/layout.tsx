import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Boxes, ChevronDown, ClipboardList, Command, LayoutDashboard, LogOut, Menu, PackageSearch, Search, Settings2, ShieldCheck, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { initials } from '../lib/utils'
import type { Role, User } from '../types'
import { session } from '../lib/api'

const nav = [
  {to:'/dashboard',label:'Overview',icon:LayoutDashboard},
  {to:'/customers',label:'Customers',icon:UsersRound},
  {to:'/products',label:'Products',icon:Boxes},
  {to:'/inventory',label:'Inventory',icon:PackageSearch},
  {to:'/challans',label:'Sales challans',icon:ClipboardList},
]

export function AppLayout({user,onLogout}:{user:User;onLogout:()=>void}) {
  const [mobileOpen,setMobileOpen]=useState(false)
  const [profileOpen,setProfileOpen]=useState(false)
  const location=useLocation(); const navigate=useNavigate()
  const title=location.pathname.startsWith('/customers')?'Customers':location.pathname.startsWith('/products')?'Products':location.pathname.startsWith('/inventory')?'Inventory':location.pathname.startsWith('/challans')?'Sales challans':'Operations overview'
  const logout=()=>{session.clear();onLogout();navigate('/login')}
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand"><div className="brand-mark"><span/></div><div><strong>XYZ</strong><small>COMPANY</small></div><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-pill"><div className="workspace-dot"/><div><span>Operations</span><b>Primary workspace</b></div><ChevronDown size={14}/></div>
      <nav>{nav.map(item=><NavLink key={item.to} to={item.to} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{item.to==='/inventory'&&<span className="nav-pulse"/>}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="secure-note"><ShieldCheck size={17}/><div><b>Protected workspace</b><span>JWT · RBAC enabled</span></div></div>
        <NavLink to="/settings" className="nav-item"><Settings2 size={18}/><span>Workspace</span></NavLink>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={19}/></button><div className="crumb"><span>XYZ Company</span><i>/</i><b>{title}</b></div><div className="top-actions"><div className="global-search"><Search size={16}/><input placeholder="Search workspace"/><kbd>⌘ K</kbd></div><button className="command-btn"><Command size={16}/></button><div className="profile-wrap"><button className="profile" onClick={()=>setProfileOpen(x=>!x)}><div className="avatar">{initials(user.name)}</div><div className="profile-copy"><b>{user.name}</b><span>{roleLabel(user.role)}</span></div><ChevronDown size={15}/></button><AnimatePresence>{profileOpen&&<motion.div className="profile-menu" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}}><div className="profile-menu-head"><div className="avatar large">{initials(user.name)}</div><div><b>{user.name}</b><span>{user.email}</span></div></div><button onClick={logout}><LogOut size={15}/> Sign out</button></motion.div>}</AnimatePresence></div></div></header>
      <div className="page"><Outlet/></div>
    </main>
    {mobileOpen&&<div className="mobile-overlay" onClick={()=>setMobileOpen(false)}/>} 
  </div>
}
export function roleLabel(role:Role){return {ADMIN:'Administrator',SALES:'Sales',WAREHOUSE:'Warehouse',ACCOUNTS:'Accounts'}[role]}
