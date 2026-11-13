
        const PATHS = { CLIENT_ID: '549408699768-0hhl7oc0sjhr1c9tsa1fo9ahv5apuecc.apps.googleusercontent.com', OAUTH: 'https://wsm.congtubaclieu.com.vn/webhook/google-oauth-callback', CREATE: 'https://wsm.congtubaclieu.com.vn/webhook/create-album-auto', INFO: 'https://wsm.congtubaclieu.com.vn/webhook/get-folder-info', CHAT: 'https://wsm.congtubaclieu.com.vn/webhook/chat-admin' };
        let isVIP = false;
        function getExpiryTimestamp() {
            let raw = localStorage.getItem('admin_expiry');
            if (!raw) return 0;
            
            if (!isNaN(raw)) {
                return parseInt(raw);
            }
            
            if (raw.includes('/')) {
                let parts = raw.split(/[\s/:]+/);
                if (parts.length >= 3) {
                    return new Date(parts[2], parts[1] - 1, parts[0], parts[3] || 0, parts[4] || 0, parts[5] || 0).getTime();
                }
            }
            return parseInt(raw) || 0;
        }
      function updateUI() {
    const isLoggedIn = localStorage.getItem('admin_is_logged_in') === 'true';
    const status = localStorage.getItem('admin_status') || 'new';
    const expiry = getExpiryTimestamp();
    const name = localStorage.getItem('admin_name') || 'Anh/Chị';
    
    isVIP = (status === 'active' && expiry > Date.now());
    
    document.querySelectorAll('#userName, #userNameDisplay').forEach(el => {
        el.innerText = name;
    });

    const notice = document.getElementById('accountNotice');
    const btnCreate = document.getElementById('btnCreate');
    const marquee = document.getElementById('marqueeContainer');
    const navLinks = document.getElementById('adminNavLinks');
    const loggedInNav = document.getElementById('loggedInNav');
    const loggedOutNav = document.getElementById('loggedOutNav');
    const authReminder = document.getElementById('authReminder');
    const extraTextNotice = document.getElementById('extraTextNotice');
    const vipSpeedNotice = document.getElementById('vipSpeedNotice');
    const driveLinkInput = document.getElementById('driveLink');
    const allowDownloadInput = document.getElementById('allowDownload');
    const allowCommentInput = document.getElementById('allowComment');
    const limitPhotosInput = document.getElementById('limitPhotos');

    if (isLoggedIn) {
        if(marquee) marquee.style.setProperty('display', 'none', 'important');
        if(navLinks) navLinks.style.setProperty('display', 'flex', 'important');
        
        if(loggedInNav) loggedInNav.style.setProperty('display', 'flex', 'important');
        
        if(loggedOutNav) loggedOutNav.style.setProperty('display', 'none', 'important');
        if(authReminder) authReminder.style.setProperty('display', 'none', 'important');
        if(extraTextNotice) extraTextNotice.style.display = 'none';
        
        const userNameDisplay = document.getElementById('userNameDisplay');
        if(userNameDisplay) userNameDisplay.innerText = name;

        const av = localStorage.getItem('admin_avatar');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if(avatarPlaceholder) {
            avatarPlaceholder.innerHTML = av && av !== 'null' ? `<img src="${av}">` : `<i class="fas fa-user-circle" style="font-size:30px; color:var(--primary)"></i>`;
        }
        
        const statusEl = document.getElementById('userStatusDisplay');
        
        if (isVIP) {
            if(statusEl) statusEl.innerHTML = `<span class="status-tag tag-active">ACTIVE - Hạn: ${new Date(expiry).toLocaleDateString('vi-VN')}</span>`;
            if(btnCreate) btnCreate.classList.remove('d-none');
            if(btnCreate) btnCreate.disabled = false; 
            if(notice) notice.style.display = 'none';
            if(vipSpeedNotice) vipSpeedNotice.style.display = 'block';
            if(driveLinkInput) { driveLinkInput.disabled = false; driveLinkInput.style.opacity = '1'; }
            if(allowDownloadInput) allowDownloadInput.disabled = false;
            if(allowCommentInput) allowCommentInput.disabled = false;
            if(limitPhotosInput) limitPhotosInput.disabled = false;

        } else if (status === 'new') {
            if(statusEl) statusEl.innerHTML = `<span class="status-tag tag-new">MỚI</span>`;
            
            const createCard = document.querySelector('.create-card');
            if (createCard) {
                createCard.innerHTML = `
                    <h1 class="luxury-title">Thiết Lập Album VIP</h1>
                    <div class="text-center mb-4" style="font-size:0.85rem; font-weight:700; line-height:1.6; display:block;">
                        Chào <strong id="userName">${name}</strong>, tài khoản của bạn chưa kích hoạt.<br>
                        Nhận ngay <span style="color:var(--primary); font-weight:900;">30 ngày dùng thử miễn phí</span> để trải nghiệm toàn bộ tính năng!<br>
                        Không cần thanh toán, kích vào nút phía dưới để kích hoạt và sử dụng ngay lập tức.
                    </div>
                    <div class="text-center mb-3">
                        <button class="btn-create" onclick="activateFreeTrial()">DÙNG THỬ 30 NGÀY MIỄN PHÍ</button>
                    </div>
                    <div class="text-center" style="font-size:0.8rem; font-weight:600;">
                        Hoặc <a href="payment" style="color:var(--primary); text-decoration:none;">Gia hạn ngay</a> để sử dụng lâu dài ạ.
                    </div>
                `;
            }
        } else {
            if(statusEl) statusEl.innerHTML = `<span class="status-tag tag-expired">EXPIRED</span>`;
            
            const createCard = document.querySelector('.create-card');
            if (createCard) {
                createCard.innerHTML = `
                    <h1 class="luxury-title">Thiết Lập Album VIP</h1>
                    <div class="text-center mb-4" style="font-size:0.85rem; font-weight:700; line-height:1.6; display:block;">
                        <span style="color:#ff4757">Tài khoản của <strong id="userName">${name}</strong> đã hết hạn.</span><br>Vui lòng <a href="payment" style="color:var(--primary); text-decoration:none; font-weight:900;">Gia hạn</a> để tiếp tục sử dụng dịch vụ ạ.
                    </div>
                `;
            }
        }
    } else { 
        if(marquee) marquee.style.setProperty('display', 'block', 'important');
        if(navLinks) navLinks.style.setProperty('display', 'none', 'important');
        if(loggedInNav) loggedInNav.style.setProperty('display', 'none', 'important');
        if(loggedOutNav) loggedOutNav.style.setProperty('display', 'block', 'important');
        
        const createCard = document.querySelector('.create-card');
        if (createCard) {
            createCard.innerHTML = `
                <h1 class="luxury-title">Thiết Lập Album VIP</h1>
                <div class="remind-text-rainbow" style="display:block;">Vui lòng đăng nhập để sử dụng</div>
                <div class="text-center mb-3" style="color:var(--primary); font-weight:900; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase;"><i class="fas fa-bolt me-2"></i>Tốc độ cực nhanh - Chính xác 100%</div>
            `;
        }
    }
    
    setTimeout(() => {
    const bubble = document.getElementById('aiSuggestion');
    if(bubble && document.getElementById('chatPanel').style.display !== 'flex') {
        // Lấy ngôn ngữ hiện đang chọn (vi hoặc en)
        const currentLang = localStorage.getItem('preferred_lang') || 'vi';
        
        // Định nghĩa câu chào theo ngôn ngữ
        const greetingText = currentLang === 'en' 
            ? `Hello <strong id="userName">${name}</strong>! 👋 How can I help you?` 
            : `Dạ chào <strong id="userName">${name}</strong>! 👋 Em hỗ trợ được gì không ạ?`;
            
        bubble.innerHTML = greetingText;
        bubble.style.display = 'block';
    }
}, 1500);
        let storedLogoBase64 = localStorage.getItem('studio_watermark_logo') || '';

        if (storedLogoBase64) {
            const preview = document.getElementById('logoPreview');
            if (preview) {
                preview.src = storedLogoBase64;
                preview.style.display = 'block';
            }
        }
       function toggleWatermarkInput() {
            const isChecked = document.getElementById('enableWatermark').checked;
            document.getElementById('logoUploadContainer').style.display = isChecked ? 'block' : 'none';
        }
        
        function processLogoFile(event) {
            const file = event.target.files[0];
            if (!file) return;
        
            if (file.size > 1024 * 1024) {
                alert("Dung lượng file logo quá lớn! Vui lòng chọn ảnh dưới 1MB.");
                return;
            }
        
            const reader = new FileReader();
            reader.onload = function(e) {
                storedLogoBase64 = e.target.result;
                localStorage.setItem('studio_watermark_logo', storedLogoBase64);
                
                const preview = document.getElementById('logoPreview');
                if (preview) {
                    preview.src = storedLogoBase64;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
        const watermarkEnabled = document.getElementById('enableWatermark').checked;
        localStorage.setItem('studio_watermark_enabled', watermarkEnabled);
        async function sendChat() {
            const input = document.getElementById('chatInput');
            const msg = input.value.trim();
            if(!msg) return;
            const body = document.getElementById('chatBody');
            const statusText = document.getElementById('aiTypingStatus');
            body.innerHTML += `<div class="msg-bubble msg-user">${msg}</div>`;
            input.value = '';
            body.scrollTop = body.scrollHeight;
            statusText.style.display = 'block';
            let sid = localStorage.getItem('chat_session_id');
            if(!sid) { sid = 'ss_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('chat_session_id', sid); }
            try {
                const response = await fetch(PATHS.CHAT, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ sessionId: sid, message: msg, adminEmail: localStorage.getItem('admin_email') || 'Guest' }) });
                const data = await response.json();
                const aiMsg = data.reply || data.output || "Dạ, em đang bận một chút ạ!";
                statusText.style.display = 'none';
                body.innerHTML += `<div class="chat-row"><div class="chat-avatar"><img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"></div><div class="msg-bubble msg-ai">${aiMsg}</div></div>`;
            } catch (e) { statusText.style.display = 'none'; body.innerHTML += `<div class="msg-bubble msg-ai">Dạ lỗi kết nối rồi ạ!</div>`; }
            body.scrollTop = body.scrollHeight;
        }
        let modalStudioLogoBase64 = '';

            function processModalLogoFile(event) {
                const file = event.target.files[0];
                if (!file) return;
            
                if (file.size > 1024 * 1024) {
                    alert("Dung lượng file logo quá lớn! Vui lòng chọn ảnh dưới 1MB.");
                    return;
                }
            
                const reader = new FileReader();
                reader.onload = function(e) {
                    modalStudioLogoBase64 = e.target.result;
                    
                    const preview = document.getElementById('modalLogoPreview');
                    if (preview) {
                        preview.src = modalStudioLogoBase64;
                        preview.style.display = 'inline-block';
                    }
                };
                reader.readAsDataURL(file);
            }
            function openStudioConfigModal() {
    document.getElementById('modalStudioNameInput').value = localStorage.getItem('admin_studio_name') || '';
    document.getElementById('modalStudioPhoneInput').value = localStorage.getItem('admin_studio_phone') || '';
    document.getElementById('modalStudioAddressInput').value = localStorage.getItem('admin_studio_address') || '';
    
    modalStudioLogoBase64 = localStorage.getItem('studio_watermark_logo') || '';
    const preview = document.getElementById('modalLogoPreview');
    if (modalStudioLogoBase64 && preview) {
        preview.src = modalStudioLogoBase64;
        preview.style.display = 'inline-block';
    } else if(preview) {
        preview.style.display = 'none';
    }
    
    const modalEl = document.getElementById('studioConfigModal');
    const myModal = new bootstrap.Modal(modalEl);
    myModal.show();
}
function closeStudioConfigModal() {
    const modalEl = document.getElementById('studioConfigModal');
    const myModal = bootstrap.Modal.getInstance(modalEl);
    if (myModal) {
        myModal.hide();
    }
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }, 300);
}

        function sendQuickChat(promptText) {
    const input = document.getElementById('chatInput');
    if(input) {
        input.value = promptText;
        sendChat(); 
    }
}

