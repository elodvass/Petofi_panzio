<script setup>
import { ref, onMounted, computed } from 'vue'

// Állapotok
const currentUser = ref(null)
const showAuthModal = ref(false)
const authMode = ref('login') // 'login' vagy 'register'

// Űrlap adatok
const loginForm = ref({ email: '', jelszo: '' })
const registerForm = ref({ nev: '', email: '', jelszo: '' })
const authError = ref('')
const authSuccess = ref('')
const authLoading = ref(false)

// Panzió adatok
const szobak = ref([])
const etelek = ref([])
const loadingData = ref(true)
const bookingNotice = ref('')

// API alap URL (helyben Vite proxy -> localhost:3000, code-server proxy alatt /proxy/3000/api)
const API_URL = import.meta.env.VITE_API_URL || (
  window.location.pathname.startsWith('/absproxy/') || window.location.pathname.startsWith('/proxy/')
    ? '/proxy/3000/api'
    : '/api'
)

// Felhasználó betöltése localStorage-ból
onMounted(async () => {
  const savedUser = localStorage.getItem('petofi_user')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
    } catch (e) {
      localStorage.removeItem('petofi_user')
    }
  }
  await loadData()
})

// Szobák és ételek lekérdezése
const loadData = async () => {
  loadingData.value = true
  try {
    const [szobaRes, etelRes] = await Promise.all([
      fetch(`${API_URL}/szobak`),
      fetch(`${API_URL}/etelek`)
    ])
    if (szobaRes.ok) szobak.value = await szobaRes.json()
    if (etelRes.ok) etelek.value = await etelRes.json()
  } catch (err) {
    console.warn('Backend még nem elérhető vagy hiba:', err)
  } finally {
    loadingData.value = false
  }
}

// Bejelentkezés
const handleLogin = async () => {
  authError.value = ''
  authSuccess.value = ''
  authLoading.value = true

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm.value)
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Hiba a bejelentkezés során!')
    }

    currentUser.value = data.user
    localStorage.setItem('petofi_user', JSON.stringify(data.user))
    authSuccess.value = `Sikeres bejelentkezés! Üdv, ${data.user.nev}!`
    
    setTimeout(() => {
      showAuthModal.value = false
      authSuccess.value = ''
      loginForm.value = { email: '', jelszo: '' }
    }, 1200)
  } catch (err) {
    authError.value = err.message
  } finally {
    authLoading.value = false
  }
}

// Vendég regisztráció (Kifejezetten csak vendég!)
const handleRegister = async () => {
  authError.value = ''
  authSuccess.value = ''
  authLoading.value = true

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm.value)
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Hiba a regisztráció során!')
    }

    // Automatikus bejelentkeztetés sikeres regisztráció után
    currentUser.value = data.user
    localStorage.setItem('petofi_user', JSON.stringify(data.user))
    authSuccess.value = `Sikeres regisztráció! Üdvözlünk vendégünkként, ${data.user.nev}!`

    setTimeout(() => {
      showAuthModal.value = false
      authSuccess.value = ''
      registerForm.value = { nev: '', email: '', jelszo: '' }
    }, 1500)
  } catch (err) {
    authError.value = err.message
  } finally {
    authLoading.value = false
  }
}

// Kijelentkezés
const handleLogout = () => {
  currentUser.value = null
  localStorage.removeItem('petofi_user')
}

// Szerepkör címke szövege és színe
const roleBadge = computed(() => {
  if (!currentUser.value) return null
  switch (currentUser.value.szerepkor) {
    case 'admin': return { text: 'Adminisztrátor', class: 'badge-admin' }
    case 'dolgozo': return { text: 'Dolgozó (Konyha)', class: 'badge-staff' }
    default: return { text: 'Vendég', class: 'badge-guest' }
  }
})

// Szobafoglalás gomb klikk
const onBookRoom = (szoba) => {
  if (!currentUser.value) {
    authMode.value = 'login'
    showAuthModal.value = true
    authError.value = 'A foglaláshoz kérjük, először jelentkezz be vendégként!'
  } else {
    bookingNotice.value = `Kiválasztottad a(z) ${szoba.szobaszam}-es szobát! (A dátumválasztó foglalás a következő lépésben érkezik.)`
    setTimeout(() => { bookingNotice.value = '' }, 4000)
  }
}
</script>

