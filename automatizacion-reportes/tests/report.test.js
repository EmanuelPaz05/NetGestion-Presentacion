'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compileReport,renderMail}=require('../src/report');
const {deliver}=require('../src/transport');
const records=[
 {fecha:'2026-11-11',producto:'Yerba',cantidad:2,precioUnitario:1500},
 {fecha:'2026-11-11',producto:'Agua',cantidad:1,precioUnitario:1000},
 {fecha:'2026-11-10',producto:'Café',cantidad:2,precioUnitario:5000}
];
test('filtra por fecha y calcula facturación/unidades',()=>{
 const r=compileReport(records,'2026-11-11');
 assert.equal(r.ventas,2);assert.equal(r.unidades,3);assert.equal(r.facturacion,4000);
});
test('sin ventas genera reporte con totales cero',()=>{
 const r=compileReport(records,'2026-11-09');
 assert.equal(r.ventas,0);assert.equal(r.facturacion,0);
});
test('rechaza cantidades inválidas',()=>assert.throws(()=>compileReport([{fecha:'2026-11-11',cantidad:-1,precioUnitario:100}],'2026-11-11'),/Venta inválida/));
test('escapa HTML de nombres de productos',()=>{
 const html=renderMail(compileReport([{fecha:'2026-11-11',producto:'<script>alert(1)</script>',cantidad:1,precioUnitario:1}],'2026-11-11')).html;
 assert.ok(!html.includes('<script>'));
});
test('por defecto no envía mensajes reales',async()=>{
 const r=await deliver({subject:'Prueba',html:'x',text:'x'});
 assert.equal(r.mode,'preview');
});
