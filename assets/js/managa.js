const PATHS = { LIST: 'https://wsm.congtubaclieu.com.vn/webhook/get-album-list', DELETE: 'https://wsm.congtubaclieu.com.vn/webhook/delete-album', EXPORT: 'https://wsm.congtubaclieu.com.vn/webhook/export_filenames',SELECTED_PHOTOS: 'https://wsm.congtubaclieu.com.vn/webhook/get-selected-photos', NOTES: 'https://wsm.congtubaclieu.com.vn/webhook/get-album-notes', CLIENT: 'https://chonanhnhanh.vn/' };
        
        let adminEmail = localStorage.getItem('admin_email'), allAlbums = [];

        function showToast(msg) { const t = document.getElementById('toastNotice'); t.innerText = msg; t.style.display = 'block'; setTimeout(() => { t.style.display = 'none'; }, 2200); }
        function filterAlbums() { const kw = document.getElementById('albumSearch').value.toLowerCase(); renderAlbums(allAlbums.filter(a => (a.folderName || a.name || '').toLowerCase().includes(kw))); }
        let displayedCount = 0;
        const pageSize = 20; 
        
        function renderAlbums(albums) {
                    const grid = document.getElementById('albumGrid');
                    if (!grid) return;
                    
                    grid.innerHTML = '';
                    displayedCount = 0;
                    window._currentFilteredAlbums = albums;
                    appendMoreAlbums();
                    
                    document.getElementById('albumCount').innerText = albums.length;
                    
                    const currentLang = localStorage.getItem('site_lang') || 'vi';
                    if (typeof applyTranslations === 'function') {
                        applyTranslations(currentLang); 
                    }
                }
        
        function appendMoreAlbums() {
            const grid = document.getElementById('albumGrid');
            const albums = window._currentFilteredAlbums || [];
            
            if (displayedCount >= albums.length) return;
            
            const nextBatch = albums.slice(displayedCount, displayedCount + pageSize);
            const fragment = document.createDocumentFragment(); // Viết gọn chuẩn DOM Fragment
            
            nextBatch.forEach(a => {
                const cardNode = createAlbumCard(a);
                fragment.appendChild(cardNode);
            });
            
            grid.appendChild(fragment);
            displayedCount += nextBatch.length; 
            const currentLang = localStorage.getItem('site_lang') || 'vi';
                    if (typeof applyTranslations === 'function') {
                        applyTranslations(currentLang); 
                    }
        }
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
                appendMoreAlbums();
            }
        });

      function createAlbumCard(album) {
    const card = document.createElement('div');  
    const id = album.folder_id || album.folderId || album.id;  
    card.className = 'album-card-vip';  
    card.id = `card-${id}`;
    
    const folderName = album.folderName || album.name || 'VIP Album';
    const albumTitle = folderName.replace(/'/g, "\\'");
    
    const coverId = album.cover_image_id || album.coverImageId || album.thumbnailFileId;
    const img = coverId ? `https://drive.google.com/thumbnail?id=${coverId}&sz=w400` : 'https://images.unsplash.com/photo-1542838132-e0c19b48b940?auto=format&fit=crop&w=600&q=80';
    
    const limitVal = album.limit_photos ?? album.limitPhotos ?? 0;
    const downloadVal = album.allow_download ?? album.allowDownload ?? false;
    const commentVal = album.allow_comment ?? album.allowComment ?? false;
    const watermarkEnabledVal = album.watermark_enabled ?? album.watermarkEnabled ?? false;
    const watermarkLogoVal = album.watermark_logo ?? album.watermarkLogo ?? '';
    
    const localStudioSlug = localStorage.getItem('admin_studio_slug');
    let rawStudio = localStudioSlug || album.studio_slug || album.studioSlug || album.studio || 'studio';
    
    const studioSlug = toSlug(rawStudio);
    const albumSlug = album.album_slug || album.albumSlug || createSlug(folderName);
    
    const clientPageUrl = `${PATHS.CLIENT}${studioSlug}/${albumSlug}`;
    const driveFolderUrl = `https://drive.google.com/drive/folders/${id}`;

    card.innerHTML = `<div class="card-img-header" style="background-image: url('${img}'); cursor: pointer;" onclick="openDirectCoverModal('${id}', '${albumTitle}')" data-i18n-title="title_change_cover" title="Bấm để đổi ảnh bìa"><div class="album-vip-title">${folderName}</div></div>
            <div class="stats-grid">
                <div class="stat-pill" onclick="openSelectedPhotosModal('${id}', '${albumTitle}')">
                    <span class="stat-val">${album.selected_photos || 0}</span>
                    <span class="stat-lab" data-i18n="lbl_selected">CHỌN</span>
                </div>
                <div class="stat-pill"><span class="stat-val text-white">${album.total_photos || 0}</span><span class="stat-lab" data-i18n="lbl_total">TỔNG</span></div>
                <div class="stat-pill" onclick="openNoteModal('${id}', '${albumTitle}')"><span class="stat-val text-info">${album.comments || 0}</span><span class="stat-lab" data-i18n="lbl_note">GHI CHÚ</span></div>
            </div>
            <div class="vip-actions-grid">
                <button class="btn-vip" style="background: #10b981; color: #fff;" onclick="downloadSelectedZip('${id}', '${albumTitle}')" title="Tải tất cả ảnh đã chọn kèm ghi chú thành file ZIP"><i class="fas fa-file-archive"></i> <span data-i18n="btn_download_final">TẢI FINAL</span></button>
                <button class="btn-vip" style="background: #0ea5e9; color: #fff;" onclick="openAlbumLinksModal('${albumTitle}', '${clientPageUrl}', '${driveFolderUrl}')" title="Xem và sao chép liên kết truy cập album"><i class="fas fa-link"></i> <span data-i18n="btn_link">LINK</span></button>
                <button class="btn-vip v-export" onclick="handleExportClick('${id}', '${albumTitle}')" title="Trích xuất tên file" style="color: #ffffff !important;">
                    <i class="fa-regular fa-copy" style="color: #ffffff !important;"></i> <span data-i18n="btn_copy_album">COPY</span>
                </button>
                <button class="btn-vip" style="background: #8b5cf6; grid-column: span 3;" onclick="openSettingsModal('${id}')">
                    <i class="fas fa-sliders-h me-1"></i> <span data-i18n="btn_config_album">CÀI ĐẶT CẤU HÌNH ALBUM</span>
                </button>
                <button class="btn-vip v-delete" onclick="deleteAlbum('${id}', '${albumTitle}')" data-i18n="btn_delete_album">XÓA ALBUM</button>
            </div>`;
    return card;
}
    const PATH_ZIP_DOWNLOAD = 'https://wsm.congtubaclieu.com.vn/webhook/download-selected-zip';

   async function downloadSelectedZip(folderId, albumName, buttonElement) {
    const btn = event ? event.currentTarget : null;
    const oldBtnContent = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Đang nén ZIP...`;
    }

    const loadingModal = document.getElementById('zipLoadingModal');
    const statusText = document.getElementById('zipStatusText');
    if (loadingModal) loadingModal.style.display = 'flex';
    
    if (statusText) {
        statusText.innerHTML = `Đang đóng gói album <b>"${albumName}"</b>.<br>Tốc độ nhanh hay chậm phụ thuộc vào đường truyền mạng và dung lượng ảnh...`;
    }

    try {
        const response = await fetch(`${PATH_ZIP_DOWNLOAD}?folderId=${folderId}`);
        
        if (!response.ok) {
            throw new Error(`Lỗi máy chủ: ${response.status}`);
        }
        const blob = await response.blob();
        
        if (blob.size < 100) {
            throw new Error("File ZIP trả về trống hoặc không có dữ liệu!");
        }
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${albumName || 'album'}_chon_anh.zip`;
        document.body.appendChild(a);
        a.click();
        
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        showToast("Tải file ZIP thành công!");
        
    } catch (error) {
        console.error("Lỗi tải ZIP:", error);
        alert(`Không thể tải file ZIP: ${error.message}`);
    } finally {
        if (loadingModal) loadingModal.style.display = 'none';
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = oldBtnContent;
        }
    }
}

