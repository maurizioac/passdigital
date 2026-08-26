window.cart = [];
try {
    const saved = localStorage.getItem('cartItems');
    if (saved) window.cart = JSON.parse(saved);
    if (!Array.isArray(window.cart)) window.cart = [];
} catch (e) {
    console.error('Pass Digital: no se pudo leer el carrito guardado, se reinicia vacío.', e);
    window.cart = [];
}

window.currentLang = window.currentLang || localStorage.getItem('appLang') || 'es';

const SHARED_CART_STRINGS = {
    es: {
        cart_title: 'Tu Carrito',
        cart_total: 'Total:',
        checkout_btn: 'Finalizar Compra',
        clear_cart_btn: 'Vaciar carrito',
        currency_modal_title: 'Moneda de Pago',
        currency_modal_desc: '¿En qué moneda desea realizar el pago?',
        currency_pen: 'Soles (PEN)',
        currency_usd: 'Dólares (USD/USDT)',
        view_cart: 'Ver carrito',
        cart_empty: 'Tu carrito está vacío',
        confirm_clear_cart: '¿Vaciar el carrito? Se eliminarán todos los productos agregados.',
        alert_empty_cart: 'Tu carrito está vacío.'
    },
    en: {
        cart_title: 'Your Cart',
        cart_total: 'Total:',
        checkout_btn: 'Checkout',
        clear_cart_btn: 'Empty cart',
        currency_modal_title: 'Payment Currency',
        currency_modal_desc: 'Which currency would you like to pay with?',
        currency_pen: 'Soles (PEN)',
        currency_usd: 'Dollars (USD/USDT)',
        view_cart: 'View cart',
        cart_empty: 'Your cart is empty',
        confirm_clear_cart: 'Empty the cart? All added products will be removed.',
        alert_empty_cart: 'Your cart is empty.'
    }
};

function cartT(key) {
    const dict = SHARED_CART_STRINGS[window.currentLang] || SHARED_CART_STRINGS.es;
    return dict[key] !== undefined ? dict[key] : key;
}

const PRODUCT_NAME_MAP_EN = {
    'AVG Internet Security (1 Año - 1 Dispositivo) (Mayorista)': 'AVG Internet Security (1 Year - 1 Device) (Wholesale)',
    'AVG Internet Security (1 Año - 10 Dispositivos) (Mayorista)': 'AVG Internet Security (1 Year - 10 Devices) (Wholesale)',
    'AVG Internet Security - 1 Dispositivo - 1 Año': 'AVG Internet Security - 1 Device - 1 Year',
    'AVG Internet Security - 10 Dispositivos - 1 Año': 'AVG Internet Security - 10 Devices - 1 Year',
    'Apple TV+ - Cuenta Completa': 'Apple TV+ - Full Account',
    'Apple TV+ - Perfil': 'Apple TV+ - Profile',
    'Avast Premium Security (1 Año - 1 Dispositivo) (Mayorista)': 'Avast Premium Security (1 Year - 1 Device) (Wholesale)',
    'Avast Premium Security (1 Año - 10 Dispositivos) (Mayorista)': 'Avast Premium Security (1 Year - 10 Devices) (Wholesale)',
    'Avast Premium Security (1 Año - 3 Dispositivos) (Mayorista)': 'Avast Premium Security (1 Year - 3 Devices) (Wholesale)',
    'Avast Premium Security - 1 Dispositivo - 1 Año': 'Avast Premium Security - 1 Device - 1 Year',
    'Avast Premium Security - 10 Dispositivos - 1 Año': 'Avast Premium Security - 10 Devices - 1 Year',
    'Avast Premium Security - 3 Dispositivos - 1 Año': 'Avast Premium Security - 3 Devices - 1 Year',
    'Avast Ultimate (1 Año - 1 Dispositivo) (Mayorista)': 'Avast Ultimate (1 Year - 1 Device) (Wholesale)',
    'Avast Ultimate - 1 Dispositivo - 1 Año': 'Avast Ultimate - 1 Device - 1 Year',
    'Crunchyroll - Cuenta Completa': 'Crunchyroll - Full Account',
    'Crunchyroll - Perfil': 'Crunchyroll - Profile',
    'Disney + ESPN - Cuenta Completa': 'Disney + ESPN - Full Account',
    'Disney + ESPN - Perfil': 'Disney + ESPN - Profile',
    'Disney - Perfil 1': 'Disney - Profile',
    'Disney Standar - Cuenta Completa': 'Disney Standard - Full Account',
    'HBO - Cuenta Completa': 'HBO - Full Account',
    'HBO Platino - Cuenta Completa': 'HBO Platinum - Full Account',
    'HBO Platino - Perfil 2': 'HBO Platinum - Profile',
    'HBO Stanadar - Perfil 1': 'HBO Standard - Profile',
    'MagisTV / Xupertv - Perfil': 'MagisTV / Xupertv - Profile',
    'McAfee Premium Basic (1 Año - 3 Dispositivos) (Mayorista)': 'McAfee Premium Basic (1 Year - 3 Devices) (Wholesale)',
    'McAfee Premium Basic - 1 Dispositivo - 1 Año': 'McAfee Premium Basic - 1 Device - 1 Year',
    'Netflix - Perfil': 'Netflix - Profile',
    'No Ping (1 Dispositivo - 30 días) (Mayorista)': 'No Ping (1 Device - 30 days) (Wholesale)',
    'No Ping - Unidad': 'No Ping - Unit',
    'Paramount - Cuenta Completa': 'Paramount - Full Account',
    'Paramount - Perfil': 'Paramount - Profile',
    'Prime Video - Cuenta Completa': 'Prime Video - Full Account',
    'Prime Video - Perfil': 'Prime Video - Profile',
    'Vix - Perfil': 'Vix - Profile',
    'Windows 10 Home OEM (Mayorista)': 'Windows 10 Home OEM (Wholesale)',
    'Windows 10 Pro Retail (Mayorista)': 'Windows 10 Pro Retail (Wholesale)',
    'Windows 11 Home OEM (Mayorista)': 'Windows 11 Home OEM (Wholesale)',
    'Windows 11 Pro Retail (Mayorista)': 'Windows 11 Pro Retail (Wholesale)'
};

