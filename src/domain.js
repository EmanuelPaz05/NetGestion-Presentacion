// Modelo didáctico: datos ficticios y estado en memoria. Sin dependencias externas.
const money = value => Math.round(Number(value) * 100) / 100;
function initialData() {
  return {
    products: [
      { id: 1, name: 'Yerba mate 1 kg', category: 'Almacén', price: 6900, stock: 16, minStock: 5 },
      { id: 2, name: 'Gaseosa cola 2,25 L', category: 'Bebidas', price: 3300, stock: 9, minStock: 8 },
      { id: 3, name: 'Galletitas surtidas', category: 'Almacén', price: 1800, stock: 4, minStock: 6 },
      { id: 4, name: 'Agua mineral 1,5 L', category: 'Bebidas', price: 1600, stock: 18, minStock: 5 },
      { id: 5, name: 'Chocolate 100 g', category: 'Golosinas', price: 2900, stock: 11, minStock: 4 }
    ],
    sales: [
      { id: 1, productId: 1, name: 'Yerba mate 1 kg', quantity: 2, unitPrice: 6900, total: 13800, createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 2, productId: 2, name: 'Gaseosa cola 2,25 L', quantity: 1, unitPrice: 3300, total: 3300, createdAt: '2026-11-01T11:00:00.000Z' }
    ],
    movements: [{ id: 1, kind: 'initial', label: 'Inventario de demostración cargado', createdAt: '2026-11-01T09:00:00.000Z' }]
  };
}
function validPositiveNumber(v, label) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(label + ' debe ser mayor a cero');
  return n;
}
function positiveInt(v, label) {
  const n = validPositiveNumber(v, label);
  if (!Number.isSafeInteger(n)) throw new Error(label + ' debe ser entero');
  return n;
}
function nextId(items) { return Math.max(0, ...items.map(x => x.id)) + 1; }
function addProduct(state, input) {
  const name = String(input.name || '').trim().slice(0, 90);
  if (name.length < 2) throw new Error('Ingresá un nombre válido');
  const price = money(validPositiveNumber(input.price, 'Precio'));
  const stock = Number(input.stock);
  const minStock = Number(input.minStock);
  if (!Number.isSafeInteger(stock) || stock < 0 || !Number.isSafeInteger(minStock) || minStock < 0) throw new Error('Stock y mínimo deben ser enteros no negativos');
  if (price <= 0) throw new Error('Precio inválido');
  const product = { id: nextId(state.products), name, category: String(input.category || 'Otros').trim().slice(0, 40), price, stock, minStock };
  return { ...state, products: [...state.products, product], movements: [ ...state.movements, { id: nextId(state.movements), kind: 'create', label: 'Alta de producto: ' + name, createdAt: new Date().toISOString() }] };
}
function registerSale(state, input) {
  const productId = Number(input.productId);
  const quantity = positiveInt(input.quantity, 'Cantidad');
  const product = state.products.find(x => x.id === productId);
  if (!product) throw new Error('Producto inexistente');
  if (quantity > product.stock) throw new Error('Stock insuficiente');
  const sale = { id: nextId(state.sales), productId, name: product.name, quantity, unitPrice: product.price, total: money(quantity * product.price), createdAt: new Date().toISOString() };
  return { ...state, products: state.products.map(x => x.id === productId ? { ...x, stock: x.stock - quantity } : x), sales: [...state.sales, sale], movements: [...state.movements, { id: nextId(state.movements), kind: 'sale', label: 'Venta de ' + quantity + ' × ' + product.name, createdAt: sale.createdAt }] };
}
function restockProduct(state, input) {
  const productId = Number(input.productId);
  const quantity = positiveInt(input.quantity, 'Cantidad');
  const product = state.products.find(x => x.id === productId);
  if (!product) throw new Error('Producto inexistente');
  const date = new Date().toISOString();
  return { ...state, products: state.products.map(x => x.id === productId ? { ...x, stock: x.stock + quantity } : x), movements: [...state.movements, { id: nextId(state.movements), kind: 'restock', label: 'Ingreso de ' + quantity + ' × ' + product.name, createdAt: date }] };
}
function summary(state) {
  return { productCount: state.products.length, lowStockCount: state.products.filter(x => x.stock <= x.minStock).length, unitsInStock: state.products.reduce((s,x) => s + x.stock, 0), salesCount: state.sales.length, revenue: money(state.sales.reduce((s,x) => s + x.total, 0)), inventoryValue: money(state.products.reduce((s,x) => s + x.stock * x.price, 0)) };
}
module.exports = { initialData, addProduct, registerSale, restockProduct, summary };
