const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw { statusCode: 401, message: "Token required" };
    }

    const token = authorization.split(" ")[1];
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id);
    if (!user) {
      throw { statusCode: 401, message: "Invalid token" };
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      
    };

    next();
  } catch (error) {
    next({ statusCode: 401, message: "Invalid token" });
  }
}

module.exports = authentication;
