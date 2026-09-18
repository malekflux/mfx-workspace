import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { IncomingMessage, ServerResponse } from 'node:http';
import puppeteer from 'puppeteer-core';
import type { Plugin } from 'vite';
const require=createRequire(import.meta.url);
const fonts=[400,500,600,700,800,900].flatMap(weight=>['arabic','latin'].map(subset=>`@font-face{font-family:Cairo;font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(require.resolve(`@fontsource/cairo/files/cairo-${subset}-${weight}-normal.woff2`)).toString('base64')}) format('woff2');unicode-range:${subset==='arabic'?'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF':'U+0000-00FF,U+0100-024F,U+2000-206F'};}`)).join('');
export async function renderPDF(html:string) {
 const executablePath=[process.env.PDF_BROWSER_PATH,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/chromium','/usr/bin/google-chrome'].find(path=>path&&existsSync(path));
 if(!executablePath)throw new Error('No PDF browser installed. Set PDF_BROWSER_PATH to Chrome, Edge or Chromium.');
 const browser=await puppeteer.launch({executablePath,headless:true,args:['--disable-extensions'],timeout:20000});
 try {
  const page=await browser.newPage();await page.setJavaScriptEnabled(false);await page.setRequestInterception(true);
  page.on('request',request=>{if(request.url().startsWith('data:')||request.url()==='about:blank')void request.continue();else void request.abort();});
  const source=html.replace(/<link\b[^>]*>/gi,'').replace('</head>',`<style>${fonts}</style></head>`);
  await page.setContent(source,{waitUntil:'load',timeout:20000});await page.emulateMediaType('print');
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>undefined)));});
  return await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true,timeout:25000});
 } finally {await browser.close();}
}
let active=0;
export async function pdfMiddleware(req:IncomingMessage,res:ServerResponse,next:()=>void) {
 if(req.url?.split('?')[0]!=='/api/pdf'){next();return;}
 if(req.method!=='POST'){res.writeHead(405).end('POST required');return;}
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403).end('Same-origin request required');return;}
 if(active>=2){res.writeHead(429).end('PDF renderer is busy. Please retry.');return;}
 active++;
 try {
  const chunks:Buffer[]=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>6*1024*1024){res.writeHead(413).end('Document exceeds 6MB. Reduce logo size.');return;}chunks.push(chunk);}
  const {html}=JSON.parse(Buffer.concat(chunks).toString());
  if(typeof html!=='string'||!html.includes('proposal-container')){res.writeHead(400).end('Invalid MFx document');return;}
  const pdf=await renderPDF(html);res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="MFx-document.pdf"','Cache-Control':'no-store'});res.end(Buffer.from(pdf));
 }catch(error){res.writeHead(500,{'Content-Type':'text/plain'}).end(error instanceof Error?error.message:'PDF export failed');}
 finally{active--;}
}
export function pdfPlugin():Plugin{return {name:'mfx-pdf',configureServer(server){server.middlewares.use((req,res,next)=>{void pdfMiddleware(req,res,next);});},configurePreviewServer(server){server.middlewares.use((req,res,next)=>{void pdfMiddleware(req,res,next);});}};}
