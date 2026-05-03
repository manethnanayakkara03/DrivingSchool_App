/**
 * crudRouter(Model, prefix)
 * Creates GET all, POST create, PUT update, DELETE by id routes.
 * All operations use MongoDB via Mongoose.
 */
const express = require('express');
const auth = require('../middleware/auth');

function crudRouter(Model, prefix) {
  const router = express.Router();

  const COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#6366F1','#EC4899'];

  // GET all
  router.get('/', auth, async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      console.error(`GET ${Model.modelName} error:`, err.message);
      res.status(500).json({ message: 'Failed to retrieve items' });
    }
  });

  // POST create
  router.post('/', auth, async (req, res) => {
    try {
      const count = await Model.countDocuments();
      const color = COLORS[count % COLORS.length];
      const idCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const item = new Model({ ...req.body, idCode, color });
      await item.save();
      res.status(201).json(item);
    } catch (err) {
      console.error(`POST ${Model.modelName} error:`, err.message);
      res.status(400).json({ message: err.message || 'Failed to create item' });
    }
  });

  // PUT update
  router.put('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) {
      console.error(`PUT ${Model.modelName} error:`, err.message);
      res.status(400).json({ message: err.message || 'Failed to update item' });
    }
  });

  // DELETE
  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      console.error(`DELETE ${Model.modelName} error:`, err.message);
      res.status(500).json({ message: err.message || 'Failed to delete item' });
    }
  });

  return router;
}

module.exports = crudRouter;
