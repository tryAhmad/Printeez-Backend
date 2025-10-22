# 🚀 Quick Start Guide - Printeez Backend

## For New Developers

### 1. Prerequisites Check

```bash
node --version    # Should be v16+
npm --version     # Should be v8+
mongod --version  # Should be v6+
```

### 2. First Time Setup (5 minutes)

```bash
# Clone and install
git clone <repo-url>
cd Printeez
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed database
npm run seed-new
npm run create-admin

# Start server
npm run dev
```

### 3. Test Everything Works

- Open: http://localhost:5000/health
- Should see: `{"success":true,"message":"Server is healthy"}`
- Open Swagger: http://localhost:5000/api-docs

### 4. Your First API Call

**Login as Admin:**

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printeez.com","password":"admin123456"}'
```

**Get Products:**

```bash
curl http://localhost:5000/api/products
```

## For Experienced Developers

### Project Structure Overview

```
┌─ config/         Configuration & Swagger
├─ middleware/     Auth, validation, errors
├─ models/         Mongoose schemas (indexed)
├─ routes/         API endpoints (RESTful)
│  ├─ *_optimized.js  (Use these for production)
│  └─ *.js            (Legacy, for comparison)
├─ services/       Business logic
├─ utils/          Helper functions
├─ app.js          Express config
└─ server.js       Entry point
```

### Key Files to Understand

1. **app.js** - Middleware pipeline, route mounting
2. **middleware/errorHandler.js** - Centralized error handling
3. **middleware/validation.js** - Joi schemas for all inputs
4. **models/Product.js** - Example of indexed model
5. **routes/product_optimized.js** - Example of optimized routes

### Environment Variables Needed

```env
MONGODB_URI=mongodb://localhost:27017/printeez
JWT_SECRET=your-secret-key-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### NPM Scripts

```bash
npm start          # Production mode
npm run dev        # Development with nodemon
npm run seed-new   # Add 27 products (9 designs x 3 sizes)
npm run create-admin  # Add admin@printeez.com
```

### API Authentication

**All protected routes need:**

```
Authorization: Bearer <jwt-token>
```

**Get token from login response:**

```javascript
const response = await fetch("/api/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
```

### Common Development Tasks

#### Adding a New Route

```javascript
// 1. Create route handler in routes/
router.get(
  "/new-endpoint",
  auth, // If protected
  validate(schema), // If needs validation
  catchAsync(async (req, res) => {
    // Your logic
    res.json({ success: true, data: result });
  })
);

// 2. Add Swagger documentation above handler
/**
 * @swagger
 * /api/resource/new-endpoint:
 *   get:
 *     summary: Description
 *     ...
 */
```

#### Adding Validation

```javascript
// In middleware/validation.js
const newSchema = Joi.object({
  field: Joi.string().required(),
  // ... more fields
});

// In routes
router.post("/", validate(newSchema), catchAsync(handler));
```

#### Adding a New Model

```javascript
// 1. Create schema with indexes
const schema = new mongoose.Schema(
  {
    field: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index({ field: 1 }); // Add indexes

// 2. Export model
module.exports = mongoose.model("ModelName", schema);
```

### Testing Your Changes

#### 1. Use Swagger UI

- Navigate to http://localhost:5000/api-docs
- Try endpoints interactively
- See request/response examples

#### 2. Use curl/Postman

```bash
# Set token variable
TOKEN="your-jwt-token"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/orders
```

#### 3. Check Logs

```bash
# Server logs show:
# - All HTTP requests (Morgan)
# - Error stack traces
# - Database connections
```

### Performance Monitoring

```javascript
// Check response times
console.time("query");
const result = await Model.find().lean();
console.timeEnd("query");

// Profile slow queries in MongoDB
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### Common Issues & Solutions

#### Issue: "MongoDB connection error"

```bash
# Solution: Check if MongoDB is running
mongod --dbpath /path/to/data

# Or start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

#### Issue: "Invalid token"

```bash
# Solution: Get fresh token from login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printeez.com","password":"admin123456"}'
```

#### Issue: "Rate limit exceeded"

```bash
# Solution: Wait 15 minutes or adjust in .env
RATE_LIMIT_MAX=1000  # Increase limit for development
```

#### Issue: "Validation error"

```bash
# Solution: Check Joi schema requirements
# Error response shows what's missing/invalid
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/my-feature

# Commit with conventional commits
git commit -m "feat: add new endpoint"
git commit -m "fix: resolve validation bug"
git commit -m "docs: update README"

# Push and create PR
git push origin feature/my-feature
```

### Code Style Guidelines

1. **Use async/await** - Not callbacks or .then()
2. **Wrap in catchAsync** - For automatic error handling
3. **Validate inputs** - Use Joi schemas
4. **Return standard responses** - `{ success, data, error }`
5. **Add Swagger docs** - For every endpoint
6. **Use lean()** - For read-only queries
7. **Add indexes** - For frequently queried fields
8. **Log errors** - Use console.error with context

### Debugging Tips

```javascript
// 1. Add detailed logging
console.log('DEBUG:', { userId, productId, quantity });

// 2. Use debugger
debugger;  // Then run: node inspect server.js

// 3. Check MongoDB queries
mongoose.set('debug', true);  // See all DB queries

// 4. Test with curl -v
curl -v http://localhost:5000/api/products  # Verbose output
```

### Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Configure FRONTEND_URL for CORS
- [ ] Use MongoDB Atlas or production DB
- [ ] Enable SSL/TLS
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring (New Relic/Datadog)
- [ ] Enable error tracking (Sentry)
- [ ] Set up backups
- [ ] Configure rate limits appropriately

### Useful Resources

- **API Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **Optimization Guide**: See OPTIMIZATION_GUIDE.md
- **API Reference**: See API_README.md
- **Express Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com

### Getting Help

1. Check error message in terminal
2. Search in Swagger documentation
3. Review OPTIMIZATION_GUIDE.md
4. Check MongoDB logs: `mongod.log`
5. Google the error with "Node.js" or "Express"

## Quick Reference Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm run seed-new         # Reset products database
npm run create-admin     # Create admin user

# Production
npm start                # Start server
NODE_ENV=production npm start  # Production mode

# Database
npm run seed-new         # 27 products (9 x 3 sizes)
npm run create-test-users  # 4 test users
npm run seed-orders      # Random test orders

# Testing
curl http://localhost:5000/health  # Health check
curl http://localhost:5000/api-docs  # API docs
```

## Next Steps

1. ✅ Server is running
2. ✅ Database is connected
3. ✅ Products are seeded
4. → Test API with Swagger
5. → Build your frontend
6. → Deploy to production

---

**Need more help?** Check the detailed documentation:

- `README.md` - Complete feature overview
- `OPTIMIZATION_GUIDE.md` - Performance details
- `OPTIMIZATION_SUMMARY.md` - What changed
- `API_README.md` - All endpoints documented

**Happy Coding! 🚀**
