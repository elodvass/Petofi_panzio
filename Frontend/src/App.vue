<script setup>
import { ref, onMounted, computed, watch } from 'vue'

// Segédfüggvény dátumokhoz (ÉÉÉÉ-HH-NN)
const formatDateISO = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const addDaysISO = (baseDate, days) => {
  const dt = new Date(baseDate)
  dt.setDate(dt.getDate() + days)
  return formatDateISO(dt)
}

const todayISO = formatDateISO(new Date())
const tomorrowISO = addDaysISO(new Date(), 1)
const inThreeDaysISO = addDaysISO(new Date(), 3)

// Állapotok
const currentUser = ref(null)
const showAuthModal = ref(false)
const authMode = ref('login') // 'login' vagy 'register'

// Űrlap adatok (Auth)
const loginForm = ref({ email: '', jelszo: '' })
const registerForm = ref({ nev: '', email: '', jelszo: '' })
const authError = ref('')
const authSuccess = ref('')
const authLoading = ref(false)

// Panzió adatok
const szobak = ref([])
const felszerelesek = ref([])
const loadingData = ref(true)
const bookingNotice = ref('')

// Dátum szerinti szobakereső
const searchDates = ref({
  erkezes: tomorrowISO,
  tavozas: inThreeDaysISO
})
const dateSearchError = ref('')
const dateFilterActive = ref(false)

// Napi menü szekció
const selectedMenuDate = ref(todayISO)
const dailyMenu = ref(null)
const loadingDailyMenu = ref(false)

// Foglalási modal és étkezés-választó (max 5 adag / kategória / nap)
const showBookingModal = ref(false)
const selectedRoom = ref(null)
const bookingForm = ref({
  erkezes_datum: tomorrowISO,
  tavozas_datum: inThreeDaysISO,
  vendegek_szama: 1
})
const bookingDailyMenus = ref([])
const loadingBookingMenus = ref(false)
// Kulcs: `${datum}|${etel_id}` -> darabszám (0..5)
const mealQuantities = ref({})
const bookingError = ref('')
const bookingSuccess = ref('')
const bookingSubmitting = ref(false)

// Felhasználó foglalásai
const bookings = ref([])
const loadingBookings = ref(false)

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
  await Promise.all([
    loadRoomsAndAmenities(),
    loadDailyMenu(selectedMenuDate.value)
  ])
  if (currentUser.value) {
    await loadBookings()
  }
})

// Szobák (+ felszerelések) és opcionálisan dátum szerinti szabad helyek lekérdezése
const loadRoomsAndAmenities = async (withDates = false) => {
  loadingData.value = true
  dateSearchError.value = ''
  try {
    let szobaUrl = `${API_URL}/szobak`
    if (withDates && searchDates.value.erkezes && searchDates.value.tavozas) {
      if (searchDates.value.erkezes >= searchDates.value.tavozas) {
        dateSearchError.value = 'A távozás dátumának későbbre kell esnie az érkezés dátumánál!'
        loadingData.value = false
        return
      }
      const params = new URLSearchParams({
        erkezes: searchDates.value.erkezes,
        tavozas: searchDates.value.tavozas
      })
      szobaUrl = `${API_URL}/szobak?${params.toString()}`
      dateFilterActive.value = true
    } else {
      dateFilterActive.value = false
    }

    const [szobaRes, felszRes] = await Promise.all([
      fetch(szobaUrl),
      fetch(`${API_URL}/felszerelesek`)
    ])

    if (szobaRes.ok) {
      szobak.value = await szobaRes.json()
    } else {
      const errData = await szobaRes.json().catch(() => ({}))
      dateSearchError.value = errData.message || 'Nem sikerült lekérni a szobákat.'
    }
    if (felszRes.ok) {
      felszerelesek.value = await felszRes.json()
    }
  } catch (err) {
    console.warn('Backend még nem elérhető vagy hiba:', err)
  } finally {
    loadingData.value = false
  }
}

