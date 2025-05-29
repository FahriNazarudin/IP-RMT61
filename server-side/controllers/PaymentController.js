const midtransClient = require("midtrans-client");
const { Order } = require("../models");

class PaymentConrtroller {
  static async initiatePayment(req, res, next) {
    try {
      const snap = new midtransClient.Snap({

        isProduction: false,
        serverKey: process.env.MT_SERVER_KEY,
      });

      const orderId = Math.random().toString()
      const amount = 50_000;

      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },

        credit_card: {
          secure: true,
        },

        customer_details: {
          first_name: req.user.username ,
          email: req.user.email,
        },
      };

      const transaction = await snap.createTransaction(parameter)
      let transactionToken = transaction.token;
      console.log("transactionToken:", transactionToken);

       await Order.create({
         orderId,
         amount,
         user_id: req.user.id,
       });

      res.json({ transactionToken, orderId,
        message: "Order Created Successfully",
      });
    } catch (error) {

        
      next(error);
    }
  }
}

module.exports = PaymentConrtroller;
