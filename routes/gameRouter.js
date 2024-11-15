const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController"); // Import the game controller

router.post("/start", gameController.startGame);
router.post("/:gameId/check", gameController.checkCharacter);
router.get("/highscores", gameController.getHighScores);

module.exports = router;
