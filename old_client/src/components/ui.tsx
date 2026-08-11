import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { cn } from '../lib/utils'

export function Button({className,variant='primary',loading=false,children,...props}:{variant?:'primary'|'secondary'|'ghost'|'danger'|'soft';loading?:boolean;children:ReactNode}&ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('btn',`btn-${variant}`,className)} disabled={loading || props.disabled} {...props}>{loading && <Loader2 size={16} className="spin"/>}{children}</button>
}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'success'|'warning'|'danger'|'violet'|'blue'}) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function Card({children,className}:{children:ReactNode;className?:string}) { return <section className={cn('card',className)}>{children}</section> }
export function Modal({open,onClose,title,children,wide=false}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;wide?:boolean}) {
  useEffect(()=>{ const f=(e:KeyboardEvent)=>e.key==='Escape'&&onClose(); if(open) window.addEventListener('keydown',f); return ()=>window.removeEventListener('keydown',f)},[open,onClose])
  return <AnimatePresence>{open&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}><motion.div className={cn('modal',wide&&'modal-wide')} initial={{opacity:0,y:20,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.98}}><div className="modal-head"><div><p className="eyebrow">XYZ COMPANY</p><h3>{title}</h3></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button></div>{children}</motion.div></motion.div>}</AnimatePresence>
}
export function Toasts({items,onRemove}:{items:{id:number;type:'success'|'error';message:string}[];onRemove:(id:number)=>void}) { return <div className="toasts"><AnimatePresence>{items.map(x=><motion.div key={x.id} className={`toast toast-${x.type}`} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}><span className="toast-icon">{x.type==='success'?<Check size={15}/>:<AlertCircle size={15}/>}</span><span>{x.message}</span><button onClick={()=>onRemove(x.id)}><X size={14}/></button></motion.div>)}</AnimatePresence></div> }
export function Empty({title,description}:{title:string;description:string}) { return <div className="empty"><div className="empty-orb"/><h3>{title}</h3><p>{description}</p></div> }
