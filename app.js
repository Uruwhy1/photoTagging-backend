const express = require("express");
const gameRouter = require("./routes/gameRouter");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  const origin = req.get("origin") || "No origin";
  console.log(`Origin: ${origin}`, origin == process.env.CORS_ORIGIN);

  console.log(req.url);
  next();
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", 
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/", gameRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
