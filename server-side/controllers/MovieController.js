const axios  = require("axios");

 class MovieController {
   static async getAllMovies(req, res, next) {
     try {
       const [genreResponse, movieResponse] = await Promise.all([
         axios({
           method: "get",
           url: "https://api.themoviedb.org/3/genre/movie/list",
           headers: {
             Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
           },
         }),
         axios({
           method: "get",
           url: "https://api.themoviedb.org/3/movie/top_rated",
           headers: {
             Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
           },
         }),
       ]);

       const genreMap = {};
       genreResponse.data.genres.forEach((genre) => {
         genreMap[genre.id] = genre.name;
       });

       const limitedMovies = movieResponse.data.results.slice(0, 10);

       const moviesWithTrailers = await Promise.all(
         limitedMovies.map(async (movie) => {
           let trailer = null;
           try {
             const videoResponse = await axios({
               method: "get",
               url: `https://api.themoviedb.org/3/movie/${movie.id}/videos`,
               headers: {
                 Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
               },
             });

             const trailerVideo =
               videoResponse.data.results.find(
                 (video) => video.type === "Trailer" && video.site === "YouTube"
               ) ||
               videoResponse.data.results.find(
                 (video) => video.site === "YouTube"
               );

             if (trailerVideo) {
               trailer = `https://www.youtube.com/watch?v=${trailerVideo.key}`;
             }
           } catch (err) {
             console.log(`Couldn't fetch trailer for ${movie.title}`);
           }

           return {
             title: movie.title,
             description: movie.overview,
             posterfilm: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
             release_date: movie.release_date,
             trailer,
             genres: movie.genre_ids.map((id) => genreMap[id] || `Genre ${id}`),
             vote_average: movie.vote_average,
             popularity: movie.popularity,
             language: movie.original_language,
             voteCount: movie.vote_count,
           };
         })
       );

       res.json(moviesWithTrailers);
     } catch (error) {
       next(error);
     }
   }

   static async getMovieById(req, res, next) {
     try {
       const movieId = req.params.id;
       const response = await axios({
         method: "get",
         url: `https://api.themoviedb.org/3/movie/${movieId}`,
         headers: {
           Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
         },
       });
       console.log(response.data, "<<< movieResponse");

       return res.status(200).json(movie);
     } catch (error) {
       next(error);
     }
   }

   static async getMovieById(req, res, next) {
     try {
       const movieId = req.params.id;


       const [movieResponse, videoResponse] = await Promise.all([
         axios({
           method: "get",
           url: `https://api.themoviedb.org/3/movie/${movieId}`,
           headers: {
             Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
           },
         }),
         axios({
           method: "get",
           url: `https://api.themoviedb.org/3/movie/${movieId}/videos`,
           headers: {
             Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
           },
         }),
       ]);

       const movieData = movieResponse.data;


       const videos = videoResponse.data.results || [];
       const trailerVideo =
         videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
         videos.find((v) => v.site === "YouTube");


       return res.status(200).json({
         id: movieData.id,
         title: movieData.title,
         description: movieData.overview,
         posterfilm: movieData.poster_path
           ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
           : null,
         release_date: movieData.release_date,
         trailer: trailerVideo
           ? `https://www.youtube.com/watch?v=${trailerVideo.key}`
           : null,
         genres: movieData.genres.map((g) => g.name),
         vote_average: movieData.vote_average,
         popularity: movieData.popularity,
         language: movieData.original_language,
         voteCount: movieData.vote_count,
         runtime: movieData.runtime,
         budget: movieData.budget,
         revenue: movieData.revenue,
         status: movieData.status,
       });
     } catch (error) {
       console.error("Error fetching movie by ID:", error.message);
       next(error);
     }
   }
 }

module.exports = MovieController;