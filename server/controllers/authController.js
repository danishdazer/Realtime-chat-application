const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const secretKey = "";

const signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    console.log(name, email, username, password);
    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser(
      name,
      email,
      username,
      hashedPassword
    );

    const token = jwt.sign({ userId, username }, secretKey, {
      expiresIn: "1h",
    });

    const user_id = await userModel.getId(email);
    const namen = await userModel.getName(email);

    res.json({ token, user_id, namen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      secretKey,
      {
        expiresIn: "1h",
      }
    );
    const user_id = await userModel.getId(email);
    const namen = await userModel.getName(email);

    res.json({ token, user_id, namen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const status = async (req, res) => {
  const user_id = req.query.user;
  const onlines = await userModel.get_status(user_id);
  const returnValue = onlines ? onlines[0] : onlines;
  res.json(returnValue);
};
const logout = async (req, res) => {
  const user_id = req.query.user;
  const onlines = await userModel.set_Offline(user_id);
  res.json({ message: "ok" });
};

module.exports = { signup, login, logout, status };
