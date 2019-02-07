import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchPath } from 'react-router-dom';

import App from './client/App';
import { promisify } from 'util';

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

export function serverRender(path : string) {
  const match : any = routes.filter(route => matchPath(path, route))[0];
  
  return match.dataFetcher(path);
}

async function fetchMainPageData() {
  const __INITIAL_DATA__: any = {
    message: 'Chatter!!!'
  };

  return ({
    __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
    __INITIAL_DATA__
  });
}

