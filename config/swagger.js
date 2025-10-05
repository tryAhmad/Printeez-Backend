const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Printeez E-Commerce API",
      version: "1.0.0",
      description: "A Node.js backend API for an e-commerce T-shirt store",
      contact: {
        name: "Printeez Team",
        email: "ahmadsaeed3220@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated user ID",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              description: "User email address",
            },
            password: {
              type: "string",
              description: "User password (hashed)",
            },
            address: {
              type: "string",
              description: "User address",
            },
            isAdmin: {
              type: "boolean",
              description: "Admin status",
              default: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
          },
        },
        Product: {
          type: "object",
          required: ["name", "price", "size", "stock"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated product ID",
            },
            name: {
              type: "string",
              description: "T-shirt name",
            },
            description: {
              type: "string",
              description: "Product description",
            },
            price: {
              type: "number",
              description: "Product price",
            },
            size: {
              type: "string",
              description: "T-shirt size (S, M, L, XL)",
            },
            stock: {
              type: "number",
              description: "Available quantity",
            },
            imageUrl: {
              type: "string",
              description: "Product image URL",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Product creation date",
            },
          },
        },
        Order: {
          type: "object",
          required: ["userId", "products", "totalAmount", "address"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated order ID",
            },
            userId: {
              type: "string",
              description: "Reference to User ID",
            },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: {
                    type: "string",
                    description: "Reference to Product ID",
                  },
                  quantity: {
                    type: "number",
                    description: "Quantity ordered",
                  },
                },
              },
            },
            totalAmount: {
              type: "number",
              description: "Total order amount",
            },
            address: {
              type: "string",
              description: "Delivery address",
            },
            status: {
              type: "string",
              enum: ["Pending", "Shipped", "Delivered"],
              default: "Pending",
              description: "Order status",
            },
            paymentMethod: {
              type: "string",
              default: "COD",
              description: "Payment method",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Order creation date",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API files
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
};
