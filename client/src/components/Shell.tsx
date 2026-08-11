import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Moon, Package, Search, Sun, Users, Warehouse, X } from 'lucide-react';
import type { Role, User } from '../types';
import { cn, initials } from '../lib/utils';

const links = [
  {to:'/dashboard',label:'Overview',icon:LayoutDashboard},
  {to:'/customers',label:'Customers',icon:Users},
  {to:'/products',label:'Products',icon:Package},
  {to:'/inventory',label:'Inventory',icon:Warehouse},
  {to:'/challans',label:'Sales challans',icon:ClipboardList},
];

const roleLabel:Record<Role,string>={ADMIN:'Administrator',SALES:'Sales',WAREHOUSE:'Warehouse',ACCOUNTS:'Accounts'};

export default function Shell({user,onLogout}:{user:User;onLogout:()=>void}){
  const [collapsed,setCollapsed]=useState(false); const [mobile,setMobile]=useState(false); const [dark,setDark]=useState(localStorage.getItem('xyz_theme')==='dark');
  const [searchOpen,setSearchOpen]=useState(false); const loc=useLocation();
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'; localStorage.setItem('xyz_theme',dark?'dark':'light');},[dark]);
  useEffect(()=>setMobile(false),[loc.pathname]);
  const current=useMemo(()=>links.find(x=>loc.pathname.startsWith(x.to))?.label||'Overview',[loc.pathname]);
  return <div className={cn('app-shell',collapsed&&'nav-collapsed')}>
    <aside className={cn('sidebar',mobile&&'mobile-open')}>
      <div className="sidebar-top">
        <div className="brand"><div className="brand-mark">X</div>{!collapsed&&<div><strong>XYZ</strong><span>Company</span></div>}</div>
        <button className="icon-btn mobile-close" onClick={()=>setMobile(false)}><X size={18}/></button>
      </div>
      <div className="workspace-switch">{!collapsed&&<><div className="workspace-avatar">XC</div><div className="workspace-copy"><b>Operations</b><span>Head office</span></div><ChevronDown size={15}/></>}</div>
      <nav className="nav-list">{links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} title={collapsed?label:undefined} className={({isActive})=>cn('nav-item',isActive&&'active')}><Icon size={18}/>{!collapsed&&<span>{label}</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        {!collapsed&&<div className="sidebar-tip"><span className="pulse-dot"/><div><b>Everything in view.</b><small>Keep stock healthy today.</small></div></div>}
        <button className="nav-item" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>} {!collapsed&&<span>{dark?'Light theme':'Dark theme'}</span>}</button>
        <button className="nav-item logout" onClick={onLogout}><LogOut size={18}/>{!collapsed&&<span>Sign out</span>}</button>
      </div>
      <button className="collapse-btn" onClick={()=>setCollapsed(v=>!v)}>{collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-btn mobile-menu" onClick={()=>setMobile(true)}><Menu size={19}/></button><div><span className="eyebrow">Workspace / {current}</span><h1>{current}</h1></div></div>
        <div className="topbar-actions">
          <button className={cn('search-trigger',searchOpen&&'open')} onClick={()=>setSearchOpen(v=>!v)}><Search size={17}/><span>Search</span><kbd>⌘ K</kbd></button>
          <button className="icon-btn notification"><Bell size={18}/><i/></button>
          <div className="user-menu"><div className="avatar">{initials(user.name)}</div><div className="user-copy"><b>{user.name}</b><span>{roleLabel[user.role]}</span></div><ChevronDown size={15}/></div>
        </div>
      </header>
      {searchOpen&&<div className="search-pop"><Search size={18}/><input autoFocus placeholder="Search customers, products, challans..."/><span>ESC</span></div>}
      <main className="page-content"><div className="page-inner"><OutletPlaceholder/></div></main>
    </div>
  </div>;
}

// Keeps Shell's chrome separate from routed content through a tiny portal-like outlet.
// React Router's Outlet is imported lazily below to keep the file readable.
function OutletPlaceholder(){ return <Outlet/>; }
