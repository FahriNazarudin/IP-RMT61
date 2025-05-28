const { Movie, sequelize } = require("../models"); 
const { Op } = require("sequelize");

class MovieController {
  static async getAllMovies(req, res, next) {
    try {
      const { genre, sort, page, limit } = req.query;


      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 12;
      const offset = (pageNumber - 1) * pageSize;


      const where = {};
      if (genre) {
        where.genres = sequelize.literal(`genres::text ILIKE '%"${genre}"%'`);
      }



      const order = [];
      if (sort === "release_date") {
        order.push(["release_date", "ASC"]);
      } else if (sort === "-release_date") {
        order.push(["release_date", "DESC"]);
      }

      const movies = await Movie.findAndCountAll({
        where,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        order,
        limit: pageSize,
        offset,
      });

      return res.status(200).json({
        totalItems: movies.count,
        totalPages: Math.ceil(movies.count / pageSize),
        currentPage: pageNumber,
        movies: movies.rows,
      });
    } catch (error) {
      console.error("Error in getAllMovies:", error); 
      next(error);
    }
  }

  static async getMovieById(req, res, next) {
    const id = req.params.id;
    try {
      const movie = await Movie.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      if (!movie) {
        throw { name: "NotFound", message: "Movie not found" };
      }

      return res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async getGenres(req, res, next) {
    try {
      const movies = await Movie.findAll({
        attributes: ["genres"],
        raw: true,
      });


      const allGenres = [];
      movies.forEach((movie) => {
        if (movie.genres) {
          try {

            const movieGenres =
              typeof movie.genres === "string"
                ? JSON.parse(movie.genres)
                : movie.genres;

            if (Array.isArray(movieGenres)) {
              allGenres.push(...movieGenres);
            } else if (typeof movieGenres === "string") {
              allGenres.push(movieGenres);
            }
          } catch (error) {
            console.error("Error parsing genres:", error);
          }
        }
      });


      const uniqueGenres = [...new Set(allGenres)].filter(Boolean).sort();

      return res.status(200).json(uniqueGenres);
    } catch (error) {
      console.error("Error in getGenres:", error);
      next(error);
    }
  }
}

module.exports = MovieController;
