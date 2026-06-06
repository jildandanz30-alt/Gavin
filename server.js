const express = require('express');
const path    = require('path');
const fs      = require('fs');

// ─── Cek environment variable penting ─────────────────────────────────────────
if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ ERROR: CLERK_SECRET_KEY tidak ditemukan!');
    console.error('   Set environment variable CLERK_SECRET_KEY di Railway dashboard.');
    console.warn("⚠️  CLERK_SECRET_KEY tidak diset!");
}

const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(clerkMiddleware());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Data files (pakai /tmp di Railway agar tidak error read-only) ─────────────
const DATA_DIR      = process.env.DATA_DIR || path.join(__dirname, 'data');
const ORDERS_FILE   = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Buat folder data jika belum ada
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(ORDERS_FILE))   fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
if (!fs.existsSync(PRODUCTS_FILE)) {
    const defaults = [
        { id:1,  cat:'plugin', catLabel:'Plugin',  name:'Items Adder',           desc:'ItemsAdder — Emotes, Mobs, Items, Armors, HUD, GUI, Emojis, Blocks, Wings, Hats, Liquids',  price:'Rp 20.000', rawPrice:20000,  img:'', badge:'HOT', downloadLink:'https://drive.google.com/file/d/1h06htqdhf3AUb_vcFwHsHbiIWRwY968b/view?usp=drivesdk', active:true },
        { id:2,  cat:'plugin', catLabel:'Plugin',  name:'MMO Items',              desc:'MMO ITEMS — Custom Skill item. Version 1.8 - 1.21.11.',                                      price:'Rp 15.000', rawPrice:15000,  img:'', badge:'HOT', downloadLink:'https://drive.google.com/file/d/14s1nO2LNrm80DxphuE8R9MIDLGKdIQ4P/view?usp=drivesdk', active:true },
        { id:3,  cat:'plugin', catLabel:'Plugin',  name:'Vulkan Anti Cheat',      desc:'VULKAN ANTI CHEAT. Version 1.8-26.1.',                                                       price:'Rp 15.000', rawPrice:15000,  img:'', badge:'NEW', downloadLink:'https://drive.google.com/file/d/1Yw35MlOppj3-rSTw_R3okL7iqwLD0nLE/view?usp=drivesdk', active:true },
        { id:4,  cat:'plugin', catLabel:'Plugin',  name:'Citizen',                desc:'Citizen. NPC premium plugin, all version.',                                                   price:'Rp 15.000', rawPrice:15000,  img:'', badge:'',    downloadLink:'https://drive.google.com/file/d/1QpvD8n5eCocqwe08k4urnv_tNXyUbHPe/view?usp=drivesdk', active:true },
        { id:5,  cat:'asset',  catLabel:'Asset',   name:'Resource Pack Premium',  desc:'Pack texture HD 128x128 dengan visual menakjubkan.',                                          price:'Rp 15.000', rawPrice:15000,  img:'', badge:'',    downloadLink:'https://drive.google.com/your-link-5', active:true },
        { id:6,  cat:'jasa',   catLabel:'Jasa',    name:'Website Landing Page',   desc:'Website landing page profesional untuk server kamu.',                                         price:'Rp 150.000',rawPrice:150000, img:'', badge:'',    downloadLink:'https://wa.me/6282298673652', active:true },
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaults, null, 2));
}

function getOrders()    { return JSON.parse(fs.readFileSync(ORDERS_FILE,   'utf8')); }
function saveOrders(o)  { fs.writeFileSync(ORDERS_FILE,   JSON.stringify(o, null, 2)); }
function getProducts()  { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8')); }
function saveProducts(p){ fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(p, null, 2)); }

// ─── Health check (Railway butuh ini) ─────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Pages ────────────────────────────────────────────────────────────────────
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/products',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/checkout',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/orders',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'orders.html')));
app.get('/admin',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ─── API: Get products (public) ───────────────────────────────────────────────
app.get('/api/products', (req, res) => {
    const products = getProducts().filter(p => p.active !== false);
    res.json({ success: true, products: products.map(p => ({ ...p, downloadLink: undefined })) });
});

// ─── API: Me ──────────────────────────────────────────────────────────────────
app.get('/api/me', (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.json({ success: false, user: null });
    res.json({ success: true, userId });
});

// ─── API: Create order ────────────────────────────────────────────────────────
app.post('/api/order', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const { username, email, productId, productName, price, paymentMethod } = req.body;
    const orders  = getOrders();
    const orderId = 'GVN' + Date.now();
    orders.push({ orderId, userId, username, email, productId, productName, price, paymentMethod, status: 'pending', createdAt: new Date().toISOString() });
    saveOrders(orders);
    res.json({ success: true, orderId });
});

