const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "ahmadsaeed3220@gmail.com",
    pass: process.env.EMAIL_PASS, // App password for Gmail
  },
});

// Send order confirmation email
const sendOrderConfirmation = async (
  customerEmail,
  customerName,
  orderDetails
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "ahmadsaeed3220@gmail.com",
      to: customerEmail,
      subject: "Order Confirmation - Printeez",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! We're excited to confirm that your order has been received and is being processed.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> PKR ${orderDetails.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${
              orderDetails.paymentMethod
            }</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
            <p><strong>Order Date:</strong> ${new Date(
              orderDetails.createdAt
            ).toLocaleDateString()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Items Ordered:</h3>
            ${orderDetails.products
              .map(
                (item) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>Product:</strong> ${item.productName}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> PKR ${item.price}</p>
              </div>
            `
              )
              .join("")}
          </div>

          <p>Your order will be delivered via Cash on Delivery (COD). Please have the exact amount ready upon delivery.</p>
          <p>We'll send you another email with tracking information once your order ships.</p>
          
          <p>Thank you for choosing Printeez!</p>
          <p>Best regards,<br>The Printeez Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation,
};
