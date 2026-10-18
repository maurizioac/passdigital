window.TELEGRAM_USERNAME = "@passdigital";

window.buildTelegramLink = function (message) {
    let handle = (window.TELEGRAM_USERNAME || '').trim();

    let baseUrl;
    if (/^https?:\/\//i.test(handle)) {

        baseUrl = handle.replace(/\/+$/, '');
    } else {
        
        handle = handle.replace(/^@/, '');
        baseUrl = 'https://t.me/' + handle;
    }

    if (!message) return baseUrl;
    return baseUrl + '?text=' + encodeURIComponent(message);
};
