const db = require("../database").db;
const bcrypt = require("bcryptjs");

class User {
  constructor({ id, full_name, email, password }) {
    this.id = id;
    this.full_name = full_name;
    this.email = email;
    this.password = password;
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return reject(err);
        if (user) resolve(new User(user));
        else resolve(null);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
        if (err) return reject(err);
        if (user) resolve(new User(user));
        else resolve(null);
      });
    });
  }

  static async create({ full_name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
      db.run(sql, [full_name, email, hashedPassword], function (err) {
        if (err) return reject(err);
        resolve(new User({ id: this.lastID, full_name, email, password: hashedPassword }));
      });
    });
  }

  static async update({ userId, full_name, password }) {
    return new Promise(async (resolve, reject) => {
      let sql, params;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = "UPDATE users SET full_name = ?, password = ? WHERE id = ?";
        params = [full_name, hashedPassword, userId];
      } else {
        sql = "UPDATE users SET full_name = ? WHERE id = ?";
        params = [full_name, userId];
      }
      db.run(sql, params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = User;
