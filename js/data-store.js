
// ==========================================
// eBay/Etsy Manager - Data Store (Simulated PostgreSQL)
// ==========================================

const DB_KEYS = {
    USERS: 'eem_users',
    INVENTORY: 'eem_inventory',
    LISTINGS: 'eem_listings',
    ORDERS: 'eem_orders',
    RETURNS: 'eem_returns',
    ACTIVITY_LOGS: 'eem_activity_logs',
    RECYCLE_BIN: 'eem_recycle_bin',
    SETTINGS: 'eem_settings',
    CURRENT_USER: 'eem_current_user'
};

// Initialize Database with Sample Data
function initDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        // Default Users
        const users = [
            { id: 1, name: 'Admin User', email: 'admin@manager.com', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
            { id: 2, name: 'Manager User', email: 'manager@manager.com', password: 'manager123', role: 'manager', created_at: new Date().toISOString() },
            { id: 3, name: 'Viewer User', email: 'viewer@manager.com', password: 'viewer123', role: 'viewer', created_at: new Date().toISOString() }
        ];
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }

    if (!localStorage.getItem(DB_KEYS.INVENTORY)) {
        const inventory = [
            { sku: 'SKU001', product_name: 'Wireless Headphones', total_stock: 150, reserved_stock: 25, cost_per_unit: 15.50, supplier_name: 'TechCorp', restock_level: 30, last_restocked: '2026-04-15' },
            { sku: 'SKU002', product_name: 'Phone Case iPhone 15', total_stock: 300, reserved_stock: 45, cost_per_unit: 3.20, supplier_name: 'CaseWorld', restock_level: 50, last_restocked: '2026-04-20' },
            { sku: 'SKU003', product_name: 'USB-C Cable 2m', total_stock: 12, reserved_stock: 5, cost_per_unit: 2.10, supplier_name: 'CablePro', restock_level: 20, last_restocked: '2026-03-10' },
            { sku: 'SKU004', product_name: 'Bluetooth Speaker', total_stock: 80, reserved_stock: 12, cost_per_unit: 22.00, supplier_name: 'AudioMax', restock_level: 15, last_restocked: '2026-04-25' },
            { sku: 'SKU005', product_name: 'Laptop Stand Aluminum', total_stock: 45, reserved_stock: 8, cost_per_unit: 18.75, supplier_name: 'ErgoTech', restock_level: 10, last_restocked: '2026-04-28' }
        ];
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
    }

    if (!localStorage.getItem(DB_KEYS.LISTINGS)) {
        const listings = [
            { id: 1, sku: 'SKU001', platform: 'eBay', title: 'Premium Wireless Headphones - Noise Cancelling', category: 'Electronics', status: 'active', price: 45.99, cost_price: 15.50, quantity_available: 125, listing_url: 'https://ebay.com/itm/123', keywords: 'headphones, wireless, bluetooth', created_at: '2026-04-01' },
            { id: 2, sku: 'SKU001', platform: 'Etsy', title: 'Handcrafted Wireless Headphones', category: 'Electronics', status: 'active', price: 49.99, cost_price: 15.50, quantity_available: 125, listing_url: 'https://etsy.com/listing/456', keywords: 'handmade, headphones, gift', created_at: '2026-04-05' },
            { id: 3, sku: 'SKU002', platform: 'eBay', title: 'iPhone 15 Pro Max Case - Clear', category: 'Mobile Accessories', status: 'active', price: 12.99, cost_price: 3.20, quantity_available: 255, listing_url: 'https://ebay.com/itm/789', keywords: 'iphone, case, clear', created_at: '2026-04-10' },
            { id: 4, sku: 'SKU003', platform: 'eBay', title: 'Fast Charge USB-C Cable 2M', category: 'Cables', status: 'active', price: 8.99, cost_price: 2.10, quantity_available: 7, listing_url: 'https://ebay.com/itm/101', keywords: 'usb-c, cable, fast charge', created_at: '2026-03-15' },
            { id: 5, sku: 'SKU004', platform: 'Etsy', title: 'Vintage Style Bluetooth Speaker', category: 'Audio', status: 'inactive', price: 55.00, cost_price: 22.00, quantity_available: 68, listing_url: 'https://etsy.com/listing/112', keywords: 'vintage, speaker, bluetooth', created_at: '2026-04-20' }
        ];
        localStorage.setItem(DB_KEYS.LISTINGS, JSON.stringify(listings));
    }

    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
        const orders = [
            { id: 1, order_id: 'EB-2026-001', platform: 'eBay', order_date: '2026-05-01', buyer_name: 'John Smith', buyer_username: 'johnsmith123', sku: 'SKU001', quantity: 2, price_per_unit: 45.99, total_amount: 91.98, platform_fee: 9.20, shipping_cost: 5.99, payment_status: 'paid', order_status: 'shipped', tracking_number: '1Z999AA10123456784', dispatch_deadline: '2026-05-04', delivery_date: '2026-05-06', created_at: '2026-05-01' },
            { id: 2, order_id: 'ET-2026-002', platform: 'Etsy', order_date: '2026-05-02', buyer_name: 'Sarah Johnson', buyer_username: 'sarahj_crafts', sku: 'SKU002', quantity: 3, price_per_unit: 12.99, total_amount: 38.97, platform_fee: 3.90, shipping_cost: 4.50, payment_status: 'paid', order_status: 'pending', tracking_number: '', dispatch_deadline: '2026-05-07', delivery_date: '', created_at: '2026-05-02' },
            { id: 3, order_id: 'EB-2026-003', platform: 'eBay', order_date: '2026-05-03', buyer_name: 'Mike Brown', buyer_username: 'mbrown88', sku: 'SKU003', quantity: 1, price_per_unit: 8.99, total_amount: 8.99, platform_fee: 0.90, shipping_cost: 3.99, payment_status: 'pending', order_status: 'pending', tracking_number: '', dispatch_deadline: '2026-05-08', delivery_date: '', created_at: '2026-05-03' },
            { id: 4, order_id: 'ET-2026-004', platform: 'Etsy', order_date: '2026-05-04', buyer_name: 'Emily Davis', buyer_username: 'emilyd_designs', sku: 'SKU001', quantity: 1, price_per_unit: 49.99, total_amount: 49.99, platform_fee: 5.00, shipping_cost: 6.50, payment_status: 'paid', order_status: 'delivered', tracking_number: '1Z999AA10123456785', dispatch_deadline: '2026-05-07', delivery_date: '2026-05-08', created_at: '2026-05-04' },
            { id: 5, order_id: 'EB-2026-005', platform: 'eBay', order_date: '2026-05-05', buyer_name: 'Chris Wilson', buyer_username: 'cwilson22', sku: 'SKU004', quantity: 2, price_per_unit: 55.00, total_amount: 110.00, platform_fee: 11.00, shipping_cost: 8.99, payment_status: 'paid', order_status: 'shipped', tracking_number: '1Z999AA10123456786', dispatch_deadline: '2026-05-10', delivery_date: '', created_at: '2026-05-05' },
            { id: 6, order_id: 'ET-2026-006', platform: 'Etsy', order_date: '2026-05-06', buyer_name: 'Lisa Anderson', buyer_username: 'lisa_anderson', sku: 'SKU005', quantity: 1, price_per_unit: 55.00, total_amount: 55.00, platform_fee: 5.50, shipping_cost: 7.50, payment_status: 'paid', order_status: 'pending', tracking_number: '', dispatch_deadline: '2026-05-11', delivery_date: '', created_at: '2026-05-06' },
            { id: 7, order_id: 'EB-2026-007', platform: 'eBay', order_date: '2026-05-07', buyer_name: 'David Martinez', buyer_username: 'dmartinez99', sku: 'SKU002', quantity: 5, price_per_unit: 12.99, total_amount: 64.95, platform_fee: 6.50, shipping_cost: 6.99, payment_status: 'paid', order_status: 'shipped', tracking_number: '1Z999AA10123456787', dispatch_deadline: '2026-05-12', delivery_date: '', created_at: '2026-05-07' },
            { id: 8, order_id: 'ET-2026-008', platform: 'Etsy', order_date: '2026-05-08', buyer_name: 'Anna Taylor', buyer_username: 'anna_taylor', sku: 'SKU003', quantity: 2, price_per_unit: 8.99, total_amount: 17.98, platform_fee: 1.80, shipping_cost: 4.50, payment_status: 'pending', order_status: 'pending', tracking_number: '', dispatch_deadline: '2026-05-13', delivery_date: '', created_at: '2026-05-08' }
        ];
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    }

    if (!localStorage.getItem(DB_KEYS.RETURNS)) {
        const returns = [
            { id: 1, order_id: 'EB-2026-001', sku: 'SKU001', reason: 'Defective item', status: 'approved', refund_amount: 91.98, received_date: '2026-05-10', notes: 'Customer reported left ear not working' },
            { id: 2, order_id: 'ET-2026-002', sku: 'SKU002', reason: 'Wrong color', status: 'pending', refund_amount: 38.97, received_date: '', notes: 'Customer wanted blue, received clear' }
        ];
        localStorage.setItem(DB_KEYS.RETURNS, JSON.stringify(returns));
    }

    if (!localStorage.getItem(DB_KEYS.ACTIVITY_LOGS)) {
        const logs = [
            { id: 1, user_id: 1, action: 'System initialized', module: 'System', timestamp: new Date().toISOString() },
            { id: 2, user_id: 1, action: 'Sample data loaded', module: 'Database', timestamp: new Date().toISOString() }
        ];
        localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    }

    if (!localStorage.getItem(DB_KEYS.RECYCLE_BIN)) {
        localStorage.setItem(DB_KEYS.RECYCLE_BIN, JSON.stringify([]));
    }

    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        const settings = {
            company_name: 'My eCommerce Store',
            currency: 'USD',
            low_stock_threshold: 20,
            default_platform: 'eBay',
            google_drive_enabled: false,
            theme: 'light'
        };
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    }
}

