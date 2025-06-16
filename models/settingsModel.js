const db = require("../db");

/**
 * Gets all settings from the database and returns them as an object.
 * @returns {Promise<Object>} A promise that resolves to an object of settings.
 */
exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM site_settings", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      // Reduce the array of rows into a single settings object
      const settings = rows.reduce((acc, row) => {
        acc[row.setting_key] = row.setting_value;
        return acc;
      }, {});
      resolve(settings);
    });
  });
};

/**
 * Updates multiple settings in the database.
 * @param {Object} settings - An object where keys are setting names and values are the new setting values.
 * @returns {Promise<void>}
 */
exports.update = (settings) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      try {
        const stmt = db.prepare(
          "UPDATE site_settings SET setting_value = ? WHERE setting_key = ?"
        );

        for (const [key, value] of Object.entries(settings)) {
          stmt.run(value, key, (err) => {
            if (err) throw err;
          });
        }

        stmt.finalize();

        db.run("COMMIT", (err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (err) {
        db.run("ROLLBACK", () => {
          console.error("Transaction rolled back:", err);
          reject(err);
        });
      }
    });
  });
};
