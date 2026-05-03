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

let categories = [];
let currentExchangeRate = 3.8; // Valor de respaldo por defecto

// Estado Global
let cart = [];
try {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.error("Error cargando el carrito guardado", e);
}

// Elementos del DOM
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const cartTotalSum = document.getElementById('cartTotalSum');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalBody = document.getElementById('modalBody');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Auth & User Menu
const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
const profileBtn = document.getElementById('profileBtn');
const userDropdown = document.getElementById('userDropdown');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const logoutBtn = document.getElementById('logoutBtn');

// History Modal
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyBody = document.getElementById('historyBody');

const btnAdminStock = document.getElementById('btnAdminStock');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminForm = document.getElementById('adminForm');

// Inicialización
async function init() {
    // 1. Obtener tipo de cambio oficial
    try {
        const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await rateRes.json();
        if (rateData && rateData.rates && rateData.rates.PEN) {
            currentExchangeRate = rateData.rates.PEN;
        }
    } catch (e) {
        console.warn("No se pudo obtener el tipo de cambio online. Usando 3.8 como respaldo.");
    }

    // 2. Obtener lista de productos
    try {
        const prodRes = await fetch('data/productos.json');
        categories = await prodRes.json();
    } catch(e) {
        console.error("Error al cargar data/productos.json: ", e);
    }

    renderProducts(categories);
    updateCartUI();
    setupEventListeners();
}

onAuthStateChanged(auth, (user) => {
    if (!loginBtn || !userMenu) return;
    if (user) {
        // Logueado exitosamente
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
        // Sesión cerrada
        loginBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
        if (userDropdown) userDropdown.classList.remove('show');
        if (profileBtn) {
            profileBtn.innerHTML = `<i class="fa-solid fa-user-circle"></i> <span class="hide-mobile">Mi Perfil</span> <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; margin-left: 0.3rem;"></i>`;
        }
    }
});

// Eliminada función checkAuthUI porque onAuthStateChanged de Firebase la reemplaza

function openHistory() {
    if (userDropdown) userDropdown.classList.remove('show');
    if (historyModal) historyModal.classList.add('show');
    if (!historyBody) return;
    
    historyBody.innerHTML = '';
    
    let orders = [];
    try {
        const stored = localStorage.getItem('purchaseHistory');
        if (stored) orders = JSON.parse(stored);
    } catch (e) { console.error(e); }
    
    if (orders.length === 0) {
        historyBody.innerHTML = `
            <div class="empty-history">
                <i class="fa-solid fa-box-open"></i>
                <p>Aún no tiene adquisiciones registradas.</p>
            </div>
        `;
        return;
    }
    
    // Invertir para mostrar lo más reciente primero
    orders.reverse().forEach(order => {
        let itemsHtml = order.items.map(i => `<div>- ${i.name} (${i.priceDisplay || i.pricePEN + ' PEN'})</div>`).join('');
        historyBody.innerHTML += `
            <div class="history-card">
                <div class="history-card-header">
                    <span><i class="fa-regular fa-calendar"></i> ${order.date}</span>
                    <span>Total: ${order.total}</span>
                </div>
                <div class="history-card-items">
                    ${itemsHtml}
                </div>
            </div>
        `;
    });
}

