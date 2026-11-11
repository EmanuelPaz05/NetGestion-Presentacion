'use strict';
// Por seguridad, el modo por defecto no envía correos a personas.
async function deliver(mail,{send=false}={}) {
 if(!send) { console.log('SIMULACIÓN: correo generado, no enviado.');return {mode:'preview'}; }
 const token=process.env.RESEND_API_KEY;
 const to=process.env.REPORT_TO;
 const from=process.env.REPORT_FROM;
 if(!token||!to||!from) throw new Error('Para enviar configurá RESEND_API_KEY, REPORT_TO y REPORT_FROM');
 const response=await fetch('https://api.resend.com/emails',{
  method:'POST',
  headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
  body:JSON.stringify({from,to:[to],subject:mail.subject,html:mail.html,text:mail.text})
 });
 if(!response.ok) throw new Error('Resend respondió con código HTTP '+response.status);
 console.log('Envío aceptado por Resend. Esto no confirma entrega en bandeja.');
 return {mode:'resend'};
}
module.exports={deliver};
