
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Asosiasi
      Order.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  Order.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "User ID harus diisi" },
        },
      },
      plan_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Tipe Plan harus diisi" },
          isIn: {
            args: [['basic', 'premium']],
            msg: "Tipe plan harus 'basic' atau 'premium'"
          }
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [0], msg: "Jumlah harus lebih dari 0" },
        },
      },
      payment_method: {
        type: DataTypes.STRING,
      },
      transaction_id: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        validate: {
          isIn: {
            args: [["pending", "success", "failed", "expired"]],
            msg: "Status harus 'pending', 'success', 'failed', atau 'expired'",
          },
        },
      },
      transaction_date: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },
      valid_until: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Order",
      hooks: {
        beforeCreate: (order) => {
          // Set masa berlaku 30 hari setelah transaksi (dapat disesuaikan)
          if (!order.valid_until) {
            const validDate = new Date();
            validDate.setDate(validDate.getDate() + 30);
            order.valid_until = validDate;
          }
        },
        afterCreate: async (order, options) => {
          if (order.status === 'success') {
            // Update status user jika pembayaran berhasil
            const User = sequelize.models.User;
            await User.update({ status: order.plan_type }, {
              where: { id: order.user_id },
              transaction: options.transaction
            });
          }
        },
        afterUpdate: async (order, options) => {
          // Update status user saat status pembayaran berubah
          if (order.changed('status') && order.status === 'success') {
            const User = sequelize.models.User;
            await User.update({ status: order.plan_type }, {
              where: { id: order.user_id },
              transaction: options.transaction
            });
          }
        }
      }
    }
  );

  return Order;
};