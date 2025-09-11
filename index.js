// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, onSnapshot, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

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
// My APIs UI refs
const apisList = document.getElementById('apis-list');
const apisEmpty = document.getElementById('apis-empty');
const apiSearch = document.getElementById('api-search');
const apiAddBtn = document.getElementById('api-add-btn');
const apiModal = document.getElementById('apiModal');
const closeApiModal = document.getElementById('closeApiModal');
const apiForm = document.getElementById('apiForm');
const apiModalTitle = document.getElementById('apiModalTitle');
const apiIdInput = document.getElementById('apiId');
const apiModeInput = document.getElementById('apiMode');
const apiNameInput = document.getElementById('apiName');
const apiDescInput = document.getElementById('apiDesc');
const apiKeyInput = document.getElementById('apiKey');

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
    <li><a href="#api-manager">API Manager</a></li>
    <li><a href="#docs">Docs</a></li>
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
        <div style="padding: 30px 0px; color:#aaa;font-weight: 700; font-size:16px;">Account</div>
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
      <li><a href="#api-manager">API Manager</a></li>
      <li><a href="#docs">Docs</a></li>
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
      <li><a href="#api-manager">API Manager</a></li>
      <li><a href="#docs">Docs</a></li>
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      await updateDoc(doc(db, 'users', cred.user.uid), { lastLoginAt: serverTimestamp() });
    } catch (_) { /* ignore if doc doesn't exist */ }
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
    // Persist user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name,
      email,
      photoURL: userCredential.user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }, { merge: true });
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

// Hero CTA wiring
document.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === 'cta-get-started') {
    // Prefer signup for new users
    if (typeof signupModal !== 'undefined') signupModal.style.display = 'flex';
  }
  if (target.id === 'cta-sign-in') {
    if (typeof loginModal !== 'undefined') loginModal.style.display = 'flex';
  }
});

// ===== My APIs (Firestore CRUD) =====
let unsubscribeApis = null;
let currentUserId = null;
let cachedApis = [];

function renderApis(items){
  const term = (apiSearch?.value || '').toLowerCase();
  const filtered = term ? items.filter(it => (it.name||'').toLowerCase().includes(term) || (it.description||'').toLowerCase().includes(term)) : items;
  if (!apisList) return;
  apisList.innerHTML = '';
  if (!filtered.length){
    if (apisEmpty) apisEmpty.style.display = 'block';
    return;
  }
  if (apisEmpty) apisEmpty.style.display = 'none';
  for (const it of filtered){
    const masked = (it.key && it.key.length > 6) ? `${it.key.slice(0,3)}••••${it.key.slice(-3)}` : (it.key || '');
    const publicId = it.publicId || '';
    const card = document.createElement('div');
    card.className = 'api-card';
    card.innerHTML = `
      <h3>${it.name || 'Untitled'}</h3>
      <p>${it.description || ''}</p>
      <div class="api-row">
        <span class="api-key" title="${it.key}">${masked}</span>
      </div>
      <div class="api-actions">
        <button class="btn-ghost" data-action="copy" data-id="${it.id}">Copy</button>
        <button class="btn-ghost" data-action="edit" data-id="${it.id}">Edit</button>
        <button class="btn-ghost" data-action="delete" data-id="${it.id}">Delete</button>
        <button class="btn-ghost" data-action="use" data-id="${it.id}">Use</button>
      </div>
    `;
    apisList.appendChild(card);
  }
}

function watchApis(user){
  if (!apisList) return;
  if (unsubscribeApis) { unsubscribeApis(); unsubscribeApis = null; }
  cachedApis = [];
  if (!user){
    apisList.innerHTML = '';
    if (apisEmpty) apisEmpty.style.display = 'block';
    return;
  }
  currentUserId = user.uid;
  // Order by server timestamp requires index sometimes; keep simple filter by uid
  const q = query(collection(db, 'apis'), where('uid', '==', user.uid));
  unsubscribeApis = onSnapshot(q, (snap) => {
    cachedApis = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderApis(cachedApis);
  });
}

// Hook auth changes to APIs list
onAuthStateChanged(auth, (user) => {
  watchApis(user);
});

// Search
apiSearch?.addEventListener('input', () => renderApis(cachedApis));

// Add button
apiAddBtn?.addEventListener('click', () => {
  if (!auth.currentUser){ alert('Please sign in first.'); return; }
  apiModalTitle.textContent = 'Add API';
  apiModeInput.value = 'create';
  apiIdInput.value = '';
  apiNameInput.value = '';
  apiDescInput.value = '';
  apiKeyInput.value = '';
  apiModal.style.display = 'flex';
});

// Close modal
closeApiModal?.addEventListener('click', () => apiModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === apiModal) apiModal.style.display = 'none'; });

// Save (create/update)
apiForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!auth.currentUser){ alert('Please sign in first.'); return; }
  const baseData = {
    name: apiNameInput.value.trim(),
    description: apiDescInput.value.trim(),
    key: apiKeyInput.value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if (apiModeInput.value === 'edit' && apiIdInput.value){
      // Do not allow changing uid or createdAt on update
      await updateDoc(doc(db, 'apis', apiIdInput.value), baseData);
    } else {
      // Generate a public reference id (non-secret) for embedding usage
      const publicId = `pub_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36)}`;
      await addDoc(collection(db, 'apis'), {
        uid: auth.currentUser.uid,
        publicId,
        ...baseData,
        createdAt: serverTimestamp()
      });
    }
    apiModal.style.display = 'none';
  } catch (err){
    alert('Failed to save: ' + err.message);
  }
});

// List actions (copy/edit/delete)
apisList?.addEventListener('click', async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute('data-action');
  const id = target.getAttribute('data-id');
  if (!action || !id) return;
  const item = cachedApis.find(x => x.id === id);
  if (!item) return;
  if (action === 'copy'){
    try { await navigator.clipboard.writeText(item.key); target.textContent = 'Copied!'; setTimeout(()=> target.textContent='Copy', 1200); } catch(_){ alert('Copy failed'); }
  }
  if (action === 'edit'){
    apiModalTitle.textContent = 'Edit API';
    apiModeInput.value = 'edit';
    apiIdInput.value = id;
    apiNameInput.value = item.name || '';
    apiDescInput.value = item.description || '';
    apiKeyInput.value = item.key || '';
    apiModal.style.display = 'flex';
  }
  if (action === 'delete'){
    if (confirm('Delete this API?')){
      try { await deleteDoc(doc(db, 'apis', id)); } catch(err){ alert('Delete failed: ' + err.message); }
    }
  }
  if (action === 'use'){
    const snippet = `<script src="${location.origin}/sdk.js" data-public-id="${item.publicId}"><\/script>`;
    try { await navigator.clipboard.writeText(snippet); target.textContent = 'Snippet Copied!'; setTimeout(()=> target.textContent='Use', 1200); } catch(_){ alert('Copy failed'); }
  }
});
