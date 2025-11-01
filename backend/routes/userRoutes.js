const express = require('express');
const router = express.Router();
const userController = require("../controllers/index").userController

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/getByTeam/:id", userController.getUsersByTeamId);

module.exports = router;