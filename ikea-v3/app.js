/* app.js
   6 product tiles, thumbnails loaded from images/ folder (images/table1.jpg ... table6.jpg)
*/

const products = [
  {
    id: "prod-1",
    name: "LISABO Table",
    price: 199.00,
    short: "Solid wood table with clean lines.",
    dimensions: "Length: 120 cm; Width: 75 cm; Height: 74 cm",
    img: "images/table1.jpg"
  },
  {
    id: "prod-2",
    name: "NORDEN Gateleg Table",
    price: 229.00,
    short: "Space-saving gateleg table, folds when not in use.",
    dimensions: "Length: 120 cm; Width: 70 cm; Height: 74 cm",
    img: "images/table2.jpg"
  },
  {
    id: "prod-3",
    name: "EKEDALEN Extendable Table",
    price: 249.00,
    short: "Extendable table for flexible dining.",
    dimensions: "Length: 140-200 cm; Width: 90 cm; Height: 75 cm",
    img: "images/table3.jpg"
  },
  {
    id: "prod-4",
    name: "MELLTORP Table",
    price: 179.00,
    short: "Simple, affordable table for everyday use.",
    dimensions: "Length: 118 cm; Width: 74 cm; Height: 73 cm",
    img: "images/table4.jpg"
  },
  {
    id: "prod-5",
    name: "LAGKAPTEN / ADILS",
    price: 209.00,
    short: "Modern tabletop with sturdy legs.",
    dimensions: "Length: 140 cm; Width: 70 cm; Height: 74 cm",
    img: "images/table5.jpg"
  },
  {
    id: "prod-6",
    name: "BJORLI Table",
    price: 219.00,
    short: "Durable table with clean Scandinavian design.",
    dimensions: "Length: 120 cm; Width: 80 cm; Height: 75 cm",
    img: "images/table6.jpg"
  }
];

const cart = [];

function formatCAD(n){
  return new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
}

/* Render products */
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');

