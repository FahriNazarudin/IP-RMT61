const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

module.exports = class UserController {
//   static async googleLogin(res, req, next) {
//     try {
//       const { googleToken } = req.body;
//       const ticket = await client.verifyIdToken({
//         idToken: googleToken,
//         audience: GOOGLE_CLIENT_ID,
//       });
//       const payload = ticket.getPayload();

//       let user = await User.findOne({ where: { email: payload.email } });
//       if (!user) {
//         user = await user.create({
//           name: payload.name,
//           email: payload.email,
//           phoneNumber: Math.random(),
//           password: Math.random().toString(),
//           address: Math.random().toString(),
//         });
//       }

//       console.log(req.body, "<<< body");

//       res.status(200).json({ message: "Login Success" });
//     } catch (error) {
//       next(error);
//     }
//   }

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
``
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
      return res.status(200).json({ access_token, userId: user.id });
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
      const { username, email, password, photo } = req.body;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const updatedUser = await user.update({
        username,
        email,
        password,
        photo,
      });
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        photo: updatedUser.photo,
      });
    } catch (error) {
      next(error);
    }
  }
};
