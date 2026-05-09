
// ==========================================
// eBay/Etsy Manager - Dashboard Logic
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;

    loadDashboardData();
    initCharts();
});

function loadDashboardData() {
    const orders = DB.getOrders();
    const inventory = DB.getInventory();
    const listings = DB.getListings();
    const returns = DB.getReturns();

    // Stat Cards
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const totalProfit = orders.reduce((sum, o) => sum + calculateProfit(o), 0);
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('total-profit').textContent = formatCurrency(totalProfit);
    document.getElementById('pending-orders').textContent = pendingOrders;

    // Update sidebar badge
    const pendingBadge = document.getElementById('pending-orders-badge');
    if (pendingBadge && pendingOrders > 0) {
        pendingBadge.textContent = pendingOrders;
        pendingBadge.classList.remove('hidden');
    }

    // Low Stock Alerts
    const lowStock = inventory.filter(i => i.total_stock <= i.restock_level);
    const lowStockList = document.getElementById('low-stock-list');
    if (lowStockList) {
        if (lowStock.length === 0) {
            lowStockList.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No low stock items</p>';
        } else {
            lowStockList.innerHTML = lowStock.map(item => `
                <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                        <p class="font-semibold text-sm text-gray-800">${item.product_name}</p>
                        <p class="text-xs text-gray-500">SKU: ${item.sku}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-red-600">${item.total_stock}</p>
                        <p class="text-xs text-gray-500">Min: ${item.restock_level}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // Recent Orders
    const recentOrders = orders.slice(-5).reverse();
    const recentTable = document.getElementById('recent-orders-table');
    if (recentTable) {
        recentTable.innerHTML = recentOrders.map(order => {
            const profit = calculateProfit(order);
            const statusClass = {
                'pending': 'status-pending',
                'shipped': 'status-shipped',
                'delivered': 'status-delivered',
                'cancelled': 'status-cancelled',
                'returned': 'status-returned'
            }[order.order_status] || 'status-pending';

            return `
                <tr>
                    <td class="font-medium text-gray-800">${order.order_id}</td>
                    <td><span class="text-xs font-semibold ${order.platform === 'eBay' ? 'text-blue-600' : 'text-orange-600'}">${order.platform}</span></td>
                    <td class="text-sm text-gray-600">${order.buyer_name}</td>
                    <td class="font-medium">${formatCurrency(order.total_amount)}</td>
                    <td><span class="status-badge ${statusClass}">${order.order_status}</span></td>
                    <td class="font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(profit)}</td>
                </tr>
            `;
        }).join('');
    }

    // Activity Logs
    const logs = DB.getActivityLogs().slice(0, 10);
    const activityLog = document.getElementById('activity-log');
    if (activityLog) {
        activityLog.innerHTML = logs.map(log => {
            const user = DB.getUserById(log.user_id);
            const icons = {
                'Orders': 'fa-shopping-cart',
                'Inventory': 'fa-boxes',
                'Listings': 'fa-tags',
                'Returns': 'fa-undo',
                'Users': 'fa-users',
                'Settings': 'fa-cog',
                'System': 'fa-server',
                'Database': 'fa-database',
                'Recycle Bin': 'fa-trash-alt'
            };
            return `
                <div class="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas ${icons[log.module] || 'fa-info'} text-gray-500 text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-800 font-medium truncate">${log.action}</p>
                        <p class="text-xs text-gray-500">${log.module} • ${user ? user.name : 'System'}</p>
                        <p class="text-xs text-gray-400">${formatDate(log.timestamp)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Platform Distribution
    const ebayOrders = orders.filter(o => o.platform === 'eBay').length;
    const etsyOrders = orders.filter(o => o.platform === 'Etsy').length;
    const total = ebayOrders + etsyOrders;
    if (total > 0) {
        document.getElementById('ebay-percent').textContent = Math.round((ebayOrders / total) * 100) + '%';
        document.getElementById('etsy-percent').textContent = Math.round((etsyOrders / total) * 100) + '%';
    }
}

let salesChart, platformChart, profitChart;

function initCharts() {
    const orders = DB.getOrders();

    // Prepare data for charts
    const last7Days = getLast7Days();
    const salesData = last7Days.map(date => {
        return orders.filter(o => o.order_date === date).reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    });
    const profitData = last7Days.map(date => {
        return orders.filter(o => o.order_date === date).reduce((sum, o) => sum + calculateProfit(o), 0);
    });

    const labels = last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales',
                    data: salesData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '$' + value; }
                        }
                    }
                }
            }
        });
    }

    // Platform Chart
    const ebayOrders = orders.filter(o => o.platform === 'eBay').length;
    const etsyOrders = orders.filter(o => o.platform === 'Etsy').length;

    const platformCtx = document.getElementById('platformChart');
    if (platformCtx) {
        platformChart = new Chart(platformCtx, {
            type: 'doughnut',
            data: {
                labels: ['eBay', 'Etsy'],
                datasets: [{
                    data: [ebayOrders, etsyOrders],
                    backgroundColor: ['#3b82f6', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Profit Chart
    const profitCtx = document.getElementById('profitChart');
    if (profitCtx) {
        profitChart = new Chart(profitCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Profit',
                    data: profitData,
                    backgroundColor: profitData.map(v => v >= 0 ? '#10b981' : '#ef4444'),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) { return '$' + value; }
                        }
                    }
                }
            }
        });
    }
}

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function exportDashboardData() {
    const orders = DB.getOrders();
    const data = orders.map(o => ({
        'Order ID': o.order_id,
        'Platform': o.platform,
        'Date': o.order_date,
        'Buyer': o.buyer_name,
        'SKU': o.sku,
        'Quantity': o.quantity,
        'Total Amount': o.total_amount,
        'Platform Fee': o.platform_fee,
        'Shipping': o.shipping_cost,
        'Profit': calculateProfit(o).toFixed(2),
        'Status': o.order_status
    }));
    exportToCSV(data, `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Dashboard report exported successfully!', 'success');
}
