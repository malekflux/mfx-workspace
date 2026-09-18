import type { Project } from '../types';
export interface SheetRow { refId:string; businessName:string; contactPerson:string; phone:string; services:string; billingModel:string; monthlyRate:number; paymentMethod:string; paymentDueDay:number; dueMethod:string; contractStartDate:string; paymentStatus:string; status:string; driveLink:string; accountPIC:string; notes:string; paidAmount?:number }
export async function fetchGoogleSheetData(sheetId:string, apiKey:string):Promise<SheetRow[]> {
 if(!/^[\w-]+$/.test(sheetId)||!apiKey.trim()) throw new Error('Enter the sheet ID and a read-only Google Sheets API key.');
 const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/Sheet1!A2:Q10000?key=${encodeURIComponent(apiKey)}`);
 if(!response.ok) throw new Error(`Google Sheets returned ${response.status}. Check access and configuration.`);
 const data=await response.json();
 return (data.values || []).filter((r:string[])=>r.some(Boolean)).map((r:string[])=>({refId:r[0]?.trim()||'',businessName:r[1]?.trim()||'',contactPerson:r[2]||'',phone:r[3]||'',services:r[4]||'',billingModel:r[5]||'',monthlyRate:Number((r[6]||'').replace(/[^\d.-]/g,'')),paymentMethod:r[7]||'',paymentDueDay:Number(r[8]||1),dueMethod:r[9]||'',contractStartDate:r[10]||'',paymentStatus:r[11]||'',status:r[12]||'',driveLink:r[13]||'',accountPIC:r[14]||'',notes:r[15]||'',paidAmount:r[16]?.trim()?Number(r[16].replace(/[^\d.-]/g,'')):undefined}));
}
export function parseSheetRowToProject(row:SheetRow,clientId:string):Project {
 if(!row.refId||!row.businessName||!Number.isFinite(row.monthlyRate)||row.monthlyRate<0) throw new Error('Invalid reference, client name or value.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(row.contractStartDate)||!Number.isFinite(Date.parse(row.contractStartDate))) throw new Error(`${row.refId}: start date must be YYYY-MM-DD.`);
 if(new Date(row.contractStartDate).toISOString().slice(0,10)!==row.contractStartDate) throw new Error(`${row.refId}: invalid calendar date.`);
 const names=row.services.split(',').map(s=>s.trim()).filter(Boolean);
 if(!names.length) throw new Error(`${row.refId}: no services.`);
 const status=row.paymentStatus.trim().toLowerCase();
 if(status.includes('partial')&&row.paidAmount===undefined) throw new Error(`${row.refId}: partial payment needs the actual amount in column Q. No 50% assumption is made.`);
 const paid=row.paidAmount ?? (status==='paid'?row.monthlyRate:0);
 if(!Number.isFinite(paid)||paid<0||paid>row.monthlyRate) throw new Error(`${row.refId}: invalid paid amount.`);
 const billing=row.billingModel.toLowerCase();
 const totalCents=Math.round(row.monthlyRate*100);
 const share=Math.floor(totalCents/names.length);
 return {id:`sheet_project_${row.refId}`,clientId,refId:row.refId,services:names.map((name,i)=>({id:`${row.refId}_${i}`,name,basePrice:(share+(i<totalCents%names.length?1:0))/100})),billingModel:billing.includes('fixed')?'fixed':billing.includes('hourly')?'hourly':billing.includes('retainer')?'retainer':'monthly',totalAmount:row.monthlyRate,paidAmount:paid,remainingAmount:Math.round((row.monthlyRate-paid)*100)/100,paymentMethod:row.paymentMethod.toLowerCase().includes('instapay')?'instapay':row.paymentMethod.toLowerCase().includes('bank')?'bank-transfer':row.paymentMethod.toLowerCase().includes('card')?'card':'cash',paymentDueDay:row.paymentDueDay,dueMethod:row.dueMethod,contractStartDate:row.contractStartDate,paymentStatus:paid===row.monthlyRate?'paid':paid>0?'partial':status==='overdue'?'overdue':'pending',projectStatus:row.status.toLowerCase().includes('complete')?'completed':row.status.toLowerCase().includes('pause')?'paused':row.status.toLowerCase().includes('cancel')?'cancelled':'active',driveLink:/^https:\/\//i.test(row.driveLink)?row.driveLink:undefined,accountPIC:row.accountPIC.split(',').filter(Boolean),notes:row.notes,currency:'EGP',currencySymbol:'EGP'};
}
