import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient, session } from '../lib/api';

export default function Login(){
  const [email,setEmail]=useState('admin@xyzcompany.com'); const [password,setPassword]=useState('Admin@123'); const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const nav=useNavigate();
  async function submit(e:FormEvent){e.preventDefault();setError('');setLoading(true);try{const r=await apiClient.login(email,password);session.set(r.token,r.user);nav('/dashboard',{replace:true});}catch(err){setError(err instanceof Error?err.message:'Unable to sign in.');}finally{setLoading(false);}}
  return <div className="login-page">
    <div className="login-art">
      <div className="art-grid"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
      <div className="art-copy"><div className="brand light"><div className="brand-mark">X</div><div><strong>XYZ</strong><span>Company</span></div></div><p className="art-kicker"><Sparkles size={14}/> OPERATIONS, WITHOUT THE CHAOS</p><h1>Know what moved.<br/><em>Know what matters.</em></h1><p>One calm workspace for customers, stock, sales challans and the people keeping the business moving.</p></div>
      <div className="art-card"><span>Inventory health</span><strong>92.4%</strong><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/></div><small>+8.2% this month</small></div>
    </div>
    <div className="login-panel"><div className="login-panel-inner"><div className="mobile-brand"><div className="brand-mark">X</div><b>XYZ Company</b></div><div className="login-heading"><span>Welcome back</span><h2>Sign in to Operations</h2><p>Use your workspace credentials to continue.</p></div>
      <form onSubmit={submit} className="auth-form"><label>Work email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="username" placeholder="you@company.com" required/></label><label>Password<div className="password-wrap"><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} autoComplete="current-password" required/><button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>{error&&<div className="form-error">{error}</div>}<button className="primary-btn wide" disabled={loading}>{loading?'Signing in...':<>Enter workspace <ArrowRight size={17}/></>}</button></form>
      <div className="secure-note"><LockKeyhole size={15}/><span>Secure session · Role-based access · Server-verified permissions</span></div>
    </div></div>
  </div>;
}
