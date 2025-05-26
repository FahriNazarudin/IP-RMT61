"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserMovies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      movieId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Movies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "watchlist",
      },
      watchProgress: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastWatched: {
        type: Sequelize.DATE,
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

    // Add unique constraint to prevent duplicate entries
    await queryInterface.addConstraint("UserMovies", {
      fields: ["userId", "movieId"],
      type: "unique",
      name: "unique_user_movie",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserMovies");
  },
};
