# Printeez E-Commerce API Documentation

A comprehensive guide to the Printeez T-shirt store API endpoints, including request/response examples and authentication requirements.

## Base URL

```
http://localhost:5000
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses are in JSON format with consistent error handling:

```json
// Success Response
{
  "data": {...},
  "message": "Success message"
}

// Error Response
{
  "error": "Error message description"
}
```

---

## 🔐 Authentication Endpoints

### 1. User Signup

**POST** `/api/users/signup`

Register a new user account.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully."
}
```

**Error Responses:**

```json
// 400 - Email already exists
{
  "error": "Email already exists."
}

// 500 - Server error
{
  "error": "Signup failed."
}
```

---

### 2. User Login

**POST** `/api/users/login`

Authenticate user and receive JWT token.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 - Invalid credentials
{
  "error": "Invalid credentials."
}

// 500 - Server error
{
  "error": "Login failed."
}
```

---

## 👕 Product Endpoints

### 3. Get All Products

**GET** `/api/products`

Retrieve all available T-shirts.

**Headers:**

```
(No authentication required)
```

**Request Body:** None

**Success Response (200):**

```json
[
  {
    "_id": "60d5f484f8c8c8b8c8c8c8c8",
    "name": "Classic White T-Shirt",
    "description": "A comfortable classic white cotton t-shirt",
    "price": 19.99,
    "size": "M",
    "stock": 50,
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2025-10-05T10:30:00.000Z"
  },
  {
    "_id": "60d5f484f8c8c8b8c8c8c8c9",
    "name": "Black Premium Tee",
    "description": "High-quality black t-shirt made from organic cotton",
    "price": 24.99,
    "size": "L",
    "stock": 30,
    "imageUrl": "https://example.com/image2.jpg",
    "createdAt": "2025-10-05T10:30:00.000Z"
  }
]
```

**Error Response:**

```json
// 500 - Server error
{
  "error": "Failed to fetch products."
}
```

---

### 4. Get Single Product

**GET** `/api/products/:id`

Retrieve details of a specific T-shirt.

**Headers:**

```
(No authentication required)
```

**URL Parameters:**

- `id` (string): Product ID

**Request Body:** None

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8c8",
  "name": "Classic White T-Shirt",
  "description": "A comfortable classic white cotton t-shirt",
  "price": 19.99,
  "size": "M",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg",
  "createdAt": "2025-10-05T10:30:00.000Z"
}
```

**Error Responses:**

```json
// 404 - Product not found
{
  "error": "Product not found."
}

// 500 - Server error
{
  "error": "Failed to fetch product."
}
```

---

### 5. Add Product (Admin Only)

**POST** `/api/products`

Add a new T-shirt to the inventory.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New T-Shirt Design",
  "description": "Amazing new t-shirt with cool design",
  "price": 29.99,
  "size": "L",
  "stock": 25,
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Success Response (201):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8ca",
  "name": "New T-Shirt Design",
  "description": "Amazing new t-shirt with cool design",
  "price": 29.99,
  "size": "L",
  "stock": 25,
  "imageUrl": "https://example.com/new-image.jpg",
  "createdAt": "2025-10-05T11:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Validation error
{
  "error": "Failed to add product."
}

// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 403 - Not admin
{
  "error": "Admin access required."
}
```

---

### 6. Update Product (Admin Only)

**PUT** `/api/products/:id`

Update an existing T-shirt.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**

- `id` (string): Product ID

**Request Body:**

```json
{
  "name": "Updated T-Shirt Name",
  "description": "Updated description",
  "price": 25.99,
  "size": "XL",
  "stock": 15,
  "imageUrl": "https://example.com/updated-image.jpg"
}
```

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8c8",
  "name": "Updated T-Shirt Name",
  "description": "Updated description",
  "price": 25.99,
  "size": "XL",
  "stock": 15,
  "imageUrl": "https://example.com/updated-image.jpg",
  "createdAt": "2025-10-05T10:30:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Update failed
{
  "error": "Failed to update product."
}

// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 403 - Not admin
{
  "error": "Admin access required."
}

// 404 - Product not found
{
  "error": "Product not found."
}
```