window.translateProductName = function (name) {
    if (window.currentLang !== 'en' || !name) return name;
    const match = name.match(/^(.*?)(\s\(x\d+\))$/);
    const base = match ? match[1] : name;
    const suffix = match ? match[2] : '';
    const translatedBase = PRODUCT_NAME_MAP_EN[base] !== undefined ? PRODUCT_NAME_MAP_EN[base] : base;
    return translatedBase + suffix;
};

// Agrupa una lista de items del carrito (producto + precio idénticos) para
// obtener cantidad y subtotal por producto. Se usa tanto para el carrito
// actual (window.cart) como para pedidos guardados en el historial, y es la
// ÚNICA función que calcula cantidades/subtotales: todos los canales
// (WhatsApp, Telegram, checkout, historial) reutilizan este mismo resultado
// para evitar duplicar la lógica y mostrar totales inconsistentes.
window.groupOrderItems = function (items) {
    const list = Array.isArray(items) ? items : [];
    const groupsByKey = new Map();
    const orderedGroups = [];

    list.forEach(item => {
        if (!item) return;
        const name = item.name || '';
        // Precios como texto, vacíos o inválidos se tratan como 0 en vez de
        // romper el cálculo del total.
        const unitPEN = Number(item.pricePEN);
        const unitUSD = Number(item.priceUSD);
        const safeUnitPEN = isNaN(unitPEN) ? 0 : unitPEN;
        const safeUnitUSD = isNaN(unitUSD) ? 0 : unitUSD;
        const key = name + '|' + safeUnitPEN + '|' + safeUnitUSD;

        let group = groupsByKey.get(key);
        if (!group) {
            group = { name, unitPEN: safeUnitPEN, unitUSD: safeUnitUSD, qty: 0 };
            groupsByKey.set(key, group);
            orderedGroups.push(group);
        }
        group.qty += 1;
    });

    return orderedGroups.map(g => ({
        name: g.name,
        qty: g.qty,
        unitPEN: g.unitPEN,
        unitUSD: g.unitUSD,
        subtotalPEN: g.unitPEN * g.qty,
        subtotalUSD: g.unitUSD * g.qty
    }));
};

// Resumen completo de un pedido: líneas agrupadas (nombre, cantidad, precio
// unitario, subtotal de cada producto) + total general sumando TODOS los
// subtotales (no solo el primer producto).
window.getOrderSummary = function (items) {
    const source = items || window.cart || [];
    const lines = window.groupOrderItems(source);
    const totalPEN = lines.reduce((sum, l) => sum + l.subtotalPEN, 0);
    const totalUSD = lines.reduce((sum, l) => sum + l.subtotalUSD, 0);
    return { lines, totalPEN, totalUSD };
};

window.getCartTotals = function () {
    const { totalPEN, totalUSD } = window.getOrderSummary(window.cart);
    return { totalPEN, totalUSD };
};

