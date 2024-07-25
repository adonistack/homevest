const express = require('express');
const { connectToDatabase, getBucket } = require('./database');
const responseHandler = require('./middlewares/handlingMiddleware');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};
app.options('*', cors(corsOptions)); 

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const getMimeType = (mediaType) => {
  switch (mediaType) {
    case 'image':
      return 'image/jpeg'; // Adjust based on actual file type if needed
    case 'video':
      return 'video/mp4'; // Adjust based on actual file type if needed
    case 'audio':
      return 'audio/mpeg'; // Adjust based on actual file type if needed
    case 'file':
      return 'application/octet-stream';
    default:
      return 'application/octet-stream';
  }
};
app.use(responseHandler);

// Routes
app.get('/uploads/:mediaType/:filename', async (req, res) => {
  try {
    const { mediaType, filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);

    const bucket = getBucket(); 
    const downloadStream = bucket.openDownloadStreamByName(decodedFilename);

    res.setHeader('Content-Type', getMimeType(mediaType));

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('end', () => {
      res.end();
    });

    downloadStream.on('error', (err) => {
      console.error('Error fetching file:', err);
      res.status(404).send('File not found');
    });
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).send('Error fetching file: ' + err.message);
  }
});

app.get('/download/:mediaType/:filename', async (req, res) => {
  try {
    const { mediaType, filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    const bucket = getBucket(); 
    const downloadStream = bucket.openDownloadStreamByName(decodedFilename);
    const safeFilename = encodeURI(path.basename(decodedFilename));

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', getMimeType(mediaType));

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('end', () => {
      res.end();
    });

    downloadStream.on('error', (err) => {
      console.error('Error fetching file:', err);
      res.notFound('File not found');
    });
  } catch (err) {
    console.error('Error fetching file:', err);
    res.internalServerError('Error fetching file: ' + err.message);
  }
});

app.use('/api/v1', require('./routes/router'));


const startServer = async () => {
  await connectToDatabase();
  const port = process.env.PORT || 3000;

 app.listen(port, (err) => {
    if (err) {
      console.error(`Error starting server: ${err.message}`);
      process.exit(1); 
    } else {
      console.log(`Server running at http://localhost:${port}`);
    }
  });


};

  startServer();