const { Watchlist, Movie } = require("../models");


module.exports = class WatchlistController {
  static async addToWatchlist(req, res, next) {
    const { movieId } = req.body;
    const userId = req.user.id;
    if (!movieId) {
      throw { name : "NotFound" , message: "Movie id is required" };
    }
    if (!userId) {
      throw { name : "NotFound" , message: "user id is required" };
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
}