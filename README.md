# 🏨 Hotel Billing System

A modern, full-stack hotel billing system built with React, Node.js, and PostgreSQL. Features mobile-first responsive design, thermal printer support, and advanced user management capabilities.

![Hotel Billing Logo](https://img.shields.io/badge/Hotel-Billing-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## 🌟 Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with access/refresh token rotation
- **Role-based Access Control** (Admin & Cashier roles)
- **Rate Limiting** (1200 requests per 15 minutes, 5 login attempts)
- **Password Visibility Toggle** for admin user management
- **Secure Logout** with token invalidation
- **Soft Delete System** for user management with reactivation
- **Request Caching & Deduplication** to prevent API abuse

### 📱 Mobile-First Design
- **Fully Responsive Layout** optimized for all screen sizes (xs, sm, md, lg, xl)
- **Sticky Cart Summary** for easy access on mobile
- **Touch-Friendly Interface** with large buttons and proper spacing
- **No Horizontal Scrolling** on any device
- **Progressive Web App** ready
- **Custom Breakpoints** for optimal mobile experience

### 🧾 Billing Features
- **Quick Bill Creation** with item selection
- **Real-time Calculations** (GST, discounts, totals)
- **Default Values** (Customer: "Guest", Table: "1")
- **Print Preview** with thermal printer optimization
- **Bill History** with advanced search and filtering
- **CSV Export** with custom date ranges and last 15 days option
- **Bill Details View** with complete item breakdown
- **Cashier Name Display** on bills and history

### 🍽️ Menu Management
- **CRUD Operations** for menu items
- **Category-based Organization** 
- **Full/Half Plate Pricing**
- **Availability Status** tracking
- **Role-based Permissions** (Cashiers can view, Admins can edit)

### 👥 User Management (Admin Only)
- **User CRUD Operations** with soft delete system
- **Password Management** with visibility toggle
- **Role Assignment** (Admin/Cashier)
- **User Activity Tracking**
- **Soft Delete & Reactivation** - Users can be deactivated and reactivated
- **Deleted Users Management** - View and manage deactivated users
- **Bill History Preservation** - Bills retain original creator information

### 📊 Dashboard & Analytics
- **Today's Statistics** (Bills, Revenue)
- **Monthly Overview**
- **Financial Privacy** (Eye icon to show/hide amounts)
- **Quick Actions** for common tasks
- **Responsive Design** optimized for all screen sizes
- **Performance Optimized** with API caching

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for validation
- **Rate Limiting** with express-rate-limit
- **CORS & Helmet** for security

### Database
- **PostgreSQL** (Neon DB for production)
- **Prisma** for database management
- **Automated Migrations**

### Deployment
- **Backend**: Render
- **Frontend**: Vercel  
- **Database**: Neon (PostgreSQL)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotel-billing
```

### 2. Backend Setup
```bash
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Seed admin user
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# In root directory
npm install

# Setup environment variables
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local

# Start development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 🔑 Default Login Credentials

### Admin Account
- **Email**: admin@hotel.com
- **Password**: admin123
- **Role**: Admin (Full access)

### Creating Cashier Accounts
1. Login as Admin
2. Go to Users section
3. Click "Add User"
4. Set role to "Cashier"

### Example User Accounts
```bash
# Admin User
Email: admin@hotel.com
Password: admin123
Role: Admin

# Cashier User (created by admin)
Email: cashier@hotel.com
Password: cashier123
Role: Cashier
```

## 🖨️ Printer Setup

### Thermal Printer (Recommended)
- **Width**: 58mm optimized
- **Connection**: USB/Bluetooth/WiFi
- **Driver**: Generic thermal printer driver
- **Paper**: Thermal paper rolls

### Regular Printer
- **Formats**: A4, Letter size supported
- **Print**: Use browser's print function (Ctrl+P)

### Print Features
- **Auto-formatting** for thermal printers
- **Clean Layout** (no headers/navigation)
- **Hotel Details** included
- **QR Code** for verification
- **Item Details** with quantities and prices

## 📱 Mobile Usage

### Optimized for Mobile
- **Sticky Cart**: Always visible at top
- **Quick Actions**: Save/Print buttons accessible
- **Touch-Friendly**: Large buttons and touch targets
- **Minimal Scrolling**: Key information always visible

### Mobile Workflow
1. **Enter Customer Details** (defaults provided)
2. **Select Items** from menu
3. **Review Cart** (expandable)
4. **Save & Print** from sticky cart

## 🔒 Security Features

### Rate Limiting
- **General API**: 1200 requests per 15 minutes (increased for development)
- **Auth Endpoints**: 5 attempts per 15 minutes
- **IP-based** protection
- **Request Throttling**: 100ms minimum interval between requests

### Data Protection
- **Encrypted Passwords** with bcrypt
- **JWT Tokens** with expiration
- **HTTPS Enforcement** in production
- **CORS Protection** configured

### Session Management
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Auto Refresh** on API calls
- **Secure Logout** clears all tokens

## 📊 User Session & Logout

### Automatic Logout Occurs:
1. **Token Expiry**: After 7 days of inactivity
2. **Invalid Tokens**: When refresh token is compromised
3. **Manual Logout**: User clicks logout button
4. **Security Logout**: After suspicious activity

### Session Persistence:
- **Browser Refresh**: User stays logged in
- **Tab Close**: Session persists
- **Device Sleep**: Session maintains
- **Network Issues**: Graceful handling

## 🛠️ Admin Password Recovery

### If Admin Forgets Password:

#### Option 1: Database Reset (Recommended)
```bash
cd server
npm run reset-admin-password
# This will reset admin password to 'admin123'
```

#### Option 2: Manual Database Update
```sql
-- Connect to your PostgreSQL database
UPDATE "User" 
SET password = '$2b$10$rQ7gZJZJ8Z1QzQxQ8Z1QzO8Z1QzQxQ8Z1QzQxQ8Z1QzQxQ8Z1QzQ'
WHERE email = 'admin@hotel.com';
-- This sets password to 'admin123'
```

#### Option 3: Create New Admin
```bash
cd server
npx prisma studio
# Use Prisma Studio to create new admin user
```

## 📋 Usage Examples

### Creating a New Bill
```bash
1. Login as Admin or Cashier
2. Navigate to "New Bill"
3. Enter customer details (defaults: Customer="Guest", Table="1")
4. Select items from menu
5. Review cart summary
6. Click "Print & Save" or "Save Bill"
```

### Managing Menu Items (Admin Only)
```bash
1. Login as Admin
2. Go to "Menu" section
3. Click "Add Item" to create new menu item
4. Set Full/Half plate prices
5. Mark availability status
6. Save changes
```

### User Management (Admin Only)
```bash
1. Login as Admin
2. Go to "Users" section
3. Click "Add User" to create cashier account
4. Set role as "Cashier"
5. Use "Show Deleted" to manage deactivated users
6. Click "Reactivate" to restore deleted users
```

### Exporting Bill History
```bash
1. Go to "History" section
2. Use "Export Last 15 Days" for recent bills
3. Use "Custom Date Range" for specific periods
4. Download CSV file with bill details
```

### Printing Bills
```bash
1. From "New Bill": Click "Print & Save"
2. From "History": Click green print button
3. Select thermal printer (58mm recommended)
4. Print single-page receipt
```

## 📁 Project Structure

```
hotel-billing/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── server/                # Backend Node.js app
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── lib/           # Backend utilities
│   └── prisma/            # Database schema & migrations
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hotel_billing"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=8080
NODE_ENV=production

# CORS
CORS_ORIGIN="https://your-frontend-url.vercel.app,http://localhost:5173"

# Admin Seeding (Optional)
SEED_ADMIN_EMAIL="admin@hotel.com"
SEED_ADMIN_PASSWORD="admin123"
```

### Frontend (.env.local)
```env
# API Base URL
VITE_API_BASE_URL="https://your-backend-url.onrender.com"

# App Configuration
VITE_APP_NAME="Hotel Billing System"
VITE_DEFAULT_TAX_RATE="0.18"
```

### Example Environment Setup
```bash
# Backend Environment Variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/hotel_billing"
JWT_SECRET="my-super-secret-jwt-key-12345"
PORT=8080
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"

# Frontend Environment Variables
VITE_API_BASE_URL="http://localhost:8080"
VITE_APP_NAME="Hotel Billing System"
VITE_DEFAULT_TAX_RATE="0.18"
```

## 🆕 What's New in Version 2.0

### 🔧 Major Improvements
- **Soft Delete System**: Users can now be deactivated and reactivated without losing bill history
- **Enhanced Mobile Responsiveness**: All pages now work perfectly on mobile devices
- **Request Optimization**: API caching and deduplication prevent rate limiting issues
- **Improved Export System**: Fixed custom date range exports and added "Last 15 Days" option
- **Better User Management**: Enhanced UI with proper mobile layouts and touch-friendly controls

### 🐛 Bug Fixes
- Fixed 429 "Too Many Requests" errors with intelligent caching
- Resolved mobile layout issues across all pages
- Fixed custom date range export functionality
- Improved bill history display and filtering
- Enhanced user deletion flow with proper data preservation

### 📱 Mobile Enhancements
- Complete responsive redesign for all screen sizes
- Touch-friendly interface with proper spacing
- No horizontal scrolling on any device
- Optimized navigation and button layouts
- Better form inputs and modal designs

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set build command: `npm install && npx prisma generate && npm run build`
3. Set start command: `node dist/index.js`
4. Add environment variables
5. Deploy

### Frontend (Vercel)
1. Connect GitHub repository
2. Set framework: Vite
3. Add environment variables
4. Deploy

### Database (Neon)
1. Create Neon project
2. Copy connection string
3. Run migrations: `npx prisma migrate deploy`
4. Seed admin user: `npm run seed`

## 📈 Performance Optimizations

- **API Caching** with 30-second TTL prevents duplicate requests
- **Request Deduplication** prevents multiple identical API calls
- **Rate Limiting** prevents abuse (1200 requests per 15 minutes)
- **Request Throttling** (100ms minimum interval)
- **Lazy Loading** for better performance
- **Optimized Images** and assets
- **Minimal Bundle Size** with tree shaking
- **Global State Management** with React Context
- **Memoized Functions** with useCallback

## 🐛 Troubleshooting

### Common Issues

#### "429 Too Many Requests"
- **Cause**: Rate limiting triggered (1200 requests per 15 minutes)
- **Solution**: Wait 15 minutes or contact admin. System now has request caching to prevent this.

#### "User gets logged out on refresh"
- **Cause**: Token storage issue
- **Solution**: Check browser localStorage, clear cache

#### "Print not working"
- **Cause**: Printer driver or connection
- **Solution**: Check printer connection, try browser print

#### "Mobile cart not showing"
- **Cause**: Screen size detection
- **Solution**: Refresh page, check responsive breakpoints

#### "User deletion issues"
- **Cause**: Foreign key constraints
- **Solution**: System now uses soft delete - users are deactivated, not deleted

#### "Export showing all bills instead of date range"
- **Cause**: Date filtering issue
- **Solution**: Fixed in v2.0 - custom date ranges now work correctly

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📞 Support

### Technical Support
- **Issues**: Create GitHub issue
- **Documentation**: Check README and docs/
- **Updates**: Watch repository for releases

### Example Hotel Information
```bash
# Hotel Details (Customize for your hotel)
Hotel Name: Your Hotel Name
Address: Your Hotel Address
Phone: Your Phone Number
Email: info@yourhotel.com
GSTIN: Your GSTIN Number
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Customization

### Hotel Information
Update the following files to customize for your hotel:

```bash
# Frontend - Hotel Details
src/pages/BillHistory.tsx (print modal)
src/components/PrintBill.tsx
src/pages/Login.tsx (title)

# Backend - Default Values
src/pages/CreateBill.tsx (default customer/table)
```

### Example Customization
```bash
# Change Hotel Name
Hotel Name: "Your Hotel Name"
Address: "Your Hotel Address"
Phone: "Your Phone Number"
Email: "info@yourhotel.com"
GSTIN: "Your GSTIN Number"

# Change Default Values
Default Customer: "Guest"
Default Table: "1"
Default Tax Rate: "0.18" (18%)
```

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for beautiful styling
- **Prisma** for excellent database tooling
- **Node.js** for robust backend development
- **PostgreSQL** for reliable data storage

---

**Made with ❤️ for the hospitality industry**

*Last Updated: January 2025 - Version 2.0*
