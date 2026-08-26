import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDl_8K4A5EkGRXck9t0uCCgB2yMA1qb-Bo",
    authDomain: "pass-digital-3acf5.firebaseapp.com",
    projectId: "pass-digital-3acf5",
    storageBucket: "pass-digital-3acf5.firebasestorage.app",
    messagingSenderId: "113849020971",
    appId: "1:113849020971:web:5b4e93844b7f97c570b06e",
    measurementId: "G-ZXP98N16T4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

window.currentLang = localStorage.getItem('appLang') || 'es';

const themeToggleBtn = document.getElementById('themeToggleBtn');

function applyTheme(theme) {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('appTheme', theme);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.contains('light-mode');
        applyTheme(isLight ? 'dark' : 'light');
    });
}

const translations = {
    es: {
        search_placeholder: 'Buscar productos (ej. Netflix, Office)...',
        clear_search: 'Limpiar búsqueda',
        login_btn: 'Iniciar Sesión',
        profile_btn: 'Mi Perfil',
        history_btn: 'Historial de Compras',
        logout_btn: 'Cerrar Sesión',
        hero_title_part1: 'Tu Pase al Mundo',
        hero_title_part2: 'Digital',
        hero_desc: "Disfruta tus series, películas, música y licencias (IA's, antivirus, noping, windows, etc) sin complicaciones y al mejor precio.",
        card_antivirus: 'Software Antivirus',
        card_windows: 'Licencias Windows',
        card_combos: 'Combos (Antivirus-Windows-Office)',
        card_mayorista: 'Mayorista',
        currency_modal_title: 'Moneda de Pago',
        currency_modal_desc: '¿En qué moneda desea realizar el pago?',
        currency_pen: 'Soles (PEN)',
        currency_usd: 'Dólares (USD/USDT)',
        cart_title: 'Tu Carrito',
        cart_total: 'Total:',
        checkout_btn: 'Finalizar Compra',
        clear_cart_btn: 'Vaciar carrito',
        history_modal_title: 'Historial de Compras',
        theme_tooltip: 'Invertir colores',
        help_tooltip: '¿Necesitas ayuda?',
        footer_email_label: 'Correo:',
        footer_contact_btn: 'Contactar',
        footer_hours_title: '🕐 Horarios',
        footer_day_mf: 'Lunes - Viernes:',
        footer_day_sat: 'Sábado:',
        footer_day_sun: 'Domingo:',
        footer_closed: 'Cerrado',
        footer_hours_note: 'Si no contestamos de manera inmediata, estamos ocupados/estudiando en la universidad. ¡Ténganos paciencia!',
        page_title: 'Pass Digital - Venta de Licencias y Streaming'
    },
    en: {
        search_placeholder: 'Search products (e.g. Netflix, Office)...',
        clear_search: 'Clear search',
        login_btn: 'Sign In',
        profile_btn: 'My Profile',
        history_btn: 'Purchase History',
        logout_btn: 'Sign Out',
        hero_title_part1: 'Your Pass to the',
        hero_title_part2: 'Digital World',
        hero_desc: "Enjoy your shows, movies, music and licenses (AI tools, antivirus, noping, windows, etc) hassle-free and at the best price.",
        card_antivirus: 'Antivirus Software',
        card_windows: 'Windows Licenses',
        card_combos: 'Combos (Antivirus-Windows-Office)',
        card_mayorista: 'Wholesale',
        currency_modal_title: 'Payment Currency',
        currency_modal_desc: 'Which currency would you like to pay with?',
        currency_pen: 'Soles (PEN)',
        currency_usd: 'Dollars (USD/USDT)',
        cart_title: 'Your Cart',
        cart_total: 'Total:',
        checkout_btn: 'Checkout',
        clear_cart_btn: 'Empty cart',
        history_modal_title: 'Purchase History',
        theme_tooltip: 'Invert colors',
        help_tooltip: 'Need help?',
        footer_email_label: 'Email:',
        footer_contact_btn: 'Contact',
        footer_hours_title: '🕐 Hours',
        footer_day_mf: 'Monday - Friday:',
        footer_day_sat: 'Saturday:',
        footer_day_sun: 'Sunday:',
        footer_closed: 'Closed',
        footer_hours_note: "If we don't reply right away, we're busy/studying at university. Thanks for your patience!",
        page_title: 'Pass Digital - License and Streaming Sales'
    }
};

const langToggleBtn = document.getElementById('langToggleBtn');
const langLabel = document.getElementById('langLabel');

