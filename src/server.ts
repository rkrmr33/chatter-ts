import express from 'express';

import config from './config';

const server = express();

server.get('/', (req, res) => {
  res.send('Hello world');
});

server.listen(config.PORT, () => {
  console.log(`server is listening on port ${config.PORT}...`);
});