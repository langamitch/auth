// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC90I2xHSa-idxsK0vKK6jdeYMQUZrtKZ8",
  authDomain: "flowauth-62f71.firebaseapp.com",
  projectId: "flowauth-62f71",
  storageBucket: "flowauth-62f71.firebasestorage.app",
  messagingSenderId: "1006820242466",
  appId: "1:1006820242466:web:3d8576b0ddf307bdc3867b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Navbar & sidebar references
const navLinks = document.getElementById("nav-links");
const navRight = document.getElementById("nav-right");
const navMobileProfile = document.getElementById("nav-mobile-profile");
let profileDropdownEl = null;
let appLoadedResolvers = [];
function onAppLoaded(cb){ appLoadedResolvers.push(cb); }
const sidebarLinks = document.getElementById("sidebar-links");
const sidebar = document.getElementById("sidebar");
const navToggle = document.getElementById("nav-toggle");
const closeBtn = document.getElementById("close-btn");

// Modals
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const closeLogin = document.getElementById("closeLogin");
const closeSignup = document.getElementById("closeSignup");

// Forms
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Password Validation Regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

// --- Event Listeners --- //

// Open/close sidebar
navToggle.addEventListener("click", () => sidebar.style.display = "flex");
closeBtn.addEventListener("click", () => sidebar.style.display = "none");

// Close modals
closeLogin.onclick = () => loginModal.style.display = "none";
closeSignup.onclick = () => signupModal.style.display = "none";

// Click outside modal closes it
window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
  if (e.target === signupModal) signupModal.style.display = "none";
});

// Switch modals links
document.getElementById("switchToSignup").onclick = () => {
  loginModal.style.display = "none";
  signupModal.style.display = "flex";
};
document.getElementById("switchToLogin").onclick = () => {
  signupModal.style.display = "none";
  loginModal.style.display = "flex";
};

// --- Functions --- //
function updateNavbar(user) {
  // Clear
  navLinks.innerHTML = '';
  navRight.innerHTML = '';
  if (navMobileProfile) navMobileProfile.innerHTML = '';
  sidebarLinks.innerHTML = '';

  // Always show static links
  navLinks.innerHTML = `
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Privacy</a></li>
  `;

  if (user) {
    // Logged in: profile pic + logout
    const profilePic = document.createElement("img");
    profilePic.src = user.photoURL || "https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D";
    profilePic.classList.add("profile-pic");

    // Create or reuse dropdown
    if (!profileDropdownEl) {
      profileDropdownEl = document.createElement('div');
      profileDropdownEl.className = 'profile-dropdown';
      profileDropdownEl.innerHTML = `
        <div style="padding: 10px 0px; color:#aaa;font-weight: 700; font-size:16px;">Account</div>
        <a href="#">Profile</a>
        <a href="#">Settings</a>
        <button id="dropdown-logout">Logout</button>
      `;
      document.body.appendChild(profileDropdownEl);
    }

    function toggleDropdown(ev){
      ev.stopPropagation();
      const isOpen = profileDropdownEl.style.display === 'block';
      profileDropdownEl.style.display = isOpen ? 'none' : 'block';
    }
    function closeDropdown(){
      if (profileDropdownEl) profileDropdownEl.style.display = 'none';
    }
    window.addEventListener('click', closeDropdown);
    profileDropdownEl.addEventListener('click', (e)=> e.stopPropagation());

    // Wire logout inside dropdown
    setTimeout(()=>{
      const ddLogout = document.getElementById('dropdown-logout');
      if (ddLogout) ddLogout.onclick = () => { signOut(auth); closeDropdown(); };
    },0);

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.onclick = () => signOut(auth);

    const desktopPic = profilePic.cloneNode(true);
    desktopPic.addEventListener('click', toggleDropdown);
    navRight.appendChild(desktopPic);
    navRight.appendChild(logoutBtn);

    // Mobile profile (to the right of the toggle)
    if (navMobileProfile) {
      profilePic.addEventListener('click', toggleDropdown);
      navMobileProfile.appendChild(profilePic);
    }

    // Sidebar
    sidebarLinks.innerHTML = `
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Privacy</a></li>
      <li><a href="#">Profile</a></li>
      <li><a href="#" id="logout-mobile">Logout</a></li>
    `;
    document.getElementById("logout-mobile").onclick = () => {
      signOut(auth);
      sidebar.style.display = "none";
    };

  } else {
    // Logged out: login/signup buttons
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login";
    loginBtn.onclick = () => loginModal.style.display = "flex";

    const signupBtn = document.createElement("button");
    signupBtn.textContent = "Signup";
    signupBtn.onclick = () => signupModal.style.display = "flex";

    navRight.appendChild(loginBtn);
    navRight.appendChild(signupBtn);
    if (navMobileProfile) navMobileProfile.innerHTML = '';

    // Sidebar links
    sidebarLinks.innerHTML = `
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Privacy</a></li>
      <li><a href="#" id="loginSidebar">Login</a></li>
      <li><a href="#" id="signupSidebar">Signup</a></li>
    `;
    document.getElementById("loginSidebar").onclick = () => {
      loginModal.style.display = "flex";
      sidebar.style.display = "none";
    };
    document.getElementById("signupSidebar").onclick = () => {
      signupModal.style.display = "flex";
      sidebar.style.display = "none";
    };
  }
}

// --- Forms --- //
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginModal.style.display = "none";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!passwordRegex.test(password)) {
    alert("Password does not meet requirements!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    signupModal.style.display = "none";
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});

// Listen to auth state
onAuthStateChanged(auth, (user) => updateNavbar(user));

// Loader handling: wait for DOM and first auth state
const appLoader = document.getElementById('app-loader');
let domReady = false;
let authReady = false;

document.addEventListener('DOMContentLoaded', () => {
  domReady = true; maybeHideLoader();
});

onAuthStateChanged(auth, () => {
  authReady = true; maybeHideLoader();
});

function maybeHideLoader(){
  if (domReady && authReady && appLoader) {
    appLoader.style.display = 'none';
    appLoadedResolvers.forEach(fn => { try{ fn(); } catch(_){} });
    appLoadedResolvers = [];
  }
}
