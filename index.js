// index.js
const guestButtons = document.getElementById("guest-buttons");
const userButtons = document.getElementById("user-buttons");
const adminPanelBtn = document.getElementById("adminPanelBtn");

const userData = localStorage.getItem("loggedUser");

if (userData) {
  try {
    const user = JSON.parse(userData);
    if (user && user.username && user.role) {
      if (user.role === "admin") {
        window.location.href = "/admin-dashboard.html";
      } else {
        window.location.href = "/dashboard.html";
      }
    } else {
      localStorage.removeItem("loggedUser");
      guestButtons.classList.remove("hidden");
      userButtons.classList.add("hidden");
    }
  } catch (err) {
    console.warn("⚠️ Date invalide în localStorage. Se curăță...");
    localStorage.removeItem("loggedUser");
    guestButtons.classList.remove("hidden");
    userButtons.classList.add("hidden");
  }
} else {
  guestButtons.classList.remove("hidden");
  userButtons.classList.add("hidden");
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  window.location.reload();
});
