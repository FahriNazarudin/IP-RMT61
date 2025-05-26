"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserMovie extends Model {
    static associate(models) {
      // define association here
      UserMovie.belongsTo(models.User, { foreignKey: "userId" });
      UserMovie.belongsTo(models.Movie, { foreignKey: "movieId" });
    }
  }
  UserMovie.init(
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
      movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Movie ID is required",
          },
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "watchlist",
        validate: {
          isIn: {
            args: [["watchlist", "watched"]],
            msg: "Status must be either 'watchlist' or 'watched'",
          },
        },
      },
      watchProgress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      lastWatched: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "UserMovie",
      indexes: [
        {
          unique: true,
          fields: ["userId", "movieId"],
        },
      ],
    }
  );
  return UserMovie;
};
