/* =========================================================
   FOODIE – Main JavaScript
   1 Data · 2 State · 3 Helpers · 4 Render menu · 5 Filter/search
   6 Cart logic · 7 Render cart · 8 Checkout · 9 Contact · 10 Auth
   11 UI (navbar, modals, scroll) · 12 Init
   ========================================================= */

/* ---------- 1. FOOD DATA (14 products) ---------- */
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

const foods = [
  { id: 1,  name: "Classic Cheeseburger",  category: "burgers",  price: 6.99,  rating: 4.8, desc: "Juicy beef patty, cheddar, lettuce and our secret sauce.",   img: IMG("1568901346375-23c9450c58cd") },
  { id: 2,  name: "Double Bacon Burger",   category: "burgers",  price: 9.49,  rating: 4.7, desc: "Two patties, crispy bacon, pickles and smoky BBQ sauce.",    img: IMG("1550547660-d9450f859349") },
  { id: 3,  name: "Margherita Pizza",      category: "pizza",    price: 10.99, rating: 4.6, desc: "Fresh mozzarella, basil and tomato sauce on thin crust.",    img: IMG("1565299624946-b28f40a0ae38") },
  { id: 4,  name: "Pepperoni Pizza",       category: "pizza",    price: 12.49, rating: 4.9, desc: "Loaded with spicy pepperoni and melted cheese.",             img: IMG("1513104890138-7c749659a591") },
  { id: 5,  name: "Crispy Fried Chicken",  category: "chicken",  price: 8.99,  rating: 4.8, desc: "Golden, crunchy chicken pieces seasoned to perfection.",     img: IMG("1626645738196-c2a7c87a8f58") },
  { id: 6,  name: "Spicy Chicken Wings",   category: "chicken",  price: 7.49,  rating: 4.5, desc: "Six hot wings tossed in tangy buffalo sauce.",               img: IMG("1567620832903-9fc6debc209f") },
  { id: 7,  name: "Chicken Fried Rice",    category: "rice",     price: 6.49,  rating: 4.4, desc: "Wok-fried rice with chicken, egg and fresh vegetables.",     img: IMG("1512058564366-18510be2db19") },
  { id: 8,  name: "Beef Rice Bowl",        category: "rice",     price: 8.29,  rating: 4.6, desc: "Tender sliced beef over steamed rice with a savory glaze.",  img: IMG("1546069901-ba9599a7e63c") },
  { id: 9,  name: "Fresh Orange Juice",    category: "drinks",   price: 3.49,  rating: 4.7, desc: "100% freshly squeezed oranges, no added sugar.",             img: IMG("1621506289937-a8e4df240d0b") },
  { id: 10, name: "Iced Caramel Coffee",   category: "drinks",   price: 4.29,  rating: 4.8, desc: "Cold brew coffee with creamy milk and caramel drizzle.",     img: IMG("1572490122747-3968b75cc699") },
  { id: 11, name: "Chocolate Lava Cake",   category: "desserts", price: 5.49,  rating: 4.9, desc: "Warm chocolate cake with a rich molten center.",             img: IMG("1578985545062-69928b1d9587") },
  { id: 12, name: "Strawberry Ice Cream",  category: "desserts", price: 3.99,  rating: 4.5, desc: "Creamy ice cream made with real strawberries.",              img: IMG("1497034825429-c343d7c6a68f") },
  { id: 13, name: "Veggie Supreme Pizza",  category: "pizza",    price: 11.49, rating: 4.3, desc: "Bell peppers, olives, mushrooms and sweet corn.",            img: IMG("1565958011703-44f9829ba187") },
  { id: 14, name: "Mango Smoothie",        category: "drinks",   price: 4.49,  rating: 4.6, desc: "Thick and refreshing smoothie made with ripe mangoes.",      img: IMG("1553530666-ba11a7da3888") }
];

const DELIVERY_FEE = 2.50;       // flat delivery fee (USD)
const CART_KEY = "foodie_cart";  // LocalStorage key

