import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from './components/layout'
import { Toasts } from './components/ui'
import { api, session } from './lib/api'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/Inventory'
import { Login } from './pages/Login'
import { Products } from './pages/Products'
import { Challans } from './pages/Challans'
import type { User } from './types'

function App(){
 const [user,setUser]=useState<User|null>(null);const [booting,setBooting]=useState(true);const [toasts,setToasts]=useState<{id:number;type:'success'|'error';message:string}[]>([]);const [refreshKey,setRefreshKey]=useState(0)
 const toast=(type:'success'|'error',message:string)=>{const id=Date.now()+Math.random();setToasts(x=>[...x,{id,type,message}]);window.setTimeout(()=>setToasts(x=>x.filter(t=>t.id!==id)),4200)}
 useEffect(()=>{if(!session.token){setBooting(false);return}api.auth.me().then(setUser).catch(()=>{session.clear();setUser(null)}).finally(()=>setBooting(false))},[])
 if(booting)return <Boot/>
 return <>
  <Routes>
    <Route path="/login" element={user?<Navigate to="/dashboard" replace/>:<Login onLogin={setUser}/>}/>
    <Route element={user?<AppLayout user={user} onLogout={()=>setUser(null)}/>:<Navigate to="/login" replace/>}>
      <Route index element={<Navigate to="/dashboard" replace/>}/>
      <Route path="dashboard" element={<Dashboard refreshKey={refreshKey}/>}/>
      <Route path="customers" element={user?<Customers user={user} onToast={toast}/>:<Navigate to="/login"/>}/>
      <Route path="products" element={user?<Products user={user} onToast={toast}/>:<Navigate to="/login"/>}/>
      <Route path="inventory" element={user?<Inventory user={user} onToast={toast}/>:<Navigate to="/login"/>}/>
      <Route path="challans" element={user?<Challans user={user} onToast={toast}/>:<Navigate to="/login"/>}/>
      <Route path="settings" element={user?<Settings user={user}/>:<Navigate to="/login"/>}/>
    </Route>
    <Route path="*" element={<Navigate to={user?'/dashboard':'/login'} replace/>}/>
  </Routes>
  <Toasts items={toasts} onRemove={id=>setToasts(x=>x.filter(t=>t.id!==id))}/>
 </>
}
function Boot(){return <div className="boot"><motion.div className="boot-mark" animate={{rotate:360}} transition={{duration:1.3,repeat:Infinity,ease:'linear'}}><span/></motion.div><p>Loading secure workspace</p></div>}
function Settings({user}:{user:User}){return <div className="content-page"><div className="content-title"><div><p className="eyebrow">WORKSPACE</p><h1>Settings</h1><p>Session and workspace information for your account.</p></div></div><div className="settings-grid"><div className="setting-card"><p className="eyebrow">SESSION</p><h3>Authenticated identity</h3><div className="setting-row"><span>Name</span><b>{user.name}</b></div><div className="setting-row"><span>Email</span><b>{user.email}</b></div><div className="setting-row"><span>Role</span><b>{user.role}</b></div><div className="setting-row"><span>Transport</span><b>Bearer JWT</b></div></div><div className="setting-card security-card"><div className="security-ring">✓</div><p className="eyebrow">SECURITY POSTURE</p><h3>Client-side safeguards</h3><p>Session token is stored in sessionStorage, API requests use a centralized authenticated client, and a 401 response clears the session. Server-side RBAC and validation remain authoritative.</p></div></div></div>}
export default App