// Texto de resumen de pedido reutilizable (WhatsApp, Telegram, historial...).
// Devuelve { itemsText, totalText } ya formateados en PEN y USD, con
// nombre, cantidad, precio unitario y subtotal de cada producto.
window.formatOrderSummaryText = function (items) {
    const { lines, totalPEN, totalUSD } = window.getOrderSummary(items);
    if (lines.length === 0) {
        return { itemsText: '', totalText: '0.00 PEN / $0.00 USD' };
    }

    const itemsText = lines.map(l => {
        const name = window.translateProductName ? window.translateProductName(l.name) : l.name;
        return `- ${name} x${l.qty} (${l.unitPEN.toFixed(2)} PEN / $${l.unitUSD.toFixed(2)} USD c/u) = ${l.subtotalPEN.toFixed(2)} PEN / $${l.subtotalUSD.toFixed(2)} USD`;
    }).join('\n');

    const totalText = `${totalPEN.toFixed(2)} PEN / $${totalUSD.toFixed(2)} USD`;

    return { itemsText, totalText };
};

window.saveCart = function () {
    localStorage.setItem('cartItems', JSON.stringify(window.cart));

    const { totalPEN, totalUSD } = window.getCartTotals();
    const totalStr = totalPEN.toFixed(2) + ' PEN / $' + totalUSD.toFixed(2) + ' USD';
    localStorage.setItem('cartTotal', totalStr);

    const sumEl = document.getElementById('cartTotalSum');
    if (sumEl) sumEl.innerText = totalStr;

    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = window.cart.length;
    });

    const cartFloat = document.getElementById('cartFloat');
    const floatCountEl = document.getElementById('cartFloatCount');
    if (floatCountEl) floatCountEl.textContent = window.cart.length;
    if (cartFloat) cartFloat.style.display = window.cart.length > 0 ? 'flex' : 'none';
};

