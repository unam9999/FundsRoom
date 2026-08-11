export const money = (value:number|string) => `₹${Number(value || 0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export const dateTime = (value:string) => new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
export const dateOnly = (value:string) => new Date(value).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
export const initials = (name:string) => name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export const cn = (...xs:(string|false|null|undefined)[]) => xs.filter(Boolean).join(' ');
