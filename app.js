const express = require("express");
const gameRouter = require("./routes/gameRouter");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api/games", gameRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
