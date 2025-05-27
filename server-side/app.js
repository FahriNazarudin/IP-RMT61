require("dotenv").config();
const express = require("express");

const UserController = require("./controllers/UserController");
const MovieController = require("./controllers/movieController");
const WatchlistController = require("./controllers/WatchlistController");

const errorHandler = require("./middlewares/errorHandler");
const authentication = require("./middlewares/authentication");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", UserController.register);
app.post("/login", UserController.login);
// app.post("/login/google", UserController.googleLogin);


app.get("/movies", MovieController.getAllMovies);
app.get("/movies/:id", MovieController.getMovieById);

app.use(authentication)

app.post("/watchlists", WatchlistController.addToWatchlist);
app.get("/watchlists", WatchlistController.getWatchlist);
// app.delete("/watchlists/:id", WatchlistController.removeFromWatchlist);
// app.put("/watchlists/:id", WatchlistController.updateWatchlist);




app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