/* ---------- 2. STATE ---------- */
let cart = loadCart();           // array of { id, qty }
let activeCategory = "all";
let searchTerm = "";

/* ---------- 3. HELPERS ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const money = (n) => "$" + n.toFixed(2);
const findFood = (id) => foods.find((f) => f.id === id);

/* Escape text so user input can never inject HTML */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* Fallback if an image fails to load */
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#ffe3d5'/><text x='50%' y='50%' font-size='60' text-anchor='middle' dominant-baseline='middle'>🍽️</text></svg>"
);
function imgError(img) { img.onerror = null; img.src = FALLBACK_IMG; }

/* Star rating HTML */
function starsHTML(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '<i class="fa-solid fa-star"></i>';
    else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html + `<span>(${rating.toFixed(1)})</span>`;
}

/* Small popup message */
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i>${message}`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- 4. RENDER FOOD MENU ---------- */
function renderMenu() {
  const grid = $("#foodGrid");

  // Apply category filter + search filter together
  const list = foods.filter((f) => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = !term || f.name.toLowerCase().includes(term) ||
                        f.desc.toLowerCase().includes(term) || f.category.includes(term);
    return matchCat && matchSearch;
  });

  grid.innerHTML = list.map((f, i) => `
    <article class="food-card" style="animation-delay:${i * 0.05}s">
      <div class="food-img">
        <img src="${f.img}" alt="${escapeHTML(f.name)}" loading="lazy" onerror="imgError(this)" />
        <span class="food-badge">${f.category}</span>
      </div>
      <div class="food-body">
        <h3>${f.name}</h3>
        <p>${f.desc}</p>
        <div class="stars">${starsHTML(f.rating)}</div>
        <div class="food-footer">
          <span class="price">${money(f.price)}</span>
          <button class="add-btn" data-add="${f.id}"><i class="fa-solid fa-plus"></i> Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");

  $("#noResults").style.display = list.length ? "none" : "block";
}

/* ---------- 5. CATEGORY FILTER + SEARCH ---------- */
function setupFilters() {
  // Category buttons
  $("#categories").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    $$(".cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderMenu();
  });

  // Live search while typing
  $("#searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderMenu();
  });

  // Search button / Enter key -> scroll to menu
  $("#heroSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    searchTerm = $("#searchInput").value;
    renderMenu();
    $("#menu").scrollIntoView({ behavior: "smooth" });
  });

  // Add to cart buttons (event delegation)
  $("#foodGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(Number(btn.dataset.add));
  });
}

