# Printeez E-Commerce Backend

A Node.js backend for an e-commerce website selling T-shirts. Built with Express.js and MongoDB (Mongoose).

## Features

- **User Authentication**: JWT-based signup and login
- **Admin Authorization**: Role-based access control
- **Product Management**: Full CRUD operations for T-shirt products
- **Order Management**: Order creation, tracking, and status updates
- **Email Notifications**: Automated order confirmation emails
- **Rate Limiting**: Protection against API abuse (100 requests per 15 minutes)
- **CORS Support**: Cross-origin resource sharing enabled
- **Environment Configuration**: Secure configuration with dotenv
- **Modular Architecture**: Separated app configuration and server bootstrapping

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with Gmail SMTP
- **Security**: bcryptjs for password hashing, express-rate-limit
- **CORS**: Cross-origin requests support

## Project Structure

```
Printeez/
├── app.js                 # Express app configuration
├── server.js              # Server bootstrapping and MongoDB connection
├── models/
│   ├── User.js           # User model schema
│   ├── Product.js        # Product model schema
│   └── Order.js          # Order model schema
├── routes/
│   ├── user.js           # Authentication routes
│   ├── product.js        # Product CRUD routes
│   └── order.js          # Order management routes
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── admin.js          # Admin authorization middleware
├── services/
│   └── emailService.js   # Email notification service
├── .env.example          # Environment variables template
└── package.json          # Dependencies and scripts
```

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Create a `.env` file with:**

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   EMAIL_USER=ahmadsaeed3220@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

3. **Gmail Setup for Email Notifications:**

   - Enable 2-factor authentication on Gmail
   - Generate an App Password from Google Account settings
   - Use the App Password as `EMAIL_PASS`

4. **Start the server:**

   ```sh
   npm start
   ```

   **For development with auto-reload:**

   ```sh
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login

### Products

- `GET /api/products` - Get all T-shirts
- `GET /api/products/:id` - Get single T-shirt
- `POST /api/products` - Add new T-shirt (Admin only)
- `PUT /api/products/:id` - Update T-shirt (Admin only)
- `DELETE /api/products/:id` - Delete T-shirt (Admin only)

### Orders

- `POST /api/orders` - Create new order (sends confirmation email)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/admin/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## Data Models

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  address: String,
  isAdmin: Boolean (default: false),
  createdAt: Date
}
```

### Product

```javascript
{
  name: String,
  description: String,
  price: Number,
  size: String,
  stock: Number,
  imageUrl: String,
  createdAt: Date
}
```

### Order

```javascript
{
  userId: ObjectId (ref: User),
  products: [{
    productId: ObjectId (ref: Product),
    quantity: Number
  }],
  totalAmount: Number,
  address: String,
  status: String (Pending/Shipped/Delivered),
  paymentMethod: String (default: "COD"),
  createdAt: Date
}
```

## Authentication

Include JWT token in request headers:

```
Authorization: Bearer your_jwt_token
```

## Email Notifications

Order confirmation emails are automatically sent to customers upon successful order creation. The email includes:

- Order details and ID
- Product information
- Total amount and delivery address
- Professional HTML template

## Rate Limiting

API is protected with rate limiting:

- **Window**: 15 minutes
- **Max requests**: 100 per IP
- **Response**: "Too many requests from this IP, please try again later."

## Development

The project uses a modular architecture:

- `app.js`: Express app configuration (reusable for testing)
- `server.js`: Server bootstrapping and database connection
- Separated routes, models, middleware, and services

## Payment

Currently supports **Cash on Delivery (COD)** only. No online payment integration required.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
