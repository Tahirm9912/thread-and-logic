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