<template>
  <div class="panzio-app">
    <!-- Fejléc / Navigáció -->
    <header class="navbar">
      <div class="nav-container">
        <div class="brand">
          <span class="brand-icon">🏡</span>
          <div>
            <span class="brand-title">Petőfi Panzió</span>
            <span class="brand-subtitle">Vendégház & Étterem</span>
          </div>
        </div>

        <nav class="nav-links">
          <a href="#hero">Főoldal</a>
          <a href="#szobak">Szobáink</a>
          <a href="#etlap">Házias Étlap</a>
          <a href="#rolunk">Rólunk</a>
        </nav>

        <div class="nav-actions">
          <template v-if="currentUser">
            <div class="user-chip">
              <span class="user-name">👤 {{ currentUser.nev }}</span>
              <span class="badge" :class="roleBadge?.class">{{ roleBadge?.text }}</span>
            </div>
            <button @click="handleLogout" class="btn btn-outline btn-sm">Kijelentkezés</button>
          </template>
          <template v-else>
            <button @click="() => { authMode = 'login'; authError = ''; showAuthModal = true }" class="btn btn-primary">
              Bejelentkezés
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Értesítési sáv ha van üzenet -->
    <div v-if="bookingNotice" class="notification-bar">
      {{ bookingNotice }}
    </div>

    <!-- Hero / Kezdőkép szekció -->
    <section id="hero" class="hero-section">
      <div class="hero-content">
        <div class="hero-tag">🌲 Nyugodt pihenés a Bakony szívében</div>
        <h1>Lassulj le és pihenj a Petőfi Panzióban</h1>
        <p class="hero-desc">
          Családias környezet, kényelmes szobák és gondosan készített házias ételek. 
          Akár egy romantikus hétvégére, akár családi pihenésre érkezel, nálunk otthon érezheted magad.
        </p>
        <div class="hero-buttons">
          <a href="#szobak" class="btn btn-primary btn-lg">Szobák megtekintése</a>
          <button v-if="!currentUser" @click="() => { authMode = 'register'; authError = ''; showAuthModal = true }" class="btn btn-secondary btn-lg">
            Vendég regisztráció
          </button>
        </div>

        <!-- Főbb jellemzők kártyák -->
        <div class="feature-strip">
          <div class="feature-item">
            <span class="feature-icon">🛏️</span>
            <div>
              <strong>Kényelmes szobák</strong>
              <span>Saját fürdő, modern bútorok</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🍲</span>
            <div>
              <strong>Házias ízek</strong>
              <span>Reggeli és napi választható menü</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✨</span>
            <div>
              <strong>Kedves vendéglátás</strong>
              <span>Minden vendégünk kiemelt figyelmet kap</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Szobák szekció -->
    <section id="szobak" class="section-container">
      <div class="section-header">
        <span class="sub-title">Szálláslehetőségek</span>
        <h2>Válaszd ki a számodra ideális szobát</h2>
        <p>Minden szobánk tágas, tiszta és felszerelt a teljes körű feltöltődéshez.</p>
      </div>

      <div v-if="loadingData" class="loading-box">
        Szobák betöltése az adatbázisból...
      </div>

      <div v-else class="rooms-grid">
        <div v-for="szoba in szobak" :key="szoba.id" class="room-card">
          <div class="room-card-header">
            <span class="room-number">{{ szoba.szobaszam }}. szoba</span>
            <span class="room-status" :class="szoba.allapot === 'szabad' ? 'status-free' : 'status-busy'">
              {{ szoba.allapot === 'szabad' ? 'Szabad' : szoba.allapot }}
            </span>
          </div>
          <div class="room-card-body">
            <h3>{{ szoba.leiras }}</h3>
            <div class="room-meta">
              <span>👥 {{ szoba.ferohely }} fős kapacitás</span>
              <span class="room-price">{{ Number(szoba.ar_per_ej).toLocaleString('hu-HU') }} Ft <small>/ éj</small></span>
            </div>
          </div>
          <div class="room-card-footer">
            <button @click="onBookRoom(szoba)" class="btn btn-primary w-full">
              {{ currentUser ? 'Szoba kiválasztása' : 'Bejelentkezés foglaláshoz' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Étlap és Ellátás szekció -->
    <section id="etlap" class="section-container bg-warm">
      <div class="section-header">
        <span class="sub-title">Gasztronómia</span>
        <h2>Házias Étlapunk & Napi Menü</h2>
        <p>A szálláshoz közvetlenül rendelhetsz bőséges reggelit vagy ízletes ebédet és vacsorát.</p>
      </div>

      <div class="menu-grid">
        <div v-for="etel in etelek" :key="etel.id" class="menu-card">
          <div class="menu-category-tag">{{ etel.kategoria }}</div>
          <div class="menu-content">
            <h4>{{ etel.nev }}</h4>
            <p>{{ etel.leiras }}</p>
          </div>
          <div class="menu-price">
            {{ Number(etel.ar).toLocaleString('hu-HU') }} Ft
          </div>
        </div>
      </div>
    </section>

    <!-- Rólunk szekció -->
    <section id="rolunk" class="section-container">
      <div class="about-card">
        <div class="about-text">
          <span class="sub-title">A Petőfi Panzióról</span>
          <h2>Ahol a hagyomány és a kényelem találkozik</h2>
          <p>
            Panziónk célja, hogy menedéket nyújtson a rohanó hétköznapokból. 
            Legyen szó túrázásról a környező hegyekben, meghitt családi összejövetelről 
            vagy csak egy nyugodt hétvégéről, nálunk barátságos légkör és ínycsiklandó fogások várnak.
          </p>
          <div class="contact-info">
            <div>📍 <strong>Cím:</strong> 8420 Zirc, Petőfi Sándor utca 12.</div>
            <div>📞 <strong>Telefon:</strong> +36 88 123 456</div>
            <div>✉️ <strong>Email:</strong> info@petofipanzio.hu</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lábléc -->
    <footer class="footer">
      <div class="footer-content">
        <div>
          <h3>🏡 Petőfi Panzió</h3>
          <p>Nyugodt pihenés, házias ízek.</p>
        </div>
        <p class="copyright">© 2026 Petőfi Panzió Projektmunka. Minden jog fenntartva.</p>
      </div>
    </footer>

    <!-- Bejelentkezés / Regisztráció Modal Felugró Ablak -->
    <div v-if="showAuthModal" class="modal-overlay" @click.self="showAuthModal = false">
      <div class="modal-card">
        <button class="modal-close" @click="showAuthModal = false">×</button>

        <!-- Fül választó -->
        <div class="auth-tabs">
          <button 
            :class="{ active: authMode === 'login' }" 
            @click="() => { authMode = 'login'; authError = ''; authSuccess = '' }"
          >
            Bejelentkezés
          </button>
          <button 
            :class="{ active: authMode === 'register' }" 
            @click="() => { authMode = 'register'; authError = ''; authSuccess = '' }"
          >
            Vendég Regisztráció
          </button>
        </div>

        <!-- Hiba / Siker üzenetek -->
        <div v-if="authError" class="alert alert-error">{{ authError }}</div>
        <div v-if="authSuccess" class="alert alert-success">{{ authSuccess }}</div>

        <!-- Bejelentkezés űrlap -->
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <p class="auth-helper">Jelentkezz be meglévő fiókoddal a foglaláshoz!</p>
          <div class="form-group">
            <label>Email cím</label>
            <input v-model="loginForm.email" type="email" placeholder="pelda@email.hu" required />
          </div>
          <div class="form-group">
            <label>Jelszó</label>
            <input v-model="loginForm.jelszo" type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn btn-primary w-full" :disabled="authLoading">
            {{ authLoading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
          </button>
          
          <div class="auth-footer-note">
            Teszt admin fiók: <code>admin@petofi.hu</code> | Jelszó: <code>admin123</code>
          </div>
        </form>

        <!-- Regisztráció űrlap -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="guest-info-banner">
            ℹ️ <strong>Vendég regisztráció:</strong> Itt kizárólag vendég fiókot tudsz létrehozni. Dolgozói jogosultságot az adminisztrátor tud adni.
          </div>
          <div class="form-group">
            <label>Teljes név</label>
            <input v-model="registerForm.nev" type="text" placeholder="pl. Kovács Anna" required />
          </div>
          <div class="form-group">
            <label>Email cím</label>
            <input v-model="registerForm.email" type="email" placeholder="kovacs.anna@email.hu" required />
          </div>
          <div class="form-group">
            <label>Jelszó</label>
            <input v-model="registerForm.jelszo" type="password" placeholder="Legalább 6 karakter" required minlength="4" />
          </div>
          <button type="submit" class="btn btn-primary w-full" :disabled="authLoading">
            {{ authLoading ? 'Regisztráció...' : 'Regisztráció Vendégként' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Teljes elrendezés */
.panzio-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Navbár */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 247, 242, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  font-size: 2rem;
}

.brand-title {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  font-weight: 500;
}

.nav-links a {
  color: var(--text-main);
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}
.badge-admin { background: #fee2e2; color: #991b1b; }
.badge-staff { background: #dbeafe; color: #1e40af; }
.badge-guest { background: #dcfce7; color: #166534; }

/* Gombok */
.btn {
  padding: 0.65rem 1.35rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary);
  color: #fff;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #fff;
  color: var(--primary);
  border: 1.5px solid var(--primary);
}
.btn-secondary:hover {
  background-color: var(--primary-light);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
.btn-outline:hover {
  background: #fff;
  color: var(--text-main);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
}

.btn-lg {
  padding: 0.9rem 2rem;
  font-size: 1.05rem;
}

.w-full { width: 100%; }

/* Hero Szekció */
.hero-section {
  padding: 5rem 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  text-align: center;
  max-width: 820px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  background: var(--accent-light);
  color: var(--accent);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-section h1 {
  font-size: 3.2rem;
  margin-bottom: 1.25rem;
  color: #1f1b19;
}

.hero-desc {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 2.2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3.5rem;
}

/* Feature sáv */
.feature-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-icon {
  font-size: 2rem;
  background: var(--bg-main);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
}

.feature-item strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-main);
}

.feature-item span {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* Szekciók általános */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4.5rem 2rem;
  width: 100%;
}

.bg-warm {
  background-color: #f4eee5;
  border-radius: var(--radius-lg);
}

.section-header {
  text-align: center;
  max-width: 650px;
  margin: 0 auto 3rem;
}

.sub-title {
  text-transform: uppercase;
  font-size: 0.82rem;
  letter-spacing: 1.5px;
  font-weight: 700;
  color: var(--primary);
  display: block;
  margin-bottom: 0.5rem;
}

.section-header h2 {
  font-size: 2.4rem;
  margin-bottom: 0.75rem;
}

.section-header p {
  color: var(--text-muted);
  font-size: 1.05rem;
}

/* Szoba Kártyák */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.room-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-number {
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.room-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-free { background: #dcfce7; color: #15803d; }
.status-busy { background: #fee2e2; color: #b91c1c; }

.room-card-body h3 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  min-height: 2.5rem;
}

.room-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.room-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.room-price small {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-muted);
}

/* Étlap Kártyák */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.menu-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.menu-category-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-light);
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  align-self: flex-start;
  margin-bottom: 0.75rem;
}

.menu-content h4 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.menu-content p {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1rem;
}

.menu-price {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary);
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
}

/* Rólunk doboz */
.about-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 3rem;
  box-shadow: var(--shadow-sm);
}

.about-text h2 {
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
}

.about-text p {
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-size: 0.95rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

/* Értesítési sáv */
.notification-bar {
  background: #ecfdf5;
  color: #065f46;
  border-bottom: 1px solid #a7f3d0;
  padding: 0.75rem 2rem;
  text-align: center;
  font-weight: 600;
}

/* Modal Stílusok */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1.5rem;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 440px;
  border-radius: var(--radius-lg);
  padding: 2.2rem;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.modal-close {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  font-size: 1.8rem;
  background: transparent;
  color: var(--text-muted);
  line-height: 1;
}

.auth-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.auth-tabs button {
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.auth-tabs button.active {
  color: var(--primary);
  background: var(--primary-light);
}

.auth-helper {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.guest-info-banner {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.82rem;
  color: #1e3a8a;
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-main);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: var(--primary);
}

.alert {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  margin-bottom: 1.2rem;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.auth-footer-note {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.auth-footer-note code {
  background: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Lábléc */
.footer {
  margin-top: auto;
  background: #25201d;
  color: #d6ccc2;
  padding: 3rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-content h3 {
  color: #fff;
  margin-bottom: 0.3rem;
}

.copyright {
  font-size: 0.85rem;
  color: #8c827a;
  border-top: 1px solid #3d3530;
  padding-top: 1.5rem;
}

/* Reszponzivitás */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero-section h1 { font-size: 2.2rem; }
  .hero-desc { font-size: 1rem; }
  .hero-buttons { flex-direction: column; }
  .about-card { padding: 1.5rem; }
}
</style>
