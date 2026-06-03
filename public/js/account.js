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

// ─── ESCAPE KEY ───────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
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

// ─── ACCOUNT EDIT MODE ────────────────────────────────────────────────
function toggleEdit() {
  const viewMode = document.getElementById("viewMode");
  const editForm = document.getElementById("editForm");
  const editBtn = document.getElementById("editToggleBtn");
  
  if (viewMode && editForm) {
    viewMode.style.display = "none";
    editForm.style.display = "grid";
    if (editBtn) editBtn.style.display = "none";
  }
}

function cancelEdit() {
  const viewMode = document.getElementById("viewMode");
  const editForm = document.getElementById("editForm");
  const editBtn = document.getElementById("editToggleBtn");
  
  if (viewMode && editForm) {
    viewMode.style.display = "grid";
    editForm.style.display = "none";
    if (editBtn) editBtn.style.display = "block";
  }
}

function updateProfile(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const data = {
    email: formData.get("email"),
    tel: formData.get("tel"),
    address: formData.get("address"),
    postal_code: formData.get("postal_code")
  };

  console.log('Sending update:', data);

  fetch("/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => {
    console.log('Update response:', data);
    
    if (data.success) {
      alert("Profile updated successfully!");
      location.reload();
    } else {
      alert(data.message || "Update failed");
    }
  })
  .catch(err => {
    console.error('Update error:', err);
    alert("Error updating profile");
  });
}

// Make function global
window.updateProfile = updateProfile;

// Make functions global
window.toggleEdit = toggleEdit;
window.cancelEdit = cancelEdit;
