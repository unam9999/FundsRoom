import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { api, session } from '../lib/api'
import type { User } from '../types'
import { Button } from '../components/ui'

export function Login({onLogin}:{onLogin:(u:User)=>void}) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState('')
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setLoading(true);try{const r=await api.auth.login(email.trim(),password);session.token=r.token;onLogin(r.user)}catch(err:any){setError(err.message||'Unable to sign in')}finally{setLoading(false)}}
  return <div className="login-shell"><div className="login-visual"><div className="visual-grid"/><div className="orb orb-a"/><div className="orb orb-b"/><div className="login-brand"><div className="brand-mark big"><span/></div><span>XYZ COMPANY</span></div><div className="visual-copy"><p className="eyebrow">OPERATIONS, REFINED</p><h1>Run the business<br/><em>without the noise.</em></h1><p>One calm workspace for customer relationships, inventory movement and sales operations.</p></div><div className="visual-footer"><div><ShieldCheck size={16}/><span>Protected by server-side RBAC</span></div><span>v1.0 · Internal</span></div></div>
    <div className="login-panel"><div className="login-form-wrap"><div className="mobile-logo"><div className="brand-mark"><span/></div><b>XYZ COMPANY</b></div><div className="login-heading"><div className="spark"><Sparkles size={16}/></div><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your workspace</h2><p>Use your company credentials to continue.</p></div><form onSubmit={submit}><label>Email address<input autoComplete="username" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required/></label><label>Password<div className="password-field"><input autoComplete="current-password" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" onClick={()=>setShow(x=>!x)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>{error&&<div className="form-error">{error}</div>}<Button type="submit" loading={loading} className="login-submit">Continue <ArrowRight size={17}/></Button></form><div className="login-security"><LockKeyhole size={15}/><span>Session-based authentication · Your password never leaves the secure API request.</span></div></div></div>
  </div>
}
