import express from 'express';

import config from './config';
import { routes } from './serverRender';

const get_routes = routes.map(r => r.path);

const server = express();

server.set('view engine', 'ejs');

server.get(get_routes, (req, res) => {
  res.render('index', {
    appTitle: 'Chatter',
    initialMarkup: 'is this working' 
  });
});

server.listen(config.PORT, () => {
  console.log(`server is listening on port ${config.PORT}...`);
});