import express from 'express';
import bodyParser from 'body-parser';

import config from './config';
import api from './api';
import { serverRender, routes } from './serverRender';

const app_routes = routes.map(r => r.path);

const server = express();

server.set('view engine', 'ejs');
server.use(bodyParser.json());

server.get(app_routes, (req, res) => {
  serverRender(req)
    .then(({__INITIAL_MARKUP__, __INITIAL_DATA__}: any) => {
      res.render('index', {__INITIAL_MARKUP__, __INITIAL_DATA__});
    });
});

server.use(express.static('static'));
server.use(api);

server.listen(config.PORT, () => {
  console.log(`[+] Server is listening on port ${config.PORT}...`);
});