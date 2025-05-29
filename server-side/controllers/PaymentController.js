const midtransClient = require("midtrans-client");
const { Order } = require("../models");

class PaymentConrtroller {
  static async initiatePayment(req, res, next) {
    try {
      console.log("Starting payment initiation...");
      console.log("Server key exists:", !!process.env.MT_SERVER_KEY);

      // Create Snap API instance, with less strict configuration
      const snap = new midtransClient.Snap({
        // Use false for development/testing
        isProduction: false,
        serverKey: process.env.MT_SERVER_KEY,
        clientKey: process.env.MT_CLIENT_KEY,
      });

      // Generate a more reliable order ID
      const timestamp = new Date().getTime();
      const userId = req.user.id;
      const orderId = `ORDER-${userId}-${timestamp}`;
      const amount = 50000;

      console.log(`Creating order: ${orderId} for user ${req.user.email}`);
      
      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: req.user.username,
          email: req.user.email,
        },
      };

      console.log("Sending request to Midtrans...");
      const transaction = await snap.createTransaction(parameter);
      const transactionToken = transaction.token;
      console.log("Transaction token received:", transactionToken);

      // Create order record
      await Order.create({
        orderId, 
        amount,
        user_id: req.user.id,
      });

      console.log("Order created successfully in database");
      res.status(200).json({
        transactionToken,
        orderId,
        message: "Order Created Successfully",
      });
    } catch (error) {
      console.error("Payment initiation error:", error.message);
      if (error.apiResponse) {
        console.error("Midtrans API Response:", error.apiResponse);
      }
      next(error);
    }
  }
}

module.exports = PaymentConrtroller;
