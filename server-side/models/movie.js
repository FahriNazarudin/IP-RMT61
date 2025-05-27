
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      // Asosiasi
      Movie.hasMany(models.Watchlist, { foreignKey: "movie_id" });
    }
  }

  Movie.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Judul harus diisi" },
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      posterfilm: {
        type: DataTypes.STRING,
      },
      trailer: {
        type: DataTypes.STRING,
      },
      release_date: {
        type: DataTypes.DATE,
      },
      genres: {
        type: DataTypes.JSON,
      },
      vote_average: {
        type: DataTypes.FLOAT,
      },
      popularity: {
        type: DataTypes.FLOAT,
      },
      language: {
        type: DataTypes.STRING,
      },
      voteCount: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Movie",
    }
  );

  return Movie;
};