
// ==========================================
// eBay/Etsy Manager - Orders Page Logic
// ==========================================

let currentPage = 1;
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;

    loadOrders();
    populateSKUSelect();
    setupEventListeners();

    // Check for new order action from dashboard
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
        openModal('order-modal');
    }
    if (urlParams.get('search')) {
        document.getElementById('order-search').value = urlParams.get('search');
        applyFilters();
    }
});

function setupEventListeners() {
    // Search
    document.getElementById('order-search').addEventListener('input', debounce(applyFilters, 300));

    // Filters
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-platform').addEventListener('change', applyFilters);
    document.getElementById('filter-date-from').addEventListener('change', applyFilters);
    document.getElementById('filter-date-to').addEventListener('change', applyFilters);

    // Form
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmit);

    // Profit calculation on input
    ['order-sku', 'order-quantity', 'order-price', 'platform-fee', 'shipping-cost'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEstimatedProfit);
    });
}

function populateSKUSelect() {
    const select = document.getElementById('order-sku');
    const inventory = DB.getInventory();
    select.innerHTML = '<option value="">Select Product</option>' + 
        inventory.map(item => `<option value="${item.sku}" data-cost="${item.cost_per_unit}">${item.sku} - ${item.product_name}</option>`).join('');
}

function calculateEstimatedProfit() {
    const sku = document.getElementById('order-sku').value;
    const qty = parseInt(document.getElementById('order-quantity').value) || 0;
    const price = parseFloat(document.getElementById('order-price').value) || 0;
    const fee = parseFloat(document.getElementById('platform-fee').value) || 0;
    const shipping = parseFloat(document.getElementById('shipping-cost').value) || 0;

    const inventory = DB.getInventoryBySku(sku);
    const costPerUnit = inventory ? inventory.cost_per_unit : 0;
    const totalCost = costPerUnit * qty;
    const totalAmount = price * qty;
    const profit = totalAmount - fee - shipping - totalCost;

    const profitEl = document.getElementById('estimated-profit');
    profitEl.textContent = formatCurrency(profit);
    profitEl.className = `text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`;
}

function loadOrders() {
    filteredOrders = DB.getOrders();
    renderOrders();
}

function applyFilters() {
    const search = document.getElementById('order-search').value.toLowerCase();
    const status = document.getElementById('filter-status').value;
    const platform = document.getElementById('filter-platform').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;

    filteredOrders = DB.getOrders().filter(order => {
        const matchesSearch = !search || 
            order.order_id.toLowerCase().includes(search) ||
            order.buyer_name.toLowerCase().includes(search) ||
            order.buyer_username.toLowerCase().includes(search) ||
            order.sku.toLowerCase().includes(search);

        const matchesStatus = !status || order.order_status === status;
        const matchesPlatform = !platform || order.platform === platform;
        const matchesDateFrom = !dateFrom || order.order_date >= dateFrom;
        const matchesDateTo = !dateTo || order.order_date <= dateTo;

        return matchesSearch && matchesStatus && matchesPlatform && matchesDateFrom && matchesDateTo;
    });

    currentPage = 1;
    renderOrders();
}