// Napi menü lekérdezése egy adott napra
const loadDailyMenu = async (datum) => {
  loadingDailyMenu.value = true
  try {
    const res = await fetch(`${API_URL}/napi-menu?datum=${encodeURIComponent(datum)}`)
    if (res.ok) {
      dailyMenu.value = await res.json()
    }
  } catch (err) {
    console.warn('Napi menü lekérdezési hiba:', err)
  } finally {
    loadingDailyMenu.value = false
  }
}

// Foglalások lekérdezése (admin mindent lát, vendég a sajátjait)
const loadBookings = async () => {
  if (!currentUser.value) {
    bookings.value = []
    return
  }
  loadingBookings.value = true
  try {
    const url = currentUser.value.szerepkor === 'admin'
      ? `${API_URL}/foglalasok`
      : `${API_URL}/foglalasok?felhasznalo_id=${currentUser.value.id}`
    const res = await fetch(url)
    if (res.ok) {
      bookings.value = await res.json()
    }
  } catch (err) {
    console.warn('Foglalások lekérdezési hiba:', err)
  } finally {
    loadingBookings.value = false
  }
}

// Napi menük betöltése a foglalási modal dátumtartományához
const loadBookingMenus = async () => {
  const { erkezes_datum, tavozas_datum } = bookingForm.value
  if (!erkezes_datum || !tavozas_datum || erkezes_datum >= tavozas_datum) {
    bookingDailyMenus.value = []
    return
  }

  loadingBookingMenus.value = true
  try {
    const params = new URLSearchParams({
      erkezes: erkezes_datum,
      tavozas: tavozas_datum
    })
    const res = await fetch(`${API_URL}/napi-menu?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      bookingDailyMenus.value = data.napok || []
    }
  } catch (err) {
    console.warn('Foglalási menük betöltési hiba:', err)
  } finally {
    loadingBookingMenus.value = false
  }
}

watch(
  () => [bookingForm.value.erkezes_datum, bookingForm.value.tavozas_datum],
  () => {
    if (showBookingModal.value) {
      mealQuantities.value = {}
      loadBookingMenus()
    }
  }
)

// Adag lekérdezése egy adott nap + étel pároshoz
const getMealQty = (datum, etelId) => {
  return mealQuantities.value[`${datum}|${etelId}`] || 0
}

// Egy nap adott kategóriájának összesített adagszáma (ebédnél A + B együtt!)
const getCategoryTotalForDay = (dayMenu, kategoria) => {
  if (kategoria === 'reggeli' && dayMenu.reggeli) {
    return getMealQty(dayMenu.datum, dayMenu.reggeli.id)
  }
  if (kategoria === 'vacsora' && dayMenu.vacsora) {
    return getMealQty(dayMenu.datum, dayMenu.vacsora.id)
  }
  if (kategoria === 'ebed') {
    return (dayMenu.ebed || []).reduce((sum, item) => sum + getMealQty(dayMenu.datum, item.id), 0)
  }
  return 0
}

const changeMealQty = (dayMenu, etel, delta) => {
  const key = `${dayMenu.datum}|${etel.id}`
  const current = mealQuantities.value[key] || 0
  const next = current + delta
  if (next < 0) return

  if (delta > 0) {
    const categoryTotal = getCategoryTotalForDay(dayMenu, etel.kategoria)
    if (categoryTotal + delta > 5) return
  }

  if (next === 0) {
    delete mealQuantities.value[key]
  } else {
    mealQuantities.value[key] = next
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
    await loadBookings()

    setTimeout(() => {
      showAuthModal.value = false
      authSuccess.value = ''
      loginForm.value = { email: '', jelszo: '' }
    }, 1000)
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

    currentUser.value = data.user
    localStorage.setItem('petofi_user', JSON.stringify(data.user))
    authSuccess.value = `Sikeres regisztráció! Üdvözlünk vendégünkként, ${data.user.nev}!`
    await loadBookings()

    setTimeout(() => {
      showAuthModal.value = false
      authSuccess.value = ''
      registerForm.value = { nev: '', email: '', jelszo: '' }
    }, 1200)
  } catch (err) {
    authError.value = err.message
  } finally {
    authLoading.value = false
  }
}

// Kijelentkezés
const handleLogout = () => {
  currentUser.value = null
  bookings.value = []
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

// Szobafoglalás gomb klikk -> dátum + étkezés választó modal megnyitása
const onBookRoom = async (szoba) => {
  if (!currentUser.value) {
    authMode.value = 'login'
    showAuthModal.value = true
    authError.value = 'A foglaláshoz kérjük, először jelentkezz be!'
    return
  }

  selectedRoom.value = szoba
  bookingError.value = ''
  bookingSuccess.value = ''
  mealQuantities.value = {}
  bookingForm.value = {
    erkezes_datum: searchDates.value.erkezes || tomorrowISO,
    tavozas_datum: searchDates.value.tavozas || inThreeDaysISO,
    vendegek_szama: Math.min(2, szoba.ferohely)
  }
  showBookingModal.value = true
  await loadBookingMenus()
}

// Foglalás elküldése (szoba + pontos dátumok + napi étkezések)
const submitBooking = async () => {
  if (!currentUser.value || !selectedRoom.value) return
  bookingError.value = ''
  bookingSuccess.value = ''

  if (bookingForm.value.erkezes_datum >= bookingForm.value.tavozas_datum) {
    bookingError.value = 'A távozás dátumának későbbre kell esnie az érkezés dátumánál!'
    return
  }

  const etkezesek = Object.entries(mealQuantities.value)
    .filter(([, adag]) => adag > 0)
    .map(([key, adag]) => {
      const [datum, etelId] = key.split('|')
      return {
        datum,
        etel_id: Number(etelId),
        adag
      }
    })

  bookingSubmitting.value = true
  try {
    const res = await fetch(`${API_URL}/foglalasok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        felhasznalo_id: currentUser.value.id,
        szoba_id: selectedRoom.value.id,
        erkezes_datum: bookingForm.value.erkezes_datum,
        tavozas_datum: bookingForm.value.tavozas_datum,
        vendegek_szama: Number(bookingForm.value.vendegek_szama),
        etkezesek
      })
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Nem sikerült rögzíteni a foglalást!')
    }

    bookingSuccess.value = `Sikeres foglalás a(z) ${selectedRoom.value.szobaszam}. szobára (${bookingForm.value.erkezes_datum} – ${bookingForm.value.tavozas_datum})!`
    bookingNotice.value = bookingSuccess.value
    setTimeout(() => { bookingNotice.value = '' }, 5000)

    await Promise.all([
      loadBookings(),
      loadRoomsAndAmenities(dateFilterActive.value)
    ])

    setTimeout(() => {
      showBookingModal.value = false
      bookingSuccess.value = ''
    }, 1100)
  } catch (err) {
    bookingError.value = err.message
  } finally {
    bookingSubmitting.value = false
  }
}

