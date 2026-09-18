import type { Client, Project } from '../types';
export function nextClientReference(clients: Client[], last = 0, year = new Date().getFullYear()) {
 const prefix=`MFx-${String(year).slice(-2)}`;
 const highest=clients.reduce((max,c)=>{const suffix=c.refId.startsWith(prefix)?c.refId.slice(prefix.length):'';return /^\d{3,}$/.test(suffix)?Math.max(max,Number(suffix)):max;},last);
 return {refId:`${prefix}${String(highest+1).padStart(3,'0')}`,sequence:highest+1,prefix};
}
export function nextProjectReference(client: Client, projects: Project[], last=0) {
 const prefix=`${client.refId}-`;
 const highest=projects.filter(p=>p.clientId===client.id).reduce((max,p)=>{const suffix=p.refId.startsWith(prefix)?p.refId.slice(prefix.length):'';return /^\d+$/.test(suffix)?Math.max(max,Number(suffix)):max;},last);
 return {refId:`${prefix}${highest+1}`,sequence:highest+1};
}
export function normalizeReferences(clients: Client[], projects: Project[]) {
 const normalizedClients=[...clients];
 for(let i=0;i<normalizedClients.length;i++)if(!/^MFx-\d{5,}$/.test(normalizedClients[i].refId))normalizedClients[i]={...normalizedClients[i],refId:nextClientReference(normalizedClients).refId};
 const normalizedProjects=[...projects];
 for(let i=0;i<normalizedProjects.length;i++){const client=normalizedClients.find(c=>c.id===normalizedProjects[i].clientId);if(client){const prefix=client.refId+'-';const suffix=normalizedProjects[i].refId.slice(prefix.length);if(!normalizedProjects[i].refId.startsWith(prefix)||!/^\d+$/.test(suffix))normalizedProjects[i]={...normalizedProjects[i],refId:nextProjectReference(client,normalizedProjects).refId};}}
 return {clients:normalizedClients,projects:normalizedProjects};
}

export function referenceHighWater(clients: Client[], projects: Project[], previous: Record<string,number> = {}) {
 const counters={...previous};
 for(const client of clients){const match=/^MFx-(\d{2})(\d{3,})$/.exec(client.refId);if(match){const key='MFx-'+match[1];counters[key]=Math.max(counters[key] || 0,Number(match[2]));}const key='project:'+client.id;counters[key]=nextProjectReference(client,projects,counters[key] || 0).sequence-1;}
 return counters;
}
