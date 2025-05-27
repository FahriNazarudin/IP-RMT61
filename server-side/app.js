const express = require("express");

const UserController = require("./controllers/UserController");

const app = express();
const port = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);







app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


module.exports = app; 