/* ---------- 6. CART LOGIC ---------- */
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) return [];
    // keep only valid items that still exist in the menu
    return saved.filter((i) => findFood(i.id) && i.qty > 0);
  } catch (err) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) { /* storage unavailable */ }
}

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCart();
  showToast(`${findFood(id).name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

/* Calculate subtotal, delivery fee and grand total */
function getTotals() {
  const subtotal = cart.reduce((sum, i) => sum + findFood(i.id).price * i.qty, 0);
  const delivery = cart.length ? DELIVERY_FEE : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

/* ---------- 7. RENDER CART ---------- */
function updateCart() {
  saveCart();

  // Cart counter badge
  $("#cartCount").textContent = cart.reduce((sum, i) => sum + i.qty, 0);

  // Cart panel items
  const itemsBox = $("#cartItems");
  if (!cart.length) {
    itemsBox.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-basket-shopping"></i><p>Your cart is empty.<br>Add some delicious food!</p></div>`;
  } else {
    itemsBox.innerHTML = cart.map((i) => {
      const f = findFood(i.id);
      return `
        <div class="cart-item">
          <img src="${f.img}" alt="${escapeHTML(f.name)}" onerror="imgError(this)" />
          <div class="ci-info">
            <h4>${f.name}</h4>
            <div class="ci-price">${money(f.price)}</div>
            <div class="qty">
              <button data-dec="${f.id}" aria-label="Decrease quantity">−</button>
              <span>${i.qty}</span>
              <button data-inc="${f.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove-btn" data-remove="${f.id}" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
    }).join("");
  }

  // Totals (cart panel + checkout summary)
  const t = getTotals();
  $("#cartSubtotal").textContent = money(t.subtotal);
  $("#cartDelivery").textContent = money(t.delivery);
  $("#cartTotal").textContent    = money(t.total);
  $("#sumSubtotal").textContent  = money(t.subtotal);
  $("#sumDelivery").textContent  = money(t.delivery);
  $("#sumTotal").textContent     = money(t.total);

  // Checkout order summary list
  $("#summaryItems").innerHTML = cart.length
    ? cart.map((i) => {
        const f = findFood(i.id);
        return `<div class="summary-row"><span>${i.qty} × ${f.name}</span><strong>${money(f.price * i.qty)}</strong></div>`;
      }).join("")
    : `<p class="summary-empty">No items yet. Add food from the menu.</p>`;
}

function setupCartEvents() {
  // + / - / remove buttons inside the cart (event delegation)
  $("#cartItems").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) changeQty(Number(inc.dataset.inc), 1);
    if (dec) changeQty(Number(dec.dataset.dec), -1);
    if (rem) removeFromCart(Number(rem.dataset.remove));
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#clearCart").addEventListener("click", () => {
    if (cart.length) { clearCart(); showToast("Cart cleared"); }
  });

  // Checkout button -> close the cart and scroll to the checkout form
  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) { showToast("Your cart is empty!"); return; }
    closeCart();
    $("#checkout").scrollIntoView({ behavior: "smooth" });
  });
}

function openCart()  { $("#cartPanel").classList.add("open");    $("#overlay").classList.add("show"); }
function closeCart() { $("#cartPanel").classList.remove("open"); $("#overlay").classList.remove("show"); }

/* ---------- 8. CHECKOUT FORM VALIDATION ---------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[\d\s\-()]{8,16}$/;

/* Show or clear an error under a field */
function setError(inputId, errId, message) {
  const input = $("#" + inputId);
  const err = $("#" + errId);
  err.textContent = message;
  if (input && input.closest(".form-group")) {
    input.closest(".form-group").classList.toggle("invalid", Boolean(message));
  }
  return !message; // true when valid
}

function setupCheckout() {
  $("#checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const name    = $("#fullName").value.trim();
    const phone   = $("#phone").value.trim();
    const email   = $("#email").value.trim();
    const address = $("#address").value.trim();
    const notes   = $("#notes").value.trim();
    const payment = document.querySelector('input[name="payment"]:checked');

    // Validate every field (all run so every error shows at once)
    const results = [
      setError("fullName", "errName",    name.length < 3 ? "Please enter your full name (min. 3 characters)." : ""),
      setError("phone",    "errPhone",   !phoneRegex.test(phone) ? "Please enter a valid phone number." : ""),
      setError("email",    "errEmail",   !emailRegex.test(email) ? "Please enter a valid email address." : ""),
      setError("address",  "errAddress", address.length < 6 ? "Please enter your full delivery address." : ""),
      Boolean(payment) || (($("#errPayment").textContent = "Please choose a payment method."), false)
    ];
    if (results.includes(false)) return;

    // Cart must have items
    if (!cart.length) {
      showToast("Your cart is empty. Add food first!");
      $("#menu").scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Success: build confirmation message
    const t = getTotals();
    const orderNo = "FD" + Math.floor(100000 + Math.random() * 900000);
    $("#confirmText").innerHTML =
      `Thank you, <strong>${escapeHTML(name)}</strong>!<br>
       Order <strong>#${orderNo}</strong> totaling <strong>${money(t.total)}</strong> (${escapeHTML(payment.value)})
       will be delivered to:<br><em>${escapeHTML(address)}</em><br><br>
       Estimated delivery time: <strong>30–40 minutes</strong>.` +
       (notes ? `<br>Note: ${escapeHTML(notes)}` : "");

    openModal("confirmModal");

    // Reset form and empty the cart
    $("#checkoutForm").reset();
    clearCart();
  });

  // Clear an error message as soon as the user edits the field
  [["fullName","errName"],["phone","errPhone"],["email","errEmail"],["address","errAddress"]].forEach(([id, err]) => {
    $("#" + id).addEventListener("input", () => setError(id, err, ""));
  });
  $$('input[name="payment"]').forEach((r) => r.addEventListener("change", () => ($("#errPayment").textContent = "")));
}

/* ---------- 9. CONTACT FORM ---------- */
function setupContact() {
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = [
      setError("cName",    "errCName",    $("#cName").value.trim().length < 2 ? "Please enter your name." : ""),
      setError("cEmail",   "errCEmail",   !emailRegex.test($("#cEmail").value.trim()) ? "Please enter a valid email." : ""),
      setError("cMessage", "errCMessage", $("#cMessage").value.trim().length < 10 ? "Message must be at least 10 characters." : "")
    ];
    if (ok.includes(false)) return;
    $("#contactForm").reset();
    showToast("Message sent! We will reply soon.");
  });
}

/* ---------- 10. LOGIN / SIGN UP (demo only) ---------- */
function setupAuth() {
  $("#openAuth").addEventListener("click", () => openModal("authModal"));

  // Switch between Login and Sign Up tabs
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      $("#loginForm").classList.toggle("hidden", tab.dataset.tab !== "login");
      $("#signupForm").classList.toggle("hidden", tab.dataset.tab !== "signup");
    });
  });

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim();
    const pass = $("#loginPass").value;
    if (!emailRegex.test(email) || pass.length < 6) {
      $("#errLogin").textContent = "Enter a valid email and a password (min. 6 characters).";
      return;
    }
    $("#errLogin").textContent = "";
    closeModal("authModal");
    $("#loginForm").reset();
    showToast("Welcome back to FOODIE!");
  });

  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#signName").value.trim();
    const email = $("#signEmail").value.trim();
    const pass = $("#signPass").value;
    if (name.length < 2 || !emailRegex.test(email) || pass.length < 6) {
      $("#errSignup").textContent = "Please fill in all fields correctly (password min. 6 characters).";
      return;
    }
    $("#errSignup").textContent = "";
    closeModal("authModal");
    $("#signupForm").reset();
    showToast(`Account created. Welcome, ${name}!`);
  });
}

/* ---------- 11. UI: MODALS, NAVBAR, SCROLL ---------- */
function openModal(id)  { $("#" + id).classList.add("show"); }
function closeModal(id) { $("#" + id).classList.remove("show"); }

function setupUI() {
  // Close buttons for modals
  $$("[data-close]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
  // Click outside the box closes the modal
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("show"); }));
  // Escape key closes everything
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { $$(".modal").forEach((m) => m.classList.remove("show")); closeCart(); }
  });

  // Mobile navigation menu
  const navLinks = $("#navLinks");
  const toggle = $("#menuToggle");
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  // Close the mobile menu after clicking a link
  $$(".nav-link").forEach((link) => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));

  // Back to top button
  $("#backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Scroll effects: navbar shadow, back-to-top visibility, active nav link
  const sections = ["home", "menu", "about", "contact"].map((id) => document.getElementById(id));
  window.addEventListener("scroll", () => {
    $("#navbar").classList.toggle("scrolled", window.scrollY > 20);
    $("#backTop").classList.toggle("show", window.scrollY > 500);

    const pos = window.scrollY + 140;
    let current = "home";
    sections.forEach((s) => { if (s && pos >= s.offsetTop) current = s.id; });
    $$(".nav-link").forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  });
}

/* ---------- 12. INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderMenu();
  setupFilters();
  setupCartEvents();
  setupCheckout();
  setupContact();
  setupAuth();
  setupUI();
  updateCart();   // restores the saved cart from LocalStorage
});
