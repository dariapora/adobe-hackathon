const express = require('express');
const router = express.Router();
const teamController = require("../controllers/index").teamController

router.post("/create-team", teamController.createTeam)
router.get("/", teamController.getAllTeams)

module.exports = router;