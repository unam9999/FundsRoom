import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { session, apiClient } from './lib/api';
import type { User } from './types';
import Shell from './components/Shell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Challans from './pages/Challans';

function Protected(){
  const [user,setUser] = useState<User|null>(session.getUser());
  const [checking,setChecking] = useState(!!session.getToken() && !user);
  const nav = useNavigate();
  useEffect(()=>{
    const onUnauthorized=()=>{setUser(null);nav('/login',{replace:true});};
    window.addEventListener('xyz:unauthorized',onUnauthorized);
    if(session.getToken() && !user){ apiClient.me().then(u=>{setUser(u);sessionStorage.setItem('xyz_session_user',JSON.stringify(u));}).catch(onUnauthorized).finally(()=>setChecking(false)); }
    return ()=>window.removeEventListener('xyz:unauthorized',onUnauthorized);
  },[nav,user]);
  if(checking) return <div className="boot-screen"><div className="brand-mark">X</div><div className="loader-line"/></div>;
  if(!user) return <Navigate to="/login" replace/>;
  return <Shell user={user} onLogout={()=>{session.clear();setUser(null);nav('/login');}}/>;
}

function AnimatedRoutes(){
  const location=useLocation();
  return <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}} className="route-frame">
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route element={<Protected/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/customers" element={<Customers/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/challans" element={<Challans/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  </motion.div></AnimatePresence>;
}

export default function App(){
  return <AnimatedRoutes/>;
}
