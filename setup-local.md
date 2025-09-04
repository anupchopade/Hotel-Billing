# Local Development Setup

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)

## Backend Setup (Terminal 1)

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file in server directory:**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/hotel_billing_dev"
   
   # JWT Secret (use a strong random string)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Server Configuration
   PORT=8080
   NODE_ENV=development
   
   # CORS Origins (comma-separated)
   CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
   
   # Admin Seeding (optional)
   SEED_ADMIN_EMAIL="admin@hotel.com"
   SEED_ADMIN_PASSWORD="admin123"
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run migrations
   npm run migrate
   
   # Seed admin user
   npm run seed
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on: http://localhost:8080

## Frontend Setup (Terminal 2)

1. **Navigate to project root:**
   ```bash
   cd ..  # if you're in server directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file in root directory:**
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_APP_NAME="Hotel Billing (Local)"
   ```

4. **Start frontend server:**
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

## Testing

1. Open http://localhost:5173/login
2. Login with:
   - Email: `admin@hotel.com`
   - Password: `admin123`

## Database Options

### Option 1: Use Your Existing Neon Database (Recommended)
- Use the same DATABASE_URL from your production deployment
- This way you'll have the same data locally and in production

### Option 2: Local PostgreSQL
- Install PostgreSQL locally
- Create a database named `hotel_billing_dev`
- Update DATABASE_URL accordingly

### Option 3: Docker PostgreSQL (Quick Setup)
```bash
docker run --name hotel-billing-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=hotel_billing_dev \
  -p 5432:5432 \
  -d postgres:15
```
Then use: `DATABASE_URL="postgresql://postgres:password@localhost:5432/hotel_billing_dev"`
