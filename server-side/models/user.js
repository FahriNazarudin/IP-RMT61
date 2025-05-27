"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Asosiasi
      User.hasMany(models.Watchlist, { foreignKey: "user_id" });
      User.hasMany(models.Order, { foreignKey: "user_id" });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: { msg: "Email is requied!" },
          notNull: { msg: "Email is required!" },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Username is requied!" },
          notNull: { msg: "Username is required!" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password is requied!" },
        },
      },
      photo: {
        type: DataTypes.STRING,
        defaultValue: "https://ui-avatars.com/api/?name=user&background=random",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "basic",
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          user.password = hashPassword(user.password);
        },
      },
    }
  );

  return User;
};