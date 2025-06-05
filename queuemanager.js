const { v4: uuidv4 } = require('uuid');
const dataStore = require('dataStore');
const PRIORITY_ORDER = { HIGH: 1, MEDIUM: 2, LOW: 3 };

let queue = [];

function addToQueue(ingestion_id, ids, priority) {
  const ingestion = {
    ingestion_id,
    status: 'yet_to_start',
    batches: [],
  };

  for (let i = 0; i < ids.length; i += 3) {
    const batch = {
      batch_id: uuidv4(),
      ids: ids.slice(i, i + 3),
      status: 'yet_to_start',
      priority,
      created_time: Date.now(),
    };
    ingestion.batches.push(batch);
    queue.push({ ...batch, ingestion_id });
  }

  dataStore.ingestions[ingestion_id] = ingestion;
  sortQueue();
}

function sortQueue() {
  queue.sort((a, b) => {
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }
    return a.created_time - b.created_time;
  });
}

function getNextBatch() {
  return queue.shift();
}

function getAll() {
  return queue;
}

module.exports = { addToQueue, getNextBatch, getAll };
