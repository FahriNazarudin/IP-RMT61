if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
require("dotenv").config();
const express = require("express");

const UserController = require("./controllers/UserController");
const MovieController = require("./controllers/MovieController");
const WatchlistController = require("./controllers/WatchlistController");
const PaymentConrtroller = require("./controllers/PaymentController");
const errorHandler = require("./middlewares/errorHandler");
const authentication = require("./middlewares/authentication");
const cors = require("cors");
const AIController = require("./controllers/AIController");

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
app.post("/google-login", UserController.googleLogin);

app.use(authentication);

app.get("/movies/recommendations", AIController.getAIResponse);

app.get("/users/:id", UserController.getUserById);
app.put("/users/:id", UserController.updateUser);
app.delete("/users/:id", UserController.deleteUser);

app.get("/movies", MovieController.getAllMovies);
app.get("/movies/genres", MovieController.getGenres); // New route for getting genres
app.get("/movies/:id", MovieController.getMovieById);

app.post("/watchlists", WatchlistController.addToWatchlist);
app.get("/watchlists", WatchlistController.getWatchlist);
app.delete("/watchlists/:id", WatchlistController.deleteWatchlist);

//midtrans payment
app.patch("/users/me/upgrade", UserController.upgradeUser);
app.get("/payment/midtrans/initiate", PaymentConrtroller.initiatePayment);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
