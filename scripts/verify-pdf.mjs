import fs from 'node:fs';
fs.mkdirSync('output/pdf',{recursive:true});
for(const name of ['invoice-ar','contract-en','long-contract-ar','report-ar','report-en']) {
 const html=fs.readFileSync(`verification/${name}.html`,'utf8');
 const response=await fetch('http://127.0.0.1:5175/api/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html})});
 if(!response.ok)throw new Error(await response.text());
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Not a PDF');
 fs.writeFileSync(`output/pdf/${name}.pdf`,bytes);console.log(`${name}: ${bytes.length} PDF bytes`);
}
