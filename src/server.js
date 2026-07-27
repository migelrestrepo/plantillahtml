const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./config/database');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');

const PORT = 3000;
const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

const app = express();

app.use(express.json());
app.use(express.static('public'));

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields: name, email, password' });
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const maxPositionResult = db.prepare('SELECT MAX(position) as maxPos FROM waitlist').get();
    const nextPosition = (maxPositionResult.maxPos || 0) + 1;

    const insert = db.prepare(`
      INSERT INTO waitlist (name, email, password_hash, position)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(name.trim(), email.trim().toLowerCase(), passwordHash, nextPosition);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email: email.trim().toLowerCase() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Successfully registered',
      position: nextPosition,
      token,
      userId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields: email, password' });
  }

  try {
    const user = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      position: user.position
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me
app.get('/api/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, position, created_at FROM waitlist WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM waitlist').get();

    res.json({
      name: user.name,
      email: user.email,
      position: user.position,
      totalUsers: totalUsers.count,
      registeredAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Kōhi server running on http://localhost:${PORT}`);
});
