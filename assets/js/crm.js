const PATHS = {
            GET_CONTRACTS: 'https://wsm.congtubaclieu.com.vn/webhook/get-contracts',
            SAVE_CONTRACT: 'https://wsm.congtubaclieu.com.vn/webhook/save-contract',
            SETTLE_CONTRACT: 'https://wsm.congtubaclieu.com.vn/webhook/settle-contract'
        };

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
        
        document.getElementById('userNameDisplay').innerText = name;
        const av = localStorage.getItem('admin_avatar');
        document.getElementById('avatarPlaceholder').innerHTML = av && av !== 'null' ? `<img src="${av}">` : `<i class="fas fa-user-circle" style="font-size:30px; color:var(--primary)"></i>`;
        
        const statusEl = document.getElementById('userStatusDisplay');
        if (statusEl) {
            if (isVIP) {
                statusEl.innerHTML = `<span class="status-tag tag-active">ACTIVE - Hạn: ${new Date(expiry).toLocaleDateString('vi-VN')}</span>`;
                if (mainWorkGrid) mainWorkGrid.style.setProperty('display', 'block', 'important');
                if (vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'none', 'important');
            } else {
                statusEl.innerHTML = `<span class="status-tag ${status === 'new' ? 'tag-new' : 'tag-expired'}">${status === 'new' ? 'MỚI' : 'EXPIRED'}</span>`;
                if (mainWorkGrid) mainWorkGrid.style.setProperty('display', 'none', 'important');
                if (vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'block', 'important');
                document.querySelector('.supreme-title').style.display = 'none';
            }
        }
    } else { 
        if(navLinks) navLinks.style.setProperty('display', 'none', 'important');
        if(loggedInNav) loggedInNav.style.setProperty('display', 'none', 'important');
        if(loggedOutNav) loggedOutNav.style.setProperty('display', 'block', 'important');
        if(mainWorkGrid) mainWorkGrid.style.setProperty('display', 'none', 'important');
        if(vipExpiredBlockNotice) vipExpiredBlockNotice.style.setProperty('display', 'block', 'important');
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

        function logoutAdmin() { 
            localStorage.clear(); 
            window.location.href = 'index'; 
        }

        function showToast(msg) {
            const t = document.getElementById('toastNotice');
            t.innerText = msg;
            t.style.display = 'block';
            setTimeout(() => { t.style.display = 'none'; }, 2500);
        }

        function autoCalculate() {
            const total = parseFloat(document.getElementById('totalAmt').value) || 0;
            const deposit = parseFloat(document.getElementById('depositAmt').value) || 0;
            const extra = parseFloat(document.getElementById('extraFee').value) || 0;
            
            const grandTotal = total + extra;
            const remaining = grandTotal - deposit;
            
            document.getElementById('remainingPreview').innerText = remaining.toLocaleString('vi-VN') + ' VNĐ';

            const statusInput = document.getElementById('paymentStatus');
            if (deposit <= 0) {
                statusInput.value = "Chưa cọc";
            } else if (remaining <= 0) {
                statusInput.value = "Đã tất toán";
            } else {
                statusInput.value = "Đã cọc ";
            }
        }
        let allContractsGlobal = []; 

        async function loadContracts() {
    const studioSlug = localStorage.getItem('admin_studio_slug') || 'studio';
    const adminEmail = localStorage.getItem('admin_email') || '';
    try {
        const res = await fetch(`${PATHS.GET_CONTRACTS}?studio_slug=${encodeURIComponent(studioSlug)}&admin_email=${encodeURIComponent(adminEmail)}`);
        if (!res.ok) {
            throw new Error("Lỗi máy chủ HTTP: " + res.status);
        }

        const textData = await res.text();

        if (!textData || textData.trim() === "") {
            allContractsGlobal = [];
        } else {
            const data = JSON.parse(textData);
            allContractsGlobal = Array.isArray(data) ? data : (data.contracts || []);
        }

        allContractsGlobal.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        
        populateMonthFilter(allContractsGlobal);
        renderTable(allContractsGlobal);

    } catch(e) {
        console.error("Lỗi tải hợp đồng:", e);
        document.getElementById('contractsTableBody').innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Lỗi kết nối lấy dữ liệu từ máy chủ!</td></tr>`;
    }
}
        
        function populateMonthFilter(contracts) {
            const monthSelect = document.getElementById('monthFilter');
            const currentValue = monthSelect.value;
            
            const monthsSet = new Set();
            contracts.forEach(c => {
                if (c.event_date) {
                    const cleanDate = c.event_date.replace('T', ' ');
                    const ym = cleanDate.substring(0, 7); 
                    if (ym.length === 7) monthsSet.add(ym);
                }
            });
        
            let optionsHTML = '<option value="">Tất cả các tháng</option>';
            Array.from(monthsSet).sort().forEach(ym => {
                let parts = ym.split('-');
                optionsHTML += `<option value="${ym}">Tháng ${parts[1]} / ${parts[0]}</option>`;
            });
        
            monthSelect.innerHTML = optionsHTML;
            monthSelect.value = currentValue;
        }
        
        let showHiddenMode = false; 

        function toggleShowHidden() {
            showHiddenMode = !showHiddenMode;
            const btn = document.getElementById('btnToggleHidden');
            if (showHiddenMode) {
                btn.innerHTML = `<i class="fas fa-eye me-1"></i> Thoát xem ẩn`;
                btn.className = "btn btn-sm btn-warning fw-bold text-uppercase";
            } else {
                btn.innerHTML = `<i class="fas fa-eye-slash me-1"></i> Xem ẩn (<span id="hiddenCount">0</span>)`;
                btn.className = "btn btn-sm btn-outline-warning fw-bold text-uppercase";
            }
            filterContracts();
        }

        function renderTable(contracts) {
            const tbody = document.getElementById('contractsTableBody');
            tbody.innerHTML = '';
            let displayedContracts = contracts.filter(c => showHiddenMode ? c.is_hidden === true : c.is_hidden !== true);
            let totalHidden = contracts.filter(c => c.is_hidden === true).length;
            if(document.getElementById('hiddenCount')) {
                document.getElementById('hiddenCount').innerText = totalHidden;
            }
            if (displayedContracts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center text-secondary py-5">Chưa có hợp đồng nào.</td></tr>`;
                return;
            }
            let totalRev = 0;
            let totalDep = 0;
            let totalRem = 0;
            displayedContracts.forEach(c => {
                const total = parseFloat(c.total_amount) || 0;
                const deposit = parseFloat(c.deposit_amount) || 0;
                const extra = parseFloat(c.extra_fee) || 0;
                const grandTotal = total + extra;
                const remaining = grandTotal - deposit;
                totalRev += grandTotal;
                totalDep += deposit;
                if (c.payment_status !== 'Đã tất toán') {
                    totalRem += remaining;
                }
                const formattedDate = c.event_date ? (() => {
                    let cleanStr = c.event_date.replace('T', ' ');
                    let datePart = cleanStr.split(' ')[0]; 
                    let timePart = cleanStr.split(' ')[1];
                    
                    let [year, month, day] = datePart.split('-');
                    let hourMin = timePart ? timePart.substring(0, 5) : '00:00'; 
                    
                    let solarStr = `${day}/${month}/${year} - ${hourMin}`;
                    
                    try {
                        let solarObj = Solar.fromYmd(parseInt(year), parseInt(month), parseInt(day));
                        let lunarObj = solarObj.getLunar();
                        let lD = lunarObj.getDay();
                        let lM = Math.abs(lunarObj.getMonth());
                        let lY = lunarObj.getYear();
                        let isLeap = lunarObj.getMonth() < 0;
                        let leapStr = isLeap ? ' (nhuận)' : '';
                        
                        return `${solarStr}<br><span style="font-size:0.72rem; color: #f0c300; font-weight:700;"><i class="fas fa-moon me-1"></i>Âm: ${lD}/${lM}${leapStr}/${lY}</span>`;
                    } catch(e) {
                        return solarStr;
                    }
                })() : '';
                let actionButtons = '';
                if (c.payment_status !== 'Đã tất toán') {
                    actionButtons += `<button class="btn-settle me-1" onclick="settleContract(${c.id})">Tất toán</button>`;
                }
        
                if (c.is_hidden) {
                    actionButtons += `<button class="btn btn-sm btn-outline-info p-1 px-2 me-1" style="font-size:0.65rem;" onclick="toggleHideContract(${c.id}, false)" title="Bỏ ẩn"><i class="fas fa-eye"></i></button>`;
                } else {
                    actionButtons += `<button class="btn btn-sm btn-outline-secondary p-1 px-2 me-1" style="font-size:0.65rem;" onclick="toggleHideContract(${c.id}, true)" title="Ẩn lịch"><i class="fas fa-eye-slash"></i></button>`;
                }
                actionButtons += `<button class="btn btn-sm btn-outline-info p-1 px-2 me-1" style="font-size:0.65rem;" onclick='openEditModal(${JSON.stringify(c)})' title="Chỉnh sửa thông tin"><i class="fas fa-pen"></i></button>`;
                actionButtons += `<button class="btn btn-sm btn-outline-warning p-1 px-2 me-1" style="font-size:0.65rem;" onclick='printContract(${JSON.stringify(c)})' title="Xuất hợp đồng"><i class="fas fa-file-pdf"></i></button>`;
                actionButtons += `<button class="btn btn-sm btn-outline-danger p-1 px-2" style="font-size:0.65rem;" onclick="deleteContract(${c.id})" title="Xóa vĩnh viễn"><i class="fas fa-trash"></i></button>`;
        
                tbody.innerHTML += `
                    <tr>
                        <td>
                            <div class="fw-bold text-white">${c.customer_name || 'Khách lẻ'}</div>
                            <div class="text-bright-sub"><i class="fas fa-phone-alt me-1 text-primary" style="font-size: 0.7rem;"></i>${c.customer_phone || 'Chưa có SĐT'}</div>
                        </td>
                        <td>
                            <div class="fw-bold text-white">${c.service_package || 'Gói chụp'}</div>
                            <div class="text-bright-sub"><i class="fas fa-map-marker-alt me-1 text-danger" style="font-size: 0.7rem;"></i>${c.event_location || 'Tại studio'}</div>
                        </td>
                        <td>${formattedDate}</td>
                        <td>${grandTotal.toLocaleString('vi-VN')} ₫</td>
                        <td>${deposit.toLocaleString('vi-VN')} ₫</td>
                        <td class="text-warning fw-bold">${remaining > 0 ? remaining.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                        <td>${extra > 0 ? extra.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                        <td><span class="badge ${c.payment_status === 'Đã tất toán' ? 'bg-success' : 'bg-info'} text-dark">${c.payment_status || 'Đã cọc'}</span></td>
                        <td class="text-end text-nowrap">
                            ${actionButtons}
                        </td>
                    </tr>
                `;
            });
        
            document.getElementById('statTotalRevenue').innerText = totalRev.toLocaleString('vi-VN') + ' VNĐ';
            document.getElementById('statTotalDeposit').innerText = totalDep.toLocaleString('vi-VN') + ' VNĐ';
            document.getElementById('statTotalRemaining').innerText = totalRem.toLocaleString('vi-VN') + ' VNĐ';
        }
        
        async function toggleHideContract(id, hideStatus) {
            const currentSlug = localStorage.getItem('admin_studio_slug') || 'studio';
            const currentEmail = localStorage.getItem('admin_email') || '';
            try {
                const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/hide-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, is_hidden: hideStatus, studio_slug: currentSlug,admin_email: currentEmail })
                });
                if(res.ok) {
                    showToast(hideStatus ? "Đã ẩn hợp đồng thành công!" : "Đã khôi phục hợp đồng!");
                    loadContracts();
                } else {
                    alert("Lỗi cập nhật trên máy chủ!");
                }
            } catch(e) {
                alert("Lỗi kết nối máy chủ!");
            }
        }