function renderProducts(list){
  resultsGrid.innerHTML = '';
  resultsCount.textContent = list.length;
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="thumb">
        <a href="#" class="thumb-link" data-id="${p.id}" aria-label="Open ${p.name} details">
          <img src="${p.img}" alt="${p.name} thumbnail" width="320" height="200" loading="lazy" />
        </a>
      </div>
      <div>
        <h4 class="product-title">${p.name}</h4>
        <div class="product-price">${formatCAD(p.price)}</div>
        <p class="product-desc">${p.short}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-details" data-id="${p.id}">Details</button>
        <button class="btn btn-add" data-id="${p.id}">Add to cart</button>
      </div>
    `;
    resultsGrid.appendChild(card);
  });
}

/* Initial filter to ~$200 band */
function initialFilter(){
  const filtered = products.filter(p => p.price >= 170 && p.price <= 260);
  renderProducts(filtered);
}
initialFilter();

/* Event delegation */
document.addEventListener('click', (e)=>{
  const detailsBtn = e.target.closest('.btn-details');
  const addBtn = e.target.closest('.btn-add');
  const thumbLink = e.target.closest('.thumb-link');

  if(detailsBtn){
    const id = detailsBtn.dataset.id;
    openProductModal(id);
  }

  if(addBtn){
    const id = addBtn.dataset.id;
    addToCartById(id);
  }

  if(thumbLink){
    e.preventDefault();
    const id = thumbLink.dataset.id;
    openProductModal(id);
  }
});

/* Modal elements */
const overlay = document.getElementById('overlay');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalShort = document.getElementById('modalShort');
const modalDimensions = document.getElementById('modalDimensions');
const modalPrice2 = document.getElementById('modalPrice2');
const modalAddBtn = document.getElementById('modalAddBtn');
const closeModal = document.getElementById('closeModal');

let currentModalProduct = null;

function openProductModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  currentModalProduct = p;
  modalImage.src = p.img;
  modalImage.alt = p.name;
  modalName.textContent = p.name;
  modalPrice.textContent = formatCAD(p.price);
  modalPrice2.textContent = formatCAD(p.price);
  modalShort.textContent = p.short;
  modalDimensions.textContent = p.dimensions;
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden','false');
}

closeModal.addEventListener('click', ()=>closeOverlay());
overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeOverlay(); });

function closeOverlay(){
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden','true');
  currentModalProduct = null;
}

/* Cart logic */
const cartCountEl = document.getElementById('cartCount');
const miniCartList = document.getElementById('miniCartList');
const miniTotal = document.getElementById('miniTotal');

function addToCartById(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(i=>i.id===id);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({id:p.id, name:p.name, price:p.price, qty:1});
  }
  updateCartUI();
  flashMessage(`${p.name} added to cart`);
}

modalAddBtn.addEventListener('click', ()=>{
  if(currentModalProduct) addToCartById(currentModalProduct.id);
});

function updateCartUI(){
  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = totalItems;
  miniCartList.innerHTML = '';
  cart.forEach(item=>{
    const li = document.createElement('li');
    li.textContent = `${item.qty} × ${item.name} — ${formatCAD(item.price * item.qty)}`;
    miniCartList.appendChild(li);
  });
  const total = cart.reduce((s,i)=>s + i.price * i.qty,0);
  miniTotal.textContent = formatCAD(total);
  document.getElementById('checkoutSubtotal').textContent = formatCAD(total);
  document.getElementById('checkoutTax').textContent = formatCAD(total * 0.13);
  document.getElementById('checkoutTotal').textContent = formatCAD(total * 1.13);
  document.getElementById('checkoutItems').innerHTML = cart.map(i=>`<div>${i.qty} × ${i.name} — ${formatCAD(i.price * i.qty)}</div>`).join('');
}

/* Flash message */
function flashMessage(text){
  const el = document.createElement('div');
  el.textContent = text;
  el.style.position='fixed';
  el.style.right='20px';
  el.style.bottom='20px';
  el.style.background='rgba(0,0,0,0.8)';
  el.style.color='white';
  el.style.padding='10px 14px';
  el.style.borderRadius='8px';
  el.style.zIndex=2000;
  document.body.appendChild(el);
  setTimeout(()=>el.style.opacity='0',1800);
  setTimeout(()=>el.remove(),2400);
}

/* Search & filters */
document.getElementById('searchBtn').addEventListener('click', ()=>{
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q));
  renderProducts(filtered);
});

document.getElementById('priceFilter').addEventListener('change', ()=>{
  const val = document.getElementById('priceFilter').value;
  let filtered = products;
  if(val === '200-399'){
    filtered = products.filter(p => p.price >= 200 && p.price <= 399);
  } else if(val === '100-199'){
    filtered = products.filter(p => p.price >= 100 && p.price <= 199);
  } else if(val === '0-99'){
    filtered = products.filter(p => p.price < 100);
  } else if(val === '400-999'){
    filtered = products.filter(p => p.price >= 400);
  }
  renderProducts(filtered);
});

/* Checkout flow */
const openCheckoutBtn = document.getElementById('openCheckout');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const submitOrder = document.getElementById('submitOrder');

openCheckoutBtn.addEventListener('click', ()=>{
  if(cart.length === 0){
    flashMessage('Your cart is empty. Add a table first.');
    return;
  }
  checkoutOverlay.style.display = 'flex';
  checkoutOverlay.setAttribute('aria-hidden','false');
});

closeCheckout.addEventListener('click', ()=>closeCheckoutOverlay());
checkoutOverlay.addEventListener('click', (e)=>{ if(e.target === checkoutOverlay) closeCheckoutOverlay(); });

function closeCheckoutOverlay(){
  checkoutOverlay.style.display = 'none';
  checkoutOverlay.setAttribute('aria-hidden','true');
}

submitOrder.addEventListener('click', ()=>{
  const name = document.getElementById('shipName').value.trim();
  const addr = document.getElementById('shipAddress').value.trim();
  const card = document.getElementById('cardNumber').value.trim();
  if(!name || !addr || !card){
    flashMessage('Please fill in shipping and payment details.');
    return;
  }

  const order = {
    id: 'ORDER-' + Math.floor(Math.random()*900000+100000),
    items: cart.slice(),
    total: cart.reduce((s,i)=>s + i.price * i.qty,0) * 1.13
  };

  cart.length = 0;
  updateCartUI();
  closeCheckoutOverlay();
  flashMessage(`Order ${order.id} submitted — Thank you!`);
});

/* Cart button opens checkout */
document.getElementById('cartBtn').addEventListener('click', ()=>{
  openCheckoutBtn.click();
});

/* Close modals with Escape */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    closeOverlay();
    closeCheckoutOverlay();
  }
});

/* Initialize cart UI */
updateCartUI();
