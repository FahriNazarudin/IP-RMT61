const { Watchlist, Movie } = require("../models");

module.exports = class WatchlistController {
  static async addToWatchlist(req, res, next) {
    const { movieId } = req.body;
    const userId = req.user.id;
    if (!movieId) {
      throw { name: "NotFound", message: "Movie id is required" };
    }
    if (!userId) {
      throw { name: "NotFound", message: "user id is required" };
    }
    try {
      const watchlistItem = await Watchlist.create({
        user_id: userId,
        movie_id: movieId,
      });

      return res.status(201).json({
        message: "Movie added to watchlist",
        watchlistItem,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWatchlist(req, res, next) {
    const userId = req.user.id;
    try {
      const watchlistItems = await Watchlist.findAll({
        where: { user_id: userId },
        include: {
          model: Movie,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      });

      return res.status(200).json(watchlistItems);
    } catch (error) {
      next(error);
    }
  }

  static async deleteWatchlist(req, res, next) {
    const { id } = req.params;
    const userId = req.user.id;
    if (!id) {
      throw { name: "NotFound", message: "Watchlist is not found!" };
    }
    try {
        const watchlistItem = await Watchlist.findOne({
            where: { id, user_id: userId },
        });
    
        if (!watchlistItem) {
            throw { name: "NotFound", message: "Watchlist not found" };
        }
    
        await watchlistItem.destroy();
    
        return res.status(200).json({
            message: "Watchlist deleted successfully",
        });

    } catch (error) {
        next(error);
    }
  }
};
