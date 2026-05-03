/**
 * crudRouter(Model, prefix)
 * Creates GET all, POST create, PUT update, DELETE by id routes.
 * Falls back to local storage when MongoDB is not available.
 */
const express = require('express');
const auth = require('../middleware/auth');
const localData = require('../localData');

function crudRouter(Model, prefix) {
  const router = express.Router();
  
  // Determine resource type from model
  const resourceTypeMap = {
    'Learner': 'learners',
    'Instructor': 'instructors',
    'Vehicle': 'vehicles',
    'Booking': 'bookings',
    'Payment': 'payments',
    'Maintenance': 'maintenance',
  };
  
  const resourceType = resourceTypeMap[Model.modelName] || 'data';

  // GET all
  router.get('/', auth, async (req, res) => {
    try {
      // Try MongoDB first
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      // Fallback to local storage
      try {
        const items = localData.getAll(resourceType);
        res.json(items);
      } catch (fallbackErr) {
        res.status(500).json({ message: 'Failed to retrieve items' });
      }
    }
  });

  // POST create
  router.post('/', auth, async (req, res) => {
    try {
      // Try MongoDB first
      const count = await Model.countDocuments();
      const COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#6366F1','#EC4899'];
      const color = COLORS[count % COLORS.length];
      const idCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const item = new Model({ ...req.body, idCode, color });
      await item.save();
      res.status(201).json(item);
    } catch (err) {
      // Fallback to local storage
      try {
        const item = localData.create(resourceType, req.body, prefix);
        res.status(201).json(item);
      } catch (fallbackErr) {
        res.status(400).json({ message: fallbackErr.message || 'Failed to create item' });
      }
    }
  });

  // PUT update
  router.put('/:id', auth, async (req, res) => {
    try {
      // Try MongoDB first
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) throw new Error('Not found');
      res.json(item);
    } catch (err) {
      // Fallback to local storage
      try {
        const item = localData.update(resourceType, req.params.id, req.body);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
      } catch (fallbackErr) {
        res.status(400).json({ message: fallbackErr.message || 'Failed to update item' });
      }
    }
  });

  // DELETE
  router.delete('/:id', auth, async (req, res) => {
    try {
      // Try MongoDB first
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new Error('Not found');
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      // Fallback to local storage
      try {
        const item = localData.remove(resourceType, req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
      } catch (fallbackErr) {
        res.status(500).json({ message: fallbackErr.message || 'Failed to delete item' });
      }
    }
  });

  return router;
}

module.exports = crudRouter;