// Renderizar tarjetas de productos
function renderProducts(list) {
    productGrid.innerHTML = '';

    if (list.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#94a3b8;">No se encontraron productos.</p>';
        return;
    }

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <h3>${item.name}</h3>
        `;
        // Al hacer click, abrir el modal con la info correspondiente
        card.addEventListener('click', () => openModal(item));
        productGrid.appendChild(card);
    });
}

// Funcionalidad de Búsqueda
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.toLowerCase().trim();
    
    if (term === '') {
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        renderProducts(categories);
        return;
    } else {
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
    }

    const filtered = categories.filter(c => {
        if (c.name.toLowerCase().includes(term)) return true;
        if (c.subitems) {
            return c.subitems.some(sub => sub.title.toLowerCase().includes(term));
        }
        return false;
    });
    
    renderProducts(filtered);

    // Auto-abrir modal si hay exactamente 1 coincidencia y el usuario ya dejó de escribir
    if (filtered.length === 1 && term.length >= 3) {
        searchTimeout = setTimeout(() => {
            openModal(filtered[0]);
        }, 800);
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        const term = e.target.value.toLowerCase().trim();
        const filtered = categories.filter(c => {
            if (c.name.toLowerCase().includes(term)) return true;
            if (c.subitems) return c.subitems.some(sub => sub.title.toLowerCase().includes(term));
            return false;
        });
        if (filtered.length >= 1) {
            openModal(filtered[0]);
            searchInput.blur(); // Quitar foco del teclado en celulares
        }
    }
});

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        renderProducts(categories);
        searchInput.focus();
    });
}

// Modales (Vistas de productos)
function openModal(item) {
    modalBody.innerHTML = ''; // Limpiar previo

    if (item.type !== 'bundle') {
        const renderStreamingOption = (optionName, optionData) => {
            if (!optionData) return '';
            // El PEN es fijo, el USD se calcula dinámicamente según la fluctuación
            const pPEN = optionData.pricePEN || (optionData.price * 3.8); // Respaldo si no hay pricePEN
            const calculatedUSD = Math.ceil((pPEN / currentExchangeRate) * 10) / 10;
            const displayStr = `${pPEN.toFixed(2)} PEN / $${calculatedUSD.toFixed(2)} USD`;
            const desc = optionData.desc || item.desc || '';
            const inst = optionData.instructions || item.instructions || '';
            return `
                <div class="${item.price !== undefined ? 'modal-option modal-single' : 'modal-option'}">
                    ${optionName ? `<h3>${optionName}</h3>` : ''}
                    ${desc ? `<p class="modal-option-desc" ${item.price !== undefined ? 'style="text-align:center;"' : ''}>${desc}</p>` : ''}
                    ${inst ? `<div class="modal-instructions">
                        <strong>Indicaciones de uso:</strong><br> ${inst}
                    </div>` : ''}
                    <div class="modal-price-row">
                        <span class="modal-price" ${item.price !== undefined ? '' : 'style="font-size: 1.1rem;"'}>${displayStr}</span>
                        <button class="btn-add" onclick="addToCart('${item.name}${optionName ? ' - ' + optionName : ''}', ${calculatedUSD}, ${pPEN})">Agregar al carrito</button>
                    </div>
                </div>
            `;
        };

        let optionsHtml = '';
        if (item.price !== undefined) {
            optionsHtml += renderStreamingOption('', item);
        } else {
            if (item.profile) optionsHtml += renderStreamingOption('Perfil', item.profile);
            if (item.profileA) optionsHtml += renderStreamingOption('Perfil A', item.profileA);
            if (item.profileB) optionsHtml += renderStreamingOption('Perfil B', item.profileB);
            if (item.full) optionsHtml += renderStreamingOption('Cuenta Completa', item.full);
        }

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${item.name}</h2>
                ${item.title ? `<h3>${item.title}</h3>` : ''}
                ${item.subtext ? `<p>${item.subtext}</p>` : ''}
            </div>
            <div class="${item.price !== undefined ? '' : 'modal-split'}">
                ${optionsHtml}
            </div>
        `;
    } else if (item.type === 'bundle') {
        let itemsHtml = '';

        item.subitems.forEach((sub, index) => {
            let optionsHtml = '';

            if (sub.options) {
                sub.options.forEach((opt, optIndex) => {
                    const pPEN = opt.pricePEN || (opt.priceUSD * 3.8) || 0;
                    const calculatedUSD = Math.ceil((pPEN / currentExchangeRate) * 10) / 10;
                    optionsHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 0.8rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; border: 1px solid var(--border-color);">
                            <div>
                                <h4 style="margin-bottom: 0.2rem; font-size: 0.95rem;">${opt.name}</h4>
                                <span style="font-size: 0.85rem; color: var(--primary); font-weight: bold;">${pPEN.toFixed(2)} PEN / $${calculatedUSD.toFixed(2)} USD</span>
                            </div>
                            <button class="btn-add" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="addToCart('${item.name} - ${sub.title} (${opt.name})', ${calculatedUSD}, ${pPEN})">Agregar al carrito</button>
                        </div>
                    `;
                });
            }

            itemsHtml += `
                <div class="modal-option" style="margin-bottom: 1.5rem; display: block; width: 100%;">
                    <h3 style="text-align: left; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff;">${sub.title}</h3>
                    <div>${optionsHtml}</div>
                </div>
            `;
        });

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${item.name}</h2>
                ${item.desc ? `<p>${item.desc}</p>` : ''}
            </div>
            <div style="max-height: 55vh; overflow-y: auto; padding-right: 0.5rem;">
                ${itemsHtml}
            </div>
        `;
    }

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Lógica del Carrito
window.addToCart = function (name, priceUSD, pricePEN) {
    // Ya recibimos el pricePEN base y el priceUSD dinámico desde openModal
    const finalPEN = pricePEN || (priceUSD * currentExchangeRate); 
    const finalUSD = priceUSD || (Math.ceil((pricePEN / currentExchangeRate) * 10) / 10);

    cart.push({ id: Date.now() + Math.random(), name, priceUSD: finalUSD, pricePEN: finalPEN });
    updateCartUI();
    closeModal();

    // Alerta visual discreta y apertura del carrito
    cartSidebar.classList.add('open');
}

// Función global para remover desde el HTML inyectado
window.removeFromCart = function (id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    cartItemsContainer.innerHTML = '';

    let totalUSD = 0;
    let totalPEN = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-msg">
                <i class="fa-solid fa-cart-arrow-down"></i>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
    }
    else {
        cart.forEach(item => {
            totalUSD += item.priceUSD;
            totalPEN += item.pricePEN;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${item.pricePEN.toFixed(2)} PEN / $${item.priceUSD.toFixed(2)} USD</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})" title="Eliminar producto">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    cartTotalSum.innerText = `${totalPEN.toFixed(2)} PEN / $${totalUSD.toFixed(2)} USD`;
    
    // Guardar en localStorage siempre que el carrito se actualice
    localStorage.setItem('cartItems', JSON.stringify(cart));
    localStorage.setItem('cartTotal', cartTotalSum.innerText);
}

// Configurar Eventos (Listeners)
function setupEventListeners() {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });

    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    closeModalBtn.addEventListener('click', closeModal);

    // Cerrar modal al hacer clic en el fondo oscuro overlay
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    // Lógica del modal de moneda
    const currencyModal = document.getElementById('currencyModal');
    const closeCurrencyModal = document.getElementById('closeCurrencyModal');
    const btnPayPEN = document.getElementById('btnPayPEN');
    const btnPayUSD = document.getElementById('btnPayUSD');

    // Acción del botón Checkout (ahora abre modal)
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            currencyModal.classList.add('active');
        } else {
            alert("Agrega productos al carrito primero.");
        }
    });

    // Cerrar modal de moneda
    closeCurrencyModal.addEventListener('click', () => {
        currencyModal.classList.remove('active');
    });

    // Cerrar modal de moneda al hacer clic afuera
    currencyModal.addEventListener('click', (e) => {
        if (e.target === currencyModal) currencyModal.classList.remove('active');
    });

    // Función unificada para proceder al pago
    const proceedToCheckout = (currency) => {
        localStorage.setItem('cartTotal', cartTotalSum.innerText);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        localStorage.setItem('preferredCurrency', currency);
        window.location.href = 'checkout.html';
    };

    // Listeners de los botones de moneda
    btnPayPEN.addEventListener('click', () => proceedToCheckout('PEN'));
    btnPayUSD.addEventListener('click', () => proceedToCheckout('USD'));

    // Lógica Firebase Login
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signInWithPopup(auth, googleProvider)
                .catch(error => console.error("Error signing in", error));
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

        // Cerrar menú usuario al hacer clic afuera
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    if (openHistoryBtn) {
        openHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openHistory();
        });
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            if (historyModal) historyModal.classList.remove('show');
        });
    }

    // Cerrar carrito al hacer clic afuera
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('open')) {
            // Verifica que el clic no sea ni en el sidebar ni en el botón del carrito
            if (!cartSidebar.contains(e.target) && (!cartBtn || !cartBtn.contains(e.target))) {
                cartSidebar.classList.remove('open');
            }
        }
    });

    // Accesibilidad: Cerrar con la tecla "Escape"
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            cartSidebar.classList.remove('open');
            if (adminModal) adminModal.classList.remove('active');
        }
    });
}

// Arrancar App
document.addEventListener('DOMContentLoaded', init);
