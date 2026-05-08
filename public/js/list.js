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
    const filterDrawer = document.getElementById("filterDrawer");
    const filterOverlay = document.getElementById("filterOverlay");
    if (filterDrawer) filterDrawer.classList.remove("active");
    if (filterOverlay) filterOverlay.classList.remove("active");
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

// ─── FILTER DRAWER ────────────────────────────────────────────────────
const filterBtn = document.getElementById("filterBtn");
const filterDrawer = document.getElementById("filterDrawer");
const filterOverlay = document.getElementById("filterOverlay");

if (filterBtn) {
  filterBtn.addEventListener("click", () => {
    filterDrawer.classList.add("active");
    filterOverlay.classList.add("active");
  });
}

if (filterOverlay) {
  filterOverlay.addEventListener("click", () => {
    filterDrawer.classList.remove("active");
    filterOverlay.classList.remove("active");
  });
}

// ─── FILTER FUNCTIONALITY ─────────────────────────────────────────────
let selectedFilters = {
  tags: [],
  minPrice: null,
  maxPrice: null
};

// Get all filter checkboxes
const filterCheckboxes = document.querySelectorAll('.filter-drawer input[type="checkbox"]');

filterCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    const value = e.target.value;
    const category = e.target.dataset.category;

    if (e.target.checked) {
      if (category === 'tag') {
        selectedFilters.tags.push(value);
      }
    } else {
      if (category === 'tag') {
        selectedFilters.tags = selectedFilters.tags.filter(t => t !== value);
      }
    }
  });
});

// Apply filters button
const applyBtn = document.querySelector('.apply-btn');
if (applyBtn) {
  applyBtn.addEventListener('click', () => {
    applyFilters();
  });
}

// Reset filters button
const resetBtn = document.querySelector('.reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    // Uncheck all checkboxes
    filterCheckboxes.forEach(cb => cb.checked = false);
    
    // Clear selected filters
    selectedFilters = {
      tags: [],
      minPrice: null,
      maxPrice: null
    };
    
    // Redirect to list without filters
    window.location.href = '/list';
  });
}

function applyFilters() {
  const params = new URLSearchParams();
  
  if (selectedFilters.tags.length > 0) {
    params.append('tag', selectedFilters.tags.join(','));
  }
  
  if (selectedFilters.minPrice) {
    params.append('minPrice', selectedFilters.minPrice);
  }
  
  if (selectedFilters.maxPrice) {
    params.append('maxPrice', selectedFilters.maxPrice);
  }
  
  window.location.href = `/list?${params.toString()}`;
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

// ─── ADD TO CART (GLOBAL) ─────────────────────────────────────────────
window.addToCart = function(productId, variantId) {
  fetch("/cart/add", {
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
      addToCartAnimation();
      
      // Update cart count without full reload
      updateCartCount();
    } else {
      alert(data.message || "Error adding to cart");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error adding to cart");
  });
};

// ─── BUY NOW (GLOBAL) ─────────────────────────────────────────────────
window.buyNow = function(productId, variantId) {
  fetch("/cart/add", {
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
      // Go directly to checkout
      window.location.href = '/checkout';
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
        } else {
          const newBadge = document.createElement('span');
          newBadge.className = 'cart-badge';
          newBadge.textContent = data.count;
          wrapper.appendChild(newBadge);
        }
        wrapper.classList.add('active');
      } else {
        if (badge) badge.remove();
        wrapper.classList.remove('active');
      }
    })
    .catch(err => console.error(err));
}

// ─── ADD TO CART (GLOBAL) ─────────────────────────────────────────────
window.addToCart = function(productId, variantId) {
  // Disable button to prevent double-click
  const buttons = document.querySelectorAll(`button[onclick*="addToCart(${productId}, ${variantId})"]`);
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
  });

  fetch("/cart/add", {
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
      // Animation
      addToCartAnimation();
      
      // Update cart count AND cart drawer content
      updateCartCount();
      updateCartDrawer();
      
      // Re-enable button
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'Add to Cart';
      });
    } else {
      alert(data.message || "Error adding to cart");
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'Add to Cart';
      });
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error adding to cart");
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.innerHTML = 'Add to Cart';
    });
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
        } else {
          const newBadge = document.createElement('span');
          newBadge.className = 'cart-badge';
          newBadge.textContent = data.count;
          wrapper.appendChild(newBadge);
        }
        wrapper.classList.add('active');
      } else {
        if (badge) badge.remove();
        wrapper.classList.remove('active');
      }
    })
    .catch(err => console.error(err));
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
    .catch(err => console.error(err));
}


// ─── BUY NOW (GLOBAL) ─────────────────────────────────────────────────
window.buyNow = function(productId, variantId) {
  const buttons = document.querySelectorAll(`button[onclick*="buyNow(${productId}, ${variantId})"]`);
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  });

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
      // Go directly to payment with this order
      window.location.href = `/payout?order=${data.orderId}`;
    } else {
      alert(data.message || "Error processing purchase");
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'Buy Now';
      });
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error processing purchase");
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.innerHTML = 'Buy Now';
    });
  });
};


function toggleWishlist(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  
  const btn = event.currentTarget;
  const icon = btn.querySelector('i');
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (wishlist.includes(productId)) {
    // Remove
    wishlist = wishlist.filter(id => id !== productId);
    icon.classList.remove('fas');
    icon.classList.add('far');
    btn.classList.remove('active');
  } else {
    // Add
    wishlist.push(productId);
    icon.classList.remove('far');
    icon.classList.add('fas');
    btn.classList.add('active');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// On page load, mark wishlisted items
document.addEventListener('DOMContentLoaded', () => {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const productId = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
    if (wishlist.includes(productId)) {
      const icon = btn.querySelector('i');
      icon.classList.remove('far');
      icon.classList.add('fas');
      btn.classList.add('active');
    }
  });
});

window.toggleWishlist = toggleWishlist;