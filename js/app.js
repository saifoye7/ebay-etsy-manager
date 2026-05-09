
// ==========================================
// eBay/Etsy Manager - Main App Logic
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Set Active Sidebar Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // User Info in Header
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        const userAvatarEl = document.getElementById('user-avatar');

        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        if (userAvatarEl) userAvatarEl.textContent = user.name.charAt(0).toUpperCase();

        // Role-based UI
        applyRoleBasedUI(user.role);
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Global Search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = globalSearch.value.trim();
                if (term) {
                    window.location.href = `orders.html?search=${encodeURIComponent(term)}`;
                }
            }
        });
    }

    // Check for alerts
    checkAlerts();
});

function applyRoleBasedUI(role) {
    // Hide elements based on role
    if (role === 'viewer') {
        document.querySelectorAll('.admin-only, .manager-only').forEach(el => el.style.display = 'none');
    } else if (role === 'manager') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    // Admin sees everything
}

function checkAlerts() {
    const inventory = DB.getInventory();
    const lowStock = inventory.filter(i => i.total_stock <= i.restock_level);
    const alertBadge = document.getElementById('alert-badge');

    if (alertBadge && lowStock.length > 0) {
        alertBadge.textContent = lowStock.length;
        alertBadge.classList.remove('hidden');
    }
}

function generateOrderId(platform) {
    const prefix = platform === 'eBay' ? 'EB' : 'ET';
    const year = new Date().getFullYear();
    const orders = DB.getOrders().filter(o => o.platform === platform);
    const num = String(orders.length + 1).padStart(3, '0');
    return `${prefix}-${year}-${num}`;
}

function generateSKU() {
    const inventory = DB.getInventory();
    const num = String(inventory.length + 1).padStart(3, '0');
    return `SKU${num}`;
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Confirm Dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Pagination Helper
function paginate(data, page, perPage = 10) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        data: data.slice(start, end),
        total: data.length,
        pages: Math.ceil(data.length / perPage),
        currentPage: page
    };
}

function renderPagination(containerId, currentPage, totalPages, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="flex items-center justify-between px-4 py-3 bg-white border-t">';
    html += '<div class="text-sm text-gray-500">Page ' + currentPage + ' of ' + totalPages + '</div>';
    html += '<div class="flex gap-1">';

    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        html += `<button onclick="${callback}(${i})" class="px-3 py-1 rounded ${active}">${i}</button>`;
    }

    html += '</div></div>';
    container.innerHTML = html;
}