---

### 7. Delete Product (Admin Only)

**DELETE** `/api/products/:id`

Remove a T-shirt from inventory.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**URL Parameters:**

- `id` (string): Product ID

**Request Body:** None

**Success Response (200):**

```json
{
  "message": "Product deleted."
}
```

**Error Responses:**

```json
// 400 - Delete failed
{
  "error": "Failed to delete product."
}

// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 403 - Not admin
{
  "error": "Admin access required."
}

// 404 - Product not found
{
  "error": "Product not found."
}
```

---

## � Search Endpoints

### 8. Search Products

**GET** `/api/products/search`

Search for T-shirts by name or description with optional filters.

**Headers:**

```
(No authentication required)
```

**Query Parameters:**

- `q` (string, required): Search query for product name or description
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `size` (string, optional): Size filter (S, M, L, XL)

**Example Request:**

```
GET /api/products/search?q=shirt&minPrice=20&maxPrice=30&size=M
```

**Success Response (200):**

```json
[
  {
    "_id": "60d5f484f8c8c8b8c8c8c8c8",
    "name": "Classic White T-Shirt",
    "description": "A comfortable classic white cotton t-shirt",
    "price": 25.99,
    "size": "M",
    "stock": 50,
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2025-10-05T10:30:00.000Z"
  }
]
```

**Error Responses:**

```json
// 400 - Missing search query
{
  "error": "Search query (q) is required"
}

// 500 - Server error
{
  "error": "Search failed."
}
```

---

## �🛒 Shopping Cart Endpoints

### 9. Get Cart

**GET** `/api/cart`

Retrieve user's shopping cart with populated product details and total amount.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8ce",
  "userId": "60d5f484f8c8c8b8c8c8c8cc",
  "items": [
    {
      "productId": {
        "_id": "60d5f484f8c8c8b8c8c8c8c8",
        "name": "Classic White T-Shirt",
        "price": 19.99,
        "size": "M",
        "imageUrl": "https://example.com/image.jpg"
      },
      "quantity": 2,
      "addedAt": "2025-10-05T12:00:00.000Z"
    }
  ],
  "totalAmount": 39.98,
  "updatedAt": "2025-10-05T12:00:00.000Z"
}
```

### 10. Add to Cart

**POST** `/api/cart`

Add a product to the shopping cart.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "60d5f484f8c8c8b8c8c8c8c8",
  "quantity": 2
}
```

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8ce",
  "userId": "60d5f484f8c8c8b8c8c8c8cc",
  "items": [...],
  "totalAmount": 39.98,
  "updatedAt": "2025-10-05T12:00:00.000Z"
}
```

### 11. Update Cart Item

**PUT** `/api/cart/:productId`

Update the quantity of a specific item in the cart.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quantity": 3
}
```

### 12. Remove from Cart

**DELETE** `/api/cart/:productId`

Remove a specific item from the cart.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

### 13. Clear Cart

**DELETE** `/api/cart/clear`

Remove all items from the cart.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

---

## ❤️ Wishlist Endpoints

### 14. Get Wishlist

**GET** `/api/wishlist`

Retrieve user's wishlist with populated product details.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8cf",
  "userId": "60d5f484f8c8c8b8c8c8c8cc",
  "products": [
    {
      "productId": {
        "_id": "60d5f484f8c8c8b8c8c8c8c8",
        "name": "Classic White T-Shirt",
        "price": 19.99,
        "size": "M",
        "imageUrl": "https://example.com/image.jpg"
      },
      "addedAt": "2025-10-05T12:00:00.000Z"
    }
  ],
  "updatedAt": "2025-10-05T12:00:00.000Z"
}
```

### 15. Add to Wishlist

**POST** `/api/wishlist`

Add a product to the wishlist.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "60d5f484f8c8c8b8c8c8c8c8"
}
```

