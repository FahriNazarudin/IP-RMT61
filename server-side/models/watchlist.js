"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Watchlist extends Model {
    static associate(models) {
      // Asosiasi
      Watchlist.belongsTo(models.User, { foreignKey: "user_id" });
      Watchlist.belongsTo(models.Movie, { foreignKey: "movie_id" });
    }
  }

  Watchlist.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "User ID harus diisi" },
        },
      },
      movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Movie ID harus diisi" },
        },
      },
      watclistMovie: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Watchlist",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "movie_id"],
        },
      ],
    }
  );

  return Watchlist;
};
