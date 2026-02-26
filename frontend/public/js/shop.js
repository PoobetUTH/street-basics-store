// ============================================
// Shop Page Logic — Decoupled Frontend
// ============================================

// API Base URL — points to the backend service
const API_BASE = window.__API_BASE__ || 'http://localhost:4000';

let allProducts = [];
let cart = [];

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  loadProducts();
  loadCartFromStorage();
});

// ============================================
// User Management
// ============================================
function loadUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userBar = document.getElementById('userBar');
  const userIcon = document.getElementById('userIcon');
  const userName = document.getElementById('userName');

  if (user && token) {
    userBar.style.display = 'block';
    userName.textContent = user.name;
    userIcon.href = '#';
    userIcon.title = user.name;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'login.html';
}

// ============================================
// Products
// ============================================
async function loadProducts() {
  const grid = document.getElementById('productsGrid');

  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json();
    allProducts = data.products;
    renderProducts(allProducts);
  } catch (err) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="text-second" style="font-size:48px;">😕</p>
        <p class="text-second">ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    `;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="text-second">ไม่พบสินค้าในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product, index) => `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" data-aos="fade-up" data-aos-delay="${index * 50}">
      <div class="shop-product-card">
        <div class="shop-product-image">
          <img src="${product.image}" alt="${product.name}" class="img-fluid">
          <div class="shop-product-overlay">
            <button class="btn-add-cart" onclick="addToCart(${product.id})">
              🛒 เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
        <div class="shop-product-info">
          <h4 class="text-main">${product.name}</h4>
          <p class="shop-product-desc text-second">${product.description || ''}</p>
          <div class="shop-product-footer">
            <span class="shop-product-price text-main">$${Number(product.price).toFixed(2)}</span>
            <span class="shop-product-stock text-second">${product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : 'หมด'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  AOS.refresh();
}

function filterProducts(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (category === 'all') {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === category);
    renderProducts(filtered);
  }
}

// ============================================
// Cart
// ============================================
function loadCartFromStorage() {
  const stored = localStorage.getItem('cart');
  if (stored) {
    cart = JSON.parse(stored);
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว 🛒`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty text-center text-second">
        <p style="font-size:48px;">🛍️</p>
        <p>ตะกร้าว่างเปล่า</p>
      </div>
    `;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h5 class="text-main">${item.name}</h5>
        <p class="text-second">$${item.price.toFixed(2)}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.productId}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.productId}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.productId})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCart(e) {
  if (e) e.preventDefault();
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');

  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : 'auto';
}

// ============================================
// Checkout
// ============================================
async function checkout() {
  const token = localStorage.getItem('token');

  if (!token) {
    showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  if (cart.length === 0) {
    showToast('ตะกร้าว่างเปล่า', 'error');
    return;
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'กำลังดำเนินการ...';

  try {
    const items = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }
      throw new Error(data.error || 'เกิดข้อผิดพลาด');
    }

    // Show success modal
    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');
    details.innerHTML = `
      <p class="text-second">หมายเลขคำสั่งซื้อ: <strong>#${data.order.id}</strong></p>
      <p class="text-second">ยอดรวม: <strong>$${data.order.total.toFixed(2)}</strong></p>
      <p class="text-second">สถานะ: <strong>รอดำเนินการ</strong></p>
    `;
    modal.style.display = 'flex';

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    toggleCart(null);

    // Reload products to update stock
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'สั่งซื้อเลย';
  }
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

// ============================================
// Mobile Nav
// ============================================
function openNav() {
  const links = document.querySelector('.links');
  document.body.style.overflowY = 'hidden';
  links.classList.toggle('show');
  if (links.getAttribute('class') === 'links') {
    document.body.style.overflow = 'auto';
  }
}

// ============================================
// Toast
// ============================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast-message ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