function closeZipLoading() {
    const loadingModal = document.getElementById('zipLoadingModal');
    if (loadingModal) loadingModal.style.display = 'none';
}
    function openAlbumLinksModal(albumName, clientUrl, driveUrl) {
        document.getElementById('linksModalAlbumName').innerText = `Album: ${albumName}`;
        document.getElementById('inputClientLink').value = clientUrl;
        document.getElementById('inputDriveLink').value = driveUrl;
        
        new bootstrap.Modal(document.getElementById('albumLinksModal')).show();
    }
    function copyLinkText(elementId) {
        const inputEl = document.getElementById(elementId);
        inputEl.select();
        inputEl.setSelectionRange(0, 99999); 
        navigator.clipboard.writeText(inputEl.value).then(() => {
            showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
        }).catch(err => {
            console.error("Lỗi khi sao chép: ", err);
            showToast("Không thể sao chép liên kết!");
        });
    }

        function createSlug(str) {
            if (!str) return 'album';
            return str.toString().toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[đĐ]/g, 'd')
                .replace(/([^0-9a-z])/g, '')
                .trim();
        }
        async function openSelectedPhotosModal(folderId, albumName) {
    showToast("Đang tải danh sách ảnh đã chọn...");
    try {
        const res = await fetch(`${PATHS.SELECTED_PHOTOS}?folderId=${folderId}`);
        const data = await res.json();

        currentLightboxPhotos = Array.isArray(data) ? data : (data.photos || data.data || data.items || [data]);
        
        const infoEl = document.getElementById('selectedModalInfo');
        if (infoEl) {
            infoEl.innerText = `Album: ${albumName || 'Chi tiết'} (Đã chọn: ${currentLightboxPhotos.length} ảnh)`;
        }
        
        const grid = document.getElementById('selectedPhotosGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (currentLightboxPhotos.length === 0 || !currentLightboxPhotos[0].id) {
            grid.innerHTML = `<div class="text-center text-secondary py-4" style="grid-column: 1 / -1;">Khách hàng chưa chọn bức ảnh nào.</div>`;
        } else {
            currentLightboxPhotos.forEach((p, index) => {
               const imgUrl = p.url || (p.id ? `https://drive.google.com/thumbnail?id=${p.id}&sz=w400` : '');
                const imgName = p.name || `Ảnh ${index + 1}`;
                grid.innerHTML += `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0, 235, 176, 0.2); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; align-items: center; padding: 8px;">
                    <img src="${imgUrl}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;" onclick="openClientLightbox(${index})" title="Xem chi tiết">
                    <span style="font-size: 0.7rem; color: var(--primary); margin-top: 8px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="${imgName}">${imgName}</span>
                </div>
            `;
            });
        }
        
        const modalEl = document.getElementById('selectedPhotosModal');
        if (modalEl) {
            new bootstrap.Modal(modalEl).show();
        }
    } catch(e) {
        console.error("Lỗi:", e);
        showToast("Không thể tải danh sách ảnh đã chọn!");
    }
}
       async function openNoteModal(folderId, albumName) {
            showToast("Đang tải ghi chú...");
            try {
                const res = await fetch(`${PATHS.NOTES}?folderId=${folderId}`);
                const data = await res.json();
                const photos = Array.isArray(data) ? data : (data.photos || data.data || []);
                
                document.getElementById('noteModalInfo').innerText = `Album: ${albumName}`;
                const container = document.getElementById('noteListContainer');
                container.innerHTML = '';
                
                let hasNote = false;
                photos.forEach(p => {
                    const contentNote = p.note;
                    if (contentNote && String(contentNote).trim() !== '') {
                        hasNote = true;
                        container.innerHTML += `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0, 235, 176, 0.2); padding: 15px; border-radius: 15px; margin-bottom: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <img src="https://drive.google.com/thumbnail?id=${p.id}&sz=w100" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; border: 1px solid var(--primary);">
                                    <div style="font-size: 0.8rem; color: var(--primary); font-weight: 800;">📷 Tên ảnh: ${p.name}</div>
                                </div>
                                <div style="font-size: 0.9rem; color: #fff; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 10px; border-left: 3px solid var(--primary);">
                                    <b>Ghi chú:</b> ${contentNote}
                                </div>
                            </div>
                        `;
                    }
                });
                
                if (!hasNote) {
                    container.innerHTML = `<div class="text-center text-secondary py-4">Chưa có ghi chú nào từ khách hàng cho album này.</div>`;
                }
                
                new bootstrap.Modal(document.getElementById('noteModal')).show();
            } catch(e) {
                console.error(e);
                showToast("Không thể tải ghi chú!");
            }
        }
        async function handleExportClick(id, name) {
            showToast("Đang trích xuất dữ liệu...");
            try {
                const res = await fetch(PATHS.EXPORT, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ folderId: id, adminEmail: adminEmail }) 
                });
                const data = await res.json(); 
                const result = Array.isArray(data) ? data[0] : data;

                if (result && result.fileNamesForCopy) {
                    const formattedNames = result.fileNamesForCopy.split(',').map(n => n.trim()).join('\n');
                    document.getElementById('modalInfo').innerText = `Album: ${name} (${result.selectedPhotos || 0} ảnh)`;
                    document.getElementById('fileNamesOutput').value = formattedNames;
                    new bootstrap.Modal(document.getElementById('exportModal')).show(); 
                    showToast("Dữ liệu đã sẵn sàng");
                } else { 
                    showToast("Chưa chọn ảnh nào"); 
                }
            } catch (e) { 
                console.error(e);
                showToast("Khách chưa chọn ảnh"); 
            }
        }
        function getExpiryTimestamp() {
            let raw = localStorage.getItem('admin_expiry');
            if (!raw) return 0;
            if (raw.includes('/')) {
                let parts = raw.split(/[\s/:]+/);
                if (parts.length >= 3) {
                    return new Date(parts[2], parts[1] - 1, parts[0], parts[3] || 0, parts[4] || 0, parts[5] || 0).getTime();
                }
            }
            return parseInt(raw) || 0;
        }
        function copyFileNames() { const txt = document.getElementById('fileNamesOutput').value; if(!txt) return; navigator.clipboard.writeText(txt.split('\n').join(',')).then(() => { showToast("Đã sao chép danh sách"); }); }

       async function deleteAlbum(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa album: "${name}" không?`)) return;

    const cardEl = document.getElementById(`card-${id}`);
    const deleteBtn = cardEl ? cardEl.querySelector('.v-delete') : null;

    const oldBtnText = deleteBtn ? deleteBtn.innerHTML : '';
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    showToast(`Đang tiến hành xóa album "${name}"...`);

    try {
        const res = await fetch(PATHS.DELETE, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ folderId: id, adminEmail: adminEmail }) 
        });
        const data = await res.json();
        
        if (data.success) { 
            allAlbums = allAlbums.filter(a => (a.folder_id || a.folderId || a.id) !== id);
            sessionStorage.setItem('cache_albums', JSON.stringify(allAlbums));
            
            renderAlbums(allAlbums); 
            showToast("Đã xóa album !"); 
        } else {
            alert("Xóa thất bại: " + (data.message || "Lỗi máy chủ"));
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = oldBtnText;
            }
        }
    } catch (e) {
        console.error(e);
        showToast("Lỗi kết nối khi xóa album!");
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = oldBtnText;
        }
    }
}
        function updateHeaderUI() {
            const isLoggedIn = localStorage.getItem('admin_is_logged_in') === 'true';
            const status = localStorage.getItem('admin_status') || 'new';
            const expiry = getExpiryTimestamp();
            const name = localStorage.getItem('admin_name') || 'Anh/Chị';
            const isVIP = (status === 'active' && expiry > Date.now());
            const navLinks = document.getElementById('adminNavLinks');
            const loggedInNav = document.getElementById('loggedInNav');
            const loggedOutNav = document.getElementById('loggedOutNav');
            const mainWorkGrid = document.getElementById('mainWorkGrid');
            const vipExpiredBlockNotice = document.getElementById('vipExpiredBlockNotice');
            if (isLoggedIn) {
                if(navLinks) navLinks.style.setProperty('display', 'flex', 'important');
                if(loggedInNav) loggedInNav.style.setProperty('display', 'flex', 'important');
                if(loggedOutNav) loggedOutNav.style.setProperty('display', 'none', 'important');
                const nameDisplay = document.getElementById('userNameDisplay');
                if (nameDisplay) nameDisplay.innerText = name;
                const avatarPlaceholder = document.getElementById('avatarPlaceholder');
                const av = localStorage.getItem('admin_avatar');
                if (avatarPlaceholder) {
                    avatarPlaceholder.innerHTML = av && av !== 'null' ? `<img src="${av}">` : `<i class="fas fa-user-circle" style="font-size:30px; color:var(--primary)"></i>`;
                }
                const badge = document.getElementById('badgeStatus'); 
                const expText = document.getElementById('userExpiryText');
                if (isVIP) {
                    if (isVIP) {
                        if (badge) {
                            badge.className = "status-tag tag-active";
                            badge.innerText = "ACTIVE - Hạn: " + new Date(expiry).toLocaleDateString('vi-VN');
                        }
                        if (expText) expText.innerText = "";
                        
                        if (mainWorkGrid) mainWorkGrid.style.setProperty('display', 'block', 'important');
                        if (vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'none', 'important');
                    }           
                    if (mainWorkGrid) mainWorkGrid.style.setProperty('display', 'block', 'important');
                    if (vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'none', 'important');
                } else {
                    if (badge) {
                        badge.className = "status-tag tag-expired";
                        badge.innerText = status === 'new' ? "MỚI" : "EXPIRED";
                    }
                    if (expText) expText.innerText = expiry > 0 ? " - Hết hạn" : "";
                    
                    if (mainWorkGrid) mainWorkGrid.style.setProperty('display', 'none', 'important');
                    if (vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'block', 'important');
                }
                } else { 
                    if(navLinks) navLinks.style.setProperty('display', 'none', 'important');
                    if(loggedInNav) loggedInNav.style.setProperty('display', 'none', 'important');
                    if(loggedOutNav) loggedOutNav.style.setProperty('display', 'block', 'important');
                    if(mainWorkGrid) mainWorkGrid.style.setProperty('display', 'none', 'important');
                    if(vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'block', 'important');
                }
            }
            function handleCopyTabClick(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.innerWidth <= 991.98) {
                    alert("Xin lỗi tính năng này không thể sử dụng trên điện thoại");
                } else {
                    window.location.href = 'copy_local';
                }
            }
           function openSettingsModal(folderId) {
            const album = allAlbums.find(a => String(a.folder_id || a.folderId || a.id) === String(folderId));
            if (!album) return;
        
            const limitVal = album.limit_photos ?? album.limitPhotos ?? 0;
            const downloadVal = album.allow_download ?? album.allowDownload ?? false;
            const commentVal = album.allow_comment ?? album.allowComment ?? false;
            const watermarkEnabledVal = album.watermark_enabled ?? album.watermarkEnabled ?? false;
            const watermarkLogoVal = album.watermark_logo ?? album.watermarkLogo ?? '';
        
            document.getElementById('editFolderId').value = folderId;
            document.getElementById('editLimitPhotos').value = (limitVal && limitVal > 0) ? limitVal : '';
            
            document.getElementById('editAllowDownload').checked = Boolean(downloadVal);
            document.getElementById('editAllowComment').checked = Boolean(commentVal);
            
            const isWatermarkOn = watermarkEnabledVal === true || 
                                String(watermarkEnabledVal).toLowerCase() === 'true' || 
                                watermarkEnabledVal === 1 || 
                                watermarkEnabledVal === '1';
                                
            document.getElementById('editWatermarkEnabled').checked = isWatermarkOn;
            editStoredLogoBase64 = watermarkLogoVal || '';
            
            const preview = document.getElementById('editLogoPreview');
            if (editStoredLogoBase64 && editStoredLogoBase64 !== 'null' && editStoredLogoBase64 !== 'undefined') {
                preview.src = editStoredLogoBase64;
                preview.style.display = 'block';
            } else {
                editStoredLogoBase64 = '';
                preview.src = '';
                preview.style.display = 'none';
            }
            toggleEditWatermarkInput();
            new bootstrap.Modal(document.getElementById('settingsModal')).show();
        }
       async function saveAlbumSettings() {
            const folderId = document.getElementById('editFolderId').value;
            const limitPhotos = parseInt(document.getElementById('editLimitPhotos').value) || 0;
            const download = document.getElementById('editAllowDownload').checked;
            const comment = document.getElementById('editAllowComment').checked;
            const watermarkEnabled = document.getElementById('editWatermarkEnabled').checked; 
            const watermarkLogo = editStoredLogoBase64;
            
            showToast("Đang lưu cấu hình...");
            try {
                const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/update-album-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderId, limitPhotos, download, comment, watermarkEnabled, watermarkLogo })
                });
                const result = await res.json();
                if(result.success) {
                    showToast("Cập nhật thành công!");
                    const targetAlbum = allAlbums.find(a => String(a.folder_id || a.folderId || a.id) === String(folderId));
                    if (targetAlbum) {
                        targetAlbum.limit_photos = limitPhotos;
                        targetAlbum.limitPhotos = limitPhotos;
                        targetAlbum.allow_download = download;
                        targetAlbum.allowDownload = download;
                        targetAlbum.allow_comment = comment;
                        targetAlbum.allowComment = comment;
                        targetAlbum.watermark_enabled = watermarkEnabled;
                        targetAlbum.watermarkEnabled = watermarkEnabled;
                        if(watermarkLogo) {
                            targetAlbum.watermark_logo = watermarkLogo;
                            targetAlbum.watermarkLogo = watermarkLogo;
                        }
                    }
                    sessionStorage.setItem('cache_albums', JSON.stringify(allAlbums));
                    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
                } else {
                    alert("Lưu thất bại!");
                }
            } catch(e) {
                alert("Lỗi kết nối máy chủ!");
            }
        }
        let editStoredLogoBase64 = ''; 

        function toggleEditWatermarkInput() {
            const isChecked = document.getElementById('editWatermarkEnabled').checked;
            document.getElementById('editLogoUploadContainer').style.display = isChecked ? 'block' : 'none';
        }
        function processEditLogoFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.size > 1024 * 1024) {
                alert("Dung lượng file logo quá lớn! Vui lòng chọn ảnh dưới 1MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                editStoredLogoBase64 = e.target.result;
                const preview = document.getElementById('editLogoPreview');
                if (preview) {
                    preview.src = editStoredLogoBase64;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }


        let currentLightboxPhotos = [];
        let currentIndex = 0;
        
        function openClientLightbox(index) {
    currentIndex = index;
    renderLightboxCurrent();
    
    let lightboxEl = document.getElementById('clientLightboxModal');
    let modalInstance = bootstrap.Modal.getInstance(lightboxEl);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(lightboxEl);
    }
    modalInstance.show();
}


        let currentCoverFolderId = '';

async function openDirectCoverModal(folderId, albumName) {
    currentCoverFolderId = folderId;
    document.getElementById('directCoverModalInfo').innerText = `Album: ${albumName}`;
    
    const grid = document.getElementById('directCoverGrid');
    grid.innerHTML = `<div class="text-secondary text-center py-4" style="grid-column: 1 / -1;">Đang tải ảnh từ Google Drive...</div>`;
    
    new bootstrap.Modal(document.getElementById('directCoverModal')).show();

    try {
        const res = await fetch(`https://wsm.congtubaclieu.com.vn/webhook/get-photos?folderId=${folderId}`);
        
        if (!res.ok) {
            throw new Error(`Lỗi máy chủ: ${res.status}`);
        }

        const textData = await res.text();
        if (!textData || textData.trim() === '') {
            throw new Error("Webhook n8n trả về dữ liệu trống (rỗng).");
        }

        const data = JSON.parse(textData);
        const photos = Array.isArray(data) ? data : (data.photos || data.data || []);
        
        grid.innerHTML = '';
        if (photos.length === 0) {
            grid.innerHTML = `<div class="text-secondary text-center py-4" style="grid-column: 1 / -1;">Album chưa có ảnh nào hoặc n8n chưa trả về danh sách ảnh.</div>`;
            return;
        }

        photos.forEach(p => {
            const thumbUrl = `https://drive.google.com/thumbnail?id=${p.id}&sz=w400`;
            const item = document.createElement('div');
            item.style.cssText = `position: relative; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: 0.2s;`;
            item.innerHTML = `<img src="${thumbUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
            
            item.onclick = () => selectThisAsCover(p.id);
            item.onmouseover = () => item.style.borderColor = 'var(--primary)';
            item.onmouseout = () => item.style.borderColor = 'transparent';
        
            grid.appendChild(item);
        });
    } catch (e) {
        console.error("Lỗi tải ảnh:", e);
        grid.innerHTML = `<div class="text-danger text-center py-4" style="grid-column: 1 / -1;">Không thể tải danh sách ảnh (${e.message})</div>`;
    }
}
async function selectThisAsCover(photoId) {
    showToast("Đang cập nhật ảnh bìa mới...");
    try {
        const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/update-album-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                folderId: currentCoverFolderId, 
                coverImageId: photoId 
            })
        });
        const result = await res.json();
        
        if (result.success || res.ok) {
            showToast("Đã đổi ảnh bìa thành công!");
            
            const targetAlbum = allAlbums.find(a => String(a.folder_id || a.folderId || a.id) === String(currentCoverFolderId));
            if (targetAlbum) {
                targetAlbum.cover_image_id = photoId;
                targetAlbum.thumbnailFileId = photoId; 

                const localStudioSlug = localStorage.getItem('admin_studio_slug');
                let rawStudio = localStudioSlug || targetAlbum.studio_slug || targetAlbum.studioSlug || targetAlbum.studio || 'studio';
                const studioSlug = createSlug(rawStudio);
                const folderName = targetAlbum.folderName || targetAlbum.name || 'album';
                const albumSlug = targetAlbum.album_slug || targetAlbum.albumSlug || createSlug(folderName);
                
                // === GỌI NGẨM SANG N8N ĐỂ LÀM NÓNG LẠI CACHE KHI ĐỔI ẢNH BÌA ===
                fetch('https://wsm.congtubaclieu.com.vn/webhook/warmup-cache', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studioSlug: studioSlug, albumSlug: albumSlug })
                }).catch(() => {});
            }
            sessionStorage.setItem('cache_albums', JSON.stringify(allAlbums));
            renderAlbums(allAlbums);
            bootstrap.Modal.getInstance(document.getElementById('directCoverModal')).hide();
        } else {
            alert("Lưu ảnh bìa thất bại!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi lưu ảnh bìa!");
    }
}
        function renderLightboxCurrent() {
            if (currentLightboxPhotos.length === 0) return;
            const p = currentLightboxPhotos[currentIndex];
            const imgUrl = p.url || (p.id ? `https://drive.google.com/thumbnail?id=${p.id}&sz=w1600` : '');
            const imgName = p.name || `Ảnh ${currentIndex + 1}`;
            
            document.getElementById('lightboxMainImage').src = imgUrl;
            document.getElementById('lightboxPhotoName').innerText = `${imgName}  (${currentIndex + 1} / ${currentLightboxPhotos.length})`;
            
            const thumbBar = document.getElementById('lightboxThumbnailsBar');
            if (!thumbBar) return;
            
            thumbBar.innerHTML = '';
            
            currentLightboxPhotos.forEach((item, idx) => {
                const tUrl = item.url || (item.id ? `https://drive.google.com/thumbnail?id=${item.id}&sz=h200` : '');
                const isActive = idx === currentIndex ? 'border: 2px solid var(--primary); transform: scale(1.1);' : 'border: 1px solid rgba(255,255,255,0.2); opacity: 0.6;';
        
                thumbBar.innerHTML += `
                    <img src="${tUrl}" onclick="jumpToLightboxIndex(${idx})" style="width: 55px; height: 55px; object-fit: cover; border-radius: 6px; cursor: pointer; transition: 0.2s; ${isActive}" title="${item.name || ''}">
                `;
            });
        }
        
        function changeLightboxImage(direction) {
    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = currentLightboxPhotos.length - 1;
    } else if (currentIndex >= currentLightboxPhotos.length) {
        currentIndex = 0;
    }
    renderLightboxCurrent();
}

        function toSlug(str) {
    if (!str) return '';
    return str.toString().toLowerCase()
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[đĐ]/g, 'd') 
        .replace(/([^0-9a-z])/g, '') 
        .trim();
}

