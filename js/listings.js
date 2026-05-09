
let currentListingPage = 1;
let filteredListings = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;

    loadListings();
    populateSKUSelect();
    setupListingListeners();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
        openModal('listing-modal');
    }
});

function setupListingListeners() {
    document.getElementById('listing-search').addEventListener('input', debounce(applyListingFilters, 300));
    document.getElementById('filter-listing-status').addEventListener('change', applyListingFilters);
    document.getElementById('filter-listing-platform').addEventListener('change', applyListingFilters);
    document.getElementById('listing-form').addEventListener('submit', handleListingSubmit);
    document.getElementById('listing-sku').addEventListener('change', autoFillListingData);
}

function populateSKUSelect() {
    const select = document.getElementById('listing-sku');
    const inventory = DB.getInventory();
    select.innerHTML = '<option value="">Select Product</option>' + 
        inventory.map(item => `<option value="${item.sku}" data-cost="${item.cost_per_unit}">${item.sku} - ${item.product_name}</option>`).join('');
}

function autoFillListingData() {
    const sku = document.getElementById('listing-sku').value;
    const inventory = DB.getInventoryBySku(sku);
    if (inventory) {
        document.getElementById('listing-quantity').value = inventory.total_stock - inventory.reserved_stock;
    }
}

function loadListings() {
    filteredListings = DB.getListings();
    renderListings();
}

function applyListingFilters() {
    const search = document.getElementById('listing-search').value.toLowerCase();
    const status = document.getElementById('filter-listing-status').value;
    const platform = document.getElementById('filter-listing-platform').value;

    filteredListings = DB.getListings().filter(listing => {
        const matchesSearch = !search || 
            listing.title.toLowerCase().includes(search) ||
            listing.sku.toLowerCase().includes(search) ||
            listing.keywords.toLowerCase().includes(search);
        const matchesStatus = !status || listing.status === status;
        const matchesPlatform = !platform || listing.platform === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    currentListingPage = 1;
    renderListings();
}

function renderListings() {
    const perPage = 10;
    const result = paginate(filteredListings, currentListingPage, perPage);
    const tbody = document.getElementById('listings-table-body');

    if (result.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-500">No listings found</td></tr>';
    } else {
        tbody.innerHTML = result.data.map(listing => {
            const statusClass = listing.status === 'active' ? 'status-active' : 'status-inactive';
            return `
                <tr>
                    <td class="font-medium text-gray-800">#${listing.id}</td>
                    <td><span class="text-xs font-bold ${listing.platform === 'eBay' ? 'text-blue-600' : 'text-orange-600'}">${listing.platform}</span></td>
                    <td class="text-sm font-mono text-gray-600">${listing.sku}</td>
                    <td class="text-sm text-gray-800 max-w-xs truncate" title="${listing.title}">${listing.title}</td>
                    <td class="text-sm text-gray-600">${listing.category}</td>
                    <td class="font-medium text-gray-800">${formatCurrency(listing.price)}</td>
                    <td class="text-sm text-gray-600">${listing.quantity_available}</td>
                    <td><span class="status-badge ${statusClass}">${listing.status}</span></td>
                    <td class="admin-only">
                        <div class="flex gap-2">
                            <button onclick="editListing(${listing.id})" class="text-blue-600 hover:text-blue-800 p-1"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteListing(${listing.id})" class="text-red-600 hover:text-red-800 p-1"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination('listings-pagination', currentListingPage, result.pages, 'goToListingPage');
}

function goToListingPage(page) {
    currentListingPage = page;
    renderListings();
}

function handleListingSubmit(e) {
    e.preventDefault();
    if (!checkRole(['admin', 'manager'])) return;

    const id = document.getElementById('listing-id').value;
    const sku = document.getElementById('listing-sku').value;
    const inventory = DB.getInventoryBySku(sku);

    const listingData = {
        sku: sku,
        platform: document.getElementById('listing-platform').value,
        title: document.getElementById('listing-title').value,
        category: document.getElementById('listing-category').value,
        status: document.getElementById('listing-status').value,
        price: parseFloat(document.getElementById('listing-price').value),
        cost_price: inventory ? inventory.cost_per_unit : 0,
        quantity_available: parseInt(document.getElementById('listing-quantity').value),
        listing_url: document.getElementById('listing-url').value,
        keywords: document.getElementById('listing-keywords').value
    };

    if (id) {
        DB.updateListing(parseInt(id), listingData);
        showToast('Listing updated successfully!', 'success');
    } else {
        DB.addListing(listingData);
        showToast('Listing created successfully!', 'success');
    }

    closeModal('listing-modal');
    resetListingForm();
    loadListings();
}

function editListing(id) {
    if (!checkRole(['admin', 'manager'])) return;
    const listing = DB.getListingById(id);
    if (!listing) return;

    document.getElementById('listing-modal-title').textContent = 'Edit Listing';
    document.getElementById('listing-id').value = listing.id;
    document.getElementById('listing-platform').value = listing.platform;
    document.getElementById('listing-sku').value = listing.sku;
    document.getElementById('listing-title').value = listing.title;
    document.getElementById('listing-category').value = listing.category;
    document.getElementById('listing-status').value = listing.status;
    document.getElementById('listing-price').value = listing.price;
    document.getElementById('listing-quantity').value = listing.quantity_available;
    document.getElementById('listing-url').value = listing.listing_url || '';
    document.getElementById('listing-keywords').value = listing.keywords || '';

    openModal('listing-modal');
}

function deleteListing(id) {
    if (!checkRole(['admin'])) return;
    confirmAction('Are you sure you want to delete this listing?', () => {
        DB.deleteListing(id);
        showToast('Listing moved to recycle bin', 'warning');
        loadListings();
    });
}

function resetListingForm() {
    document.getElementById('listing-form').reset();
    document.getElementById('listing-id').value = '';
    document.getElementById('listing-modal-title').textContent = 'New Listing';
}

function exportListings() {
    const data = filteredListings.map(l => ({
        'ID': l.id,
        'Platform': l.platform,
        'SKU': l.sku,
        'Title': l.title,
        'Category': l.category,
        'Price': l.price,
        'Cost Price': l.cost_price,
        'Quantity': l.quantity_available,
        'Status': l.status,
        'URL': l.listing_url,
        'Keywords': l.keywords
    }));
    exportToCSV(data, `listings-export-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Listings exported successfully!', 'success');
}