async function activateFreeTrial() {
    const userEmail = localStorage.getItem('admin_email');
    if (!userEmail) {
        alert("Không tìm thấy thông tin tài khoản, vui lòng đăng nhập lại!");
        return;
    }

    try {
        const btn = document.querySelector('.btn-create');
        if (btn) {
            btn.innerText = "ĐANG KÍCH HOẠT...";
            btn.disabled = true;
        }
        const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/activate-free-trial', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: userEmail,
                days: 30 
            })
        });
        
        const data = await res.json();
        
        if (res.ok && (data.status === 'active' || data.success)) {
            let newExpiry = data.expiry_timestamp || (Date.now() + 30 * 24 * 60 * 60 * 1000); 
            
            localStorage.setItem('admin_status', 'active');
            localStorage.setItem('admin_expiry', newExpiry);
            
            alert("Kích hoạt dùng thử 30 ngày thành công! Chào mừng bạn đến với ChonAnhNhanh.vn.");
            window.location.reload(); 
        } else {
            alert("Không thể kích hoạt tự động. Vui lòng thử lại hoặc liên hệ hỗ trợ!");
            if (btn) {
                btn.innerText = "DÙNG THỬ 30 NGÀY MIỄN PHÍ"; 
                btn.disabled = false;
            }
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi kích hoạt dùng thử!");
        window.location.reload();
    }
}
        
       async function saveStudioConfig() {
    const nameVal = document.getElementById('modalStudioNameInput').value.trim();
    const phoneVal = document.getElementById('modalStudioPhoneInput').value.trim();
    const addressVal = document.getElementById('modalStudioAddressInput').value.trim();
    
    if (!nameVal) {
        return alert("Vui lòng nhập Tên Studio!");
    }
    
    const studioSlug = createSlug(nameVal);
    localStorage.setItem('admin_studio_slug', studioSlug);
    localStorage.setItem('admin_studio_name', nameVal);
    localStorage.setItem('admin_studio_phone', phoneVal);
    localStorage.setItem('admin_studio_address', addressVal);
    if (modalStudioLogoBase64) {
        localStorage.setItem('studio_watermark_logo', modalStudioLogoBase64);
    }
    const modalEl = document.getElementById('studioConfigModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
    try {
        await fetch('https://wsm.congtubaclieu.com.vn/webhook/update-admin-studio', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                adminEmail: localStorage.getItem('admin_email'),
                studioSlug: studioSlug,
                studioName: nameVal,
                studioPhone: phoneVal,
                studioAddress: addressVal,
                watermarkLogo: modalStudioLogoBase64
            })
        });
        alert("Đã lưu thông tin Studio và Logo thành công lên hệ thống!");
    } catch (e) {
    }
}
        function createSlug(str) {
            if (!str) return '';
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            return str.replace(/[^0-9a-z]/g, '');
        }
       async function handleCreateAlbum() {
    const status = localStorage.getItem('admin_status');
    const expiry = parseInt(localStorage.getItem('admin_expiry')) || 0;
    
    if (status !== 'active' || expiry <= Date.now()) {
        showInlineMessage("Tài khoản của bạn chưa được kích hoạt hoặc đã hết hạn!", "error");
        return; 
    }

    const driveLink = document.getElementById('driveLink').value.trim();
    if (!driveLink.includes('drive.google.com') || (!driveLink.includes('folders/') && !driveLink.includes('drive/u/'))) {
        showInlineMessage("Link thư mực drive không hợp lệ. ( Lưu ý link phải công khai )", "error");
        return;
    }

    const fIdMatch = driveLink.match(/folders\/([^/?]+)/);
    const fId = fIdMatch ? fIdMatch[1] : null;
    
    if (!fId) {
        showInlineMessage("Không tìm thấy mã thư mục hợp lệ trong đường dẫn này!", "error");
        return;
    }

    let rawStudio = localStorage.getItem('admin_studio_slug') || 'studio';
    let studioSlug = rawStudio.replace(/[^0-9a-z]/g, '');
    let currentLogo = localStorage.getItem('studio_watermark_logo') || '';
    let isWatermarkChecked = document.getElementById('enableWatermark').checked;

    const btn = document.getElementById('btnCreate');
    btn.innerHTML = 'ĐANG XỬ LÝ...';
    btn.disabled = true;

    let folderTitle = "Album VIP";
    let albumSlug = "album";

    try {
        const infoRes = await fetch(`${PATHS.INFO}?id=${fId}`);
        if (!infoRes.ok) {
            throw new Error("Không thể lấy thông tin thư mục từ Google Drive. Vui lòng kiểm tra lại đường dẫn!");
        }
        const infoData = await infoRes.json();
        const folderObj = Array.isArray(infoData) ? infoData[0] : infoData;
        
        if (folderObj && (folderObj.folderName || folderObj.name)) {
            folderTitle = folderObj.folderName || folderObj.name;
            albumSlug = createSlug(folderTitle); 
        }

        const createRes = await fetch(`${PATHS.CREATE}?folderId=${fId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                adminEmail: localStorage.getItem('admin_email'),
                studioSlug: studioSlug,
                albumSlug: albumSlug,
                folderName: folderTitle, 
                settings: {
                    download: document.getElementById('allowDownload').checked,
                    comment: document.getElementById('allowComment').checked,
                    limitPhotos: document.getElementById('limitPhotos').checked,
                    limitPhotosValue: document.getElementById('limitPhotos').checked ? (parseInt(document.getElementById('limitPhotosInput').value) || 0) : 0,
                    watermarkEnabled: isWatermarkChecked,
                    watermarkLogo: currentLogo
                }
            })
        });

        if (!createRes.ok) {
            throw new Error("Máy chủ từ chối lưu dữ liệu. Vui lòng thử lại sau!");
        }

        const clientLink = `https://chonanhnhanh.vn/${studioSlug}/${albumSlug}`;

        document.getElementById('resFolderName').innerText = folderTitle;
        document.getElementById('resClientLink').href = clientLink;
        document.getElementById('resClientLink').innerText = clientLink;
        document.getElementById('resultBox').style.display = 'block';

        showInlineMessage("Khởi tạo Album thành công!", "success");
        fetch('https://wsm.congtubaclieu.com.vn/webhook/warmup-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studioSlug: studioSlug, albumSlug: albumSlug })
        }).catch(() => {});

    } catch (err) {
        console.error("Lỗi tạo album:", err);
        showInlineMessage(err.message || "Đã xảy ra lỗi kết nối máy chủ!", "error");
        document.getElementById('resultBox').style.display = 'none';
    } finally {
        btn.innerHTML = "KHỞI TẠO ALBUM NGAY";
        btn.disabled = false;
    }
}

