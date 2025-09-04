# Vercel Deployment Guide for Hotel Anuprabha

## 🚀 Quick Deployment Steps

### 1. **Fix Applied** ✅
- Removed the `functions` section from `vercel.json` that was causing the error
- Your `vercel.json` is now properly configured for a frontend-only React app

### 2. **Environment Variables Setup**

Before deploying, make sure to set these environment variables in your Vercel project:

#### **Required Environment Variables:**
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Hotel Anuprabha
VITE_DEFAULT_TAX_RATE=0.18
```

#### **How to Set Environment Variables in Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the correct values

### 3. **Deploy Again**

Now you can redeploy your project:

```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub (if connected)
git add .
git commit -m "Fix vercel.json for frontend deployment"
git push origin main
```

### 4. **Backend Deployment**

Make sure your backend is deployed on Render with:
- **Build Command**: `npm install && npm run build && npm run migrate:deploy`
- **Start Command**: `npm start`
- **Environment Variables**: All backend variables from `env.example`

### 5. **CORS Configuration**

Ensure your backend's `CORS_ORIGIN` includes your Vercel domain:
```
CORS_ORIGIN=https://your-app-name.vercel.app,http://localhost:5173
```

## 🔧 Troubleshooting

### **If you still get errors:**
1. **Check Environment Variables**: Make sure `VITE_API_BASE_URL` points to your deployed backend
2. **Check CORS**: Ensure your backend allows your Vercel domain
3. **Check Build Logs**: Look for any build errors in Vercel dashboard

### **Common Issues:**
- **404 on API calls**: Check `VITE_API_BASE_URL` is correct
- **CORS errors**: Update backend `CORS_ORIGIN` with your Vercel domain
- **Build failures**: Check for TypeScript errors in your code

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Frontend loads at your Vercel URL
- ✅ Login page appears
- ✅ API calls work (check browser network tab)

## 📞 Support

If you encounter any issues:
1. Check the Vercel build logs
2. Verify environment variables
3. Test your backend API endpoints
4. Check browser console for errors

---

**Your Hotel Anuprabha billing system should now deploy successfully!** 🎉
