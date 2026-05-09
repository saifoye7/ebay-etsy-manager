
let currentBinPage = 1;
let filteredBin = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    loadRecycleBin();
    setupBinListeners();
});

function setupBinListeners() {
    document.getElementById('bin-search').addEventListener('input', debounce(applyBinFilters, 300));
    document.getElementById('filter-bin-module').addEventListener('change', applyBinFilters);
}

function loadRecycleBin() {
    filteredBin = DB.getRecycleBin();
    renderRecycleBin();
}

function applyBinFilters() {
    const search = document.getElementById('bin-search').value.toLowerCase();
    const module = document.getElementById('filter-bin-module').value;

    filteredBin = DB.getRecycleBin().filter(item => {
        const data = item.data;
        let searchText = '';
        if (item.module === 'inventory') searchText = `${data.sku} ${data.product_name}`;
        else if (item.module === 'listings') searchText = `${data.title} ${data.sku}`;
        else if (item.module === 'orders') searchText = `${data.order_id} ${data.buyer_name}`;
        else if (item.module === 'returns') searchText = `${data.order_id} ${data.reason}`;

        const matchesSearch = !search || searchText.toLowerCase().includes(search);
        const matchesModule = !module || item.module === module;
        return matchesSearch && matchesModule;
    });

    currentBinPage = 1;
    renderRecycleBin();
}

function renderRecycleBin() {
    const perPage = 10;
    const result = paginate(filteredBin, currentBinPage, perPage);
    const tbody = document.getElementById('recycle-bin-body');

    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Recycle bin is empty</td></tr>';
    } else {
        tbody.innerHTML = result.data.map(item => {
            const icons = {
                'inventory': 'fa-box text-blue-500',
                'listings': 'fa-tag text-green-500',
                'orders': 'fa-shopping-cart text-purple-500',
                'returns': 'fa-undo text-red-500'
            };

            let details = '';
            const data = item.data;
            if (item.module === 'inventory') details = `<strong>${data.sku}</strong> - ${data.product_name}`;
            else if (item.module === 'listings') details = `<strong>#${data.id}</strong> - ${data.title}`;
            else if (item.module === 'orders') details = `<strong>${data.order_id}</strong> - ${data.buyer_name}`;
            else if (item.module === 'returns') details = `<strong>#${data.id}</strong> - ${data.reason}`;

            return `
                <tr class="deleted-item">
                    <td>
                        <div class="flex items-center gap-2">
                            <i class="fas ${icons[item.module] || 'fa-file'}"></i>
                            <span class="text-sm font-medium capitalize">${item.module}</span>
                        </div>
                    </td>
                    <td class="text-sm text-gray-800">${details}</td>
                    <td class="text-sm text-gray-600">${item.deleted_by}</td>
                    <td class="text-sm text-gray-500">${formatDate(item.deleted_at)}</td>
                    <td class="admin-only">
                        <div class="flex gap-2">
                            <button onclick="restoreItem(${item.bin_id})" class="text-green-600 hover:text-green-800 p-1" title="Restore">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button onclick="permanentDeleteItem(${item.bin_id})" class="text-red-600 hover:text-red-800 p-1" title="Delete Permanently">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination('bin-pagination', currentBinPage, result.pages, 'goToBinPage');
}

function goToBinPage(page) {
    currentBinPage = page;
    renderRecycleBin();
}

function restoreItem(binId) {
    if (!checkRole(['admin'])) return;
    if (DB.restoreFromRecycleBin(binId)) {
        showToast('Item restored successfully!', 'success');
        loadRecycleBin();
    } else {
        showToast('Failed to restore item', 'error');
    }
}

function permanentDeleteItem(binId) {
    if (!checkRole(['admin'])) return;
    confirmAction('This action cannot be undone. Delete permanently?', () => {
        DB.permanentDelete(binId);
        showToast('Item permanently deleted', 'warning');
        loadRecycleBin();
    });
}

function emptyRecycleBin() {
    if (!checkRole(['admin'])) return;
    confirmAction('Are you sure you want to empty the entire recycle bin?', () => {
        localStorage.setItem('eem_recycle_bin', JSON.stringify([]));
        logActivity(getCurrentUser()?.id, 'Recycle bin emptied', 'Recycle Bin');
        showToast('Recycle bin emptied', 'warning');
        loadRecycleBin();
    });
}
