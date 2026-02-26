const { query } = require('../database/connection');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ name, email, password }) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const { rows } = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    return rows[0];
  },

  verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  },
};

module.exports = User;