### 16. Remove from Wishlist

**DELETE** `/api/wishlist/:productId`

Remove a product from the wishlist.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

### 17. Clear Wishlist

**DELETE** `/api/wishlist/clear`

Remove all products from the wishlist.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

---

## 📊 Analytics Endpoints (Admin Only)

### 18. Sales Analytics

**GET** `/api/analytics/sales`

Get comprehensive sales analytics with customizable time periods.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (string): Time period - daily, weekly, monthly, yearly
- `startDate` (date): Custom start date (YYYY-MM-DD)
- `endDate` (date): Custom end date (YYYY-MM-DD)

**Example Request:**

```
GET /api/analytics/sales?period=monthly
```

**Success Response (200):**

```json
{
  "totalSales": 1250.75,
  "totalOrders": 45,
  "averageOrderValue": 27.79,
  "salesByStatus": {
    "Pending": 150.5,
    "Shipped": 400.25,
    "Delivered": 700.0
  },
  "dailySales": [
    {
      "date": "2025-10-01",
      "amount": 125.5
    },
    {
      "date": "2025-10-02",
      "amount": 200.25
    }
  ],
  "period": "monthly"
}
```

### 19. Top Selling Products

**GET** `/api/analytics/products/top-selling`

Get the most popular products by sales volume.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `limit` (number): Number of products to return (default: 10)

**Success Response (200):**

```json
[
  {
    "product": {
      "_id": "60d5f484f8c8c8b8c8c8c8c8",
      "name": "Classic White T-Shirt",
      "price": 19.99,
      "size": "M"
    },
    "totalQuantitySold": 150,
    "totalRevenue": 2998.5,
    "orderCount": 75
  }
]
```

### 20. Customer Analytics

**GET** `/api/analytics/customers`

Get customer statistics and top customers by spending.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**

```json
{
  "totalCustomers": 245,
  "newCustomersThisMonth": 18,
  "topCustomers": [
    {
      "customer": {
        "_id": "60d5f484f8c8c8b8c8c8c8cc",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalOrders": 8,
      "totalSpent": 215.5
    }
  ]
}
```

### 21. Dashboard Overview

**GET** `/api/analytics/overview`

Get a comprehensive overview for the admin dashboard.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**

```json
{
  "totalProducts": 25,
  "totalOrders": 156,
  "totalRevenue": 3245.75,
  "totalCustomers": 89,
  "lowStockProducts": [
    {
      "_id": "60d5f484f8c8c8b8c8c8c8c9",
      "name": "Limited Edition Tee",
      "stock": 3
    }
  ],
  "recentOrders": [
    {
      "_id": "60d5f484f8c8c8b8c8c8c8cb",
      "totalAmount": 45.98,
      "status": "Pending",
      "createdAt": "2025-10-05T14:30:00.000Z",
      "userId": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

## 🛒 Order Endpoints

### 22. Create Order

**POST** `/api/orders`

Place a new order. Automatically sends confirmation email to customer.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "products": [
    {
      "productId": "60d5f484f8c8c8b8c8c8c8c8",
      "quantity": 2
    },
    {
      "productId": "60d5f484f8c8c8b8c8c8c8c9",
      "quantity": 1
    }
  ],
  "address": "123 Main Street, New York, NY 10001"
}
```

**Success Response (201):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8cb",
  "userId": "60d5f484f8c8c8b8c8c8c8cc",
  "products": [
    {
      "productId": "60d5f484f8c8c8b8c8c8c8c8",
      "quantity": 2
    },
    {
      "productId": "60d5f484f8c8c8b8c8c8c8c9",
      "quantity": 1
    }
  ],
  "totalAmount": 64.97,
  "address": "123 Main Street, New York, NY 10001",
  "status": "Pending",
  "paymentMethod": "COD",
  "createdAt": "2025-10-05T12:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Product unavailable or insufficient stock
{
  "error": "Product unavailable or insufficient stock."
}

