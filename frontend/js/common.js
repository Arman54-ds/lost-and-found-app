// ================= GLOBAL =================
window.BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
  ? "http://localhost:5000" 
  : ""; // Empty string for relative paths on hosted environments

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ================= CHECK LOGIN =================
function checkAuth() {
  const user = localStorage.getItem("user");

  if (!user) {
    window.location.href = "login.html";
  }
}

// ================= PROFILE LOAD =================
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "User";

  const first = name.split(" ")[0];
  const initial = first.charAt(0).toUpperCase();

  const circle = document.getElementById("profileCircle");
  const tag = document.getElementById("profileName");

  if (circle) circle.innerHTML = initial;
  if (tag) tag.innerHTML = first;
}
