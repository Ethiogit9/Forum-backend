const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

async function autMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication Invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      username: decoded.username,
      user_id: decoded.userid, // 🚨 Make sure this matches your token payload
    };

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication Invalid" });
  }
}

module.exports = autMiddleware;