// 400 - Order creation failed
{
  "error": "Order creation failed."
}

// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}
```

---

### 23. Get User's Orders

**GET** `/api/orders`

Retrieve all orders for the authenticated user.

**Headers:**

```
Authorization: Bearer <user_jwt_token>
```

**Request Body:** None

**Success Response (200):**

```json
[
  {
    "_id": "60d5f484f8c8c8b8c8c8c8cb",
    "userId": "60d5f484f8c8c8b8c8c8c8cc",
    "products": [
      {
        "productId": "60d5f484f8c8c8b8c8c8c8c8",
        "quantity": 2
      }
    ],
    "totalAmount": 39.98,
    "address": "123 Main Street, New York, NY 10001",
    "status": "Pending",
    "paymentMethod": "COD",
    "createdAt": "2025-10-05T12:00:00.000Z"
  },
  {
    "_id": "60d5f484f8c8c8b8c8c8c8cd",
    "userId": "60d5f484f8c8c8b8c8c8c8cc",
    "products": [
      {
        "productId": "60d5f484f8c8c8b8c8c8c8c9",
        "quantity": 1
      }
    ],
    "totalAmount": 24.99,
    "address": "456 Oak Avenue, Los Angeles, CA 90210",
    "status": "Delivered",
    "paymentMethod": "COD",
    "createdAt": "2025-10-03T09:30:00.000Z"
  }
]
```

**Error Responses:**

```json
// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 500 - Server error
{
  "error": "Failed to fetch orders."
}
```

---

### 24. Get All Orders (Admin Only)

**GET** `/api/orders/admin/orders`

Retrieve all orders in the system.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:** None

**Success Response (200):**

```json
[
  {
    "_id": "60d5f484f8c8c8b8c8c8c8cb",
    "userId": "60d5f484f8c8c8b8c8c8c8cc",
    "products": [
      {
        "productId": "60d5f484f8c8c8b8c8c8c8c8",
        "quantity": 2
      }
    ],
    "totalAmount": 39.98,
    "address": "123 Main Street, New York, NY 10001",
    "status": "Pending",
    "paymentMethod": "COD",
    "createdAt": "2025-10-05T12:00:00.000Z"
  }
  // ... more orders from all users
]
```

**Error Responses:**

```json
// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 403 - Not admin
{
  "error": "Admin access required."
}

