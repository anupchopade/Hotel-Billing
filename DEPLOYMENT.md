# 🚀 Deployment Guide - Hotel Anuprabha Billing System

## 🔧 Quick Fix for Slow Loading & 404 Errors

### **Common Issues & Solutions:**

#### **1. 🐌 Slow Loading (30+ seconds)**
**Cause**: Render free tier cold starts
**Solutions**:
- Upgrade to paid plan ($7/month) for faster cold starts
- Add health check endpoint (already added)
- Optimize database queries
- Use connection pooling

#### **2. 🚫 404 Not Found Errors**
**Cause**: Environment variables or routing issues
**Solutions**:
- Check `VITE_API_BASE_URL` in frontend
- Verify CORS settings in backend
- Ensure proper build configuration

#### **3. 🔄 Intermittent Loading**
**Cause**: Database connection timeouts
**Solutions**:
- Check database connection string
- Verify Prisma migrations
- Monitor database performance

---

## 📋 Step-by-Step Deployment

### **Backend (Render)**

#### **1. Environment Variables**
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://your-frontend-url.vercel.app,http://localhost:5173
```

#### **2. Build Settings**
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x

#### **3. Database Setup**
```bash
# After deployment, run migrations
npx prisma migrate deploy
npm run seed
```

### **Frontend (Vercel)**

#### **1. Environment Variables**
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Hotel Anuprabha
```

#### **2. Build Settings**
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x

#### **3. Custom Domain (Optional)**
- Add custom domain in Vercel dashboard
- Update CORS_ORIGIN in backend

---

## 🔍 Troubleshooting

### **Check Backend Health**
```bash
curl https://your-backend-url.onrender.com/health
```
Should return:
```json
{
  "ok": true,
  "timestamp": "2025-01-16T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### **Check Frontend Build**
```bash
npm run build
npm run preview
```
Visit `http://localhost:4173` to test

### **Database Connection**
```bash
cd server
npx prisma studio
```
Should open Prisma Studio interface

---

## ⚡ Performance Optimizations

### **Backend Optimizations**
- ✅ Added health check endpoint
- ✅ Optimized rate limiting (1200 requests/15min)
- ✅ Request caching and deduplication
- ✅ Connection pooling ready

### **Frontend Optimizations**
- ✅ Code splitting with manual chunks
- ✅ Terser minification
- ✅ Asset caching headers
- ✅ SPA routing configuration

### **Database Optimizations**
- ✅ Prisma connection pooling
- ✅ Optimized queries
- ✅ Proper indexing

---

## 🚨 Emergency Fixes

### **If Site Won't Load**
1. Check Render logs: `https://dashboard.render.com`
2. Check Vercel logs: `https://vercel.com/dashboard`
3. Verify environment variables
4. Test health endpoint

### **If 404 Errors**
1. Check `VITE_API_BASE_URL` in frontend
2. Verify CORS settings
3. Check build output
4. Test API endpoints directly

### **If Database Issues**
1. Check connection string
2. Run migrations: `npx prisma migrate deploy`
3. Verify database is accessible
4. Check Prisma client generation

---

## 📞 Support

### **Render Support**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

### **Vercel Support**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com

### **Database Support**
- Neon: https://neon.tech/docs
- Prisma: https://prisma.io/docs

---

**Last Updated: January 2025**
