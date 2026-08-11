import { X } from 'lucide-react';
import { AnimatePresence,motion } from 'framer-motion';
export default function Modal({open,onClose,title,children,wide=false}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;wide?:boolean}){
 return <AnimatePresence>{open&&<div className="modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><motion.div initial={{opacity:0,y:14,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8}} className={`modal ${wide?'wide':''}`}><div className="modal-head"><div><span className="panel-eyebrow">XYZ COMPANY</span><h3>{title}</h3></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</motion.div></div>}</AnimatePresence>
}