// Generic CRUD Operations
const DB = {
    // Users
    getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
    getUserById: (id) => DB.getUsers().find(u => u.id === id),
    getUserByEmail: (email) => DB.getUsers().find(u => u.email === email),
    addUser: (user) => {
        const users = DB.getUsers();
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user.created_at = new Date().toISOString();
        users.push(user);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        logActivity(user.id, 'User created', 'Users');
        return user;
    },
    updateUser: (id, data) => {
        const users = DB.getUsers();
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...data };
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
            logActivity(getCurrentUser()?.id, `User ${id} updated`, 'Users');
            return users[idx];
        }
        return null;
    },
    deleteUser: (id) => {
        const users = DB.getUsers().filter(u => u.id !== id);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        logActivity(getCurrentUser()?.id, `User ${id} deleted`, 'Users');
    },

    // Inventory
    getInventory: () => JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]'),
    getInventoryBySku: (sku) => DB.getInventory().find(i => i.sku === sku),
    addInventory: (item) => {
        const inventory = DB.getInventory();
        inventory.push(item);
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
        logActivity(getCurrentUser()?.id, `Inventory ${item.sku} added`, 'Inventory');
        return item;
    },
    updateInventory: (sku, data) => {
        const inventory = DB.getInventory();
        const idx = inventory.findIndex(i => i.sku === sku);
        if (idx !== -1) {
            inventory[idx] = { ...inventory[idx], ...data };
            localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
            logActivity(getCurrentUser()?.id, `Inventory ${sku} updated`, 'Inventory');
            return inventory[idx];
        }
        return null;
    },
    deleteInventory: (sku) => {
        const item = DB.getInventoryBySku(sku);
        if (item) {
            addToRecycleBin('inventory', item);
            const inventory = DB.getInventory().filter(i => i.sku !== sku);
            localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
            logActivity(getCurrentUser()?.id, `Inventory ${sku} deleted`, 'Inventory');
        }
    },

    // Listings
    getListings: () => JSON.parse(localStorage.getItem(DB_KEYS.LISTINGS) || '[]'),
    getListingById: (id) => DB.getListings().find(l => l.id === id),
    addListing: (listing) => {
        const listings = DB.getListings();
        listing.id = listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1;
        listing.created_at = new Date().toISOString();
        listings.push(listing);
        localStorage.setItem(DB_KEYS.LISTINGS, JSON.stringify(listings));
        logActivity(getCurrentUser()?.id, `Listing ${listing.id} added`, 'Listings');
        return listing;
    },
    updateListing: (id, data) => {
        const listings = DB.getListings();
        const idx = listings.findIndex(l => l.id === id);
        if (idx !== -1) {
            listings[idx] = { ...listings[idx], ...data };
            localStorage.setItem(DB_KEYS.LISTINGS, JSON.stringify(listings));
            logActivity(getCurrentUser()?.id, `Listing ${id} updated`, 'Listings');
            return listings[idx];
        }
        return null;
    },
    deleteListing: (id) => {
        const item = DB.getListingById(id);
        if (item) {
            addToRecycleBin('listings', item);
            const listings = DB.getListings().filter(l => l.id !== id);
            localStorage.setItem(DB_KEYS.LISTINGS, JSON.stringify(listings));
            logActivity(getCurrentUser()?.id, `Listing ${id} deleted`, 'Listings');
        }
    },

    // Orders
    getOrders: () => JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]'),
    getOrderById: (id) => DB.getOrders().find(o => o.id === id),
    addOrder: (order) => {
        const orders = DB.getOrders();
        order.id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        order.created_at = new Date().toISOString();

        // Business Logic: New Order -> reserved_stock += quantity
        const inventory = DB.getInventoryBySku(order.sku);
        if (inventory) {
            inventory.reserved_stock += parseInt(order.quantity);
            DB.updateInventory(order.sku, { reserved_stock: inventory.reserved_stock });
        }

        orders.push(order);
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        logActivity(getCurrentUser()?.id, `Order ${order.order_id} created`, 'Orders');
        return order;
    },
    updateOrder: (id, data) => {
        const orders = DB.getOrders();
        const idx = orders.findIndex(o => o.id === id);
        if (idx !== -1) {
            const oldOrder = orders[idx];

            // Business Logic: Order Shipped -> reserved_stock -= quantity, total_stock -= quantity
            if (data.order_status === 'shipped' && oldOrder.order_status !== 'shipped') {
                const inventory = DB.getInventoryBySku(oldOrder.sku);
                if (inventory) {
                    inventory.reserved_stock -= parseInt(oldOrder.quantity);
                    inventory.total_stock -= parseInt(oldOrder.quantity);
                    DB.updateInventory(oldOrder.sku, { 
                        reserved_stock: inventory.reserved_stock,
                        total_stock: inventory.total_stock
                    });
                }
            }

            orders[idx] = { ...oldOrder, ...data };
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
            logActivity(getCurrentUser()?.id, `Order ${id} updated`, 'Orders');
            return orders[idx];
        }
        return null;
    },
    deleteOrder: (id) => {
        const item = DB.getOrderById(id);
        if (item) {
            addToRecycleBin('orders', item);
            const orders = DB.getOrders().filter(o => o.id !== id);
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
            logActivity(getCurrentUser()?.id, `Order ${id} deleted`, 'Orders');
        }
    },

    // Returns
    getReturns: () => JSON.parse(localStorage.getItem(DB_KEYS.RETURNS) || '[]'),
    getReturnById: (id) => DB.getReturns().find(r => r.id === id),
    addReturn: (ret) => {
        const returns = DB.getReturns();
        ret.id = returns.length > 0 ? Math.max(...returns.map(r => r.id)) + 1 : 1;
        returns.push(ret);
        localStorage.setItem(DB_KEYS.RETURNS, JSON.stringify(returns));
        logActivity(getCurrentUser()?.id, `Return ${ret.id} created`, 'Returns');
        return ret;
    },
    updateReturn: (id, data) => {
        const returns = DB.getReturns();
        const idx = returns.findIndex(r => r.id === id);
        if (idx !== -1) {
            const oldReturn = returns[idx];

            // Business Logic: Return Approved -> total_stock += quantity
            if (data.status === 'approved' && oldReturn.status !== 'approved') {
                const order = DB.getOrders().find(o => o.order_id === oldReturn.order_id);
                if (order) {
                    const inventory = DB.getInventoryBySku(order.sku);
                    if (inventory) {
                        inventory.total_stock += parseInt(order.quantity);
                        DB.updateInventory(order.sku, { total_stock: inventory.total_stock });
                    }
                }
            }

            returns[idx] = { ...oldReturn, ...data };
            localStorage.setItem(DB_KEYS.RETURNS, JSON.stringify(returns));
            logActivity(getCurrentUser()?.id, `Return ${id} updated`, 'Returns');
            return returns[idx];
        }
        return null;
    },
    deleteReturn: (id) => {
        const item = DB.getReturnById(id);
        if (item) {
            addToRecycleBin('returns', item);
            const returns = DB.getReturns().filter(r => r.id !== id);
            localStorage.setItem(DB_KEYS.RETURNS, JSON.stringify(returns));
            logActivity(getCurrentUser()?.id, `Return ${id} deleted`, 'Returns');
        }
    },

    // Activity Logs
    getActivityLogs: () => JSON.parse(localStorage.getItem(DB_KEYS.ACTIVITY_LOGS) || '[]'),

    // Recycle Bin
    getRecycleBin: () => JSON.parse(localStorage.getItem(DB_KEYS.RECYCLE_BIN) || '[]'),
    restoreFromRecycleBin: (binId) => {
        const bin = DB.getRecycleBin();
        const item = bin.find(b => b.bin_id === binId);
        if (item) {
            const data = item.data;
            switch(item.module) {
                case 'inventory':
                    DB.addInventory(data);
                    break;
                case 'listings':
                    DB.addListing(data);
                    break;
                case 'orders':
                    const orders = DB.getOrders();
                    orders.push(data);
                    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
                    break;
                case 'returns':
                    const returns = DB.getReturns();
                    returns.push(data);
                    localStorage.setItem(DB_KEYS.RETURNS, JSON.stringify(returns));
                    break;
            }
            const newBin = bin.filter(b => b.bin_id !== binId);
            localStorage.setItem(DB_KEYS.RECYCLE_BIN, JSON.stringify(newBin));
            logActivity(getCurrentUser()?.id, `Item restored from recycle bin`, 'Recycle Bin');
            return true;
        }
        return false;
    },
    permanentDelete: (binId) => {
        const bin = DB.getRecycleBin().filter(b => b.bin_id !== binId);
        localStorage.setItem(DB_KEYS.RECYCLE_BIN, JSON.stringify(bin));
        logActivity(getCurrentUser()?.id, `Item permanently deleted`, 'Recycle Bin');
    },

    // Settings
    getSettings: () => JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}'),
    updateSettings: (settings) => {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
        logActivity(getCurrentUser()?.id, 'Settings updated', 'Settings');
    }
};

