const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://ayoub:ayoub@cluster0-hamdp.mongodb.net/task-manager?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
  )
  .then(() => {
    console.log("connected successfully to the database");
  })
  .catch(err => {
    console.log("could not connect to the database", err.message);
  });

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser");

const cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

const port = process.env.PORT || 8080;

app.listen(
  port,
  console.log.bind(this, `the server has started on port: ${port}`)
);
