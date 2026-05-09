
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;

    loadSettings();
    document.getElementById('general-settings-form').addEventListener('submit', saveGeneralSettings);
});

function loadSettings() {
    const settings = DB.getSettings();
    document.getElementById('setting-company').value = settings.company_name || '';
    document.getElementById('setting-currency').value = settings.currency || 'USD';
    document.getElementById('setting-threshold').value = settings.low_stock_threshold || 20;
    document.getElementById('setting-platform').value = settings.default_platform || 'eBay';
    document.getElementById('gdrive-toggle').checked = settings.google_drive_enabled || false;
}

function saveGeneralSettings(e) {
    e.preventDefault();
    const settings = {
        company_name: document.getElementById('setting-company').value,
        currency: document.getElementById('setting-currency').value,
        low_stock_threshold: parseInt(document.getElementById('setting-threshold').value) || 20,
        default_platform: document.getElementById('setting-platform').value,
        google_drive_enabled: document.getElementById('gdrive-toggle').checked,
        theme: 'light'
    };
    DB.updateSettings(settings);
    showToast('Settings saved successfully!', 'success');
}

function exportToDrive() {
    showToast('Google Drive export requires backend integration. Use JSON backup instead.', 'warning');
}

function exportAllJSON() {
    const data = {
        users: DB.getUsers(),
        inventory: DB.getInventory(),
        listings: DB.getListings(),
        orders: DB.getOrders(),
        returns: DB.getReturns(),
        activity_logs: DB.getActivityLogs(),
        settings: DB.getSettings(),
        exported_at: new Date().toISOString()
    };
    exportToJSON(data, `full-backup-${new Date().toISOString().split('T')[0]}.json`);
    showToast('Full backup exported successfully!', 'success');
}

function handleImport(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(e.target.result);
                if (confirm('This will overwrite existing data. Continue?')) {
                    if (data.users) localStorage.setItem('eem_users', JSON.stringify(data.users));
                    if (data.inventory) localStorage.setItem('eem_inventory', JSON.stringify(data.inventory));
                    if (data.listings) localStorage.setItem('eem_listings', JSON.stringify(data.listings));
                    if (data.orders) localStorage.setItem('eem_orders', JSON.stringify(data.orders));
                    if (data.returns) localStorage.setItem('eem_returns', JSON.stringify(data.returns));
                    showToast('Data imported successfully! Please refresh.', 'success');
                }
            } else if (file.name.endsWith('.csv')) {
                showToast('CSV import will be available with backend integration.', 'info');
            }
        } catch (err) {
            showToast('Invalid file format!', 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function resetAllData() {
    if (!checkRole(['admin'])) return;
    const confirmText = prompt('Type "DELETE" to confirm resetting all data:');
    if (confirmText === 'DELETE') {
        Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
        initDatabase();
        showToast('All data has been reset to defaults!', 'success');
        setTimeout(() => location.reload(), 1000);
    } else {
        showToast('Reset cancelled', 'info');
    }
}
