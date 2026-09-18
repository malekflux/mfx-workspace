import { useEffect, useRef } from 'react';
export function useDialog(onClose:()=>void) {
  const ref=useRef<HTMLDivElement>(null); const close=useRef(onClose); close.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null; const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const elements=()=>Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select,textarea,a[href],[tabindex="0"]')||[]).filter(e=>e.getClientRects().length>0);
    elements()[0]?.focus();
    const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const items=elements();const first=items[0];const last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',listener);return()=>{document.removeEventListener('keydown',listener);document.body.style.overflow=overflow;previous?.focus();};
  },[]);
  return ref;
}
