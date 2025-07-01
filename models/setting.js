const { db } = require('../database');

class Setting {
    static findByKey(key, callback) {
        const sql = 'SELECT * FROM settings WHERE key = ?';
        db.get(sql, [key], callback);
    }

    static update(key, value, callback) {
        const sql = 'UPDATE settings SET value = ? WHERE key = ?';
        db.run(sql, [value, key], callback);
    }
}

module.exports = Setting;