import { build } from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
await build({entryPoints:['src/documents/generate.ts','src/store/useStore.ts','src/utils/googleSheets.ts','src/utils/deduplicate.ts','src/utils/auth.ts'],outdir:'verification/modules',bundle:true,platform:'node',format:'esm',packages:'external',plugins:[{name:'raw-css',setup(b){b.onLoad({filter:/\.css$/},a=>({contents:JSON.stringify(fs.readFileSync(a.path.replace('?raw',''),'utf8')),loader:'json'}));}}]});
globalThis.window={localStorage:globalThis.localStorage};
const {generateDocument,getDocumentReference}=await import('../verification/modules/documents/generate.js');
const {useStore}=await import('../verification/modules/store/useStore.js');
const {parseSheetRowToProject}=await import('../verification/modules/utils/googleSheets.js');
const {uniqueRecords}=await import('../verification/modules/utils/deduplicate.js');
const {credentialsAreValid}=await import('../verification/modules/utils/auth.js');
const client={id:'qa-client',refId:'QA-001',businessName:'QA Studio / استوديو تجريبي',contactPerson:'Test Contact',phone:'01000000000'};
const service={id:'qa-service',name:'Brand strategy',nameAr:'استراتيجية العلامة التجارية',description:'Research & identity',descriptionAr:'البحث والهوية',subServices:['Research','Identity design'],subServicesAr:['البحث','تصميم الهوية'],basePrice:1234.5};
const project={id:'qa-project',refId:'QA-P001',clientId:client.id,services:[service],billingModel:'fixed',totalAmount:1234.5,paidAmount:234.5,remainingAmount:1000,paymentMethod:'instapay',contractStartDate:'2026-09-18',paymentStatus:'partial',projectStatus:'active',currency:'EGP',currencySymbol:'EGP'};
let checks=0;function test(name,fn){fn();checks++;console.log(`PASS ${name}`);}
const appCss=fs.readFileSync('src/index.css','utf8');
test('Light and dark palettes use the approved exact tokens',()=>{for(const token of ['#F8F9FA','#FFFFFF','#0B58BD','#C2673B','#1A1D20','#6C757D','#08090A','#111418','#1F242B','#D4AF37','#EDEDED','#8A929B'])assert.ok(appCss.includes(token),`Missing ${token}`);});
test('Print stylesheet remains independent from application theme tokens',()=>{const printCss=fs.readFileSync('src/documents/reference.css','utf8');assert.ok(printCss.includes('--primary: #0b58bd'));assert.ok(!printCss.includes('--accent: #C2673B'));});
useStore.setState({clients:[],projects:[],timeEntries:[],activeTimeEntry:null});
test('Duplicate client and project imports are idempotent',()=>{for(let i=0;i<3;i++){useStore.getState().addClient(client);useStore.getState().addProject(project);}assert.equal(useStore.getState().clients.length,1);assert.equal(useStore.getState().projects.length,1);});
test('Editing updates client relationship and financial values',()=>{useStore.getState().updateProject(project.id,{paidAmount:300,remainingAmount:934.5});assert.equal(useStore.getState().projects[0].paidAmount,300);});
test('Switching timers stops the old entry',()=>{useStore.getState().startTimer(project.id);useStore.getState().startTimer(project.id);assert.equal(useStore.getState().timeEntries.filter(e=>e.isActive).length,1);useStore.getState().stopTimer();assert.equal(useStore.getState().activeTimeEntry,null);});
test('Deleting project removes its timer entries',()=>{useStore.getState().deleteProject(project.id);assert.equal(useStore.getState().timeEntries.length,0);});
test('Duplicate cleanup preserves conflicting records',()=>{assert.deepEqual(uniqueRecords([client,client,{...client,phone:'different'}]),[client,{...client,phone:'different'}]);});
const row={refId:'Q1',businessName:'QA',contactPerson:'Q',phone:'0',services:'Branding',billingModel:'fixed',monthlyRate:1000,paymentMethod:'cash',paymentDueDay:1,dueMethod:'',contractStartDate:'2026-09-18',paymentStatus:'partial',status:'active',driveLink:'',accountPIC:'',notes:''};
test('Partial payment is never assumed to be 50 percent',()=>assert.throws(()=>parseSheetRowToProject(row,'qa'),/actual amount/));
test('Unpaid does not match paid',()=>assert.equal(parseSheetRowToProject({...row,paymentStatus:'unpaid'},'qa').paidAmount,0));
test('Actual partial amount determines remaining balance',()=>assert.equal(parseSheetRowToProject({...row,paidAmount:100},'qa').remainingAmount,900));
test('Sheet source reference is retained without becoming the public reference',()=>{const parsed=parseSheetRowToProject({...row,paymentStatus:'pending'},'qa');assert.equal(parsed.sourceRef,'Q1');});
test('Imported service amounts sum exactly to the project value',()=>{const p=parseSheetRowToProject({...row,paymentStatus:'pending',services:'A,B,C'},'qa');assert.equal(Math.round(p.services.reduce((s,v)=>s+v.basePrice,0)*100),p.totalAmount*100);});
test('Impossible calendar dates are rejected',()=>assert.throws(()=>parseSheetRowToProject({...row,paymentStatus:'pending',contractStartDate:'2026-02-31'},'qa'),/date/));
for(const kind of ['invoice','contract','report'])for(const language of ['en','ar']){
 const html=generateDocument({kind,language,clients:[client],projects:[project],date:'2026-09-18',terms:language==='ar'?'بنود اختبار فقط — لا تمثل اتفاقًا فعليًا.':'Test terms only — not an actual agreement.'});
 test(`${kind} ${language}: HTML identity, language, logo, totals`,()=>{assert.ok(html.includes(`lang="${language}"`));assert.ok(html.includes("family=Cairo"));assert.ok(html.includes('--primary: #0b58bd'));assert.ok(html.includes('data:image/png;base64,'));assert.ok(html.includes(language==='ar'?'١٬٠٠٠٫٠٠':'1,000.00'));if(kind!=='report')assert.ok(html.includes(language==='ar'?service.nameAr:service.name));});
 fs.writeFileSync(`verification/${kind}-${language}.html`,html);
}
test('User content is escaped in generated documents',()=>{const html=generateDocument({kind:'contract',language:'en',clients:[{...client,businessName:'<script>alert(1)</script>'}],projects:[project],terms:'<img onerror="bad">'});assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img'));});
test('Report never adds different currencies together',()=>{const html=generateDocument({kind:'report',language:'en',clients:[client],projects:[project,{...project,id:'usd',currency:'USD',totalAmount:20,paidAmount:0,remainingAmount:20}]});assert.ok(html.includes('1,234.50 EGP'));assert.ok(html.includes('20.00 USD'));assert.ok(!html.includes('1,254.50'));});
const longProject={...project,services:Array.from({length:35},(_,i)=>({...service,id:`long-${i}`,name:`Service ${i+1}`,nameAr:`الخدمة ${i+1}`})),totalAmount:43207.5,paidAmount:0,remainingAmount:43207.5};
fs.writeFileSync('verification/long-contract-ar.html',generateDocument({kind:'contract',language:'ar',clients:[client],projects:[longProject],terms:'بنود اختبار متعددة الصفحات.'}));
test('Sequential client references survive deletion',()=>{useStore.setState({clients:[],projects:[],referenceCounters:{}});const a=useStore.getState().createClient(client);const prefix='MFx-'+String(new Date().getFullYear()).slice(-2);assert.equal(a.refId,prefix+'001');useStore.getState().deleteClient(a.id);const b=useStore.getState().createClient(client);assert.equal(b.refId,prefix+'002');});
test('Project sequence survives deletion and changing client',()=>{const a=useStore.getState().clients[0];const p=useStore.getState().createProject({...project,clientId:a.id});assert.equal(p.refId,a.refId+'-1');useStore.getState().deleteProject(p.id);const q=useStore.getState().createProject({...project,clientId:a.id});assert.equal(q.refId,a.refId+'-2');const b=useStore.getState().createClient(client);useStore.getState().updateProject(q.id,{clientId:b.id});assert.equal(useStore.getState().getProjectById(q.id).refId,b.refId+'-1');});
test('Catalog has all twelve bilingual services and four deliverables each',()=>{const catalog=useStore.getState().servicesCatalog;assert.equal(catalog.length,12);for(const service of catalog){assert.equal(service.subServices.length,4);assert.equal(service.subServicesAr.length,4);assert.ok(service.nameAr);}});
test('Deleting a catalog service preserves service snapshots in existing projects',()=>{useStore.setState({servicesCatalog:[service],projects:[project]});useStore.getState().deleteServiceFromCatalog(service.id);assert.equal(useStore.getState().servicesCatalog.length,0);assert.equal(useStore.getState().projects[0].services[0].name,service.name);});
test('Workspace gate accepts only the configured credentials',()=>{assert.equal(credentialsAreValid('mfx-admin','mfx2026'),true);assert.equal(credentialsAreValid('mfx-admin','wrong'),false);assert.equal(credentialsAreValid('other','mfx2026'),false);});
test('Documents use client number and show project reference separately',()=>{const html=generateDocument({kind:'invoice',language:'en',clients:[{...client,refId:'MFx-26001'}],projects:[{...project,refId:'MFx-26001-4'}]});assert.ok(html.includes('INV-MFx-26001'));assert.ok(!html.includes('INV-MFx-26001-4'));assert.ok(html.includes('Project reference: MFx-26001-4'));});
test('Download references match the visible document reference',()=>{assert.equal(getDocumentReference('invoice','MFx-26001'),'INV-MFx-26001');assert.equal(getDocumentReference('contract','MFx-26001'),'CON-MFx-26001');assert.equal(getDocumentReference('report',undefined,'2026-09-19'),'RPT-2026-09-19');});
console.log(`${checks} regression checks passed. Six bilingual HTML samples and a long document generated.`);

