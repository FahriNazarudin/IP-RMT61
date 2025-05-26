"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserMovie, { foreignKey: "userId" });
      User.hasMany(models.Subscription, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          len: {
            args: [6, 100],
            msg: "Password must be at least 6 characters",
          },
        },
      },
      displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Display name is required",
          },
        },
      },
      photoUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          user.password = hashPassword(user.password);
        },
        beforeUpdate: (user) => {
          if (user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );
  return User;
};
