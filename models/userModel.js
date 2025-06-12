const db = require("../db");
const bcrypt = require("bcryptjs");

// Find a user by their email address
exports.findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) reject(err);
      resolve(user);
    });
  });
};

// Find a user by their ID
exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, name, email FROM users WHERE id = ?",
      [id],
      (err, user) => {
        if (err) reject(err);
        resolve(user);
      }
    );
  });
};

// Create a new user
exports.create = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(sql, [name, email, hashedPassword], function (err) {
      if (err) reject(err);
      resolve({ id: this.lastID, name, email });
    });
  });
};

// Update a user's details
exports.update = async ({ userId, name, password }) => {
  return new Promise(async (resolve, reject) => {
    let sql, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = "UPDATE users SET name = ?, password = ? WHERE id = ?";
      params = [name, hashedPassword, userId];
    } else {
      sql = "UPDATE users SET name = ? WHERE id = ?";
      params = [name, userId];
    }
    db.run(sql, params, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
