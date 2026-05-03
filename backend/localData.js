/**
 * Local file-based data storage system for development
 * Handles all CRUD operations for learners, instructors, vehicles, etc.
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#6366F1','#EC4899'];

// Initialize default data structure
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      learners: [],
      instructors: [],
      vehicles: [],
      bookings: [],
      payments: [],
      maintenance: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    console.log('✅ Local data storage initialized');
  }
}

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      learners: [],
      instructors: [],
      vehicles: [],
      bookings: [],
      payments: [],
      maintenance: [],
    };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Generate ID code with prefix
function generateIdCode(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Get all items of a type
function getAll(type) {
  const data = readData();
  return data[type] || [];
}

// Get single item by ID
function getById(type, id) {
  const data = readData();
  const items = data[type] || [];
  return items.find(item => item.id === id);
}

// Create new item
function create(type, itemData, prefix) {
  const data = readData();
  const items = data[type] || [];
  
  const count = items.length;
  const color = COLORS[count % COLORS.length];
  const idCode = generateIdCode(prefix);
  
  const newItem = {
    id: generateId(),
    idCode,
    color,
    createdAt: new Date().toISOString(),
    ...itemData,
  };
  
  items.push(newItem);
  data[type] = items;
  writeData(data);
  
  return newItem;
}

// Update item
function update(type, id, updateData) {
  const data = readData();
  const items = data[type] || [];
  
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  
  data[type] = items;
  writeData(data);
  
  return items[index];
}

// Delete item
function remove(type, id) {
  const data = readData();
  const items = data[type] || [];
  
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const deleted = items[index];
  items.splice(index, 1);
  data[type] = items;
  writeData(data);
  
  return deleted;
}

// Get dashboard stats
function getStats() {
  const data = readData();
  
  return {
    learners: data.learners.length,
    instructors: data.instructors.length,
    vehicles: data.vehicles.length,
    bookings: data.bookings.length,
    payments: data.payments.length,
    revenue: data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
  };
}

module.exports = {
  initializeData,
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
};