// Helper Functions
function addToRecycleBin(module, data) {
    const bin = DB.getRecycleBin();
    bin.push({
        bin_id: Date.now(),
        module: module,
        data: data,
        deleted_at: new Date().toISOString(),
        deleted_by: getCurrentUser()?.name || 'Unknown'
    });
    localStorage.setItem(DB_KEYS.RECYCLE_BIN, JSON.stringify(bin));
}

function logActivity(userId, action, module) {
    const logs = DB.getActivityLogs();
    logs.unshift({
        id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
        user_id: userId || 0,
        action: action,
        module: module,
        timestamp: new Date().toISOString()
    });
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.pop();
    localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
}

// Profit Calculation
function calculateProfit(order) {
    const inventory = DB.getInventoryBySku(order.sku);
    const costPerUnit = inventory ? inventory.cost_per_unit : 0;
    const totalCost = costPerUnit * order.quantity;
    return order.total_amount - order.platform_fee - order.shipping_cost - totalCost;
}

// Authentication
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null');
}

function setCurrentUser(user) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function checkRole(allowedRoles) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
        showToast('Access Denied: Insufficient permissions', 'error');
        return false;
    }
    return true;
}

// Export/Import
function exportToCSV(data, filename) {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = String(val).replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function exportToJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2`;
    toast.innerHTML = `<span class="font-bold">${icons[type]}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col';
    document.body.appendChild(container);
    return container;
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Format Date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Search and Filter
function filterData(data, searchTerm, fields) {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(term);
    }));
}

// Initialize on load
initDatabase();
