const mysql = require("mysql2/promise");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "dazer.sana",
  database: "authentication",
};

const pool = mysql.createPool(dbConfig);

const createUser = async (name, email, username, hashedPassword) => {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)",
    [name, email, username, hashedPassword]
  );

  return result.insertId;
};

const getUserByEmail = async (email) => {
  const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return users[0];
};
const getUserByName = async (pattern) => {
  const [users] = await pool.execute(
    "SELECT * FROM users WHERE name REGEXP ?",
    [pattern]
  );
  return users;
};
const getId = async (email) => {
  const user_id = await pool.execute(
    "select user_id from users where email=?",
    [email]
  );
  return user_id[0];
};
const getName = async (email) => {
  const name = await pool.execute("select name from users where email=?", [
    email,
  ]);
  return name[0];
};
const getNameById = async (user_id) => {
  console.log(user_id);
  const name = await pool.execute("select name from users where user_id=?", [
    user_id,
  ]);
  const names = name[0].map((obj) => obj.name);
  console.log(names[0]);
  return names[0];
};

const set_Online = async (user_id) => {
  const [result] = await pool.execute(
    "update users set is_online=1 where user_id=?",
    [user_id]
  );
};
const set_Offline = async (user_id) => {
  const [result] = await pool.execute(
    "update users set is_online=0 where user_id=?",
    [user_id]
  );
};
const get_status = async (user_id) => {
  const status = await pool.execute(
    "select is_online from users where user_id=?",
    [user_id]
  );
  return status[0];
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserByName,
  set_Online,
  getId,
  getName,
  set_Offline,
  get_status,
  getNameById,
};
