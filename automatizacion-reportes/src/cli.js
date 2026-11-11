'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {compileReport,renderMail}=require('./report');
const {deliver}=require('./transport');

const args=process.argv.slice(2);
const dateFlag=args.find(a=>a.startsWith('--date='));
const date=dateFlag ? dateFlag.split('=')[1] : new Date().toISOString().slice(0,10);
const watch=args.includes('--watch');
const live=args.includes('--send');
const rowsPath=path.join(__dirname,'..','data','ventas.json');
async function run() {
 const rows=JSON.parse(fs.readFileSync(rowsPath,'utf8'));
 const report=compileReport(rows,date);
 const mail=renderMail(report);
 const output=path.join(__dirname,'..','output');
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'reporte.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(output,'reporte.html'),mail.html);
 console.log('\nReporte '+date+' | ventas: '+report.ventas+' | total ARS '+report.facturacion);
 console.log('Archivos: output/reporte.json y output/reporte.html');
 await deliver(mail,{send:live});
}
(async()=> {
 try {
  await run();
  if(watch) {
   const minutes=Number(process.env.DEMO_INTERVAL_MINUTES||1);
   if(!Number.isFinite(minutes)||minutes<1)throw new Error('DEMO_INTERVAL_MINUTES debe ser >= 1');
   console.log('Modo demostración programada: cada '+minutes+' minuto(s). Ctrl+C para salir.');
   setInterval(()=>run().catch(e=>console.error('Fallo del ciclo:',e.message)),minutes*60*1000);
  }
 } catch(e) { console.error('Error:',e.message); process.exitCode=1; }
})();