function showInlineMessage(text, type) {
    let msgBox = document.getElementById('inlineSystemNotice');
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'inlineSystemNotice';
        msgBox.style.cssText = 'margin-top: 6px; font-size: 0.8rem; font-weight: 700; text-align: center; transition: all 0.3s ease; display: none; min-height: 15px;';
        let targetElement = document.getElementById('vipSpeedNotice');
        
        if (targetElement) {
            targetElement.insertAdjacentElement('afterend', msgBox);
        } else {
            const btn = document.getElementById('btnCreate');
            if (btn && btn.parentNode) {
                btn.parentNode.insertAdjacentElement('afterend', msgBox);
            }
        }
    }

    msgBox.innerText = text;
    msgBox.style.display = 'block';
    
    if (type === 'error') {
        msgBox.style.color = '#ff4757';
    } else {
        msgBox.style.color = 'var(--primary)';
    }

    setTimeout(() => {
        if (msgBox) msgBox.style.display = 'none';
    }, 6000);
}
        function toggleLimitInput() {
            const isChecked = document.getElementById('limitPhotos').checked;
            document.getElementById('limitNumberContainer').style.display = isChecked ? 'block' : 'none';
        }
        
        function toggleChat() { const p = document.getElementById('chatPanel'); p.style.display = p.style.display === 'flex' ? 'none' : 'flex'; document.getElementById('aiSuggestion').style.display = 'none'; }
        function startGoogleLogin() { 
            const scope = 'openid profile email https://www.googleapis.com/auth/calendar.events';  
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${PATHS.CLIENT_ID}&redirect_uri=${encodeURIComponent(PATHS.OAUTH)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`; 
        }
        function logoutAdmin() { localStorage.clear(); window.location.reload(); }
        function copyFinalLink() { const link = document.getElementById('resClientLink').href; navigator.clipboard.writeText(link).then(() => { document.getElementById('btnCopyMain').innerText = "ĐÃ SAO CHÉP!"; setTimeout(() => { document.getElementById('btnCopyMain').innerText = "COPY LINK"; }, 2000); }); }

        window.onload = () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('auth_status') === 'success') {
                localStorage.setItem('admin_is_logged_in', 'true');
                localStorage.setItem('admin_email', params.get('user_email') || '');
                localStorage.setItem('admin_name', decodeURIComponent(params.get('user_name') || ''));
                localStorage.setItem('admin_avatar', decodeURIComponent(params.get('user_avatar') || ''));
                localStorage.setItem('admin_status', params.get('user_status') || 'new');
                localStorage.setItem('admin_expiry', params.get('user_expiry') || '0');
                
                const sSlug = params.get('studio_slug');
                if (sSlug) localStorage.setItem('admin_studio_slug', sSlug);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            const isLoggedIn = localStorage.getItem('admin_is_logged_in');
            if (isLoggedIn !== 'true') {
                console.log("Chưa phát hiện trạng thái đăng nhập hợp lệ.");
            }

            updateUI();
            if (localStorage.getItem('admin_is_logged_in') === 'true') {
                checkAccountStatusLive();
            }

            setTimeout(() => {
                const isLoggedIn = localStorage.getItem('admin_is_logged_in') === 'true';
                const studioSlug = localStorage.getItem('admin_studio_slug');

                if (!isLoggedIn) return; 

                if (studioSlug && studioSlug !== 'null' && studioSlug !== 'undefined' && studioSlug.trim() !== '') {
                    return; 
                }
                const modalElement = document.getElementById('studioConfigModal');
                if (modalElement) {
                    const myModal = new bootstrap.Modal(modalElement, {
                        backdrop: 'static',
                        keyboard: false
                    });
                    myModal.show();
                }
            }, 1000);
        };
async function checkAccountStatusLive() {
    const isLoggedIn = localStorage.getItem('admin_is_logged_in') === 'true';
    const email = localStorage.getItem('admin_email');
    
    if (!isLoggedIn || !email) {
        updateUI();
        return;
    }

    try {
        const res = await fetch(`https://wsm.congtubaclieu.com.vn/webhook/check-account-status?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : (data.user || data);

        if (!user || !user.email) {
            logoutAdmin(); 
            return;
        }
        localStorage.setItem('admin_status', user.status || 'new');
        localStorage.setItem('admin_expiry', user.expiry_timestamp || '0');
        if (user.name) localStorage.setItem('admin_name', user.name);
        if (user.avatar) localStorage.setItem('admin_avatar', user.avatar);
        if (user.studio_slug) localStorage.setItem('admin_studio_slug', user.studio_slug);
        if (user.studio_name) localStorage.setItem('admin_studio_name', user.studio_name);
        if (user.studio_phone) localStorage.setItem('admin_studio_phone', user.studio_phone);
        if (user.studio_address) localStorage.setItem('admin_studio_address', user.studio_address);
        if (user.watermark_logo) localStorage.setItem('studio_watermark_logo', user.watermark_logo);

    } catch (e) {
        console.error("Lỗi kết nối kiểm tra tài khoản:", e);
    } finally {
        updateUI();
    }
}
    let globalDeferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        globalDeferredPrompt = e;

        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            return;
        }

        const promptBanner = document.getElementById('install-prompt');
        if (promptBanner) {
            promptBanner.style.display = 'flex';
        }
    });

    async function triggerInstallApp() {

    if (globalDeferredPrompt) {
        globalDeferredPrompt.prompt();
        const { outcome } = await globalDeferredPrompt.userChoice;
        globalDeferredPrompt = null;
        
        const promptBanner = document.getElementById('install-prompt');
        if (promptBanner) promptBanner.style.display = 'none';
        return;
    }


    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        alert("Ứng dụng này đã được cài đặt trên thiết bị của bạn rồi!");
        return;
    }


    const installModalEl = document.getElementById('installAppModal');
    if (installModalEl) {
        const myModal = new bootstrap.Modal(installModalEl);
        myModal.show();
    } else {
        alert("Vui lòng bấm vào biểu tượng 3 chấm ở góc trên bên phải Chrome -> Chọn 'Cài đặt ChonAnhNhanh...' để cài ngay lập tức nhé!");
    }
}

    function dismissInstall() {
        const promptBanner = document.getElementById('install-prompt');
        if (promptBanner) {
            promptBanner.style.display = 'none';
        }
        localStorage.setItem('tt_install_dismissed', Date.now());
    }

    window.addEventListener('DOMContentLoaded', () => {
        const promptBanner = document.getElementById('install-prompt');

        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            if (promptBanner) promptBanner.style.display = 'none';
            return;
        }

        const dismissedTime = localStorage.getItem('tt_install_dismissed');
        if (dismissedTime && (Date.now() - dismissedTime < 86400000)) {
            if (promptBanner) {
                promptBanner.style.display = 'none';
            }
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            if (!navigator.serviceWorker.controller) {
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            }
        }).catch(() => {});
    }
});
