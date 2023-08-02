require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dbroutes = require("./routes/dbroutes");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userroutes");
const path = require("path");

const app = express();

const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use("/api/expenses", dbroutes);
app.use("/api/user/", userRoutes);

app.use(errorHandler);


  app.get("/", (req, res) => {
    res.send("API is running");
  });

app.listen(port, () => console.log(`Server is running on port ${port}`));
