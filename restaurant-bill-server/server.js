const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors()); // Allow cross-origin requests
app.use('/uploads', express.static('uploads')); // Serve uploaded files publicly

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder to save uploaded files
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${cleanName}`);
  },
});

const upload = multer({ storage });

// POST endpoint for uploading bills
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send({ error: 'No file uploaded.' });

  const fileUrl = `http://${req.hostname}:${PORT}/uploads/${req.file.filename}`;
  res.send({ message: 'Upload successful!', url: fileUrl });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