window.updateCartUI = function () {
    const container = document.getElementById('cartItems');
    if (container) {
        container.innerHTML = '';
        if (window.cart.length === 0) {
            container.innerHTML = `<div style="text-align:center; margin-top:2rem; color:var(--text-muted);">${cartT('cart_empty')}</div>`;
        } else {
            window.cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${window.translateProductName(item.name)}</h4>
                        <p>${item.pricePEN.toFixed(2)} PEN / $${item.priceUSD.toFixed(2)} USD</p>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                `;
                container.appendChild(div);
            });
        }
    }
    window.saveCart();
};

window.addToCart = function (btn) {
    const name = btn.getAttribute('data-name');
    const pricePEN = parseFloat(btn.getAttribute('data-price-pen'));
    const priceUSD = parseFloat(btn.getAttribute('data-price-usd'));
    // Categoría del producto (opcional). Se define con el atributo data-category
    // en el botón "Agregar al carrito" de cada página de producto. Si una página
    // no la define, el producto simplemente queda sin categoría (category: null).
    const category = btn.getAttribute('data-category') || null;

    window.cart.push({ id: Date.now() + Math.random(), name, pricePEN, priceUSD, category });
    window.updateCartUI();
    // Nota: ya no se abre el panel del carrito automáticamente al agregar un
    // producto. El cliente lo abre manualmente con el botón del carrito.
};

window.removeFromCart = function (id) {
    window.cart = window.cart.filter(item => item.id !== id);
    window.updateCartUI();
};

window.clearCart = function () {
    window.cart = [];
    window.updateCartUI();
};


document.addEventListener('DOMContentLoaded', () => {
    // Botón(es) flotante(s) de Telegram: arma el enlace con TELEGRAM_USERNAME
    // (ver js/config.js) + el mensaje general precargado. Se ejecuta en TODAS
    // las páginas (incluido checkout, que corta el resto de este listener).
    document.querySelectorAll('.fab-help-telegram').forEach(link => {
        const message = link.getAttribute('data-tg-message') || '';
        link.href = window.buildTelegramLink ? window.buildTelegramLink(message) : 'https://t.me/';
    });

    if (window.SHARED_CART_NO_UI) {
        window.updateCartUI();
        return;
    }

    if (!document.getElementById('currencyModal')) {
        document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="currencyModal">
            <div class="modal-content modal-single" style="text-align: center; max-width: 400px; padding: 2rem;">
                <button class="close-modal" id="closeCurrencyModal"><i class="fa-solid fa-times"></i></button>
                <div class="modal-header" style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.4rem; color: #fff;"><i class="fa-solid fa-wallet" style="color: var(--primary); margin-right: 8px;"></i> <span data-i18n="currency_modal_title">${cartT('currency_modal_title')}</span></h2>
                    <p style="margin-top: 0.8rem; font-size: 0.95rem;" data-i18n="currency_modal_desc">${cartT('currency_modal_desc')}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="checkout-btn" id="btnPayPEN" style="background: linear-gradient(135deg, #10b981, #059669);" data-i18n="currency_pen">${cartT('currency_pen')}</button>
                    <button class="checkout-btn" id="btnPayUSD" style="background: linear-gradient(135deg, #3b82f6, #2563eb);" data-i18n="currency_usd">${cartT('currency_usd')}</button>
                </div>
            </div>
        </div>`);
    }

    if (!document.getElementById('cartSidebar')) {
        document.body.insertAdjacentHTML('beforeend', `
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h2><i class="fa-solid fa-cart-shopping"></i> <span data-i18n="cart_title">${cartT('cart_title')}</span></h2>
                <button class="close-cart" id="closeCartBtn"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span data-i18n="cart_total">${cartT('cart_total')}</span>
                    <span id="cartTotalSum">$0.00</span>
                </div>
                <button class="checkout-btn" id="checkoutBtn"><i class="fa-solid fa-credit-card"></i> <span data-i18n="checkout_btn">${cartT('checkout_btn')}</span></button>
                <button type="button" id="clearCartBtn" data-i18n="clear_cart_btn" style="width:100%; margin-top:0.8rem; background:transparent; border:none; color: var(--text-muted); font-size:0.85rem; cursor:pointer; text-decoration: underline; padding: 0.4rem;">${cartT('clear_cart_btn')}</button>
            </div>
        </div>
        <button class="cart-float" id="cartFloat" style="display: none; position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--primary); color: #fff; border: none; border-radius: 50px; padding: 0.8rem 1.4rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; align-items: center; gap: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.4); z-index: 100;">
            <i class="fa-solid fa-cart-shopping"></i> <span data-i18n="view_cart">${cartT('view_cart')}</span>
            <span class="cf-count" id="cartFloatCount" style="background: #fff; color: var(--primary); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700;">0</span>
        </button>
        `);
    } else if (!document.getElementById('cartBtn') && !document.getElementById('cartFloat')) {
        document.body.insertAdjacentHTML('beforeend', `
        <button class="cart-float" id="cartFloat" style="display: none; position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--primary); color: #fff; border: none; border-radius: 50px; padding: 0.8rem 1.4rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; align-items: center; gap: 0.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.4); z-index: 100;">
            <i class="fa-solid fa-cart-shopping"></i> <span data-i18n="view_cart">${cartT('view_cart')}</span>
            <span class="cf-count" id="cartFloatCount" style="background: #fff; color: var(--primary); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700;">0</span>
        </button>`);
    }

    const sidebar = document.getElementById('cartSidebar');

    const openTrigger = document.getElementById('cartBtn') || document.getElementById('cartFloat');
    if (openTrigger && sidebar) {
        openTrigger.addEventListener('click', () => sidebar.classList.add('open'));
    }

    const closeBtn = sidebar ? sidebar.querySelector('#closeCartBtn, .close-cart') : null;
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    // Cierra el carrito al hacer clic en cualquier parte fuera de él
    // (sin contar los botones que lo abren, para no interferir con su propio click).
    if (sidebar) {
        document.addEventListener('click', (e) => {
            if (!sidebar.classList.contains('open')) return;
            if (e.target.closest('#cartBtn, #cartFloat')) return;
            if (!sidebar.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (window.cart.length === 0) return;
            if (confirm(cartT('confirm_clear_cart'))) {
                window.clearCart();
            }
        });
    }

    const currencyModal = document.getElementById('currencyModal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn && currencyModal) {
        checkoutBtn.addEventListener('click', () => {
            if (window.cart.length === 0) {
                alert(cartT('alert_empty_cart'));
                return;
            }
            currencyModal.classList.add('active');
        });
    }
    const closeCurrencyBtn = document.getElementById('closeCurrencyModal');
    if (closeCurrencyBtn && currencyModal) {
        closeCurrencyBtn.addEventListener('click', () => currencyModal.classList.remove('active'));
    }
    if (currencyModal) {
        currencyModal.addEventListener('click', (e) => {
            if (e.target === currencyModal) currencyModal.classList.remove('active');
        });
    }
    const btnPayPEN = document.getElementById('btnPayPEN');
    const btnPayUSD = document.getElementById('btnPayUSD');
    if (btnPayPEN) {
        btnPayPEN.addEventListener('click', () => {
            localStorage.setItem('preferredCurrency', 'PEN');
            window.location.href = 'checkout.html';
        });
    }
    if (btnPayUSD) {
        btnPayUSD.addEventListener('click', () => {
            localStorage.setItem('preferredCurrency', 'USD');
            window.location.href = 'checkout.html';
        });
    }

    window.updateCartUI();
});
