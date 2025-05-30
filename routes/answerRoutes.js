const express = require("express");
// const { post } = require("./questionRoute");
const router = express.Router();
const { postAnswer, getAnswer } = require("../controller/answerController");
router.post("/", postAnswer);
router.get("/:question_id", getAnswer);
module.exports = router;
