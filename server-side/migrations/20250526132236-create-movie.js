// filepath: /Users/fahrinzrdn/Documents/Hacktiv8/phase-2-repeat/Individual Project/IP-RMT61/server-side/migrations/XXXXXX-create-movie.js
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Movies", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      overview: {
        type: Sequelize.TEXT,
      },
      posterPath: {
        type: Sequelize.STRING,
      },
      backdropPath: {
        type: Sequelize.STRING,
      },
      releaseDate: {
        type: Sequelize.DATE,
      },
      trailerYoutubeId: {
        type: Sequelize.STRING,
      },
      tmdbRating: {
        type: Sequelize.FLOAT,
      },
      genres: {
        type: Sequelize.JSON,
      },
      accessLevel: {
        type: Sequelize.STRING,
        defaultValue: "basic",
      },
      popularity: {
        type: Sequelize.FLOAT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Movies");
  },
};
