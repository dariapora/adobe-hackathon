const express = require("express");
const router = express.Router();
const userRouter = require("./userRoutes");
const teamRouter = require("./teamRoutes");
const authRouter = require("./authRoutes");

router.use("/auth", authRouter)
router.use("/team", teamRouter)
router.use("/user", userRouter)

module.exports = router;