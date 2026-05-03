/**
 * Local file-based authentication system for development mode
 * This allows login without MongoDB connectivity
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize default admin user if file doesn't exist
function initializeUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultAdmin = {
      id: 'admin-1',
      email: 'arampath@driveease.com',
      password: bcrypt.hashSync('123456', 10),
      name: 'Admin',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [defaultAdmin] }, null, 2));
    console.log('✅ Local auth initialized with default admin');
  }
}

function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data).users || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email === email);
}

function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function createUser(email, password, name = 'User', extra = {}) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  const newUser = {
    id: 'user-' + Date.now(),
    email,
    password: bcrypt.hashSync(password, 10),
    name,
    ...extra,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return { id: newUser.id, email: newUser.email, name: newUser.name, ...extra };
}

module.exports = {
  initializeUsers,
  findUserByEmail,
  validatePassword,
  createUser,
  getUsers
};
