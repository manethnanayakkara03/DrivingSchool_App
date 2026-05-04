const router = require('express').Router();
const { upload } = require('../utils/cloudinary');

router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
