// --- QUẢN LÝ DARK / LIGHT MODE ---
function initTheme() {
    const savedTheme = localStorage.getItem('site_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('site_theme', newTheme);
}

// --- QUẢN LÝ ĐA NGÔN NGỮ (ANH / VIỆT) ---
async function changeLanguage(lang) {
    try {
        const response = await fetch(`./assets/locales/${lang}.json`);
        const translations = await response.json();
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.innerText = translations[key];
            }
        });
        
        localStorage.setItem('preferred_lang', lang);
    } catch (e) {
        console.error("Lỗi tải ngôn ngữ:", e);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferred_lang') || 'vi';
    changeLanguage(savedLang);
}

// Chạy tự động khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
});