import express from 'express';

const server = express();

server.get('/', (req, res) => {
  res.send('Hello world');
});

server.listen(3000, () => {
  console.log('server is listening on port 3000...');
});