function renderOrders() {
    const perPage = 10;
    const result = paginate(filteredOrders, currentPage, perPage);
    const tbody = document.getElementById('orders-table-body');

    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-gray-500">No orders found</td></tr>';
    } else {
        tbody.innerHTML = result.data.map(order => {
            const profit = calculateProfit(order);
            const statusClass = {
                'pending': 'status-pending',
                'shipped': 'status-shipped',
                'delivered': 'status-delivered',
                'cancelled': 'status-cancelled',
                'returned': 'status-returned'
            }[order.order_status] || 'status-pending';

            const paymentClass = {
                'paid': 'text-green-600',
                'pending': 'text-yellow-600',
                'refunded': 'text-red-600'
            }[order.payment_status] || 'text-gray-600';

            return `
                <tr>
                    <td class="font-medium text-gray-800">${order.order_id}</td>
                    <td><span class="text-xs font-bold ${order.platform === 'eBay' ? 'text-blue-600' : 'text-orange-600'}">${order.platform}</span></td>
                    <td class="text-sm text-gray-600">${formatDate(order.order_date)}</td>
                    <td>
                        <div class="text-sm font-medium text-gray-800">${order.buyer_name}</div>
                        <div class="text-xs text-gray-500">@${order.buyer_username}</div>
                    </td>
                    <td class="text-sm font-mono text-gray-600">${order.sku}</td>
                    <td class="text-sm text-gray-600">${order.quantity}</td>
                    <td class="font-medium text-gray-800">${formatCurrency(order.total_amount)}</td>
                    <td class="font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(profit)}</td>
                    <td><span class="status-badge ${statusClass}">${order.order_status}</span></td>
                    <td class="text-sm font-medium ${paymentClass}">${order.payment_status}</td>
                    <td class="admin-only">
                        <div class="flex gap-2">
                            <button onclick="editOrder(${order.id})" class="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteOrder(${order.id})" class="text-red-600 hover:text-red-800 p-1" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination('orders-pagination', currentPage, result.pages, 'goToPage');
}

function goToPage(page) {
    currentPage = page;
    renderOrders();
}

function handleOrderSubmit(e) {
    e.preventDefault();

    if (!checkRole(['admin', 'manager'])) return;

    const id = document.getElementById('order-id').value;
    const platform = document.getElementById('order-platform').value;
    const orderData = {
        order_id: id ? DB.getOrderById(parseInt(id)).order_id : generateOrderId(platform),
        platform: platform,
        order_date: document.getElementById('order-date').value,
        buyer_name: document.getElementById('buyer-name').value,
        buyer_username: document.getElementById('buyer-username').value,
        sku: document.getElementById('order-sku').value,
        quantity: parseInt(document.getElementById('order-quantity').value),
        price_per_unit: parseFloat(document.getElementById('order-price').value),
        total_amount: parseFloat(document.getElementById('order-price').value) * parseInt(document.getElementById('order-quantity').value),
        platform_fee: parseFloat(document.getElementById('platform-fee').value),
        shipping_cost: parseFloat(document.getElementById('shipping-cost').value),
        payment_status: document.getElementById('payment-status').value,
        order_status: document.getElementById('order-status').value,
        tracking_number: document.getElementById('tracking-number').value,
        dispatch_deadline: document.getElementById('dispatch-deadline').value,
        delivery_date: ''
    };

    if (id) {
        DB.updateOrder(parseInt(id), orderData);
        showToast('Order updated successfully!', 'success');
    } else {
        DB.addOrder(orderData);
        showToast('Order created successfully!', 'success');
    }

    closeModal('order-modal');
    resetOrderForm();
    loadOrders();
}

function editOrder(id) {
    if (!checkRole(['admin', 'manager'])) return;

    const order = DB.getOrderById(id);
    if (!order) return;

    document.getElementById('modal-title').textContent = 'Edit Order';
    document.getElementById('order-id').value = order.id;
    document.getElementById('order-platform').value = order.platform;
    document.getElementById('order-date').value = order.order_date;
    document.getElementById('buyer-name').value = order.buyer_name;
    document.getElementById('buyer-username').value = order.buyer_username;
    document.getElementById('order-sku').value = order.sku;
    document.getElementById('order-quantity').value = order.quantity;
    document.getElementById('order-price').value = order.price_per_unit;
    document.getElementById('platform-fee').value = order.platform_fee;
    document.getElementById('shipping-cost').value = order.shipping_cost;
    document.getElementById('order-status').value = order.order_status;
    document.getElementById('payment-status').value = order.payment_status;
    document.getElementById('tracking-number').value = order.tracking_number || '';
    document.getElementById('dispatch-deadline').value = order.dispatch_deadline;

    calculateEstimatedProfit();
    openModal('order-modal');
}

function deleteOrder(id) {
    if (!checkRole(['admin'])) return;

    confirmAction('Are you sure you want to delete this order?', () => {
        DB.deleteOrder(id);
        showToast('Order moved to recycle bin', 'warning');
        loadOrders();
    });
}

function resetOrderForm() {
    document.getElementById('order-form').reset();
    document.getElementById('order-id').value = '';
    document.getElementById('modal-title').textContent = 'New Order';
    document.getElementById('estimated-profit').textContent = '$0.00';
    document.getElementById('estimated-profit').className = 'text-lg font-bold text-gray-800';
}

function exportOrders() {
    const data = filteredOrders.map(o => ({
        'Order ID': o.order_id,
        'Platform': o.platform,
        'Date': o.order_date,
        'Buyer': o.buyer_name,
        'Username': o.buyer_username,
        'SKU': o.sku,
        'Quantity': o.quantity,
        'Price/Unit': o.price_per_unit,
        'Total': o.total_amount,
        'Platform Fee': o.platform_fee,
        'Shipping': o.shipping_cost,
        'Profit': calculateProfit(o).toFixed(2),
        'Payment': o.payment_status,
        'Status': o.order_status,
        'Tracking': o.tracking_number
    }));
    exportToCSV(data, `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Orders exported successfully!', 'success');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
