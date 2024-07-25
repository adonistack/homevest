const { Readable } = require('stream');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const Media = require('../models/mediaModel');
const { getBucket } = require('../database');

dotenv.config();

const imageExtensions = ['.png', '.jpg', '.gif', '.jpeg', '.bmp', '.svg', '.webp'];
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
const audioExtensions = ['.mp3', '.wav', '.ogg', '.wma', '.aac', '.flac', '.alac'];
const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'];

const getMediaType = (ext) => {
  if (imageExtensions.includes(ext)) return 'image';
  if (videoExtensions.includes(ext)) return 'video';
  if (audioExtensions.includes(ext)) return 'audio';
  if (fileExtensions.includes(ext)) return 'file';
  return 'unknown';
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const handleFileUpload = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next();
  }

  const { originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();
  const mediaType = getMediaType(ext);

  if (mediaType === 'unknown') {
    return res.status(400).send('Invalid file type. Please upload an image, video, audio, or a PDF file.');
  }

  const bucket = getBucket();
  const readableStream = Readable.from(buffer);
  const uploadStream = bucket.openUploadStream(originalname, {
    contentType: file.mimetype,
    metadata: { mediaType },
  });

  readableStream.pipe(uploadStream);

  uploadStream.on('finish', async () => {
    const owner = req.user ? req.user.id : null;
    if (!owner) {
      return res.status(401).send('Please login to upload media.');
    }

    const url = `/uploads/${mediaType}/${originalname}`;

    // Check if the media already exists
    const existingMedia = await Media.findOne({ url });
    if (existingMedia) {
      req.body.media = existingMedia._id;
      return next();
    }

    const media = new Media({
      fileName: originalname,
      mediaType,
      altText: '',
      slug: `${mediaType}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      url,
      owner,
    });

    try {
      const savedMedia = await media.save();
      req.body.media = savedMedia._id;
      next();
    } catch (err) {
      console.error('Error saving media:', err);
      res.status(500).send('An error occurred while saving the media. Please try again later.');
    }
  });

  uploadStream.on('error', (err) => {
    console.error('Error uploading file:', err);
    res.status(500).send('An error occurred while uploading the file. Please try again later.');
  });
};

const dynamicUpload = (req, res, next) => {
  const fieldName = req.body.fileFieldName || 'file';
  const multerUpload = upload.single(fieldName);

  multerUpload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'An error occurred while uploading the file.', error: err.message });
    }

    if (req.body.media) {
      const existingMedia = await Media.findOne({ _id: req.body.media });
      if (existingMedia) {
        req.body.media = existingMedia._id;
        return handleFileUpload(req, res, next);
      }
    }

    handleFileUpload(req, res, next);
  });
};

module.exports = { upload, handleFileUpload, dynamicUpload };
