/* app.js
   Left panel collapsible by toggle. Hover tooltip shows larger image and details.
   Thumbnails load from images/table1.jpg ... table6.jpg
*/

const products = [
  { id: "prod-1", name: "LISABO Table", price: 199.00, short: "Solid wood table with clean lines.", dimensions: "120 × 75 × 74 cm", img: "images/table1.jpg" },
  { id: "prod-2", name: "NORDEN Gateleg Table", price: 229.00, short: "Space-saving gateleg table, folds when not in use.", dimensions: "120 × 70 × 74 cm", img: "images/table2.jpg" },
  { id: "prod-3", name: "EKEDALEN Extendable Table", price: 249.00, short: "Extendable table for flexible dining.", dimensions: "140–200 × 90 × 75 cm", img: "images/table3.jpg" },
  { id: "prod-4", name: "MELLTORP Table", price: 179.00, short: "Simple, affordable table for everyday use.", dimensions: "118 × 74 × 73 cm", img: "images/table4.jpg" },
  { id: "prod-5", name: "LAGKAPTEN / ADILS", price: 209.00, short: "Modern tabletop with sturdy legs.", dimensions: "140 × 70 × 74 cm", img: "images/table5.jpg" },
  { id: "prod-6", name: "BJORLI Table", price: 219.00, short: "Durable table with clean Scandinavian design.", dimensions: "120 × 80 × 75 cm", img: "images/table6.jpg" }
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

renderProducts(products);

/* Left panel toggle */
const leftPanel = document.getElementById('leftPanel');
const panelToggle = document.getElementById('panelToggle');
const leftPanelContent = document.getElementById('leftPanelContent');

panelToggle.addEventListener('click', () => {
  const expanded = leftPanel.classList.toggle('expanded');
  leftPanel.classList.toggle('collapsed', !expanded);
  panelToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (expanded) {
    leftPanelContent.hidden = false;
  } else {
    leftPanelContent.hidden = true;
  }
});

/* Hover tooltip logic */
const hoverTooltip = document.getElementById('hoverTooltip');
let hoverTimer = null;
const TOOLTIP_WIDTH = 600;
const TOOLTIP_HEIGHT = 420;

resultsGrid.addEventListener('mousemove', (e) => {
  const link = e.target.closest('.thumb-link');
  if (!link) return;
  const id = link.dataset.id;
  const p = products.find(x => x.id === id);
  if (!p) return;

  const offsetX = 18;
  const offsetY = 14;
  let left = e.clientX + offsetX;
  let top = e.clientY + offsetY;

  if (left + TOOLTIP_WIDTH > window.innerWidth) {
    left = e.clientX - TOOLTIP_WIDTH - offsetX;
  }
  if (top + TOOLTIP_HEIGHT > window.innerHeight) {
    top = Math.max(12, window.innerHeight - TOOLTIP_HEIGHT - 12);
  }

  hoverTooltip.style.left = left + 'px';
  hoverTooltip.style.top = top + 'px';
});

resultsGrid.addEventListener('mouseover', (e) => {
  const link = e.target.closest('.thumb-link');
  if (!link) return;
  const id = link.dataset.id;
  const p = products.find(x => x.id === id);
  if (!p) return;

  hoverTimer = setTimeout(() => {
    hoverTooltip.innerHTML = `
      <img src="${p.img}" alt="${p.name} thumbnail" />
      <div class="name">${p.name}</div>
      <div class="price">${formatCAD(p.price)}</div>
      <div class="summary">${p.short}</div>
      <div class="dims">Dimensions: ${p.dimensions}</div>
    `;
    hoverTooltip.style.display = 'block';
    hoverTooltip.setAttribute('aria-hidden','false');
  }, 140);
});

resultsGrid.addEventListener('mouseout', (e) => {
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
  const related = e.relatedTarget;
  const stillInside = related && (related.closest && (related.closest('.thumb') || related.closest('.hover-tooltip')));
  if (!stillInside) {
    hoverTooltip.style.display = 'none';
    hoverTooltip.setAttribute('aria-hidden','true');
  }
});

/* Click handlers (details, add, thumbnail) */
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
    openCheckoutOverlay();
  }

  if(thumbLink){
    e.preventDefault();
    const id = thumbLink.dataset.id;
    openProductModal(id);
  }
});

/* Modal & checkout logic */
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

/* Cart & checkout */
const cartCountEl = document.getElementById('cartCount');
const checkoutItemsEl = document.getElementById('checkoutItems');
const checkoutSubtotalEl = document.getElementById('checkoutSubtotal');
const checkoutTaxEl = document.getElementById('checkoutTax');
const checkoutTotalEl = document.getElementById('checkoutTotal');

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
  if(currentModalProduct) {
    addToCartById(currentModalProduct.id);
    closeOverlay();
    openCheckoutOverlay();
  }
});

function updateCartUI(){
  const totalItems = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = totalItems;
  checkoutItemsEl.innerHTML = cart.map(i=>`<div>${i.qty} × ${i.name} — ${formatCAD(i.price * i.qty)}</div>`).join('');
  const total = cart.reduce((s,i)=>s + i.price * i.qty,0);
  checkoutSubtotalEl.textContent = formatCAD(total);
  checkoutTaxEl.textContent = formatCAD(total * 0.13);
  checkoutTotalEl.textContent = formatCAD(total * 1.13);
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

/* Search & filter */
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

/* Checkout overlay controls */
const checkoutOverlay = document.getElementById('checkoutOverlay');
const openCheckoutLeft = document.getElementById('openCheckoutLeft');
const closeCheckout = document.getElementById('closeCheckout');
const submitOrder = document.getElementById('submitOrder');
const continueShoppingBtn = document.getElementById('continueShopping');

openCheckoutLeft && openCheckoutLeft.addEventListener('click', ()=>{
  if(cart.length === 0){ flashMessage('Your cart is empty. Add a table first.'); return; }
  openCheckoutOverlay();
});

function openCheckoutOverlay(){
  checkoutOverlay.style.display = 'flex';
  checkoutOverlay.setAttribute('aria-hidden','false');
  updateCartUI();
}

closeCheckout.addEventListener('click', ()=>closeCheckoutOverlay());
checkoutOverlay.addEventListener('click', (e)=>{ if(e.target === checkoutOverlay) closeCheckoutOverlay(); });

function closeCheckoutOverlay(){
  checkoutOverlay.style.display = 'none';
  checkoutOverlay.setAttribute('aria-hidden','true');
}

/* Submit order (simulated) */
submitOrder.addEventListener('click', ()=>{
  const name = document.getElementById('shipName').value.trim();
  const addr = document.getElementById('shipAddress').value.trim();
  const card = document.getElementById('cardNumber').value.trim();
  if(!name || !addr || !card){ flashMessage('Please fill in shipping and payment details.'); return; }

  const order = { id: 'ORDER-' + Math.floor(Math.random()*900000+100000), items: cart.slice(), total: cart.reduce((s,i)=>s + i.price * i.qty,0) * 1.13 };

  cart.length = 0;
  updateCartUI();
  closeCheckoutOverlay();
  flashMessage(`Order ${order.id} submitted — Thank you!`);
});

/* Continue shopping */
continueShoppingBtn.addEventListener('click', ()=>{
  closeCheckoutOverlay();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Cart button opens checkout */
document.getElementById('cartBtn').addEventListener('click', ()=>{
  if(cart.length === 0){ flashMessage('Your cart is empty. Add a table first.'); return; }
  openCheckoutOverlay();
});

/* Close modals with Escape */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){ closeOverlay(); closeCheckoutOverlay(); }
});

/* Initialize */
updateCartUI();
