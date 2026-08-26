(function () {
    window.currentLang = localStorage.getItem('appLang') || 'es';

    const COMMON = {
        es: {
            back_to_catalog: 'Volver al catálogo',
            back_to_store: 'Volver a la tienda',
            add_to_cart: 'Agregar al carrito',
            add_btn: 'Agregar',
            want_profile_or_full: '¿Desea cuenta completa o por perfil?',
            full_account_desc: 'Cuenta completa privada. Hasta 4 a 5 pantallas simultáneas. Ideal para la familia.',
            profile_instructions: 'No usar más de un dispositivo ni realizar cambios en los ajustes ni perfiles.',
            account_instructions: 'No tocar nada de la cuenta o se le quita la garantía.',
            indicaciones_label: 'Indicaciones:',
            full_account_label: 'Cuenta Completa',
            device_1y: '1 Dispositivo - 1 Año',
            device_3y: '3 Dispositivos - 1 Año',
            device_10y: '10 Dispositivos - 1 Año',
            theme_tooltip: 'Invertir colores',
            help_tooltip: '¿Necesitas ayuda?',
            help_tooltip_telegram: 'Escríbenos por Telegram',
            footer_email_label: 'Correo:',
            footer_contact_btn: 'Contactar',
            footer_hours_title: '🕐 Horarios',
            footer_day_mf: 'Lunes - Viernes:',
            footer_day_sat: 'Sábado:',
            footer_day_sun: 'Domingo:',
            footer_closed: 'Cerrado',
            footer_hours_note: 'Si no contestamos de manera inmediata, estamos ocupados/estudiando en la universidad. ¡Ténganos paciencia!',
            footer_policy_notice: 'Si no respondemos de inmediato, es porque estamos ocupados o en clases de la universidad: les pedimos un poco de paciencia. Ante mensajes o llamadas insistentes y repetidas se enviará una primera advertencia; si la insistencia continúa, el acceso será bloqueado en todas las plataformas alquiladas y los pagos adelantados no serán reembolsados.',

            cart_title: 'Tu Carrito',
            cart_total: 'Total:',
            checkout_btn: 'Finalizar Compra',
            clear_cart_btn: 'Vaciar carrito',
            currency_modal_title: 'Moneda de Pago',
            currency_modal_desc: '¿En qué moneda desea realizar el pago?',
            currency_pen: 'Soles (PEN)',
            currency_usd: 'Dólares (USD/USDT)',
            view_cart: 'Ver carrito',

            qty_label: 'Cantidad de unidades',
            qty_placeholder: 'Ej: 25',
            range_10_100: '10–100 unidades',
            per_unit: 'c/u',
            enter_quantity: 'Ingresa una cantidad',
            enter_range_tpl: 'Ingresa entre %min% y %max% unidades',
            units_word: 'uds'
        },
        en: {
            back_to_catalog: 'Back to catalog',
            back_to_store: 'Back to store',
            add_to_cart: 'Add to cart',
            add_btn: 'Add',
            want_profile_or_full: 'Would you like a full account or a profile?',
            full_account_desc: 'Private full account. Up to 4-5 simultaneous screens. Ideal for the family.',
            profile_instructions: 'Do not use more than one device or make changes to the settings or profiles.',
            account_instructions: 'Do not modify anything on the account or the warranty will be voided.',
            indicaciones_label: 'Instructions:',
            full_account_label: 'Full Account',
            device_1y: '1 Device - 1 Year',
            device_3y: '3 Devices - 1 Year',
            device_10y: '10 Devices - 1 Year',
            theme_tooltip: 'Invert colors',
            help_tooltip: 'Need help?',
            help_tooltip_telegram: 'Message us on Telegram',
            footer_email_label: 'Email:',
            footer_contact_btn: 'Contact',
            footer_hours_title: '🕐 Hours',
            footer_day_mf: 'Monday - Friday:',
            footer_day_sat: 'Saturday:',
            footer_day_sun: 'Sunday:',
            footer_closed: 'Closed',
            footer_hours_note: "If we don't reply right away, we're busy/studying at university. Thanks for your patience!",
            footer_policy_notice: "If we don't reply right away, it's because we're busy or in university classes — thank you for your patience. In case of repeated, insistent messages or calls, a first warning will be sent; if the insistence continues, access will be blocked on all rented platforms and any advance payment will not be refunded.",
            cart_title: 'Your Cart',
            cart_total: 'Total:',
            checkout_btn: 'Checkout',
            clear_cart_btn: 'Empty cart',
            currency_modal_title: 'Payment Currency',
            currency_modal_desc: 'Which currency would you like to pay with?',
            currency_pen: 'Soles (PEN)',
            currency_usd: 'Dollars (USD/USDT)',
            view_cart: 'View cart',
            qty_label: 'Quantity of units',
            qty_placeholder: 'E.g., 25',
            range_10_100: '10–100 units',
            per_unit: 'each',
            enter_quantity: 'Enter a quantity',
            enter_range_tpl: 'Enter between %min% and %max% units',
            units_word: 'units'
        }
    };

    function dictFor(lang) {
        const page = (window.PAGE_I18N && window.PAGE_I18N[lang]) || {};
        return Object.assign({}, COMMON[lang] || COMMON.es, page);
    }

    window.translate = function (key) {
        const d = dictFor(window.currentLang);
        return d[key] !== undefined ? d[key] : key;
    };

    window.applyLanguage = function (lang) {
        window.currentLang = lang;
        localStorage.setItem('appLang', lang);
        document.documentElement.lang = lang;

        const d = dictFor(lang);
        if (d.page_title) document.title = d.page_title;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (d[key] !== undefined) el.textContent = d[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (d[key] !== undefined) el.setAttribute('placeholder', d[key]);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (d[key] !== undefined) el.setAttribute('title', d[key]);
        });

        const langLabel = document.getElementById('langLabel');
        if (langLabel) langLabel.textContent = lang === 'es' ? 'EN' : 'ES';

        if (typeof window.updateCartUI === 'function') window.updateCartUI();


        if (typeof window.onLanguageChanged === 'function') window.onLanguageChanged(lang);
    };

    window.applyTheme = function (theme) {
        document.documentElement.classList.toggle('light-mode', theme === 'light');
        localStorage.setItem('appTheme', theme);
    };

    document.addEventListener('DOMContentLoaded', function () {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn && !themeBtn.dataset.i18nWired) {
            themeBtn.dataset.i18nWired = '1';
            themeBtn.addEventListener('click', function () {
                const isLight = document.documentElement.classList.contains('light-mode');
                window.applyTheme(isLight ? 'dark' : 'light');
            });
        }

        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.addEventListener('click', function () {
                window.applyLanguage(window.currentLang === 'es' ? 'en' : 'es');
            });
        }
        window.applyLanguage(window.currentLang);
    });
})();
