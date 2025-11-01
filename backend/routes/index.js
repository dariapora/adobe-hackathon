const express = require("express");
const router = express.Router();
const userRouter = require("./userRoutes");
const teamRouter = require("./teamRoutes");
const authRouter = require("./authRoutes");
const postRouter = require("./postRouter");

router.use("/auth", authRouter)
router.use("/team", teamRouter)
router.use("/user", userRouter)
router.use("/post", postRouter)

module.exports = router;