function applyLanguage(lang) {
    const dict = translations[lang] || translations.es;
    window.currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    document.title = dict.page_title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
    });

    // El botón muestra el idioma AL QUE SE CAMBIARÁ al pulsarlo
    if (langLabel) langLabel.textContent = lang === 'es' ? 'EN' : 'ES';

    // Refresca los nombres de producto ya renderizados (carrito e historial)
    if (typeof window.updateCartUI === 'function') window.updateCartUI();
}

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        applyLanguage(window.currentLang === 'es' ? 'en' : 'es');
    });
}

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
const profileBtn = document.getElementById('profileBtn');
const userDropdown = document.getElementById('userDropdown');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const logoutBtn = document.getElementById('logoutBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyBody = document.getElementById('historyBody');

onAuthStateChanged(auth, (user) => {
    if (!loginBtn || !userMenu) return;
    if (user) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'inline-block';
        if (profileBtn) {
            const name = user.displayName ? user.displayName.split(' ')[0] : 'Perfil';
            const html = user.photoURL
                ? `<img src="${user.photoURL}" style="width: 24px; height: 24px; border-radius: 50%;"> <span class="hide-mobile">${name}</span> <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; margin-left: 0.3rem;"></i>`
                : `<i class="fa-solid fa-user-circle"></i> <span class="hide-mobile">${name}</span> <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; margin-left: 0.3rem;"></i>`;
            profileBtn.innerHTML = html;
        }
    } else {
        loginBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
        if (userDropdown) userDropdown.classList.remove('show');
    }
});

function openHistory() {
    if (userDropdown) userDropdown.classList.remove('show');
    if (historyModal) historyModal.classList.add('active');
    if (!historyBody) return;
    historyBody.innerHTML = '';
    let orders = [];
    try {
        const stored = localStorage.getItem('purchaseHistory');
        if (stored) orders = JSON.parse(stored);
    } catch (e) { console.error(e); }

    if (orders.length === 0) {
        const emptyMsg = window.currentLang === 'en' ? "You don't have any purchases yet." : 'Aún no tiene adquisiciones registradas.';
        historyBody.innerHTML = `
            <div class="empty-history">
                <i class="fa-solid fa-box-open"></i>
                <p>${emptyMsg}</p>
            </div>
        `;
        return;
    }

    const totalLabel = window.currentLang === 'en' ? 'Total' : 'Total';
    orders.reverse().forEach(order => {
        // Se agrupan los productos del pedido (misma función usada en el
        // checkout/WhatsApp/Telegram) para mostrar cantidad y subtotal por
        // producto en vez de una línea repetida por cada unidad.
        const groupedLines = window.groupOrderItems ? window.groupOrderItems(order.items) : (order.items || []).map(i => ({
            name: i.name, qty: 1, unitPEN: i.pricePEN, unitUSD: i.priceUSD, subtotalPEN: i.pricePEN, subtotalUSD: i.priceUSD
        }));
        let itemsHtml = groupedLines.map(l => {
            const name = window.translateProductName ? window.translateProductName(l.name) : l.name;
            return `<div>- ${name} x${l.qty} (${l.unitPEN.toFixed(2)} PEN / $${l.unitUSD.toFixed(2)} USD c/u) = ${l.subtotalPEN.toFixed(2)} PEN / $${l.subtotalUSD.toFixed(2)} USD</div>`;
        }).join('');
        historyBody.innerHTML += `
            <div class="history-card">
                <div class="history-card-header">
                    <span><i class="fa-regular fa-calendar"></i> ${order.date}</span>
                    <span>${totalLabel}: ${order.total}</span>
                </div>
                <div class="history-card-items">${itemsHtml}</div>
            </div>
        `;
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.product-card');

        if (term === '') {
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            cards.forEach(card => card.style.display = 'flex');
            return;
        }

        if (clearSearchBtn) clearSearchBtn.style.display = 'block';

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            if (title.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        document.querySelectorAll('.product-card').forEach(card => card.style.display = 'flex');
        searchInput.focus();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signInWithPopup(auth, googleProvider).catch(error => console.error("Error signing in", error));
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch(error => console.error("Error signing out", error));
        });
    }

    if (profileBtn && userDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    if (openHistoryBtn) openHistoryBtn.addEventListener('click', (e) => { e.preventDefault(); openHistory(); });
    if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', () => { if (historyModal) historyModal.classList.remove('active'); });

    applyLanguage(window.currentLang);
});