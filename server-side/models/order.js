'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {

    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  Order.init(
    {
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Order id is required" },
          notNull: { msg: "Order id is required" },
        },
      },
      user_id: DataTypes.INTEGER,
      amount: DataTypes.STRING,
      status: DataTypes.STRING,
      paidDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};