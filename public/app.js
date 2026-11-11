const byId = id => document.getElementById(id);
const ars = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const esc = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const toast = (msg, error=false) => { const x=byId('toast');x.textContent=msg;x.className=error?'visible error':'visible';clearTimeout(window.toastTimeout);window.toastTimeout=setTimeout(()=>x.className='',3200); };
async function api(path, method='GET', data) {const response=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const json=await response.json();if(!response.ok)throw Error(json.error||'Error inesperado');return json;}
function date(value){return new Date(value).toLocaleString('es-AR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}
function render(s){
  byId('revenue').textContent=ars(s.summary.revenue);
  byId('productCount').textContent=s.summary.productCount;
  byId('stockUnits').textContent=s.summary.unitsInStock;
  byId('lowStock').textContent=s.summary.lowStockCount;
  byId('products').innerHTML=s.products.map(p=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.category)}</td><td>${ars(p.price)}</td><td><span class="stock ${p.stock<=p.minStock?'low':''}">${p.stock} uds.</span></td></tr>`).join('');
  const options=s.products.map(p=>`<option value="${p.id}">${esc(p.name)} · ${p.stock} uds.</option>`).join('');
  for(const id of ['saleProduct','stockProduct']){const el=byId(id),selected=el.value;el.innerHTML=options;if(s.products.some(p=>String(p.id)===selected))el.value=selected;}
  byId('events').innerHTML=s.movements.slice(-6).reverse().map(m=>`<div class="event"><span class="eventicon">${m.kind==='sale'?'↗':m.kind==='restock'?'↙':'+'}</span><div><strong>${esc(m.label)}</strong><small>${date(m.createdAt)}</small></div></div>`).join('');
}
async function refresh(){render(await api('state'));}
async function submit(id,path,mapper){byId(id).addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));try{render(await api(path,'POST',mapper(data)));toast('Operación registrada correctamente');if(id==='productForm')e.currentTarget.reset();}catch(err){toast(err.message,true);}});}
submit('saleForm','sales',x=>({productId:Number(x.productId),quantity:Number(x.quantity)}));
submit('stockForm','restocks',x=>({productId:Number(x.productId),quantity:Number(x.quantity)}));
submit('productForm','products',x=>({name:x.name,category:x.category,price:Number(x.price),stock:Number(x.stock),minStock:Number(x.minStock)}));
byId('reset').addEventListener('click',async()=>{if(!confirm('¿Restablecer los datos ficticios?'))return;try{render(await api('reset','POST'));toast('Datos de demostración restaurados');}catch(e){toast(e.message,true);}});
refresh().catch(err=>toast(err.message,true));
