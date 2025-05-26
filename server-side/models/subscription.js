"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Subscription.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "User ID is required",
          },
        },
      },
      planType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "free",
        validate: {
          isIn: {
            args: [["free", "basic", "premium"]],
            msg: "Plan type must be 'free', 'basic', or 'premium'",
          },
        },
      },
      startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      transactionId: {
        type: DataTypes.STRING,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        validate: {
          isIn: {
            args: [["pending", "success", "failed", "expired"]],
            msg: "Payment status must be 'pending', 'success', 'failed', or 'expired'",
          },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
