const {
  getAIResponse,
  extractKeywordsFromResponse,
} = require("../helpers/openai");
const { Movie } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../models").sequelize;

class AIController {
  static async getAIResponse(req, res) {
    try {
      const { question } = req.query || {};
      const searchQuery = question || "What are some good movies to watch?";

      const aiResponse = await getAIResponse(searchQuery);

      const rawKeywords = extractKeywordsFromResponse(aiResponse);

      const keywords = rawKeywords.map((k) => k.replace(/\*/g, "").trim());

      const filteredKeywords = keywords.filter(
        (k) =>
          k.length > 3 &&
          ![
            "this",
            "that",
            "with",
            "from",
            "what",
            "when",
            "where",
            "film",
            "movie",
          ].includes(k.toLowerCase())
      );

      console.log("Keywords for searching:", filteredKeywords);

      let movies = [];

      try {
        movies = await Movie.findAll({
          where: {
            title: {
              [Op.or]: filteredKeywords.map((k) => ({ [Op.iLike]: `%${k}%` })),
            },
          },
          limit: 10,
        });

        if (movies.length === 0) {
          const genreKeywords = [
            "horror",
            "action",
            "comedy",
            "drama",
            "thriller",
            "sci-fi",
            "animation",
          ];
          const matchedGenres = filteredKeywords.filter((k) =>
            genreKeywords.some((g) => k.toLowerCase().includes(g.toLowerCase()))
          );

          if (matchedGenres.length > 0) {
            movies = await Movie.findAll({
              where: {
                [Op.or]: matchedGenres.map((genre) => ({
                  [Op.and]: sequelize.where(
                    sequelize.fn(
                      "LOWER",
                      sequelize.cast(sequelize.col("genres"), "text")
                    ),
                    "LIKE",
                    `%${genre.toLowerCase()}%`
                  ),
                })),
              },
              limit: 10,
            });
          } else {
            movies = await Movie.findAll({
              order: [["popularity", "DESC"]],
              limit: 10,
            });
          }
        }
      } catch (queryError) {
        console.error("Error in movie query:", queryError);

        movies = await Movie.findAll({
          limit: 10,
        });
      }

      res.status(200).json({
        recommendations: aiResponse,
        movies: movies,
      });
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  }
}

module.exports = AIController;