// 500 - Server error
{
  "error": "Failed to fetch all orders."
}
```

---

### 25. Update Order Status (Admin Only)

**PUT** `/api/orders/:id/status`

Update the status of an order.

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**

- `id` (string): Order ID

**Request Body:**

```json
{
  "status": "Shipped"
}
```

**Valid Status Values:**

- `"Pending"` - Order received, awaiting processing
- `"Shipped"` - Order dispatched for delivery
- `"Delivered"` - Order successfully delivered

**Success Response (200):**

```json
{
  "_id": "60d5f484f8c8c8b8c8c8c8cb",
  "userId": "60d5f484f8c8c8b8c8c8c8cc",
  "products": [
    {
      "productId": "60d5f484f8c8c8b8c8c8c8c8",
      "quantity": 2
    }
  ],
  "totalAmount": 39.98,
  "address": "123 Main Street, New York, NY 10001",
  "status": "Shipped",
  "paymentMethod": "COD",
  "createdAt": "2025-10-05T12:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Update failed
{
  "error": "Failed to update order status."
}

// 401 - Not authenticated
{
  "error": "Access denied. No token provided."
}

// 403 - Not admin
{
  "error": "Admin access required."
}

// 404 - Order not found
{
  "error": "Order not found."
}
```

---

## 📊 Data Models

### User Model

```json
{
  "_id": "string",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "address": "string (optional)",
  "isAdmin": "boolean (default: false)",
  "createdAt": "date"
}
```

### Product Model

```json
{
  "_id": "string",
  "name": "string (required)",
  "description": "string",
  "price": "number (required)",
  "size": "string (required)",
  "stock": "number (required)",
  "imageUrl": "string",
  "createdAt": "date"
}
```

### Order Model

```json
{
  "_id": "string",
  "userId": "string (ObjectId reference to User)",
  "products": [
    {
      "productId": "string (ObjectId reference to Product)",
      "quantity": "number (required)"
    }
  ],
  "totalAmount": "number (required)",
  "address": "string (required)",
  "status": "string (enum: Pending, Shipped, Delivered)",
  "paymentMethod": "string (default: COD)",
  "createdAt": "date"
}
```

### Cart Model

```json
{
  "_id": "string",
  "userId": "string (ObjectId reference to User)",
  "items": [
    {
      "productId": "string (ObjectId reference to Product)",
      "quantity": "number (required, min: 1)",
      "addedAt": "date"
    }
  ],
  "totalAmount": "number (calculated)",
  "updatedAt": "date"
}
```

### Wishlist Model

```json
{
  "_id": "string",
  "userId": "string (ObjectId reference to User)",
  "products": [
    {
      "productId": "string (ObjectId reference to Product)",
      "addedAt": "date"
    }
  ],
  "updatedAt": "date"
}
```

---

## 🔒 Security Features

### Rate Limiting

- **Limit:** 100 requests per IP address
- **Window:** 15 minutes
- **Response:** `429 Too Many Requests`

### Authentication

- **JWT Token Expiry:** 24 hours
- **Password Hashing:** bcryptjs with salt rounds: 10
- **Admin Protection:** Admin-only endpoints require `isAdmin: true`

---

## 📧 Email Notifications

### Order Confirmation Email

Automatically sent when an order is created successfully.

**Email Content Includes:**

- Customer name and order ID
- Product details (name, quantity, price)
- Total amount and delivery address
- Payment method (COD)
- Order date and professional branding

---

## 🚀 Testing with Swagger

Interactive API documentation is available at:

```
http://localhost:5000/api-docs
```

### Testing Steps:

1. **Authentication:**

   - Use POST `/api/users/login` to get JWT token
   - Click "Authorize" in Swagger UI
   - Enter: `Bearer your_jwt_token`

2. **Testing Endpoints:**
   - All endpoints can be tested directly from Swagger UI
   - View request/response schemas
   - See example data

---

## 🛠 Setup for Testing

### 1. Environment Variables

Create `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
EMAIL_USER=ahmadsaeed3220@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 2. Sample Data Creation

```bash
# Create admin user
npm run create-admin

# Create test users
npm run create-test-users

# Add sample products
npm run seed

# Add sample orders
npm run seed-orders
```

### 3. Test Credentials

**Admin User:**

- Email: `admin@printeez.com`
- Password: `admin123456`

**Test Users:**

- Email: `john@test.com` | Password: `password123`
- Email: `jane@test.com` | Password: `password123`
- Email: `mike@test.com` | Password: `password123`
- Email: `sarah@test.com` | Password: `password123`

---

## ❌ Common Error Codes

| Status Code | Description                       |
| ----------- | --------------------------------- |
| 200         | Success                           |
| 201         | Created Successfully              |
| 400         | Bad Request / Validation Error    |
| 401         | Unauthorized / Invalid Token      |
| 403         | Forbidden / Admin Access Required |
| 404         | Resource Not Found                |
| 429         | Too Many Requests (Rate Limited)  |
| 500         | Internal Server Error             |

---

## 📝 Notes

- **Payment Method:** Currently supports Cash on Delivery (COD) only
- **Stock Management:** Product stock is automatically reduced when orders are placed
- **Email Service:** Requires Gmail App Password for email notifications
- **CORS:** Enabled for cross-origin requests
- **Data Validation:** Mongoose schema validation ensures data integrity

---

For more detailed examples and interactive testing, visit the Swagger documentation at `http://localhost:5000/api-docs` when the server is running.
