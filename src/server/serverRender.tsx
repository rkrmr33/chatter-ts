import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchPath } from 'react-router-dom';
import axios from 'axios';

import App from '../client/App';
import config from './config';
import { response } from 'express';

// All the routes of the application
export const routes = [
  {
    path: '/',
    exact: true,
    strict: false,
    dataFetcher: fetchMainPageData
  },
  {
    path: '/create_account',
    exact: true,
    strict: false,
    dataFetcher: fetchMainPageData
  }
];

// Server Render Function
export function serverRender(path : string) {
  const match : any = routes.filter(route => matchPath(path, route))[0];
  
  return match.dataFetcher(path);
}


// route: '/'
function fetchMainPageData() {

  return axios.get(`${config.endpoint}/api/chats`)
    .then(response => {
      const chats = response.data;
      const __INITIAL_DATA__: any = {
        display: 'main',
        chats
      };

      return ({
        __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
        __INITIAL_DATA__
      });
    })
    .catch(err => {
      console.error(`[-] Could not fetch /api/chats Error: ${err}`);
    });  
}

