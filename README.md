# ingestion-API


## Features
- Batches requests into chunks of 3
- Priority + timestamp-based queue
- 5-second rate limit between batches
- Status tracking per ingestion

## Running Locally

```bash
npm install
node server.js
