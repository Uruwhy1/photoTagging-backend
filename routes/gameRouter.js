const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController"); // Import the game controller

router.post("/setup", gameController.setUpGame);
router.post("/:gameId/start", gameController.startGame);
router.post("/:gameId/check", gameController.checkCharacter);
router.get("/highscores", gameController.getHighScores);

module.exports = router;