// ─── API: Confirm payment ─────────────────────────────────────────────────────
app.post('/api/confirm-payment', requireAuth(), (req, res) => {
    const { orderId, buktiUrl } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status      = 'confirming';
    orders[idx].buktiUrl    = buktiUrl;
    orders[idx].confirmedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// ─── API: Get orders by user ──────────────────────────────────────────────────
app.get('/api/orders/:userId', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    if (userId !== req.params.userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    const orders = getOrders().filter(o => String(o.userId) === String(req.params.userId));
    res.json({ success: true, orders });
});

// ─── API: Download link ───────────────────────────────────────────────────────
app.get('/api/download/:orderId', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const orders   = getOrders();
    const products = getProducts();
    const order    = orders.find(o => o.orderId === req.params.orderId);
    if (!order)  return res.json({ success: false, message: 'Order tidak ditemukan!' });
    if (order.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'paid') return res.json({ success: false, message: 'Pembayaran belum dikonfirmasi!' });
    const product = products.find(p => p.id === order.productId);
    if (!product) return res.json({ success: false, message: 'Produk tidak ditemukan!' });
    res.json({ success: true, downloadLink: product.downloadLink, productName: product.name });
});

// ─── API: Admin - get all orders ──────────────────────────────────────────────
app.get('/api/admin/orders', (req, res) => {
    res.json({ success: true, orders: getOrders().slice().reverse() });
});

// ─── API: Admin - approve order ───────────────────────────────────────────────
app.post('/api/admin/approve', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'paid';
    orders[idx].approvedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// ─── API: Admin - reject order ────────────────────────────────────────────────
app.post('/api/admin/reject', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'cancelled';
    orders[idx].rejectedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// ─── API: Admin - get all products ────────────────────────────────────────────
app.get('/api/admin/products', (req, res) => {
    res.json({ success: true, products: getProducts() });
});

// ─── API: Admin - add product ─────────────────────────────────────────────────
app.post('/api/admin/products', (req, res) => {
    const { name, cat, catLabel, desc, price, rawPrice, badge, downloadLink, img, active } = req.body;
    if (!name || !price) return res.json({ success: false, message: 'Nama dan harga wajib diisi!' });
    const products = getProducts();
    const newId    = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const product  = { id: newId, cat: cat||'other', catLabel: catLabel||cat||'Other', name, desc: desc||'', price, rawPrice: Number(rawPrice)||0, img: img||'', badge: badge||'', downloadLink: downloadLink||'', active: active !== false };
    products.push(product);
    saveProducts(products);
    res.json({ success: true, product });
});

// ─── API: Admin - update product ──────────────────────────────────────────────
app.put('/api/admin/products/:id', (req, res) => {
    const id       = Number(req.params.id);
    const products = getProducts();
    const idx      = products.findIndex(p => p.id === id);
    if (idx === -1) return res.json({ success: false, message: 'Produk tidak ditemukan!' });
    const { name, cat, catLabel, desc, price, rawPrice, badge, downloadLink, img, active } = req.body;
    products[idx] = { ...products[idx], name: name||products[idx].name, cat: cat||products[idx].cat, catLabel: catLabel||products[idx].catLabel, desc: desc||products[idx].desc, price: price||products[idx].price, rawPrice: rawPrice !== undefined ? Number(rawPrice) : products[idx].rawPrice, badge: badge !== undefined ? badge : products[idx].badge, downloadLink: downloadLink !== undefined ? downloadLink : products[idx].downloadLink, img: img !== undefined ? img : products[idx].img, active: active !== undefined ? active : products[idx].active };
    saveProducts(products);
    res.json({ success: true, product: products[idx] });
});

// ─── API: Admin - delete product ──────────────────────────────────────────────
app.delete('/api/admin/products/:id', (req, res) => {
    const id       = Number(req.params.id);
    const products = getProducts();
    const idx      = products.findIndex(p => p.id === id);
    if (idx === -1) return res.json({ success: false, message: 'Produk tidak ditemukan!' });
    products.splice(idx, 1);
    saveProducts(products);
    res.json({ success: true });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Gavin Store berjalan di http://0.0.0.0:${PORT}`);
    console.log(`   NODE_ENV  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DATA_DIR  : ${DATA_DIR}`);
});
