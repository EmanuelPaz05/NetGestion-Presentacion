'use strict';
function isISODate(x) { return /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x+'T00:00:00Z')); }
function compileReport(rows, date) {
  if (!isISODate(date)) throw new Error('Fecha inválida (AAAA-MM-DD)');
  if (!Array.isArray(rows)) throw new Error('Se esperan ventas en un arreglo');
  const sales = rows.filter(v => v.fecha === date).map(v => {
    const qty=Number(v.cantidad), price=Number(v.precioUnitario);
    if (!Number.isSafeInteger(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) throw new Error('Venta inválida');
    return {...v, cantidad:qty, precioUnitario:price, total:Math.round(qty*price*100)/100};
  });
  const amount=Math.round(sales.reduce((sum,v)=>sum+v.total,0)*100)/100;
  const units=sales.reduce((sum,v)=>sum+v.cantidad,0);
  return {fecha:date, ventas:sales.length, unidades:units, facturacion:amount, detalle:sales};
}
const ars = amount => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(amount);
const escapeHTML = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderMail(r) {
 const subject='Net-Gestión Demo | Reporte de ventas '+r.fecha;
 const text=['REPORTE DIARIO - DEMO ACADÉMICA','Fecha: '+r.fecha,'Ventas: '+r.ventas,'Unidades: '+r.unidades,'Total: '+ars(r.facturacion),'','Detalle:',...r.detalle.map(v=>'- '+v.producto+' x'+v.cantidad+' = '+ars(v.total)),'','Datos totalmente ficticios. No corresponde a un comercio real.'].join('\n');
 const rows=r.detalle.map(v=>'<tr><td>'+escapeHTML(v.producto)+'</td><td>'+v.cantidad+'</td><td>'+ars(v.total)+'</td></tr>').join('');
 const html='<html lang="es"><body style="font-family:Arial,sans-serif;color:#182c39"><h1>Reporte diario · Net-Gestión Demo</h1><p><strong>Datos ficticios · '+r.fecha+'</strong></p><p>Ventas: '+r.ventas+' | Unidades: '+r.unidades+' | Total: <strong>'+ars(r.facturacion)+'</strong></p><table border="1" cellpadding="8" cellspacing="0"><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr>'+rows+'</table><p>Proyecto académico independiente. No contiene datos reales de clientes.</p></body></html>';
 return {subject, text, html};
}
module.exports={compileReport,renderMail};
