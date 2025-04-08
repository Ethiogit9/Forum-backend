const dbcon = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

async function postAnswer(req, res) {
  const { question_id, content } = req.body;
  const user_id = req.user?.user_id;

  if (!content || !question_id || !user_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Missing content, question_id or user_id",
    });
  }

  try {
    await dbcon.query(
      "INSERT INTO answers (user_id,question_id,content) VALUES (?,?,?)",
      [user_id, question_id, content]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Answer posted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred." });
  }
}

async function getAnswer(req, res) {
  const { question_id } = req.params;
  try {
    const [answers] = await dbcon.query(
      `SELECT a.answer_id,a.user_id,a.question_id,a.content,u.username from answers a join users u on a.user_id=u.user_id WHERE question_id = '${question_id}'`
    );
    return res
      .status(StatusCodes.OK)
      .json({ message: "Answers retrieved successfully", answers });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred." });
  }
}

module.exports = { postAnswer, getAnswer };
