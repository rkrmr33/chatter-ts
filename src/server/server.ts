import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);

import config from './config';
import api from './api';
import { serverRender, routes } from './serverRender';

const app_routes = routes.map(r => r.path);

const server = express();

server.set('view engine', 'ejs');
server.set('trust proxy', 1);

server.use(express.static('static'));
server.use(bodyParser.json());
server.use(session({
   secret: config.SECRET_KEY,
   saveUninitialized: false,
   resave: false,
   store: new MongoStore({ url: config.DB_CONN_STR })
  }));
server.use(flash());
server.use(passport.initialize());
server.use(api);

server.get(app_routes, (req, res) => {
  serverRender(req)
    .then(({__INITIAL_MARKUP__, __INITIAL_DATA__}: any) => {
      res.render('index', {__INITIAL_MARKUP__, __INITIAL_DATA__});
    });
});



server.listen(config.PORT, () => {
  console.log(`[+] Server is listening on port ${config.PORT}...`);
});