function jumpToLightboxIndex(idx) {
    currentIndex = idx;
    renderLightboxCurrent();
}

        
        function hideLoadOverlay() {
            const overlay = document.getElementById('loadOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
        async function init() { 
            updateHeaderUI(); 
            if (!document.getElementById('mainWorkGrid') || document.getElementById('mainWorkGrid').innerHTML === '') {
                setTimeout(hideLoadOverlay, 500); 
                return;
            }
            
            const cachedAlbums = sessionStorage.getItem('cache_albums');
            if (cachedAlbums) {
                try {
                    allAlbums = JSON.parse(cachedAlbums);
                    renderAlbums(allAlbums); 
                    hideLoadOverlay(); 
                } catch(err) {
                    console.error("Lỗi đọc cache", err);
                }
            }
        
            try { 
                const res = await fetch(`${PATHS.LIST}?adminEmail=${adminEmail}`); 
                allAlbums = await res.json(); 
                sessionStorage.setItem('cache_albums', JSON.stringify(allAlbums));
                
                renderAlbums(allAlbums); 
                hideLoadOverlay();
            } catch (e) { 
                console.error("Lỗi tải danh sách album ngầm:", e);
                hideLoadOverlay(); 
            } 
        }
        function logoutAdmin() { localStorage.clear(); window.location.href = 'index'; }
        document.addEventListener('DOMContentLoaded', init);
