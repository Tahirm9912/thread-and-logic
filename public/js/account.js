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

document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" || e.key==="Esc") {
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



function toggleEdit() {
  document.getElementById("viewMode").style.display = "none";
  document.getElementById("editForm").style.display = "grid";
}

function updateProfile(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  fetch("/user/update", {
    method: "POST",
    body: JSON.stringify({
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address")
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Updated!");
      location.reload();
    }
  });
}


