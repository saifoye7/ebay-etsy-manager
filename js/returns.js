
let currentReturnPage = 1;
let filteredReturns = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    loadReturns();
    updateReturnStats();
    populateOrderSelect();
    setupReturnListeners();
});

function setupReturnListeners() {
    document.getElementById('return-search').addEventListener('input', debounce(applyReturnFilters, 300));
    document.getElementById('filter-return-status').addEventListener('change', applyReturnFilters);
    document.getElementById('return-form').addEventListener('submit', handleReturnSubmit);
    document.getElementById('return-order-id').addEventListener('change', autoFillReturnData);
}

function populateOrderSelect() {
    const select = document.getElementById('return-order-id');
    const orders = DB.getOrders();
    select.innerHTML = '<option value="">Select Order</option>' + 
        orders.map(o => `<option value="${o.order_id}" data-sku="${o.sku}" data-amount="${o.total_amount}">${o.order_id} - ${o.buyer_name} (${o.platform})</option>`).join('');
}

function autoFillReturnData() {
    const orderId = document.getElementById('return-order-id').value;
    const option = document.querySelector(`#return-order-id option[value="${orderId}"]`);
    if (option) {
        document.getElementById('return-sku').value = option.dataset.sku;
        document.getElementById('return-refund').value = option.dataset.amount;
    }
}

function updateReturnStats() {
    const returns = DB.getReturns();
    document.getElementById('total-returns').textContent = returns.length;
    document.getElementById('pending-returns').textContent = returns.filter(r => r.status === 'pending').length;
    const totalRefund = returns.filter(r => r.status === 'approved').reduce((sum, r) => sum + parseFloat(r.refund_amount), 0);
    document.getElementById('refund-total').textContent = formatCurrency(totalRefund);
}

function loadReturns() {
    filteredReturns = DB.getReturns();
    renderReturns();
}

function applyReturnFilters() {
    const search = document.getElementById('return-search').value.toLowerCase();
    const status = document.getElementById('filter-return-status').value;

    filteredReturns = DB.getReturns().filter(ret => {
        const matchesSearch = !search || 
            ret.order_id.toLowerCase().includes(search) ||
            ret.sku.toLowerCase().includes(search) ||
            ret.reason.toLowerCase().includes(search);
        const matchesStatus = !status || ret.status === status;
        return matchesSearch && matchesStatus;
    });

    currentReturnPage = 1;
    renderReturns();
}

function renderReturns() {
    const perPage = 10;
    const result = paginate(filteredReturns, currentReturnPage, perPage);
    const tbody = document.getElementById('returns-table-body');

    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-500">No returns found</td></tr>';
    } else {
        tbody.innerHTML = result.data.map(ret => {
            const statusClass = {
                'pending': 'status-pending',
                'approved': 'status-approved',
                'rejected': 'status-rejected'
            }[ret.status] || 'status-pending';

            return `
                <tr>
                    <td class="font-medium text-gray-800">#${ret.id}</td>
                    <td class="font-mono text-sm text-gray-600">${ret.order_id}</td>
                    <td class="font-mono text-sm text-gray-600">${ret.sku}</td>
                    <td class="text-sm text-gray-800 max-w-xs truncate" title="${ret.reason}">${ret.reason}</td>
                    <td class="font-medium text-gray-800">${formatCurrency(ret.refund_amount)}</td>
                    <td><span class="status-badge ${statusClass}">${ret.status}</span></td>
                    <td class="text-sm text-gray-500">${formatDate(ret.received_date)}</td>
                    <td class="text-sm text-gray-600 max-w-xs truncate" title="${ret.notes || ''}">${ret.notes || '-'}</td>
                    <td class="admin-only">
                        <div class="flex gap-2">
                            <button onclick="editReturn(${ret.id})" class="text-blue-600 hover:text-blue-800 p-1"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteReturn(${ret.id})" class="text-red-600 hover:text-red-800 p-1"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination('returns-pagination', currentReturnPage, result.pages, 'goToReturnPage');
}

function goToReturnPage(page) {
    currentReturnPage = page;
    renderReturns();
}

function handleReturnSubmit(e) {
    e.preventDefault();
    if (!checkRole(['admin', 'manager'])) return;

    const id = document.getElementById('return-id').value;
    const returnData = {
        order_id: document.getElementById('return-order-id').value,
        sku: document.getElementById('return-sku').value,
        reason: document.getElementById('return-reason').value,
        status: document.getElementById('return-status').value,
        refund_amount: parseFloat(document.getElementById('return-refund').value) || 0,
        received_date: document.getElementById('return-received').value,
        notes: document.getElementById('return-notes').value
    };

    if (id) {
        DB.updateReturn(parseInt(id), returnData);
        showToast('Return updated successfully!', 'success');
    } else {
        DB.addReturn(returnData);
        showToast('Return created successfully!', 'success');
    }

    closeModal('return-modal');
    resetReturnForm();
    loadReturns();
    updateReturnStats();
}

function editReturn(id) {
    if (!checkRole(['admin', 'manager'])) return;
    const ret = DB.getReturnById(id);
    if (!ret) return;

    document.getElementById('return-modal-title').textContent = 'Edit Return';
    document.getElementById('return-id').value = ret.id;
    document.getElementById('return-order-id').value = ret.order_id;
    document.getElementById('return-sku').value = ret.sku;
    document.getElementById('return-reason').value = ret.reason;
    document.getElementById('return-status').value = ret.status;
    document.getElementById('return-refund').value = ret.refund_amount;
    document.getElementById('return-received').value = ret.received_date || '';
    document.getElementById('return-notes').value = ret.notes || '';

    openModal('return-modal');
}

function deleteReturn(id) {
    if (!checkRole(['admin'])) return;
    confirmAction('Are you sure you want to delete this return?', () => {
        DB.deleteReturn(id);
        showToast('Return moved to recycle bin', 'warning');
        loadReturns();
        updateReturnStats();
    });
}

function resetReturnForm() {
    document.getElementById('return-form').reset();
    document.getElementById('return-id').value = '';
    document.getElementById('return-modal-title').textContent = 'New Return';
    document.getElementById('return-sku').value = '';
}

function exportReturns() {
    const data = filteredReturns.map(r => ({
        'ID': r.id,
        'Order ID': r.order_id,
        'SKU': r.sku,
        'Reason': r.reason,
        'Refund Amount': r.refund_amount,
        'Status': r.status,
        'Received Date': r.received_date,
        'Notes': r.notes
    }));
    exportToCSV(data, `returns-export-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Returns exported successfully!', 'success');
}
