// --- 1. XỬ LÝ SÁNG / TỐI & TỰ ĐỔI ICON ---
function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    
    if (theme === 'light') {
        // Đang ở chế độ sáng -> Hiện icon Mặt Trời (bấm vào sẽ chuyển về tối)
        icon.className = "fas fa-sun";
    } else {
        // Đang ở chế độ tối -> Hiện icon Mặt Trăng (bấm vào sẽ chuyển sang sáng)
        icon.className = "fas fa-moon";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('site_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('site_theme', newTheme);
    updateThemeUI(newTheme);
}

// --- 2. XỬ LÝ ĐA NGÔN NGỮ & ĐỔI MÀU NÚT ACTIVE ---
function updateLangUI(lang) {
    const btnVi = document.getElementById('btnVi');
    const btnEn = document.getElementById('btnEn');
    if (!btnVi || !btnEn) return;

    if (lang === 'en') {
        btnEn.style.cssText = "background: rgba(0,176,155,0.2); border: 1px solid var(--primary); color: var(--primary); font-size: 0.65rem; padding: 6px 8px; border-top-right-radius: 20px; border-bottom-right-radius: 20px; font-weight: 900;";
        btnVi.style.cssText = "background: rgba(0,0,0,0.04); border: 1px solid #cbd5e1; color: var(--text-muted, #64748b); font-size: 0.65rem; padding: 6px 8px; border-top-left-radius: 20px; border-bottom-left-radius: 20px; font-weight: 700;";
    } else {
        btnVi.style.cssText = "background: rgba(0,176,155,0.2); border: 1px solid var(--primary); color: var(--primary); font-size: 0.65rem; padding: 6px 8px; border-top-left-radius: 20px; border-bottom-left-radius: 20px; font-weight: 900;";
        btnEn.style.cssText = "background: rgba(0,0,0,0.04); border: 1px solid #cbd5e1; color: var(--text-muted, #64748b); font-size: 0.65rem; padding: 6px 8px; border-top-right-radius: 20px; border-bottom-right-radius: 20px; font-weight: 700;";
    }
}

async function changeLanguage(lang) {
    try {
        const response = await fetch(`./assets/locales/${lang}.json`);
        const translations = await response.json();
        
        // Cập nhật các thẻ có data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.innerText = translations[key];
            }
        });

        // Cập nhật placeholder nếu có
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
        
        // Lưu trước vào localStorage
        localStorage.setItem('preferred_lang', lang);
        updateLangUI(lang);

        // --- DÙNG TRỰC TIẾP BIẾN `lang` THAY VÌ ĐỌC LẠI LOCALSTORAGE ---
        const bubble = document.getElementById('aiSuggestion');
        if (bubble && bubble.style.display === 'block') {
            const userName = localStorage.getItem('admin_name') || 'Anh/Chị';
            bubble.innerHTML = lang === 'en' 
                ? `Hello <strong id="userName">${userName}</strong>! 👋 How can I help you?` 
                : `Dạ chào <strong id="userName">${userName}</strong>! 👋 Em hỗ trợ được gì không ạ?`;
        }
        // -------------------------------------------------------------

    } catch (e) {
        console.error("Lỗi chuyển đổi ngôn ngữ:", e);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferred_lang') || 'vi';
    changeLanguage(savedLang);
}

// Tự động kích hoạt khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
});
