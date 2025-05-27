
const { Movie } = require("../models");

 class MovieController {
   static async getAllMovies(req, res, next) {  
    try {
         const movies = await Movie.findAll({
              attributes: {
                 exclude: ["createdAt", "updatedAt"]
              }
         });  
       return res.status(200).json(movies);
     } catch (error) {
       next(error);
     }
    }
   

   static async getMovieById(req, res, next) {
    const id = req.params.id;       
     try {
        const movie = await Movie.findByPk(id, {
          attributes: {
            exclude: ["createdAt", "updatedAt"]
          }
        });
       if (!movie) {
            throw ({ name : "NotFound", message: "Movie not found" });
         } 
         
         return res.status(200).json(movie);
     } catch (error) {
       next(error);
     }
   }
 }

module.exports = MovieController;