// Foglalás lemondása
const cancelBooking = async (bookingId) => {
  try {
    const res = await fetch(`${API_URL}/foglalasok/${bookingId}/statusz`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusz: 'lemondva' })
    })
    if (res.ok) {
      await Promise.all([
        loadBookings(),
        loadRoomsAndAmenities(dateFilterActive.value)
      ])
    }
  } catch (err) {
    console.warn('Lemondási hiba:', err)
  }
}

const bookingStatusLabel = (statusz) => {
  switch (statusz) {
    case 'megerositve': return 'Megerősítve'
    case 'lemondva': return 'Lemondva'
    default: return 'Függőben'
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
          <a href="#etlap">Napi Menü</a>
          <a v-if="currentUser" href="#foglalasaim">Foglalásaim</a>
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
          Családias környezet, felszerelt szobák pontos dátumra foglalhatóan és gondosan készített házias napi menük.
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
              <strong>Felszerelt szobák</strong>
              <span>Wi-Fi, klíma, erkély, pontos dátumválasztás</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🍲</span>
            <div>
              <strong>Napi menü opciókkal</strong>
              <span>Fix reggeli és vacsora, A/B ebéd (max. 5 adag)</span>
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
        <h2>Válaszd ki a szobát pontos dátumra</h2>
        <p>Add meg az érkezés és távozás napját a szabad szobák és felszereléseik ellenőrzéséhez.</p>
      </div>

      <!-- Dátumra pontos szobakereső -->
      <div class="date-filter-bar">
        <div class="date-field">
          <label for="search-erkezes">Érkezés dátuma</label>
          <input id="search-erkezes" v-model="searchDates.erkezes" type="date" :min="todayISO" />
        </div>
        <div class="date-field">
          <label for="search-tavozas">Távozás dátuma</label>
          <input id="search-tavozas" v-model="searchDates.tavozas" type="date" :min="searchDates.erkezes || todayISO" />
        </div>
        <div class="date-actions">
          <button @click="loadRoomsAndAmenities(true)" class="btn btn-primary">
            Elérhetőség ellenőrzése
          </button>
          <button v-if="dateFilterActive" @click="loadRoomsAndAmenities(false)" class="btn btn-outline">
            Szűrő törlése
          </button>
        </div>
      </div>

      <div v-if="dateSearchError" class="alert alert-error">{{ dateSearchError }}</div>

      <div v-if="loadingData" class="loading-box">
        Szobák betöltése az adatbázisból...
      </div>

      <div v-else class="rooms-grid">
        <div v-for="szoba in szobak" :key="szoba.id" class="room-card">
          <div class="room-card-header">
            <span class="room-number">{{ szoba.szobaszam }}. szoba</span>
            <span
              v-if="dateFilterActive"
              class="room-status"
              :class="szoba.szabad_a_datumra ? 'status-free' : 'status-busy'"
            >
              {{ szoba.szabad_a_datumra ? 'Szabad a választott dátumra' : 'Foglalt ebben az időszakban' }}
            </span>
            <span
              v-else
              class="room-status"
              :class="szoba.allapot === 'szabad' ? 'status-free' : 'status-busy'"
            >
              {{ szoba.allapot === 'szabad' ? 'Szabad' : szoba.allapot }}
            </span>
          </div>

          <div class="room-card-body">
            <h3>{{ szoba.leiras }}</h3>

            <!-- Felszerelések címkék -->
            <div v-if="szoba.felszerelesek && szoba.felszerelesek.length" class="amenities-list">
              <span v-for="felsz in szoba.felszerelesek" :key="felsz.id" class="amenity-chip">
                ✓ {{ felsz.nev }}
              </span>
            </div>

            <div class="room-meta">
              <span>👥 {{ szoba.ferohely }} fős kapacitás</span>
              <span class="room-price">{{ Number(szoba.ar_per_ej).toLocaleString('hu-HU') }} Ft <small>/ éj</small></span>
            </div>
          </div>

          <div class="room-card-footer">
            <button
              @click="onBookRoom(szoba)"
              class="btn btn-primary w-full"
              :disabled="dateFilterActive && !szoba.szabad_a_datumra"
            >
              <template v-if="dateFilterActive && !szoba.szabad_a_datumra">
                Nem elérhető ezen a dátumon
              </template>
              <template v-else>
                {{ currentUser ? 'Szoba foglalása & étkezés választása' : 'Bejelentkezés foglaláshoz' }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Napi Étlap és Ellátás szekció -->
    <section id="etlap" class="section-container bg-warm">
      <div class="section-header">
        <span class="sub-title">Gasztronómia</span>
        <h2>Napi Menü & Étkezési Opciók</h2>
        <p>
          A reggeli és a vacsora aznap mindenkinek fix, az ebédhez <strong>2 opció (A / B)</strong> közül választhatsz.
          Foglaláskor kategóriánként naponta legfeljebb <strong>5 adag</strong> kérhető.
        </p>
      </div>

      <div class="menu-date-bar">
        <label for="menu-date-picker"><strong>Válassz napot:</strong></label>
        <input
          id="menu-date-picker"
          v-model="selectedMenuDate"
          type="date"
          @change="loadDailyMenu(selectedMenuDate)"
        />
      </div>

      <div v-if="loadingDailyMenu" class="loading-box">Napi menü betöltése...</div>

      <div v-else-if="dailyMenu" class="menu-grid">
        <!-- Fix reggeli -->
        <div v-if="dailyMenu.reggeli" class="menu-card">
          <div class="menu-tag-row">
            <span class="menu-category-tag">Reggeli</span>
            <span class="menu-option-badge option-fix">Fix napi menü · max. 5 adag</span>
          </div>
          <div class="menu-content">
            <h4>{{ dailyMenu.reggeli.nev }}</h4>
            <p>{{ dailyMenu.reggeli.leiras }}</p>
          </div>
          <div class="menu-price">
            {{ Number(dailyMenu.reggeli.ar).toLocaleString('hu-HU') }} Ft / adag
          </div>
        </div>

        <!-- Ebéd A és B opciók -->
        <div v-for="ebed in dailyMenu.ebed" :key="ebed.id" class="menu-card">
          <div class="menu-tag-row">
            <span class="menu-category-tag">Ebéd</span>
            <span class="menu-option-badge option-choice">{{ ebed.opcio }} opció · A+B max. 5 adag</span>
          </div>
          <div class="menu-content">
            <h4>{{ ebed.nev }}</h4>
            <p>{{ ebed.leiras }}</p>
          </div>
          <div class="menu-price">
            {{ Number(ebed.ar).toLocaleString('hu-HU') }} Ft / adag
          </div>
        </div>

        <!-- Fix vacsora -->
        <div v-if="dailyMenu.vacsora" class="menu-card">
          <div class="menu-tag-row">
            <span class="menu-category-tag">Vacsora</span>
            <span class="menu-option-badge option-fix">Fix napi menü · max. 5 adag</span>
          </div>
          <div class="menu-content">
            <h4>{{ dailyMenu.vacsora.nev }}</h4>
            <p>{{ dailyMenu.vacsora.leiras }}</p>
          </div>
          <div class="menu-price">
            {{ Number(dailyMenu.vacsora.ar).toLocaleString('hu-HU') }} Ft / adag
          </div>
        </div>
      </div>
    </section>

    <!-- Saját / Összes Foglalás szekció -->
    <section v-if="currentUser" id="foglalasaim" class="section-container">
      <div class="section-header">
        <span class="sub-title">{{ currentUser.szerepkor === 'admin' ? 'Admin áttekintés' : 'Saját fiók' }}</span>
        <h2>{{ currentUser.szerepkor === 'admin' ? 'Beérkezett foglalások' : 'Foglalásaim' }}</h2>
        <p>Itt látod a rögzített szobafoglalásokat és a hozzájuk rendelt napi étkezéseket.</p>
      </div>

      <div v-if="loadingBookings" class="loading-box">Foglalások betöltése...</div>

      <div v-else-if="bookings.length === 0" class="empty-bookings">
        Még nincs rögzített foglalás. Válassz fentről egy szobát és dátumot!
      </div>

      <div v-else class="bookings-list">
        <div v-for="b in bookings" :key="b.id" class="booking-card">
          <div class="booking-card-top">
            <div>
              <h3>
                {{ b.szoba?.szobaszam }}. szoba
                <small v-if="currentUser.szerepkor === 'admin' && b.felhasznalo">
                  ({{ b.felhasznalo.nev }})
                </small>
              </h3>
              <p class="booking-dates">
                📅 {{ b.erkezes_datum }} → {{ b.tavozas_datum }} · 👥 {{ b.vendegek_szama }} fő
              </p>
            </div>
            <div class="booking-top-actions">
              <span class="room-status" :class="b.statusz === 'lemondva' ? 'status-busy' : 'status-free'">
                {{ bookingStatusLabel(b.statusz) }}
              </span>
              <button
                v-if="b.statusz !== 'lemondva'"
                @click="cancelBooking(b.id)"
                class="btn btn-outline btn-sm"
              >
                Lemondás
              </button>
            </div>
          </div>

          <div v-if="b.etkezesiRendelesek && b.etkezesiRendelesek.length" class="booking-meals">
            <strong>Rendelt étkezések:</strong>
            <ul>
              <li v-for="m in b.etkezesiRendelesek" :key="m.id">
                <span class="meal-date">{{ m.datum }}</span> —
                <strong>{{ m.adag }}×</strong>
                {{ m.etel?.nev }}
                <span class="meal-meta">({{ m.etel?.kategoria }}, {{ m.etel?.opcio }})</span>
              </li>
            </ul>
          </div>
          <div v-else class="booking-meals muted">
            Ehhez a foglaláshoz nincs rendelt étkezés.
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

    <!-- Szobafoglalás + Étkezés Választó Modal -->
    <div v-if="showBookingModal && selectedRoom" class="modal-overlay" @click.self="showBookingModal = false">
      <div class="modal-card modal-card-wide">
        <button class="modal-close" @click="showBookingModal = false">×</button>

        <h3 class="booking-modal-title">
          {{ selectedRoom.szobaszam }}. szoba foglalása
        </h3>
        <p class="auth-helper">
          {{ selectedRoom.leiras }} (max. {{ selectedRoom.ferohely }} fő · {{ Number(selectedRoom.ar_per_ej).toLocaleString('hu-HU') }} Ft / éj)
        </p>

        <div v-if="bookingError" class="alert alert-error">{{ bookingError }}</div>
        <div v-if="bookingSuccess" class="alert alert-success">{{ bookingSuccess }}</div>

        <form @submit.prevent="submitBooking">
          <div class="booking-form-row">
            <div class="form-group">
              <label>Érkezés napja</label>
              <input v-model="bookingForm.erkezes_datum" type="date" :min="todayISO" required />
            </div>
            <div class="form-group">
              <label>Távozás napja</label>
              <input v-model="bookingForm.tavozas_datum" type="date" :min="bookingForm.erkezes_datum || todayISO" required />
            </div>
            <div class="form-group">
              <label>Vendégek száma (1–{{ selectedRoom.ferohely }})</label>
              <input
                v-model.number="bookingForm.vendegek_szama"
                type="number"
                min="1"
                :max="selectedRoom.ferohely"
                required
              />
            </div>
          </div>

          <div class="meal-picker-section">
            <h4>🍽️ Opcionális napi étkezések kiválasztása</h4>
            <p class="auth-helper">
              Reggeli és vacsora: fix napi menü (max. 5 adag/nap). Ebéd: A vagy B opció választható (A + B együtt max. 5 adag/nap).
            </p>

            <div v-if="loadingBookingMenus" class="loading-box">Napi menük betöltése...</div>

            <div v-else class="meal-days-list">
              <div v-for="day in bookingDailyMenus" :key="day.datum" class="meal-day-box">
                <div class="meal-day-header">📅 {{ day.datum }}</div>

                <!-- Fix reggeli -->
                <div v-if="day.reggeli" class="meal-row">
                  <div class="meal-info">
                    <span class="meal-pill">Reggeli (Fix)</span>
                    <strong>{{ day.reggeli.nev }}</strong>
                    <small>{{ getCategoryTotalForDay(day, 'reggeli') }}/5 adag</small>
                  </div>
                  <div class="stepper">
                    <button type="button" @click="changeMealQty(day, day.reggeli, -1)" :disabled="getMealQty(day.datum, day.reggeli.id) <= 0">−</button>
                    <span>{{ getMealQty(day.datum, day.reggeli.id) }}</span>
                    <button type="button" @click="changeMealQty(day, day.reggeli, 1)" :disabled="getCategoryTotalForDay(day, 'reggeli') >= 5">+</button>
                  </div>
                </div>

                <!-- Ebéd A és B opció -->
                <div v-for="ebed in day.ebed" :key="ebed.id" class="meal-row">
                  <div class="meal-info">
                    <span class="meal-pill meal-pill-lunch">Ebéd ({{ ebed.opcio }} opció)</span>
                    <strong>{{ ebed.nev }}</strong>
                    <small>Ebéd összesen: {{ getCategoryTotalForDay(day, 'ebed') }}/5 adag</small>
                  </div>
                  <div class="stepper">
                    <button type="button" @click="changeMealQty(day, ebed, -1)" :disabled="getMealQty(day.datum, ebed.id) <= 0">−</button>
                    <span>{{ getMealQty(day.datum, ebed.id) }}</span>
                    <button type="button" @click="changeMealQty(day, ebed, 1)" :disabled="getCategoryTotalForDay(day, 'ebed') >= 5">+</button>
                  </div>
                </div>

                <!-- Fix vacsora -->
                <div v-if="day.vacsora" class="meal-row">
                  <div class="meal-info">
                    <span class="meal-pill meal-pill-dinner">Vacsora (Fix)</span>
                    <strong>{{ day.vacsora.nev }}</strong>
                    <small>{{ getCategoryTotalForDay(day, 'vacsora') }}/5 adag</small>
                  </div>
                  <div class="stepper">
                    <button type="button" @click="changeMealQty(day, day.vacsora, -1)" :disabled="getMealQty(day.datum, day.vacsora.id) <= 0">−</button>
                    <span>{{ getMealQty(day.datum, day.vacsora.id) }}</span>
                    <button type="button" @click="changeMealQty(day, day.vacsora, 1)" :disabled="getCategoryTotalForDay(day, 'vacsora') >= 5">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="bookingSubmitting">
            {{ bookingSubmitting ? 'Foglalás mentése...' : 'Foglalás véglegesítése' }}
          </button>
        </form>
      </div>
    </div>

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
            <input v-model="registerForm.jelszo" type="password" placeholder="Legalább 4 karakter" required minlength="4" />
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

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background-color: var(--primary);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
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
  max-width: 680px;
  margin: 0 auto 2.5rem;
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

/* Dátumszűrő sáv */
.date-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.date-field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.date-field input,
.menu-date-bar input {
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.95rem;
}

.date-actions {
  display: flex;
  gap: 0.6rem;
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
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.room-number {
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.room-status {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-free { background: #dcfce7; color: #15803d; }
.status-busy { background: #fee2e2; color: #b91c1c; }

.room-card-body h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

/* Felszerelések */
.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.2rem;
}

.amenity-chip {
  font-size: 0.78rem;
  background: #f5efe6;
  color: #5c4938;
  border: 1px solid #e5d8c7;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-weight: 500;
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
.menu-date-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.menu-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.menu-category-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-light);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.menu-option-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.option-fix {
  background: #f3f4f6;
  color: #374151;
}

.option-choice {
  background: #dbeafe;
  color: #1e40af;
}

.menu-content h4 {
  font-size: 1.12rem;
  margin-bottom: 0.5rem;
}

.menu-content p {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1rem;
}

.menu-price {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--primary);
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
}

/* Foglalások lista */
.empty-bookings,
.loading-box {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.bookings-list {
  display: grid;
  gap: 1.25rem;
}

.booking-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.booking-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.booking-dates {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin-top: 0.25rem;
}

.booking-top-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.booking-meals {
  border-top: 1px solid var(--border-color);
  padding-top: 0.9rem;
  font-size: 0.9rem;
}

.booking-meals.muted {
  color: var(--text-muted);
}

.booking-meals ul {
  margin: 0.5rem 0 0 1.2rem;
  display: grid;
  gap: 0.3rem;
}

.meal-date {
  font-weight: 600;
}

.meal-meta {
  color: var(--text-muted);
  font-size: 0.82rem;
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
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  padding: 2.2rem;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.modal-card-wide {
  max-width: 680px;
}

.booking-modal-title {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.booking-form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
}

.meal-picker-section {
  margin: 0.75rem 0 1.5rem;
}

.meal-picker-section h4 {
  margin-bottom: 0.3rem;
}

.meal-days-list {
  display: grid;
  gap: 1rem;
}

.meal-day-box {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: #faf8f5;
}

.meal-day-header {
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-color);
}

.meal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e7dfd5;
}

.meal-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.meal-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.88rem;
}

.meal-info small {
  color: var(--text-muted);
  font-size: 0.76rem;
}

.meal-pill {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
}

.meal-pill-lunch {
  background: #dbeafe;
  color: #1e40af;
}

.meal-pill-dinner {
  background: #ede9fe;
  color: #5b21b6;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.stepper button {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper span {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 700;
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
