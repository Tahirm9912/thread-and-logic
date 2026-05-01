
// ─── SIDE MENU ────────────────────────────────────────────────────────
const menu     = document.getElementById("sideMenu");
const overlay  = document.getElementById("overlay");
const toggle   = document.getElementById("menuToggle");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
  overlay.classList.toggle("active");
  toggle.classList.toggle("fa-bars");
  toggle.classList.toggle("fa-times");
});

overlay.addEventListener("click", () => {
  menu.classList.remove("active");
  overlay.classList.remove("active");
  toggle.classList.add("fa-bars");
  toggle.classList.remove("fa-times");
});

// dropdowns inside side menu
document.querySelectorAll(".dropdown").forEach(d => {
  d.querySelector(".drop-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    d.classList.toggle("active");
  });
});


// ─── CART DRAWER ──────────────────────────────────────────────────────
const cartDrawer  = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

// FIX: use the correct selector — the bag icon now has class "cart-icon"
const cartIcon = document.querySelector(".cart-icon");

cartIcon.addEventListener("click", () => {
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
});

cartOverlay.addEventListener("click", () => {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
});

const searchBtn = document.getElementById("search_top");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");

// OPEN SEARCH
searchBtn.addEventListener("click", () => {
  searchOverlay.classList.add("active");
  searchInput.focus();
});

// CLOSE SEARCH
function closeSearch() {
  searchOverlay.classList.remove("active");
  searchInput.value = "";
}

// close button click
searchClose.addEventListener("click", closeSearch);

// ENTER = SEARCH
searchInput.addEventListener("keydown", (e) => {
 if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query !== "") {
      alert("Searching for: " + query); // replace with real logic
    } 
  } 


});

document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" || e.key==="Esc") {
    closeSearch();
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
    menu.classList.remove("active");
    overlay.classList.remove("active");
    toggle.classList.add("fa-bars");
    toggle.classList.remove("fa-times");
  } 
})
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, {
  threshold: 0.15
});

reveals.forEach(el => observer.observe(el));


document.querySelectorAll(".cart-item").forEach(item => {

  const minus = item.querySelector(".minus");
  const plus = item.querySelector(".plus");
  const input = item.querySelector(".qty-input");

  minus.addEventListener("click", () => {
    let value = parseInt(input.value);
    if (value > 1) input.value = value - 1;
  });

  plus.addEventListener("click", () => {
    let value = parseInt(input.value);
    input.value = value + 1;
  });

});

// IMAGE SWITCH
const mainImg = document.getElementById("mainImg");
const thumbs = document.querySelectorAll(".thumb");

thumbs.forEach(img => {
  img.addEventListener("click", () => {
    mainImg.src = img.src;

    thumbs.forEach(t => t.classList.remove("active"));
    img.classList.add("active");
  });
});

// QUANTITY
const minus = document.querySelector(".minus");
const plus = document.querySelector(".plus");
const input = document.querySelector(".qty-box input");

minus.addEventListener("click", () => {
  let value = parseInt(input.value);
  if (value > 1) input.value = value - 1;
});

plus.addEventListener("click", () => {
  input.value = parseInt(input.value) + 1;
});


const cartWrapper = document.querySelector(".cart-wrapper");



// MAIN FUNCTION
function addToCartAnimation() {

  // 1. shake cart icon
  cartIcon.classList.add("cart-shake");

  // 2. show red dot
  cartWrapper.classList.add("active");

  // 3. play sound
  const sp = new Audio("/sounds/cart.mp3")
  sp.play()

  // remove shake after animation
  setTimeout(() => {
    cartIcon.classList.remove("cart-shake");
  }, 400);
}

document.querySelectorAll(".btn-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    addToCartAnimation();
  });
});
