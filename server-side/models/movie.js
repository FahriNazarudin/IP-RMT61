"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      // define association here
      Movie.hasMany(models.UserMovie, { foreignKey: "movieId" });
    }
  }
  Movie.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Movie title is required",
          },
        },
      },
      overview: {
        type: DataTypes.TEXT,
      },
      posterPath: {
        type: DataTypes.STRING,
      },
      backdropPath: {
        type: DataTypes.STRING,
      },
      releaseDate: {
        type: DataTypes.DATE,
      },
      trailerYoutubeId: {
        type: DataTypes.STRING,
      },
      tmdbRating: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0,
          max: 10,
        },
      },
      genres: {
        type: DataTypes.JSON,
      },
      accessLevel: {
        type: DataTypes.STRING,
        defaultValue: "basic",
        validate: {
          isIn: {
            args: [["free", "basic", "premium"]],
            msg: "Access level must be 'free', 'basic', or 'premium'",
          },
        },
      },
      popularity: {
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      modelName: "Movie",
    }
  );
  return Movie;
};
