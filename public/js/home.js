// ─── SLIDER ───────────────────────────────────────────────────────────
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots");

let index = 0;

if (slides.length > 0 && dotsContainer) {
  // create dots
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.addEventListener("click", () => showSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));
    slides[i].classList.add("active");
    dots[i].classList.add("active");
    index = i;
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  }

  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);

  setInterval(nextSlide, 4000);
  showSlide(0);
}

// ─── SIDE MENU ────────────────────────────────────────────────────────
const menu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const toggle = document.getElementById("menuToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
    toggle.classList.toggle("fa-bars");
    toggle.classList.toggle("fa-times");
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
    toggle.classList.add("fa-bars");
    toggle.classList.remove("fa-times");
  });
}

document.querySelectorAll(".dropdown").forEach(d => {
  const btn = d.querySelector(".drop-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      d.classList.toggle("active");
    });
  }
});

// ─── CART DRAWER ──────────────────────────────────────────────────────
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartIcon = document.querySelector(".cart-icon");

if (cartIcon) {
  cartIcon.addEventListener("click", () => {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  });
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", () => {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
}

// ─── SEARCH ───────────────────────────────────────────────────────────
const searchBtn = document.getElementById("search_top");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    searchInput.focus();
  });
}

function closeSearch() {
  if (searchOverlay) searchOverlay.classList.remove("active");
  if (searchInput) searchInput.value = "";
}

if (searchClose) {
  searchClose.addEventListener("click", closeSearch);
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query !== "") {
        window.location.href = `/list?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// ─── ESCAPE KEY ───────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    closeSearch();
    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartOverlay) cartOverlay.classList.remove("active");
    if (menu) menu.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (toggle) {
      toggle.classList.add("fa-bars");
      toggle.classList.remove("fa-times");
    }
    const popup = document.getElementById("popup");
    if (popup) popup.classList.remove("active");
  }
});

// ─── SCROLL REVEAL ────────────────────────────────────────────────────
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

// ─── CART QTY CONTROLS ────────────────────────────────────────────────
document.querySelectorAll(".cart-item").forEach(item => {
  const minus = item.querySelector(".minus");
  const plus = item.querySelector(".plus");
  const input = item.querySelector(".qty-input");

  if (minus && plus && input) {
    minus.addEventListener("click", () => {
      let value = parseInt(input.value);
      if (value > 1) input.value = value - 1;
    });

    plus.addEventListener("click", () => {
      let value = parseInt(input.value);
      input.value = value + 1;
    });
  }
});

// ─── POPUP ────────────────────────────────────────────────────────────
const showPopup = true;
const popup = document.getElementById("popup");
const popupClose = document.getElementById("popupClose");

if (showPopup && popup && popupClose) {
  setTimeout(() => {
    popup.classList.add("active");
  }, 300);

  popupClose.addEventListener("click", () => {
    popup.classList.remove("active");
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active");
    }
  });
}

// ─── CART ANIMATION ───────────────────────────────────────────────────
const cartWrapper = document.querySelector(".cart-wrapper");

function addToCartAnimation() {
  if (!cartIcon) return;

  cartIcon.classList.add("cart-shake");

  if (cartWrapper) {
    cartWrapper.classList.add("active");
  }

  const sound = new Audio("/sounds/cart.mp3");
  sound.play().catch(() => {});

  setTimeout(() => {
    cartIcon.classList.remove("cart-shake");
  }, 400);
}

document.querySelectorAll(".btn-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    addToCartAnimation();
  });
});

window.addToCartAnimation = addToCartAnimation;



// ─── BUY NOW (GLOBAL) ─────────────────────────────────────────────────
window.buyNow = function(productId, variantId) {
  fetch("/buy-now", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      variant_id: variantId,
      quantity: 1
    })
  })
  .then(res => {
    if (res.redirected) {
      window.location.href = res.url;
      return null;
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;
    
    if (data.success) {
      window.location.href = `/payout?order=${data.orderId}`;
    } else {
      alert(data.message || "Error processing purchase");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error processing purchase");
  });
};

// ─── UPDATE CART COUNT (NO RELOAD) ────────────────────────────────────
function updateCartCount() {
  fetch('/api/cart-count')
    .then(res => res.json())
    .then(data => {
      const badge = document.querySelector('.cart-badge');
      const wrapper = document.querySelector('.cart-wrapper');
      
      if (data.count > 0) {
        if (badge) {
          badge.textContent = data.count;
        } else if (wrapper) {
          const newBadge = document.createElement('span');
          newBadge.className = 'cart-badge';
          newBadge.textContent = data.count;
          wrapper.appendChild(newBadge);
        }
        if (wrapper) wrapper.classList.add('active');
      } else {
        if (badge) badge.remove();
        if (wrapper) wrapper.classList.remove('active');
      }
    })
    .catch(err => console.error('Cart count update error:', err));
}

// ─── UPDATE CART DRAWER CONTENT ───────────────────────────────────────
function updateCartDrawer() {
  fetch('/api/cart-items')
    .then(res => res.json())
    .then(data => {
      const cartBody = document.querySelector('.cart-drawer .cart-body');
      
      if (!cartBody) return;

      if (data.items && data.items.length > 0) {
        cartBody.innerHTML = data.items.map(item => `
          <div class="cart-item">
            <img src="${item.image_url || '/images/default.jpg'}" alt="${item.name}">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p>${item.size} • ${item.color}</p>
              <p class="cart-price">Rs ${parseFloat(item.price).toFixed(0)}</p>
            </div>
            <div class="cart-qty">
              <span>Qty: ${item.quantity}</span>
            </div>
          </div>
        `).join('');

        // Update footer
        let footer = document.querySelector('.cart-drawer .cart-footer');
        if (!footer) {
          footer = document.createElement('div');
          footer.className = 'cart-footer';
          document.querySelector('.cart-drawer').appendChild(footer);
        }
        footer.innerHTML = '<a href="/checkout" class="cart-checkout-btn">Checkout</a>';
      } else {
        cartBody.innerHTML = `
          <div class="cart-empty">
            <i class="fas fa-shopping-bag"></i>
            <p>Your cart is empty</p>
          </div>
        `;

        const footer = document.querySelector('.cart-drawer .cart-footer');
        if (footer) footer.remove();
      }
    })
    .catch(err => console.error('Cart drawer update error:', err));
}

// ─── SHOW NOTIFICATION ────────────────────────────────────────────────
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();

  // Create notification
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Hide and remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Make functions globally available
window.updateCartCount = updateCartCount;
window.updateCartDrawer = updateCartDrawer;
window.showNotification = showNotification;




// Add at bottom of home.js
console.log('Home.js loaded');
console.log('updateCartCount available:', typeof updateCartCount);
console.log('updateCartDrawer available:', typeof updateCartDrawer);
console.log('showNotification available:', typeof showNotification);