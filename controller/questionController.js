const dbConnection = require("../db/dbConfig");
const { v4: uuidv4 } = require("uuid");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function createQuestion(req, res) {
  const questionid = uuidv4(); // Generate a unique question ID using uuid
  const { title, description } = req.body;
  // console.log(req.body, "create question body");
  const { userid } = req.user;
  // Validate required fields
  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please provide all required fields (title and description)",
    });
  }
  try {
    // Insert question into the database
    await dbConnection.query(
      "INSERT INTO questions (title, description, question_id, user_id) VALUES (?, ?, ?, ?)",
      [title, description, questionid, userid]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Question Posted successfully", questionid });
  } catch (error) {
    console.error("Error creating question:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred", error: error.message });
  }
}

async function singleQuestion(req, res) {
  // res.send(`specific question for id=${req.params.question_id}`)

  const [singleQuestion] = await dbConnection.query(
    `SELECT q.question_id,q.user_id ,q.title,q.description,u.username FROM questions q join users u on q.user_id = u.user_id WHERE q.question_id = '${req.params.question_id}' ORDER BY q.question_id DESC `
  );
  // console.log(singleQuestion);
  return res.status(StatusCodes.OK).json({
    msg: "Question's retrieved successfully ",
    singleQuestion,
  });
}
async function getAllQuestion(req, res) {
  const [allQuestion] = await dbConnection.query(
    "SELECT q.question_id, q.user_id, q.title, q.description, u.username FROM questions q JOIN users u ON q.user_id = u.user_id ORDER BY q.question_id DESC"
  );
  // console.log(allQuestion);
  return res.status(StatusCodes.OK).json({
    msg: "Question's retrieved successfully ",
    allQuestion,
  });
}
async function getSeachedQuestion(req, res) {
  // console.log("am in get searched question function ", req.params.search)
  try {
    const [allQuestion] = await dbConnection.query(
      `SELECT q.question_id,q.user_id ,q.title,q.description,u.username FROM questions q join users u on q.user_id = u.user_id WHERE title like '%${req.params.search}%' or description like '%${req.params.search}%' order by desc `
    );
    // console.log(allQuestion);
    return res.status(StatusCodes.OK).json({
      msg: "Question/s retrieved successfully ",
      allQuestion,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An unexpected error occurred", error: error.message });
  }
}
module.exports = {
  createQuestion,
  getAllQuestion,
  singleQuestion,
  getSeachedQuestion,
};
