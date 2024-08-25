const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase, getBucket } = require('./database');
const responseHandler = require('./middlewares/handlingMiddleware');
const { mediaExtensions, getMediaType, getMimeType } = require('./middlewares/uploadFilesMiddleware');

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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(responseHandler);

// Routes

app.get('/:mediatype/:ext', (req, res) => {
  const ext = `.${req.params.ext.toLowerCase()}`;
  if (Object.values(mediaExtensions).flat().includes(ext)) {
    return res.status(200).json({ mediaType: getMediaType(ext) });
  }
  res.status(400).json({ error: 'Unsupported file type' });
});

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
      res.status(404).send('File not found');
    });
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).send('Error fetching file: ' + err.message);
  }
});

app.use('/api/v1', require('./routes/router'));

const startServer = async () => {
  try {
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
  } catch (err) {
    console.error(`Failed to connect to database: ${err.message}`);
    process.exit(1);
  }
};


startServer();
