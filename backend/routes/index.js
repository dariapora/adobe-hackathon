const express = require("express");
const router = express.Router();
const userRouter = require("./userRoutes");
const teamRouter = require("./teamRoutes");
const authRouter = require("./authRoutes");
const postRouter = require("./postRouter");
const messageRouter = require("./messageRoutes");
const eventRouter = require("./eventRouter");
const commentRouter = require("./commentRoutes");

router.use("/auth", authRouter);
router.use("/team", teamRouter);
router.use("/user", userRouter);
router.use("/post", postRouter);
router.use("/messages", messageRouter);
router.use("/event", eventRouter);
router.use("/comments", commentRouter);

module.exports = router;