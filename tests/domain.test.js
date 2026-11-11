const test = require('node:test');
const assert = require('node:assert/strict');
const { initialData,addProduct,registerSale,restockProduct,summary } = require('../src/domain');
test('descuenta unidades del stock y suma ingresos al vender', () => {
 const s=initialData(); const next=registerSale(s,{productId:1,quantity:3});
 assert.equal(next.products.find(p=>p.id===1).stock,13);
 assert.equal(next.sales.at(-1).total,20700);
 assert.equal(summary(next).revenue,summary(s).revenue+20700);
});
test('bloquea ventas sin existencias',()=>assert.throws(()=>registerSale(initialData(),{productId:3,quantity:999}),/Stock insuficiente/));
test('valida cantidades enteras',()=>assert.throws(()=>registerSale(initialData(),{productId:1,quantity:1.5}),/entero/));
test('registra un ingreso de mercadería',()=>{const s=restockProduct(initialData(),{productId:3,quantity:7});assert.equal(s.products.find(p=>p.id===3).stock,11)});
test('permite agregar productos',()=>{const s=addProduct(initialData(),{name:'Café',category:'Almacén',price:5000,stock:8,minStock:3});assert.equal(s.products.length,6)});
