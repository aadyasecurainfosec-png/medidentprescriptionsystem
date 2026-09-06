/* ==========================================================
   MediDent Clinic — Login (local accounts)
   Three accounts: Admin, Soham, Saylee.

   NOTE ON "SIGN IN WITH GOOGLE":
   Real Google sign-in needs (a) a Google Cloud OAuth Client ID and
   (b) the app hosted at a real https:// address — it will not work
   when the page is opened locally by double-clicking index.html.
   This file is written so that, once you have both of those, a
   Google button can be wired in later without changing anything
   else (see the GOOGLE_CLIENT_ID slot below). Until then, use the
   local username/password accounts.
   ========================================================== */

const GOOGLE_CLIENT_ID = ""; // fill in later if you host this + get a Client ID from Google Cloud Console

const USERS_KEY = "medident_users_v1";
const SESSION_KEY = "medident_session_v1";

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Admin", doctorId: null },
  { username: "soham", password: "soham123", role: "doctor", name: "Dr. Soham K. Gholba", doctorId: "soham" },
  { username: "saylee", password: "saylee123", role: "doctor", name: "Dr. Saylee Deshmukh", doctorId: "saylee" }
];

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USERS.slice();
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function changePassword(username, newPassword) {
  const users = getUsers();
  const u = users.find(u => u.username === username);
  if (!u) return false;
  u.password = newPassword;
  saveUsers(users);
  return true;
}

function attemptLogin(username, password) {
  const users = getUsers();
  const u = users.find(
    u => u.username.toLowerCase() === (username || "").trim().toLowerCase() && u.password === password
  );
  if (!u) return null;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, role: u.role, name: u.name, doctorId: u.doctorId }));
  return u;
}

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

function isAdmin() {
  const u = getCurrentUser();
  return !!u && u.role === "admin";
}

/* ---------------- login screen wiring ---------------- */

function showLoginScreen() {
  document.getElementById("loginOverlay").classList.add("show");
  document.getElementById("appRoot").classList.add("blurred");
}

function hideLoginScreen() {
  document.getElementById("loginOverlay").classList.remove("show");
  document.getElementById("appRoot").classList.remove("blurred");
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  const usernameEl = document.getElementById("loginUsername");
  const passwordEl = document.getElementById("loginPassword");
  const rememberEl = document.getElementById("loginRemember");
  const toggleBtn = document.getElementById("loginPwToggle");

  // Logo (shared data URI defined in app.js, loaded before this file).
  const logoEl = document.getElementById("loginLogo");
  if (logoEl && typeof LOGO_DATA_URI !== "undefined") {
    logoEl.src = LOGO_DATA_URI;
  }

  // Remembered username (never the password).
  const REMEMBER_KEY = "medident_remembered_username";
  const remembered = localStorage.getItem(REMEMBER_KEY);
  if (remembered) {
    usernameEl.value = remembered;
    rememberEl.checked = true;
    passwordEl.focus();
  } else {
    usernameEl.focus();
  }

  toggleBtn.addEventListener("click", () => {
    const show = passwordEl.type === "password";
    passwordEl.type = show ? "text" : "password";
    toggleBtn.textContent = show ? "Hide" : "Show";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameEl.value;
    const password = passwordEl.value;
    const user = attemptLogin(username, password);
    if (!user) {
      errorEl.textContent = "Incorrect username or password.";
      errorEl.style.display = "block";
      passwordEl.value = "";
      passwordEl.focus();
      return;
    }
    errorEl.style.display = "none";
    if (rememberEl.checked) {
      localStorage.setItem(REMEMBER_KEY, user.username);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    onLoginSuccess(user);
  });
}

function onLoginSuccess(user) {
  hideLoginScreen();
  document.getElementById("currentUserLabel").textContent = `${user.name} (${user.role === "admin" ? "Admin" : "Doctor"})`;
  document.getElementById("adminTabBtn").style.display = user.role === "admin" ? "" : "none";
  if (user.role === "doctor" && user.doctorId && typeof selectedDoctorId !== "undefined") {
    selectedDoctorId = user.doctorId;
    if (typeof renderDoctorSelect === "function") renderDoctorSelect();
  }
}

function initAuth() {
  wireLoginForm();
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Log out?")) logout();
  });
  const user = getCurrentUser();
  if (user) {
    onLoginSuccess(user);
  } else {
    showLoginScreen();
  }
}

document.addEventListener("DOMContentLoaded", initAuth);
