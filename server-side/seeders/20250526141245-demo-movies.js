"use strict";
const axios = require("axios");
require("dotenv").config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("API Key available:", !!process.env.TMDB_API_KEY);


      const { data: genreData } = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`
      );


      const genreMap = Object.fromEntries(
        genreData.genres.map((genre) => [genre.id, genre.name])
      );


      let allMovies = [];
      const pages = 5;

      console.log("Mengambil data film dari TMDB API...");
      for (let page = 1; page <= pages; page++) {
        console.log(`Halaman ${page}/${pages}...`);
        const { data: movieData } = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&page=${page}`
        );
        allMovies = [...allMovies, ...movieData.results];


        await new Promise((r) => setTimeout(r, 500));
      }


      allMovies = allMovies.slice(0, 100);
      console.log(`Total film terkumpul: ${allMovies.length}`);


      const batchSize = 10;
      const totalBatches = Math.ceil(allMovies.length / batchSize);
      let moviesWithTrailers = [];

      for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * batchSize;
        const end = Math.min(start + batchSize, allMovies.length);
        const currentBatch = allMovies.slice(start, end);

        console.log(
          `Memproses batch ${batch + 1}/${totalBatches} (film ${
            start + 1
          }-${end})...`
        );

        const batchResults = await Promise.all(
          currentBatch.map(async (movie, idx) => {
            const index = start + idx; 


            let trailer = null;
            try {
              const { data } = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${process.env.TMDB_API_KEY}`
              );

              const trailerVideo =
                data.results?.find(
                  (v) => v.type === "Trailer" && v.site === "YouTube"
                ) || data.results?.find((v) => v.site === "YouTube");

              if (trailerVideo)
                trailer = `https://www.youtube.com/watch?v=${trailerVideo.key}`;
            } catch (err) {
              console.log(
                `Gagal mengambil trailer untuk ${movie.title}: ${err.message}`
              );
            }


            return {
              id: index + 1,
              title: movie.title,
              description: movie.overview,
              posterfilm: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              release_date: movie.release_date,
              trailer,
              genres: JSON.stringify(
                movie.genre_ids.map((id) => genreMap[id] || `Genre ${id}`)
              ),
              vote_average: movie.vote_average,
              popularity: movie.popularity,
              language: movie.original_language,
              voteCount: movie.vote_count,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          })
        );

        moviesWithTrailers = [...moviesWithTrailers, ...batchResults];


        if (batch < totalBatches - 1) {
          console.log("Jeda sejenak untuk menghindari rate limit...");
          await new Promise((r) => setTimeout(r, 2000));
        }
      }



      await queryInterface.bulkInsert("Movies", moviesWithTrailers);

    } catch (error) {
      console.error("Error seeding movies:", error.message);
      if (error.response) console.error("Response data:", error.response.data);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Movies", null);
  },
};
