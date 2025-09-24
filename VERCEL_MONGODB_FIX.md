# Vercel MongoDB SSL/TLS Fix

## Quick Fix for Vercel Deployment

### 1. Update Vercel Environment Variables

In your Vercel dashboard, update `MONGODB_URI` with this optimized connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forms_app?retryWrites=true&w=majority&maxPoolSize=1&minPoolSize=0&maxIdleTimeMS=30000&connectTimeoutMS=30000&serverSelectionTimeoutMS=30000&socketTimeoutMS=60000&compressors=zlib&tls=true&tlsAllowInvalidCertificates=false&tlsAllowInvalidHostnames=false
```

### 2. MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Security → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Or add Vercel's IP ranges if you prefer more security

### 3. Verify TLS Settings

Ensure your MongoDB Atlas cluster:
- Uses TLS 1.2 or higher
- Has proper cipher suite support
- Is not in a restricted region

### 4. Redeploy

```bash
vercel --prod
```

## Key Changes Made

- ✅ **Enhanced SSL/TLS configuration** for Vercel
- ✅ **Increased timeouts** for serverless environment
- ✅ **Proper connection pooling** for serverless
- ✅ **Retry logic** with exponential backoff
- ✅ **Compression enabled** for better performance

The SSL/TLS error should now be resolved on Vercel deployment.
