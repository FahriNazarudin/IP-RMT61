const { head } = require("../app");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User, Order } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const axios = require("axios");


module.exports = class UserController {
  static async upgradeUser(req, res, next) {
    try {

      console.log(req.user, "<<< user data from req");
      
      const  {orderId}  = req.body;

      const order = await Order.findOne({
        where: { orderId },
      });

      if (!order) {
          throw { name: "NotFound", message: "Order not found" };
      }
      if (req.user.status === "premium") {
        throw { name: "BadRequest", message: "You are already premium" };
      }

      if (order.status === "paid") {
        return res.status(400).json({message: "Order already paid"});
      }
        

      const base64ServerKey = Buffer.from(
        process.env.MT_SERVER_KEY + ":"
      ).toString("base64");

      const {data} = await axios.get(
        `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
        {
          headers: {
            Authorization: `Basic ${base64ServerKey}`,
          },
        }
      );
      console.log(data, "<<< response from midtrans");
      if (data.transaction_status === "capture" && data.status_code === "200") {
        // Ambil user dari database terlebih dahulu
        const user = await User.findByPk(req.user.id);
        if (!user) {
          throw { name: "NotFound", message: "User not found" };
        }

        // Update status user dan order
        await user.update({ status: "premium" });
        await order.update({ status: "paid", paidDate: new Date() });

        res.json({ message: "Upgraded premium successfully" });
      } else {
        res.status(400).json({
          message: "Upgrade failed, please call our customer support",
        });
      }
      
    } catch (error) {
      console.error("Error upgrading user:", error);
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      if (!googleToken) {
        throw { name: "BadRequest", message: "Google token is required" };
      }

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      console.log(payload, "<<< payload from google");

      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          username: payload.name,
          email: payload.email,
          password: Math.random().toString(36).slice(-8),
        },
      });

      const access_token = signToken({ id: user.id });

      res.status(created ? 201 : 200).json({ access_token, userId: user.id, status: user.status });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const users = await User.create({
        username,
        email,
        password,
      });

      return res.status(201).json({
        id: users.id,
        username: users.username,
        email: users.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      ``;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
      const access_token = signToken({ id: user.id });
      return res.status(200).json({ access_token, userId: user.id , status: user.status });
    } catch (error) {
      console.log(error, "<<< error in login");

      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const updatedUser = await user.update({
        username,
        email,
        password,
      });
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      await user.destroy();
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
};
