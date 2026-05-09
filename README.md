# eBay/Etsy Manager Pro

A complete **frontend-only** multi-platform e-commerce management dashboard for eBay and Etsy sellers. Built with pure HTML, Tailwind CSS, and Vanilla JavaScript. Ready for backend integration.

---

## Features

| Feature | Status |
|---------|--------|
| Dashboard Analytics with Charts | Ready |
| Orders Management (CRUD) | Ready |
| Listings Management (CRUD) | Ready |
| Inventory Management (CRUD) | Ready |
| Returns Management (CRUD) | Ready |
| Recycle Bin (Soft Delete) | Ready |
| Role-based Users (Admin/Manager/Viewer) | Ready |
| Export/Import (CSV/JSON) | Ready |
| Global Search & Filters | Ready |
| Auto Profit Calculation | Ready |
| Low Stock Alerts | Ready |
| Mobile Responsive UI | Ready |
| Google Drive Integration Placeholder | Ready |

---

## Database Schema (Simulated PostgreSQL)

The app uses `localStorage` to simulate a PostgreSQL database. All tables match your requested schema exactly:

- **users** - id, name, email, password, role, created_at
- **inventory** - sku, product_name, total_stock, reserved_stock, cost_per_unit, supplier_name, restock_level, last_restocked
- **listings** - id, sku, platform, title, category, status, price, cost_price, quantity_available, listing_url, keywords, created_at
- **orders** - id, order_id, platform, order_date, buyer_name, buyer_username, sku, quantity, price_per_unit, total_amount, platform_fee, shipping_cost, payment_status, order_status, tracking_number, dispatch_deadline, delivery_date, created_at
- **returns** - id, order_id, sku, reason, status, refund_amount, received_date, notes
- **activity_logs** - id, user_id, action, module, timestamp

---

## Business Logic Implemented

- **New Order**: `reserved_stock += quantity` (total_stock unchanged)
- **Order Shipped**: `reserved_stock -= quantity`, `total_stock -= quantity`
- **Return Approved**: `total_stock += quantity`
- **Profit Formula**: `profit = total_amount - platform_fee - shipping_cost - (cost_per_unit quantity)`

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@manager.com | admin123 |
| Manager | manager@manager.com | manager123 |
| Viewer | viewer@manager.com | viewer123 |

---

## Project Structure

```
ebay-etsy-manager/
├── index.html              # Dashboard
├── login.html              # Login Page
├── orders.html             # Orders Management
├── listings.html           # Listings Management
├── inventory.html          # Inventory Management
├── returns.html            # Returns Management
├── recycle-bin.html        # Recycle Bin
├── users.html              # User Management (Admin only)
├── settings.html           # Settings & Backup
├── css/
│   └── styles.css          # Custom Styles
└── js/
    ├── data-store.js       # Database & CRUD Logic
    ├── app.js              # Main App Logic
    ├── dashboard.js        # Dashboard Charts
    ├── orders.js           # Orders Page Logic
    ├── listings.js         # Listings Page Logic
    ├── inventory.js        # Inventory Page Logic
    ├── returns.js          # Returns Page Logic
    ├── recycle-bin.js      # Recycle Bin Logic
    ├── users.js            # Users Page Logic
    └── settings.js         # Settings Logic
```

---

## Deployment Guide (Step-by-Step)

### Method 1: GitHub Pages (Recommended - 100% Free Forever, No Card Needed)

**Step 1: Create GitHub Account**
1. Go to https://github.com/signup
2. Sign up with your email (free)
3. Verify your email

**Step 2: Create New Repository**
1. Click the **+** icon (top right) → **New repository**
2. Repository name: `ebay-etsy-manager`
3. Make it **Public**
4. Click **Create repository**

**Step 3: Upload Files**
1. In your new repo, click **uploading an existing file**
2. Drag and drop ALL files from this project folder
3. OR use Git (see below)

**Using Git (Command Line):**
```bash
# 1. Install Git from https://git-scm.com/downloads
# 2. Open Terminal/Command Prompt
# 3. Navigate to project folder
cd path/to/ebay-etsy-manager

# 4. Initialize Git
git init

# 5. Add all files
git add .

# 6. Commit
git commit -m "Initial commit"

# 7. Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ebay-etsy-manager.git

# 8. Push
git branch -M main
git push -u origin main
```

**Step 4: Enable GitHub Pages**
1. Go to your repo on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/(root)** folder
6. Click **Save**
7. Wait 1-2 minutes
8. Your site will be live at: `https://YOUR_USERNAME.github.io/ebay-etsy-manager/login.html`

---

### Method 2: Netlify (Free, No Card Needed)

**Step 1: Create Netlify Account**
1. Go to https://app.netlify.com/signup
2. Sign up with GitHub (easiest) or email

**Step 2: Drag & Drop Deploy**
1. Go to https://app.netlify.com/drop
2. Drag your entire `ebay-etsy-manager` folder onto the page
3. Done! Your site is live instantly
4. URL will look like: `random-name-123.netlify.app`

**To add custom domain (free):**
1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. You can use a free subdomain or connect your own

---

### Method 3: Surge.sh (Super Simple, Free Forever)

**Step 1: Install Node.js**
1. Download from https://nodejs.org (LTS version)
2. Install it

**Step 2: Install Surge**
```bash
npm install -g surge
```

**Step 3: Deploy**
```bash
cd path/to/ebay-etsy-manager
surge
# Follow prompts, choose a domain like: ebay-manager.surge.sh
```

**To update:**
```bash
surge
# Use the same domain
```

---

### Method 4: Vercel (Free, No Card Needed)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
cd path/to/ebay-etsy-manager
vercel
# Follow prompts, login with email or GitHub
```

---

## Adding Backend Later (Future Integration)

This frontend is designed to easily connect to a backend. Here's how:

### Step 1: Create Backend API

Create a REST API using any backend technology:
- **Node.js + Express** (recommended)
- **Python + Flask/Django**
- **PHP + Laravel**
- **Java + Spring Boot**

### Step 2: Replace localStorage Calls

In `js/data-store.js`, replace the localStorage functions with API calls:

```javascript
// BEFORE (localStorage):
DB.getOrders = () => JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');

// AFTER (API):
DB.getOrders = async () => {
    const res = await fetch('https://your-api.com/api/orders');
    return await res.json();
};
```

### Step 3: Add Authentication

Replace the simple password check with JWT tokens:

```javascript
// Login API call
async function login(email, password) {
    const res = await fetch('https://your-api.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data.user;
}
```

### Step 4: Connect Real PostgreSQL

Use your backend to connect to PostgreSQL with the exact schema provided. The frontend expects data in the same format, so no UI changes needed!

---

## Google Drive Integration (Future)

The settings page has a placeholder for Google Drive. To enable:

1. Create a project at https://console.cloud.google.com
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Add the Client ID to your backend
5. Implement file upload/backup endpoints

---

## Tips

- **Data is stored in browser**: Since this is frontend-only, data stays in the user's browser (localStorage). Each user/browser has separate data.
- **Clear browser data = lose everything**: Always use Export/Backup feature in Settings before clearing browser data.
- **Works offline**: After first load, the app works without internet (except charts which need CDN).
- **Mobile friendly**: Fully responsive design works on phones and tablets.

---

## License

Free to use for personal and commercial projects.