async function printContract(c) {
    let printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
        alert("Trình duyệt đã chặn cửa sổ popup! Vui lòng cho phép popup để xem hợp đồng.");
        return;
    }
    function formatMoney(amount) {
        let num = parseFloat(amount) || 0;
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Hợp Đồng Dịch Vụ - ${c.customer_name || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Montserrat', sans-serif; color: #111; margin: 0; padding: 40px; background: #f1f5f9; line-height: 1.5; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; background: #fff; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border-radius: 12px; position: relative; min-height: 500px; }    
        #loadingOverlay { position: absolute; inset: 0; background: #ffffff; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; gap: 15px; }
        .spinner { width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #00ebb0; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00ebb0; padding-bottom: 20px; margin-bottom: 25px; }
        .logo-area { display: flex; align-items: center; gap: 15px; }
        .logo-area img { width: 70px; height: 70px; border-radius: 10px; object-fit: contain; background: #f8fafc; border: 1.5px solid #00ebb0; padding: 4px; flex-shrink: 0; }
        .studio-title { font-weight: 900; font-size: 1.1rem; color: #050a14; text-transform: uppercase; }
        .studio-contact { font-size: 0.75rem; color: #555; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; color: #050a14; font-size: 1.3rem; letter-spacing: 1px; }
        .invoice-title p { margin: 3px 0 0; font-size: 0.78rem; color: #666; }
        .section-title { font-weight: 700; font-size: 0.85rem; background: #f8fafc; padding: 6px 10px; border-left: 4px solid #00ebb0; margin: 18px 0 10px; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 8px; }
        .info-item { margin-bottom: 6px; font-size: 0.82rem; }
        .info-item span { font-weight: 600; color: #555; display: block; margin-bottom: 2px; }
        .editable-input { width: 100%; padding: 5px 8px; border: 1px dashed #cbd5e1; border-radius: 5px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; background: #fafafa; color: #111; box-sizing: border-box; }
        .editable-input:focus { border: 1px solid #00ebb0; background: #fff; outline: none; box-shadow: 0 0 5px rgba(0,235,176,0.3); }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: fixed; }
        table th, table td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 0.82rem; vertical-align: middle; }
        table th { background: #050a14; color: #fff; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px; }
        .col-content { width: 55%; }
        .col-price { width: 35%; text-align: right; }
        .col-action { width: 10%; text-align: center; }
        .total-section { margin-top: 15px; float: right; width: 320px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 0.85rem; }
        .total-row.grand { font-weight: 900; font-size: 1.05rem; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 8px 0; margin-top: 4px; color: #050a14; }
        .signatures { display: flex; justify-content: space-between; margin-top: 70px; text-align: center; }
        .sig-box { width: 45%; }
        .sig-box p { margin: 4px 0; font-size: 0.82rem; }
        .sig-space { height: 55px; }
        .notice-bar { background: #00ebb0; color: #000; padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; margin-bottom: 15px; text-align: center; line-height: 1.5; }
        .btn-add-row { background: #10b981; color: #fff; border: none; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; text-transform: uppercase; }
        .btn-del-row { background: #ef4444; color: #fff; border: none; padding: 4px 8px; font-size: 0.7rem; border-radius: 4px; cursor: pointer; }
        .action-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 35px; }
        .action-btn { border: none; padding: 12px 25px; font-weight: 900; border-radius: 8px; cursor: pointer; text-transform: uppercase; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .btn-print { background: #00ebb0; color: #000; }
        .btn-pdf { background: #3b82f6; color: #fff; }
        @media print {
            body { padding: 0; background: #fff; }
            .invoice-box { border: none; box-shadow: none; padding: 0; }
            .no-print { display: none; }
            .editable-input { border: none; background: transparent; padding: 0; font-weight: 600; }
            .btn-del-row { display: none; }
            #loadingOverlay { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div id="loadingOverlay">
            <div class="spinner"></div>
            <div style="font-weight: 800; font-size: 1rem; color: #050a14;">Đang tải thông tin studio từ hệ thống...</div>
            <div style="font-size: 0.8rem; color: #666;">Vui lòng đợi trong giây lát.</div>
        </div>

        <div class="no-print notice-bar">
            💡 Chủ studio có thể chỉnh sửa trực tiếp thông tin, thêm bớt dòng dịch vụ và chọn In hoặc xuất PDF gửi khách!<br>
            ⚠️ Nếu chưa có thông tin studio vui lòng cấu hình ở trang chủ.
        </div>

        <div class="header">
            <div class="logo-area">
                <img id="studioLogoImg" src="" alt="Logo Studio">
                <div>
                    <div class="studio-title" id="studioTitleText">CHONANHNHANH.VN</div>
                    <div class="studio-contact"><i class="fas fa-phone-alt me-1 text-primary"></i> <span id="studioPhoneText">Đang cập nhật</span></div>
                    <div class="studio-contact"><i class="fas fa-map-marker-alt me-1 text-danger"></i> <span id="studioAddressText">Đang cập nhật</span></div>
                </div>
            </div>
            <div class="invoice-title">
                <h2>HỢP ĐỒNG DỊCH VỤ</h2>
                <p>Mã đơn: #${c.id || 'HD-00'}</p>
                <p>Ngày lập: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
        </div>

        <div class="section-title">Thông tin khách hàng</div>
        <div class="grid-2">
            <div>
                <div class="info-item">
                    <span>Họ tên khách hàng:</span>
                    <input type="text" class="editable-input" value="${c.customer_name || ''}">
                </div>
                <div class="info-item" style="margin-top: 8px;">
                    <span>Số điện thoại:</span>
                    <input type="text" class="editable-input" value="${c.customer_phone || ''}">
                </div>
            </div>
            <div>
                <div class="info-item">
                    <span>Email liên hệ:</span>
                    <input type="text" class="editable-input" value="${c.customer_email || ''}">
                </div>
                <div class="info-item" style="margin-top: 8px;">
                    <span>Địa điểm tổ chức:</span>
                    <input type="text" class="editable-input" value="${c.event_location || 'Tại Studio'}">
                </div>
            </div>
        </div>

        <div class="section-title">Chi tiết lịch trình & Sự kiện</div>
        <div class="grid-2">
            <div class="info-item">
                <span>Thời gian diễn ra:</span>
                <input type="text" class="editable-input" value="${c.event_date ? c.event_date.replace('T', ' ').substring(0, 16) : ''}">
            </div>
            <div class="info-item">
                <span>Gói dịch vụ đăng ký:</span>
                <input type="text" class="editable-input" value="${c.service_package || 'Gói tiêu chuẩn'}">
            </div>
        </div>
        <div class="info-item" style="margin-top: 8px;">
            <span>Ghi chú / Yêu cầu riêng:</span>
            <input type="text" class="editable-input" value="${c.note || 'Không có ghi chú phát sinh.'}">
        </div>

        <div class="section-title">
            <span>Bảng kê chi phí & Thanh toán</span>
            <button class="btn-add-row no-print" id="btnAddRow"><i class="fas fa-plus me-1"></i> Thêm dòng</button>
        </div>
        <table id="priceTable">
            <thead>
                <tr>
                    <th class="col-content">Nội dung dịch vụ</th>
                    <th class="col-price">Thành tiền (VNĐ)</th>
                    <th class="col-action no-print">Xóa</th>
                </tr>
            </thead>
            <tbody id="priceTableBody">
                <tr>
                    <td class="col-content"><input type="text" class="editable-input" value="Gói dịch vụ chính: ${c.service_package || 'Gói tiêu chuẩn'}"></td>
                    <td class="col-price"><input type="text" class="editable-input price-input" style="text-align: right;" value="${Math.round(parseFloat(c.total_amount) || 0)}"></td>
                    <td class="col-action no-print"><button class="btn-del-row" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
                </tr>
                <tr>
                    <td class="col-content"><input type="text" class="editable-input" value="Chi phí phát sinh thêm (Trang phục, phụ phí...)"></td>
                    <td class="col-price"><input type="text" class="editable-input price-input" style="text-align: right;" value="${Math.round(parseFloat(c.extra_fee) || 0)}"></td>
                    <td class="col-action no-print"><button class="btn-del-row" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row"><span>Tổng giá trị:</span> <strong id="grandTotalDisplay">0 ₫</strong></div>
            <div class="total-row" style="color: #059669;"><span>Đã đặt cọc:</span> <strong id="depositDisplay">- 0 ₫</strong></div>
            <div class="total-row grand"><span>CÒN LẠI:</span> <span id="remainingDisplay" style="color: #d97706;">0 ₫</span></div>
        </div>
        <div style="clear: both;"></div>

        <div class="signatures">
            <div class="sig-box">
                <p><strong>ĐẠI DIỆN STUDIO</strong></p>
                <p style="font-size: 0.72rem; color: #666;">(Ký và ghi rõ họ tên)</p>
                <div class="sig-space"></div>
                <p><strong id="sigStudioName">CHONANHNHANH.VN</strong></p>
            </div>
            <div class="sig-box">
                <p><strong>ĐẠI DIỆN KHÁCH HÀNG</strong></p>
                <p style="font-size: 0.72rem; color: #666;">(Ký và ghi rõ họ tên)</p>
                <div class="sig-space"></div>
                <p><strong>${c.customer_name || ''}</strong></p>
            </div>
        </div>

        <div class="action-buttons no-print">
            <button class="action-btn btn-print" onclick="window.print()"><i class="fas fa-print me-2"></i> In Hợp Đồng</button>
            <button class="action-btn btn-pdf" onclick="window.print()"><i class="fas fa-file-pdf me-2"></i> Xuất PDF Gửi Khách</button>
        </div>
    </div>
</body>
</html>`);
    const studioSlug = localStorage.getItem('admin_studio_slug') || 'studio';
    let sName = "CHONANHNHANH.VN";
    let sPhone = "0879029170";
    let sAddress = "Bạc Liêu";
    let sLogo = localStorage.getItem('admin_avatar') || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=200&q=80';

    try {
        const adminEmail = localStorage.getItem('admin_email') || '';
        const res = await fetch(`https://wsm.congtubaclieu.com.vn/webhook/get-studio-info?studio_slug=${studioSlug}&admin_email=${encodeURIComponent(adminEmail)}`);
        let data = await res.json();
        let info = Array.isArray(data) ? data[0] : (data.data || data);
        
        if (info) {
            sName = info.studio_name || sName;
            sPhone = info.studio_phone || sPhone;
            sAddress = info.studio_address || sAddress;
            sLogo = info.watermark_logo || info.logo || sLogo;
        }
    } catch (e) {
        console.log("Lỗi tải thông tin studio từ n8n:", e);
    }
    let doc = printWindow.document;
    doc.getElementById('studioTitleText').innerText = sName;
    doc.getElementById('studioPhoneText').innerText = sPhone;
    doc.getElementById('studioAddressText').innerText = sAddress;
    doc.getElementById('studioLogoImg').src = sLogo;
    doc.getElementById('sigStudioName').innerText = sName;
    doc.getElementById('loadingOverlay').style.display = 'none';

    const depositAmt = Math.round(parseFloat(c.deposit_amount) || 0);
    doc.getElementById('depositDisplay').innerText = '- ' + formatMoney(depositAmt) + ' ₫';
    function updateCalc() {
        let inputs = doc.querySelectorAll('.price-input');
        let sum = 0;
        inputs.forEach(inp => {
            let val = parseFloat(inp.value.replace(/[^0-9.-]+/g,"")) || 0;
            sum += val;
        });
        let remaining = sum - depositAmt;
        doc.getElementById('grandTotalDisplay').innerText = formatMoney(sum) + ' ₫';
        doc.getElementById('remainingDisplay').innerText = (remaining > 0 ? formatMoney(remaining) : '0') + ' ₫';
    }
    doc.getElementById('btnAddRow').onclick = function() {
        let tbody = doc.getElementById('priceTableBody');
        let tr = doc.createElement('tr');
        tr.innerHTML = `
            <td class="col-content"><input type="text" class="editable-input" value="Nội dung dịch vụ mới..."></td>
            <td class="col-price"><input type="text" class="editable-input price-input" style="text-align: right;" value="0"></td>
            <td class="col-action no-print"><button class="btn-del-row" onclick="this.closest('tr').remove();">X</button></td>
        `;
        tbody.appendChild(tr);
        tr.querySelector('.price-input').oninput = updateCalc;
        updateCalc();
    };
    doc.querySelectorAll('.price-input').forEach(inp => {
        inp.oninput = updateCalc;
    });

    updateCalc();
    printWindow.document.close();
}
        async function deleteContract(id) {
            if(!confirm("⚠️ Thao tác này sẽ xóa vĩnh viễn hợp đồng khỏi hệ thống và không thể hoàn tác.\n\nℹ️ Lưu ý: Lịch trên Google Calendar của bạn sẽ được giữ nguyên vì lý do bảo mật.\n\nBạn có chắc chắn muốn tiếp tục xóa?")) return;
            const currentSlug = localStorage.getItem('admin_studio_slug') || 'studio';
            const currentEmail = localStorage.getItem('admin_email') || '';
            try {
                const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/delete-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: id, 
                        studio_slug: currentSlug,
                        admin_email: currentEmail
                    })
                    
                });
                if(res.ok) {
                    showToast("Đã xóa vĩnh viễn hợp đồng!");
                    loadContracts();
                } else {
                    alert("Lỗi xóa trên máy chủ!");
                }
            } catch(e) {
                alert("Lỗi kết nối máy chủ!");
            }
        }
        
            function filterContracts() {
                const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
                const selectedMonth = document.getElementById('monthFilter').value; 
            
                let filtered = allContractsGlobal.filter(c => {
                    const name = (c.customer_name || '').toLowerCase();
                    const phone = (c.customer_phone || '').toLowerCase();
                    const dateStr = (c.event_date || '').toLowerCase();
                    const packageStr = (c.service_package || '').toLowerCase();
                    const matchKeyword = name.includes(keyword) || phone.includes(keyword) || dateStr.includes(keyword) || packageStr.includes(keyword);
                    let matchMonth = true;
                    if (selectedMonth && c.event_date) {
                        const cleanDate = c.event_date.replace('T', ' ');
                        matchMonth = cleanDate.startsWith(selectedMonth);
                    }
            
                    return matchKeyword && matchMonth;
                });
            
                renderTable(filtered);
            }
            function openEditModal(c) {
                document.getElementById('editContractId').value = c.id || '';
                document.getElementById('editCustName').value = c.customer_name || '';
                document.getElementById('editCustPhone').value = c.customer_phone || '';
                document.getElementById('editCustEmail').value = c.customer_email || '';
                document.getElementById('editServicePkg').value = c.service_package || '';
                document.getElementById('editEventLocation').value = c.event_location || '';
                document.getElementById('editTotalAmt').value = Math.round(parseFloat(c.total_amount) || 0);
                document.getElementById('editDepositAmt').value = Math.round(parseFloat(c.deposit_amount) || 0);
                document.getElementById('editExtraFee').value = Math.round(parseFloat(c.extra_fee) || 0);
                document.getElementById('editEventNote').value = c.note || '';
                
                if (c.event_date) {
                    let cleanDt = c.event_date.replace(' ', 'T').substring(0, 16);
                    document.getElementById('editEventDate').value = cleanDt;
                }
                document.getElementById('editIsLunarEvent').checked = false;
                toggleEditEventDateInputMode();
                autoCalculateEdit();
                let editModal = new bootstrap.Modal(document.getElementById('editContractModal'), {
                    backdrop: 'static'
                });
                editModal.show();
            }

        function autoCalculateEdit() {
            const total = parseFloat(document.getElementById('editTotalAmt').value) || 0;
            const deposit = parseFloat(document.getElementById('editDepositAmt').value) || 0;
            const extra = parseFloat(document.getElementById('editExtraFee').value) || 0;
            
            const grandTotal = total + extra;
            const remaining = grandTotal - deposit;
            
            document.getElementById('editRemainingPreview').innerText = remaining.toLocaleString('vi-VN') + ' VNĐ';
        
            const statusInput = document.getElementById('editPaymentStatus');
            if (deposit <= 0) {
                statusInput.value = "Chưa cọc";
            } else if (remaining <= 0) {
                statusInput.value = "Đã tất toán";
            } else {
                statusInput.value = "Đã cọc ";
            }
        }
    
        function toggleEditEventDateInputMode() {
            const isLunar = document.getElementById('editIsLunarEvent').checked;
            const noteEl = document.getElementById('editEventDateNotes');
            noteEl.innerHTML = isLunar ? `🌙 Nhập ngày Âm lịch, hệ thống sẽ tự quy đổi sang Dương.` : `📅 Ngày Dương lịch chuẩn cho sự kiện.`;
            previewEditLunarSolarEventDate();
        }

        function previewEditLunarSolarEventDate() {
            const val = document.getElementById('editEventDate').value;
            const noteEl = document.getElementById('editEventDateNotes');
            const isLunar = document.getElementById('editIsLunarEvent').checked;
            if (!val) return;
            try {
                let parts = val.split('T');
                let dateParts = parts[0].split('-');
                let y = parseInt(dateParts[0]), m = parseInt(dateParts[1]), d = parseInt(dateParts[2]);
                let timePart = parts[1] || '00:00';
        
                if (isLunar) {
                    let lunarObj = Lunar.fromYmd(y, m, d);
                    let solarObj = lunarObj.getSolar();
                    let sY = solarObj.getYear();
                    let sM = String(solarObj.getMonth()).padStart(2, '0');
                    let sD = String(solarObj.getDay()).padStart(2, '0');
                    noteEl.innerHTML = `✅ ÂL: <b>${d}/${m}/${y}</b> ➔ Dương lịch: <span class="text-success fw-bold">${sD}/${sM}/${sY} ${timePart}</span>`;
                } else {
                    let solarObj = Solar.fromYmd(y, m, d);
                    let lunarObj = solarObj.getLunar();
                    noteEl.innerHTML = `🌙 DL: <b>${d}/${m}/${y}</b> ➔ Âm lịch: <span class="text-warning fw-bold">Ngày ${lunarObj.getDay()} Tháng ${Math.abs(lunarObj.getMonth())} Năm ${lunarObj.getYear()}</span>`;
                }
            } catch (e) { console.error(e); }
        }
       async function updateContract() {
    let rawDateVal = document.getElementById('editEventDate').value;
    const isLunar = document.getElementById('editIsLunarEvent').checked;
    let finalEventDate = rawDateVal;
    let lunarDateStr = "";

    if (rawDateVal) {
        try {
            let parts = rawDateVal.split('T');
            let dateParts = parts[0].split('-');
            let y = parseInt(dateParts[0]), m = parseInt(dateParts[1]), d = parseInt(dateParts[2]);
            let timePart = parts[1] || '00:00';

            if (isLunar) {
                let lunarObj = Lunar.fromYmd(y, m, d);
                let solarObj = lunarObj.getSolar();
                finalEventDate = `${solarObj.getYear()}-${String(solarObj.getMonth()).padStart(2, '0')}-${String(solarObj.getDay()).padStart(2, '0')}T${timePart}`;
                lunarDateStr = `${d}/${m}/${y}`;
            } else {
                let solarObj = Solar.fromYmd(y, m, d);
                let lunarObj = solarObj.getLunar();
                lunarDateStr = `${lunarObj.getDay()}/${Math.abs(lunarObj.getMonth())}/${lunarObj.getYear()}`;
            }
        } catch (e) { console.error(e); }
    }

    const data = {
        id: document.getElementById('editContractId').value,
        studio_slug: localStorage.getItem('admin_studio_slug') || 'studio',
        admin_email: localStorage.getItem('admin_email') || '',
        customer_name: document.getElementById('editCustName').value,
        customer_phone: document.getElementById('editCustPhone').value,
        customer_email: document.getElementById('editCustEmail').value,
        service_package: document.getElementById('editServicePkg').value,
        event_date: finalEventDate,
        lunar_date: lunarDateStr,
        event_location: document.getElementById('editEventLocation').value,
        total_amount: document.getElementById('editTotalAmt').value,
        deposit_amount: document.getElementById('editDepositAmt').value,
        extra_fee: document.getElementById('editExtraFee').value,
        payment_status: document.getElementById('editPaymentStatus').value,
        note: document.getElementById('editEventNote').value
    };

    if(!data.customer_name || !data.event_date) {
        return alert('Vui lòng nhập Tên khách hàng và Ngày giờ sự kiện!');
    }

    showToast("Đang cập nhật hợp đồng...");

    try {
        const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/update-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if(res.ok) {
            showToast("Đã cập nhật hợp đồng thành công!");

            let editModalEl = bootstrap.Modal.getInstance(document.getElementById('editContractModal'));
            if(editModalEl) editModalEl.hide();
            await loadContracts();
            if (currentCalendarView === 'grid') {
                renderModalCalendar(modalCurrentYear, modalCurrentMonth);
            } else {
                renderModalAgendaList(modalCurrentYear, modalCurrentMonth);
            }
        } else {
            alert('Lỗi cập nhật trên máy chủ!');
        }
    } catch(e) {
        console.error(e);
        alert('Lỗi kết nối webhook n8n!');
    }
}
        async function settleContract(contractId) {
            if(!confirm("Xác nhận khách đã thanh toán toàn bộ phần còn lại (bao gồm tổng tiền và chi phí phát sinh) để tất toán hợp đồng?")) return;
            const currentSlug = localStorage.getItem('admin_studio_slug') || 'studio';
            const currentEmail = localStorage.getItem('admin_email') || '';
            showToast("Đang cập nhật tất toán...");
            try {
                const res = await fetch(PATHS.SETTLE_CONTRACT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: contractId, studio_slug: currentSlug,
                admin_email: currentEmail })
                });
                if(res.ok) {
                    showToast("Đã tất toán thành công!");
                    setTimeout(() => loadContracts(), 1000);
                } else {
                    alert("Lỗi cập nhật trên máy chủ!");
                }
            } catch(e) {
                alert("Lỗi kết nối máy chủ!");
            }
        }

       async function saveContract() {
    const adminEmail = localStorage.getItem('admin_email') || "";
    const syncChecked = document.getElementById('syncGoogleCalendar').checked;
    
    let rawDateVal = document.getElementById('eventDate').value;
    const isLunar = document.getElementById('isLunarEvent').checked;
    let finalEventDate = rawDateVal;
    let lunarDateStr = "";

    if (rawDateVal) {
        try {
            let parts = rawDateVal.split('T');
            let dateParts = parts[0].split('-');
            let y = parseInt(dateParts[0]), m = parseInt(dateParts[1]), d = parseInt(dateParts[2]);
            let timePart = parts[1] || '00:00';

            if (isLunar) {
                let lunarObj = Lunar.fromYmd(y, m, d);
                let solarObj = lunarObj.getSolar();
                let sY = solarObj.getYear();
                let sM = String(solarObj.getMonth()).padStart(2, '0');
                let sD = String(solarObj.getDay()).padStart(2, '0');
                finalEventDate = `${sY}-${sM}-${sD}T${timePart}`;
                let isLeap = lunarObj.getMonth() < 0;
                lunarDateStr = `${d}/${m}${isLeap ? 'n' : ''}/${y}`;
            } else {
                let solarObj = Solar.fromYmd(y, m, d);
                let lunarObj = solarObj.getLunar();
                let lD = lunarObj.getDay();
                let lM = Math.abs(lunarObj.getMonth());
                let lY = lunarObj.getYear();
                let isLeap = lunarObj.getMonth() < 0;
                lunarDateStr = `${lD}/${lM}${isLeap ? 'n' : ''}/${lY}`;
            }
        } catch (e) {
            console.error("Lỗi quy đổi ngày:", e);
        }
    }

    const data = {
        studio_email: adminEmail,
        studio_slug: localStorage.getItem('admin_studio_slug') || 'studio',
        customer_name: document.getElementById('custName').value,
        customer_phone: document.getElementById('custPhone').value,
        customer_email: document.getElementById('custEmail').value,
        service_package: document.getElementById('servicePkg').value,
        event_date: finalEventDate,
        lunar_date: lunarDateStr, 
        event_location: document.getElementById('eventLocation').value,
        total_amount: document.getElementById('totalAmt').value,
        deposit_amount: document.getElementById('depositAmt').value,
        extra_fee: document.getElementById('extraFee').value,
        payment_status: document.getElementById('paymentStatus').value,
        note: document.getElementById('eventNote').value,
        sync_calendar: syncChecked
    };
    
    if(!data.customer_name || !data.event_date) {
        return alert('Vui lòng nhập Tên khách hàng và Ngày giờ sự kiện!');
    }
    
    showToast("Đang lưu hợp đồng và đồng bộ lịch ngầm...");
    
    try {
        const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/save-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (result.status === 'token_expired' || result.error === 'invalid_grant') {
            if (confirm("Quyền kết nối Google Calendar của bạn đã hết hạn.\n\nVui Lòng kết nối lại tài khoản để đồng bộ.")) {
                requestCalendarPermission();
            }
            return;
        }
        
        if(res.ok) {
            showToast("Đã lưu hợp đồng và đồng bộ thành công!");
            let addModalEl = bootstrap.Modal.getInstance(document.getElementById('addContractModal'));
            if(addModalEl) addModalEl.hide();
            document.getElementById('contractForm').reset();
            await loadContracts();
            if (currentCalendarView === 'grid') {
                renderModalCalendar(modalCurrentYear, modalCurrentMonth);
            } else {
                renderModalAgendaList(modalCurrentYear, modalCurrentMonth);
            }
        } else {
            alert('Lỗi lưu hợp đồng trên máy chủ!');
        }
    } catch(e) {
        console.error(e);
        alert('Lỗi kết nối webhook!');
    }
}
        document.addEventListener('DOMContentLoaded', () => {
            updateHeaderUI();
            loadContracts();
        });
        function connectGoogleCalendar() {
            const clientId = '549408699768-0hhl7oc0sjhr1c9tsa1fo9ahv5apuecc.apps.googleusercontent.com';
            const redirectUri = 'https://wsm.congtubaclieu.com.vn/webhook/save-calendar-token'; 
            const scope = 'https://www.googleapis.com/auth/calendar.events';
            
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
            window.location.href = authUrl;
        }
        function requestCalendarPermission() {
            const clientId = '549408699768-0hhl7oc0sjhr1c9tsa1fo9ahv5apuecc.apps.googleusercontent.com';
            const redirectUri = 'https://wsm.congtubaclieu.com.vn/webhook/save-calendar-token'; 
            const scope = 'https://www.googleapis.com/auth/calendar.events';
            const currentEmail = localStorage.getItem('admin_email') || '';
            
            let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
            
            if (currentEmail) {
                authUrl += `&login_hint=${encodeURIComponent(currentEmail)}`;
                authUrl += `&state=${encodeURIComponent(currentEmail)}`;
            }
            
            window.location.href = authUrl;
        }
       let modalToday = new Date();
    let modalCurrentYear = modalToday.getFullYear();
    let modalCurrentMonth = modalToday.getMonth();

    function initModalCalendarYears() {
        const yearSel = document.getElementById('modalSelectYear');
        if (yearSel && yearSel.children.length === 0) {
            for (let y = 2020; y <= 2050; y++) {
                let opt = document.createElement('option');
                opt.value = y;
                opt.innerText = y;
                opt.className = "bg-dark text-primary";
                if (y === modalCurrentYear) opt.selected = true;
                yearSel.appendChild(opt);
            }
        }
        const monthSel = document.getElementById('modalSelectMonth');
        if (monthSel) monthSel.value = modalCurrentMonth;
        if (yearSel) yearSel.value = modalCurrentYear;
    }
    let currentCalendarView = 'grid'; 

function switchCalendarView(viewType) {
    currentCalendarView = viewType;
    const gridContainer = document.getElementById('calendarGridViewContainer');
    const listContainer = document.getElementById('calendarListViewContainer');
    
    if (viewType === 'grid') {
        gridContainer.style.display = 'block';
        listContainer.style.display = 'none';
        renderModalCalendar(modalCurrentYear, modalCurrentMonth);
    } else {
        gridContainer.style.display = 'none';
        listContainer.style.display = 'block';
        renderModalAgendaList(modalCurrentYear, modalCurrentMonth);
    }
}


function renderModalCalendar(year, month) {
    initModalCalendarYears();
    const container = document.getElementById('modalCalendarDaysContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const monthSel = document.getElementById('modalSelectMonth');
    const yearSel = document.getElementById('modalSelectYear');
    if (monthSel) monthSel.value = month;
    if (yearSel) yearSel.value = year;

    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    let totalDays = new Date(year, month + 1, 0).getDate();
    let prevTotalDays = new Date(year, month, 0).getDate();

    for (let i = firstDayIndex; i > 0; i--) {
        let d = prevTotalDays - i + 1;
        let prevM = month === 0 ? 11 : month - 1;
        let prevY = month === 0 ? year - 1 : year;
        container.appendChild(createModalDayCell(d, prevM + 1, prevY, true, false));
    }

    for (let d = 1; d <= totalDays; d++) {
        let isToday = (d === modalToday.getDate() && month === modalToday.getMonth() && year === modalToday.getFullYear());
        container.appendChild(createModalDayCell(d, month + 1, year, false, isToday));
    }

    if (currentCalendarView === 'list') {
        renderModalAgendaList(year, month);
    }
}
function handleDayCellClick(year, month, day) {
    let formattedMonth = String(month).padStart(2, '0');
    let formattedDay = String(day).padStart(2, '0');
    let defaultTimeInput = `${year}-${formattedMonth}-${formattedDay}T08:00`;
    
    document.getElementById('eventDate').value = defaultTimeInput;
    document.getElementById('isLunarEvent').checked = false;
    if (typeof toggleEventDateInputMode === 'function') toggleEventDateInputMode();
    let addModal = new bootstrap.Modal(document.getElementById('addContractModal'), {
        backdrop: 'static' 
    });
    addModal.show();
}
function createModalDayCell(day, month, year, isOtherMonth = false, isToday = false) {
    const cell = document.createElement('div');
    
    let lunarDay = 1, lunarMonth = 1, isLeap = false;
    try {
        let solar = Solar.fromYmd(year, month, day);
        let lunar = solar.getLunar();
        lunarDay = lunar.getDay();
        lunarMonth = Math.abs(lunar.getMonth());
        isLeap = lunar.getMonth() < 0;
    } catch (e) {}

    let isFirstLunarDay = (lunarDay === 1);
    let bgStyle = isToday ? 'rgba(234, 179, 8, 0.22)' : 'rgba(255,255,255,0.02)';
    let borderStyle = isToday ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.05)';

    cell.style.cssText = `background: ${bgStyle}; border: ${borderStyle}; border-radius: 10px; height: 115px; padding: 6px; display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; opacity: ${isOtherMonth ? '0.3' : '1'}; cursor: pointer; overflow: hidden; transition: background 0.2s;`;

    cell.onmouseover = () => { if(!isToday) cell.style.background = 'rgba(0,235,176,0.05)'; };
    cell.onmouseout = () => { if(!isToday) cell.style.background = bgStyle; };

    cell.onclick = (e) => {
        if (e.target.closest('.customer-event-badge')) return;
        handleDayCellClick(year, month, day);
    };

    let formattedLunarDay = String(lunarDay).padStart(2, '0');
    let formattedLunarMonth = String(lunarMonth).padStart(2, '0') + (isLeap ? 'n' : '');
    let lunarText = isFirstLunarDay ? `01/${formattedLunarMonth}` : `${formattedLunarDay}/${formattedLunarMonth}`;

    let dateStrFormatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let matchingContracts = (allContractsGlobal || []).filter(c => {
        if (!c.event_date) return false;
        return c.event_date.startsWith(dateStrFormatted) && !c.is_hidden;
    });

    let eventsHtml = '';
    matchingContracts.forEach(c => {
        let timePart = '00:00';
        if (c.event_date.includes('T')) {
            timePart = c.event_date.split('T')[1].substring(0, 5);
        } else if (c.event_date.includes(' ')) {
            timePart = c.event_date.split(' ')[1].substring(0, 5);
        }
        let displayName = c.customer_name || 'Khách';

        eventsHtml += `
            <div class="customer-event-badge" onclick='event.stopPropagation(); openEditModal(${JSON.stringify(c)})' 
                 style="background: rgba(0, 235, 176, 0.25); border-left: 2.5px solid var(--primary); padding: 2px 6px; margin-bottom: 3px; border-radius: 4px; font-size: 0.68rem; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background 0.2s;"
                 onmouseover="this.style.background='rgba(0, 235, 176, 0.5)'" onmouseout="this.style.background='rgba(0, 235, 176, 0.25)'"
                 title="${c.customer_name} - ${timePart} (${c.service_package || ''})">
                <span class="text-warning fw-bold">${timePart}</span> <span class="text-white fw-bold">${displayName}</span>
            </div>
        `;
    });

    cell.innerHTML = `
        <div class="d-flex justify-content-between align-items-center w-100 mb-1">
            <span style="font-size: 0.95rem; font-weight: 900; color: #fff;">${day}</span>
            <span style="font-size: 0.78rem; color: ${isFirstLunarDay ? '#f0c300' : 'var(--primary)'}; font-weight: 800;">${lunarText}</span>
        </div>
        <div class="flex-grow-1 overflow-y-auto" style="max-height: 75px;">
            ${eventsHtml}
        </div>
    `;

    return cell;
}
function renderModalAgendaList(year, month) {
    const listBody = document.getElementById('modalCalendarAgendaBody');
    if (!listBody) return;
    listBody.innerHTML = '';

    let monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    let monthContracts = (allContractsGlobal || []).filter(c => {
        return c.event_date && c.event_date.startsWith(monthPrefix) && !c.is_hidden;
    });

    monthContracts.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    if (monthContracts.length === 0) {
        listBody.innerHTML = `<div class="text-center text-secondary py-5">Không có lịch trình nào trong tháng ${month + 1}/${year}.</div>`;
        return;
    }

    monthContracts.forEach(c => {
        let cleanDt = c.event_date.replace('T', ' ');
        let datePart = cleanDt.split(' ')[0];
        let timePart = cleanDt.split(' ')[1] ? cleanDt.split(' ')[1].substring(0, 5) : '00:00';
        let [y, m, d] = datePart.split('-');

        let total = parseFloat(c.total_amount) || 0;
        let deposit = parseFloat(c.deposit_amount) || 0;
        let extra = parseFloat(c.extra_fee) || 0;
        let grandTotal = total + extra;
        let remaining = grandTotal - deposit;

        let lunarStr = "";
        try {
            let solarObj = Solar.fromYmd(parseInt(y), parseInt(m), parseInt(d));
            let lunarObj = solarObj.getLunar();
            let lD = lunarObj.getDay();
            let lM = Math.abs(lunarObj.getMonth());
            let lY = lunarObj.getYear();
            let isLeap = lunarObj.getMonth() < 0;
            lunarStr = `Âm lịch: Ngày ${lD} Tháng ${lM}${isLeap ? ' (nhuận)' : ''} năm ${lY}`;
        } catch (e) {
            lunarStr = "Âm lịch: Đang cập nhật";
        }

        listBody.innerHTML += `
            <div class="p-3 mb-2 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" 
                 style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);">
                <div class="d-flex align-items-center gap-3">
                    <div class="text-center px-3 py-2 rounded-3" style="background: rgba(0,235,176,0.15); border: 1px solid var(--primary); min-width: 75px;">
                        <div style="font-size: 0.65rem; color: #cbd5e1; font-weight: bold; text-transform: uppercase;">Ngày</div>
                        <div style="font-size: 1.15rem; color: #fff; font-weight: 900; line-height: 1.1;">${d}/${m}</div>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge px-2 py-1 fw-bold text-black" style="background-color: var(--primary); font-size: 0.75rem;"><i class="fas fa-clock me-1"></i> ${timePart}</span>
                            <h6 class="m-0 text-white fw-bold" style="font-size: 0.95rem;">${c.customer_name || 'Khách lẻ'}</h6>
                            <span class="text-info fw-bold small" style="font-size: 0.8rem;"><i class="fas fa-phone-alt me-1"></i>${c.customer_phone || 'Chưa có SĐT'}</span>
                        </div>
                        <div class="text-light small mb-1" style="font-size: 0.78rem;">
                            <i class="fas fa-box me-1 text-info"></i> <b class="text-white">${c.service_package || 'Gói chụp'}</b> | 
                            <i class="fas fa-map-marker-alt me-1 text-danger ms-1"></i> ${c.event_location || 'Tại studio'}
                        </div>
                        <div class="d-flex align-items-center gap-3 flex-wrap">
                            <div style="font-size: 0.75rem; color: #f0c300; font-weight: 700;">
                                <i class="fas fa-moon me-1"></i> ${lunarStr}
                            </div>
                            <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700;">
                                💰 Tổng: ${grandTotal.toLocaleString('vi-VN')}đ | Cọc: ${deposit.toLocaleString('vi-VN')}đ | Còn lại: <span class="text-warning">${remaining.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-info fw-bold text-uppercase px-3 py-1.5" style="font-size: 0.75rem;" onclick='openEditModal(${JSON.stringify(c)})'>
                        <i class="fas fa-eye me-1"></i> Chi Tiết
                    </button>
                </div>
            </div>
        `;
    });
}

function changeMonthModal(direction) {
    modalCurrentMonth += direction;
    if (modalCurrentMonth > 11) {
        modalCurrentMonth = 0;
        modalCurrentYear++;
    } else if (modalCurrentMonth < 0) {
        modalCurrentMonth = 11;
        modalCurrentYear--;
    }
    renderModalCalendar(modalCurrentYear, modalCurrentMonth);
}

function jumpToMonthModal() {
    modalCurrentMonth = parseInt(document.getElementById('modalSelectMonth').value);
    modalCurrentYear = parseInt(document.getElementById('modalSelectYear').value);
    renderModalCalendar(modalCurrentYear, modalCurrentMonth);
}

function jumpToToday() {
    modalCurrentYear = modalToday.getFullYear();
    modalCurrentMonth = modalToday.getMonth();
    renderModalCalendar(modalCurrentYear, modalCurrentMonth);
}

function performModalConversion() {
    const isLunarToSolar = document.getElementById('typeLunarToSolar').checked;
    const resultEl = document.getElementById('modalConversionResult');
    const dateInput = document.getElementById('modalConvertDate');
    if(!resultEl || !dateInput || !dateInput.value) return;

    try {
        let parts = dateInput.value.split('-');
        let y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
        
        if (!isLunarToSolar) {
            let solarObj = Solar.fromYmd(y, m, d);
            let lunarObj = solarObj.getLunar();
            let lD = lunarObj.getDay();
            let lM = Math.abs(lunarObj.getMonth());
            let lY = lunarObj.getYear();
            let isLeap = lunarObj.getMonth() < 0;
            resultEl.innerHTML = `<span class="text-warning">➔ ÂL: ${lD}/${lM}${isLeap ? 'n' : ''}/${lY}</span>`;
        } else {
            let lunarObj = Lunar.fromYmd(y, m, d);
            let solarObj = lunarObj.getSolar();
            let sD = String(solarObj.getDay()).padStart(2, '0');
            let sM = String(solarObj.getMonth()).padStart(2, '0');
            let sY = solarObj.getYear();
            resultEl.innerHTML = `<span class="text-info">➔ DL: ${sD}/${sM}/${sY}</span>`;
        }
    } catch(e) {
        resultEl.innerHTML = `<span class="text-danger">Lỗi định dạng!</span>`;
    }
}
    function changeMonthModal(direction) {
        modalCurrentMonth += direction;
        if (modalCurrentMonth > 11) {
            modalCurrentMonth = 0;
            modalCurrentYear++;
        } else if (modalCurrentMonth < 0) {
            modalCurrentMonth = 11;
            modalCurrentYear--;
        }
        const yearSel = document.getElementById('modalSelectYear');
        if (yearSel) {
            yearSel.value = modalCurrentYear;
        }
        renderModalCalendar(modalCurrentYear, modalCurrentMonth);
    }

    function jumpToMonthModal() {
        modalCurrentMonth = parseInt(document.getElementById('modalSelectMonth').value);
        modalCurrentYear = parseInt(document.getElementById('modalSelectYear').value);
        renderModalCalendar(modalCurrentYear, modalCurrentMonth);
    }

    function jumpToToday() {
        modalCurrentYear = modalToday.getFullYear();
        modalCurrentMonth = modalToday.getMonth();
        renderModalCalendar(modalCurrentYear, modalCurrentMonth);
    }

  function switchConvertMode() {
    performModalConversion();
}
function redirectToGoogleAuth() {
    const clientId = '549408699768-0hhl7oc0sjhr1c9tsa1fo9ahv5apuecc.apps.googleusercontent.com';
    const redirectUri = 'https://wsm.congtubaclieu.com.vn/webhook/save-calendar-token'; 
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const currentEmail = localStorage.getItem('admin_email') || '';
    
    let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    
    if (currentEmail) {
        authUrl += `&login_hint=${encodeURIComponent(currentEmail)}`;
        authUrl += `&state=${encodeURIComponent(currentEmail)}`;
    }
    
    window.location.href = authUrl;
}
async function triggerSyncAndCheckToken() {
    const adminEmail = localStorage.getItem('admin_email') || "";
    if (!adminEmail) {
        alert("Không tìm thấy thông tin email quản trị viên!");
        return;
    }

    showToast("Đang kiểm tra và đồng bộ lịch ngầm...");

    try {
        const res = await fetch('https://wsm.congtubaclieu.com.vn/webhook/save-calendar-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studio_email: adminEmail })
        });
        
        const result = await res.json();

        if (result.status === 'token_expired' || result.error === 'invalid_grant') {
            if (confirm("Quyền kết nối Google Calendar của bạn đã hết hạn.\n\nVui Lòng kết nối lại tài khoản để đồng bộ.")) {
                redirectToGoogleAuth();
            }
            return;
        }

        if (res.ok && result.status === 'success') {
            showToast("Đồng bộ toàn bộ lịch thành công!");
            setTimeout(() => {
                if (typeof loadContracts === 'function') loadContracts();
            }, 1000);
        } else {
            alert(result.message || "Lỗi đồng bộ lịch từ máy chủ!");
        }

    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi thực hiện đồng bộ lịch!");
    }
}
    function performModalConversion() {
    const isLunarToSolar = document.getElementById('typeLunarToSolar').checked;
    const resultEl = document.getElementById('modalConversionResult');
    const dateInput = document.getElementById('modalConvertDate');
    if(!resultEl || !dateInput || !dateInput.value) return;

    try {
        let parts = dateInput.value.split('-');
        let y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
        
        if (!isLunarToSolar) {
            let solarObj = Solar.fromYmd(y, m, d);
            let lunarObj = solarObj.getLunar();
            let lD = lunarObj.getDay();
            let lM = Math.abs(lunarObj.getMonth());
            let lY = lunarObj.getYear();
            let isLeap = lunarObj.getMonth() < 0;
            resultEl.innerHTML = `<span class="text-warning">➔ ÂL: ${lD}/${lM}${isLeap ? 'n' : ''}/${lY}</span>`;
        } else {
            let lunarObj = Lunar.fromYmd(y, m, d);
            let solarObj = lunarObj.getSolar();
            let sD = String(solarObj.getDay()).padStart(2, '0');
            let sM = String(solarObj.getMonth()).padStart(2, '0');
            let sY = solarObj.getYear();
            resultEl.innerHTML = `<span class="text-info">➔ DL: ${sD}/${sM}/${sY}</span>`;
        }
    } catch(e) {
        resultEl.innerHTML = `<span class="text-danger">Lỗi định dạng!</span>`;
    }
}

   document.addEventListener('DOMContentLoaded', () => {
    initModalCalendarYears();
    const modalEl = document.getElementById('lunarCalendarModal');
    if (modalEl) {
        modalEl.addEventListener('show.bs.modal', () => {
            modalCurrentYear = modalToday.getFullYear();
            modalCurrentMonth = modalToday.getMonth();
            document.getElementById('viewModeGrid').checked = true;
            switchCalendarView('grid');
            renderModalCalendar(modalCurrentYear, modalCurrentMonth);

            let year = modalToday.getFullYear();
            let month = String(modalToday.getMonth() + 1).padStart(2, '0');
            let day = String(modalToday.getDate()).padStart(2, '0');
            let todayLocalStr = `${year}-${month}-${day}`;

            let convInput = document.getElementById('modalConvertDate');
            if (convInput) {
                convInput.value = todayLocalStr;
                performModalConversion();
            }
        });
    }
});
        document.addEventListener('DOMContentLoaded', () => {
    const syncCheckbox = document.getElementById('syncGoogleCalendar');
    const syncStatusText = document.getElementById('syncStatusText');
    const saveBtn = document.getElementById('saveContractBtn');

    if (syncCheckbox) {
        function updateSyncUI() {
            if (syncCheckbox.checked) {
                if (syncStatusText) {
                    syncStatusText.style.display = 'block';
                    syncStatusText.innerHTML = "⚡ Trạng thái: Sẽ tự động đồng bộ lịch khi lưu.";
                }
                if (saveBtn) {
                    saveBtn.innerText = "LƯU HỢP ĐỒNG & ĐỒNG BỘ LỊCH GOOGLE CALENDAR";
                }
            } else {
                if (syncStatusText) {
                    syncStatusText.style.display = 'none';
                    syncStatusText.innerHTML = "";
                }
                if (saveBtn) {
                    saveBtn.innerText = "LƯU HỢP ĐỒNG";
                }
            }
        }
        updateSyncUI();
        syncCheckbox.addEventListener('change', updateSyncUI);
    }
});
    function toggleEventDateInputMode() {
        const isLunar = document.getElementById('isLunarEvent').checked;
        const noteEl = document.getElementById('eventDateNotes');
        if (isLunar) {
            noteEl.innerHTML = `🌙 Bạn đang chọn chế độ <b>nhập ngày Âm lịch</b>. Hệ thống sẽ tự động quy đổi sang ngày Dương để lưu lịch trình.`;
        } else {
            noteEl.innerHTML = `📅 Ngày Dương lịch chuẩn cho sự kiện.`;
        }
        previewLunarSolarEventDate();
    }
    function previewLunarSolarEventDate() {
        const val = document.getElementById('eventDate').value;
        const noteEl = document.getElementById('eventDateNotes');
        const isLunar = document.getElementById('isLunarEvent').checked;

        if (!val) return;

        try {
            let parts = val.split('T');
            let dateParts = parts[0].split('-');
            let y = parseInt(dateParts[0]), m = parseInt(dateParts[1]), d = parseInt(dateParts[2]);
            let timePart = parts[1] || '00:00';

            if (isLunar) {
                let lunarObj = Lunar.fromYmd(y, m, d);
                let solarObj = lunarObj.getSolar();
                
                let sY = solarObj.getYear();
                let sM = String(solarObj.getMonth()).padStart(2, '0');
                let sD = String(solarObj.getDay()).padStart(2, '0');

                noteEl.innerHTML = `✅ ÂL: <b>${d}/${m}/${y}</b> ➔ Tương ứng Dương lịch: <span class="text-success fw-bold">${sD}/${sM}/${sY} ${timePart}</span> (Sẽ lưu ngày này vào hệ thống)`;
            } else {
                let solarObj = Solar.fromYmd(y, m, d);
                let lunarObj = solarObj.getLunar();
                
                let lD = lunarObj.getDay();
                let lM = Math.abs(lunarObj.getMonth());
                let lY = lunarObj.getYear();
                let isLeap = lunarObj.getMonth() < 0;
                let leapStr = isLeap ? ' (nhuận)' : '';

                noteEl.innerHTML = `🌙 DL: <b>${d}/${m}/${y}</b> ➔ Tương ứng Âm lịch: <span class="text-warning fw-bold">Ngày ${lD} Tháng ${lM}${leapStr} Năm ${lY}</span>`;
            }
        } catch (e) {
            console.error(e);
        }
    }
        function fixModalBackdrop() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}
        document.addEventListener('DOMContentLoaded', () => {
    const calendarModalEl = document.getElementById('lunarCalendarModal');
    if (calendarModalEl) {
        calendarModalEl.addEventListener('show.bs.modal', () => {
            fixModalBackdrop();
        });
    }
});
