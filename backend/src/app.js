const path = require("path");
const express = require("express");
const cors = require("cors");

const { router } = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const frontendPath = path.join(__dirname, "..", "..", "frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

app.use("/api", router);
app.use(errorHandler);

module.exports = { app };
