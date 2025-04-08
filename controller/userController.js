const dbcon = require("../db/dbConfig");
const bcrypt = require("bcrypt");

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;
  // console.log(req.body, "register body");
  if (!username || !email || !password || !firstname || !lastname) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "All input is required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 8 characters" });
  }
  try {
    const [user] = await dbcon.query(
      "SELECT username,user_id FROM users WHERE email = ? or username = ?",
      [email, username]
    );
    if (user.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await dbcon.query(
      "INSERT INTO users (username,email,password,first_name,last_name) VALUES (?,?,?,?,?)",
      [username, email, hashedPassword, firstname, lastname]
    );
    return res.status(201).json({ msg: "User created" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body, "login body");

  if (!email || !password) {
    return res.status(401).json({ msg: "Please enter all the fields" });
  }

  try {
    const [user] = await dbcon.query(
      "SELECT username, user_id, password FROM users WHERE email = ?",
      [email]
    );

    if (user.length == 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const username = user[0].username;
    const userid = user[0].user_id;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .json({ msg: "User login successful", token, username, userid });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server faced an error" });
  }
};
async function checkUser(req, res) {
  // console.log("in check");
  const username = req.user.username;
  const userid = req.user.user_id;
  // console.log(username, userid);
  res.status(StatusCodes.OK).json({ msg: "valid user", username, userid });
  // res.send("hello this is check user")
}
async function getFullName(req, res) {
  // console.log("am in full name");
  const [userfullname] = await dbcon.query(
    "SELECT *  FROM users WHERE user_id = ?",
    1
  );
  // console.log(req.body.user_id);
  //   fullname = userfullname[0].firstname + " " + userfullname[0].lastname
  //   console.log(
  //     "user full name",
  //     userfullname[0].firstname + " " + userfullname[0].lastname
  //   )
  //   res.status(StatusCodes.OK).json({ msg: "valid user", fullname })
  // res.send("hello this is check user")
}

module.exports = { login, register, checkUser, getFullName };
