const dataStore = require('dataStore');

async function processBatch(batch) {
  const ingestion = dataStore.ingestions[batch.ingestion_id];
  const batchRecord = ingestion.batches.find(b => b.batch_id === batch.batch_id);

  batchRecord.status = 'triggered';
  updateIngestionStatus(ingestion);

  // Simulate delay for each ID
  await Promise.all(
    batch.ids.map(id => {
      return new Promise(res => {
        setTimeout(() => {
          console.log(`Processed ID: ${id}`);
          res();
        }, 1000); // simulate external call
      });
    })
  );

  batchRecord.status = 'completed';
  updateIngestionStatus(ingestion);
}

function updateIngestionStatus(ingestion) {
  const statuses = ingestion.batches.map(b => b.status);
  if (statuses.every(s => s === 'yet_to_start')) {
    ingestion.status = 'yet_to_start';
  } else if (statuses.every(s => s === 'completed')) {
    ingestion.status = 'completed';
  } else {
    ingestion.status = 'triggered';
  }
}

module.exports = processBatch;
