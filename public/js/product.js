// ===============================
// 🟢 SIDE MENU
// ===============================
const menu     = document.getElementById("sideMenu");
const overlay  = document.getElementById("overlay");
const toggle   = document.getElementById("menuToggle");

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

// dropdowns
document.querySelectorAll(".dropdown").forEach(d => {
  const btn = d.querySelector(".drop-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      d.classList.toggle("active");
    });
  }
});


// ===============================
// 🟢 CART DRAWER
// ===============================
const cartDrawer  = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartIcon    = document.querySelector(".cart-icon");

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


// ===============================
// 🟢 SEARCH
// ===============================
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
        alert("Searching for: " + query);
      }
    }
  });
}


// ===============================
// 🟢 GLOBAL ESC HANDLER
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSearch();

    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartOverlay) cartOverlay.classList.remove("active");

    if (menu) menu.classList.remove("active");
    if (overlay) overlay.classList.remove("active");

    if (toggle) {
      toggle.classList.add("fa-bars");
      toggle.classList.remove("fa-times");
    }
  }
});


// ===============================
// 🟢 SCROLL ANIMATION
// ===============================
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));


// ===============================
// 🟢 CART QTY (DRAWER ITEMS)
// ===============================
document.querySelectorAll(".cart-item").forEach(item => {
  const minus = item.querySelector(".minus");
  const plus  = item.querySelector(".plus");
  const input = item.querySelector(".qty-input");

  if (minus && plus && input) {
    minus.addEventListener("click", () => {
      let val = parseInt(input.value);
      if (val > 1) input.value = val - 1;
    });

    plus.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
    });
  }
});


// ===============================
// 🟢 IMAGE SWITCH (PRODUCT PAGE)
// ===============================
const mainImg = document.getElementById("mainImg");
const thumbs  = document.querySelectorAll(".thumb");

thumbs.forEach(img => {
  img.addEventListener("click", () => {
    if (mainImg) mainImg.src = img.src;

    thumbs.forEach(t => t.classList.remove("active"));
    img.classList.add("active");
  });
});


// ===============================
// 🟢 CART ANIMATION (USED BY EJS)
// ===============================
const cartWrapper = document.querySelector(".cart-wrapper");

function addToCartAnimation() {
  if (!cartIcon) return;

  cartIcon.classList.add("cart-shake");

  if (cartWrapper) {
    cartWrapper.classList.add("active");
  }

  const sound = new Audio("/sounds/cart.mp3");
  sound.play();

  setTimeout(() => {
    cartIcon.classList.remove("cart-shake");
  }, 400);
}