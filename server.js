const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('datastore');
const { addToQueue, getNextBatch } = require('queuemanager');
const processBatch = require('processbatch');

const app = express();
app.use(express.json());

// POST /ingest
app.post('/ingest', (req, res) => {
  const { ids, priority } = req.body;
  if (!Array.isArray(ids) || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const ingestion_id = uuidv4();
  addToQueue(ingestion_id, ids, priority);
  res.json({ ingestion_id });
});

// GET /status/:ingestion_id
app.get('/status/:ingestion_id', (req, res) => {
  const ingestion = dataStore.ingestions[req.params.ingestion_id];
  if (!ingestion) {
    return res.status(404).json({ error: 'Not found' });
  }

  const batches = ingestion.batches.map(b => ({
    batch_id: b.batch_id,
    ids: b.ids,
    status: b.status,
  }));

  res.json({
    ingestion_id: ingestion.ingestion_id,
    status: ingestion.status,
    batches,
  });
});

// Background batch processor - every 5 seconds
setInterval(async () => {
  const batch = getNextBatch();
  if (batch) {
    await processBatch(batch);
  }
}, 5000);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app;
