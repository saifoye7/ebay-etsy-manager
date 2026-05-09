
let currentInventoryPage = 1;
let filteredInventory = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    loadInventory();
    updateStats();
    setupInventoryListeners();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') openModal('inventory-modal');
});

function setupInventoryListeners() {
    document.getElementById('inventory-search').addEventListener('input', debounce(applyInventoryFilters, 300));
    document.getElementById('filter-stock-status').addEventListener('change', applyInventoryFilters);
    document.getElementById('inventory-form').addEventListener('submit', handleInventorySubmit);
}

function updateStats() {
    const inventory = DB.getInventory();
    document.getElementById('total-products').textContent = inventory.length;
    const lowStock = inventory.filter(i => i.total_stock <= i.restock_level);
    document.getElementById('low-stock-count').textContent = lowStock.length;
    const available = inventory.reduce((sum, i) => sum + (i.total_stock - i.reserved_stock), 0);
    document.getElementById('available-stock').textContent = available;
}

function loadInventory() {
    filteredInventory = DB.getInventory();
    renderInventory();
}

function applyInventoryFilters() {
    const search = document.getElementById('inventory-search').value.toLowerCase();
    const stockStatus = document.getElementById('filter-stock-status').value;

    filteredInventory = DB.getInventory().filter(item => {
        const matchesSearch = !search || 
            item.sku.toLowerCase().includes(search) ||
            item.product_name.toLowerCase().includes(search) ||
            item.supplier_name.toLowerCase().includes(search);
        const matchesStatus = !stockStatus || 
            (stockStatus === 'low' ? item.total_stock <= item.restock_level : item.total_stock > item.restock_level);
        return matchesSearch && matchesStatus;
    });

    currentInventoryPage = 1;
    renderInventory();
}

function renderInventory() {
    const perPage = 10;
    const result = paginate(filteredInventory, currentInventoryPage, perPage);
    const tbody = document.getElementById('inventory-table-body');

    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-gray-500">No products found</td></tr>';
    } else {
        tbody.innerHTML = result.data.map(item => {
            const available = item.total_stock - item.reserved_stock;
            const isLowStock = item.total_stock <= item.restock_level;
            const rowClass = isLowStock ? 'low-stock-row' : '';

            return `
                <tr class="${rowClass}">
                    <td class="font-mono font-medium text-gray-800">${item.sku}</td>
                    <td class="text-sm text-gray-800">${item.product_name}</td>
                    <td class="font-bold text-gray-800">${item.total_stock}</td>
                    <td class="text-sm text-gray-600">${item.reserved_stock}</td>
                    <td class="font-medium ${available <= 0 ? 'text-red-600' : 'text-green-600'}">${available}</td>
                    <td class="text-sm text-gray-600">${formatCurrency(item.cost_per_unit)}</td>
                    <td class="text-sm text-gray-600">${item.supplier_name || '-'}</td>
                    <td class="text-sm text-gray-600">${item.restock_level}</td>
                    <td class="text-sm text-gray-500">${formatDate(item.last_restocked)}</td>
                    <td class="admin-only">
                        <div class="flex gap-2">
                            <button onclick="editInventory('${item.sku}')" class="text-blue-600 hover:text-blue-800 p-1"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteInventory('${item.sku}')" class="text-red-600 hover:text-red-800 p-1"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination('inventory-pagination', currentInventoryPage, result.pages, 'goToInventoryPage');
}

function goToInventoryPage(page) {
    currentInventoryPage = page;
    renderInventory();
}

function handleInventorySubmit(e) {
    e.preventDefault();
    if (!checkRole(['admin', 'manager'])) return;

    const sku = document.getElementById('inventory-sku').value.trim().toUpperCase();
    const existingSku = document.getElementById('inventory-sku-hidden').value;

    const itemData = {
        sku: sku,
        product_name: document.getElementById('inventory-name').value,
        total_stock: parseInt(document.getElementById('inventory-total').value) || 0,
        reserved_stock: parseInt(document.getElementById('inventory-reserved').value) || 0,
        cost_per_unit: parseFloat(document.getElementById('inventory-cost').value) || 0,
        supplier_name: document.getElementById('inventory-supplier').value,
        restock_level: parseInt(document.getElementById('inventory-restock').value) || 0,
        last_restocked: document.getElementById('inventory-restocked').value || new Date().toISOString().split('T')[0]
    };

    if (existingSku) {
        DB.updateInventory(existingSku, itemData);
        showToast('Product updated successfully!', 'success');
    } else {
        if (DB.getInventoryBySku(sku)) {
            showToast('SKU already exists!', 'error');
            return;
        }
        DB.addInventory(itemData);
        showToast('Product added successfully!', 'success');
    }

    closeModal('inventory-modal');
    resetInventoryForm();
    loadInventory();
    updateStats();
    populateSKUSelect();
}

function editInventory(sku) {
    if (!checkRole(['admin', 'manager'])) return;
    const item = DB.getInventoryBySku(sku);
    if (!item) return;

    document.getElementById('inventory-modal-title').textContent = 'Edit Product';
    document.getElementById('inventory-sku-hidden').value = item.sku;
    document.getElementById('inventory-sku').value = item.sku;
    document.getElementById('inventory-name').value = item.product_name;
    document.getElementById('inventory-total').value = item.total_stock;
    document.getElementById('inventory-reserved').value = item.reserved_stock;
    document.getElementById('inventory-cost').value = item.cost_per_unit;
    document.getElementById('inventory-supplier').value = item.supplier_name;
    document.getElementById('inventory-restock').value = item.restock_level;
    document.getElementById('inventory-restocked').value = item.last_restocked;

    openModal('inventory-modal');
}

function deleteInventory(sku) {
    if (!checkRole(['admin'])) return;
    confirmAction('Are you sure you want to delete this product?', () => {
        DB.deleteInventory(sku);
        showToast('Product moved to recycle bin', 'warning');
        loadInventory();
        updateStats();
        populateSKUSelect();
    });
}

function resetInventoryForm() {
    document.getElementById('inventory-form').reset();
    document.getElementById('inventory-sku-hidden').value = '';
    document.getElementById('inventory-modal-title').textContent = 'Add Product';
}

function exportInventory() {
    const data = filteredInventory.map(i => ({
        'SKU': i.sku,
        'Product Name': i.product_name,
        'Total Stock': i.total_stock,
        'Reserved': i.reserved_stock,
        'Available': i.total_stock - i.reserved_stock,
        'Cost/Unit': i.cost_per_unit,
        'Supplier': i.supplier_name,
        'Restock Level': i.restock_level,
        'Last Restocked': i.last_restocked
    }));
    exportToCSV(data, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Inventory exported successfully!', 'success');
}
