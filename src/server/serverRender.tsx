/// <reference path="../client/Components/interfaces.d.ts" />
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { matchPath } from 'react-router-dom';
import express from 'express';
import axios, { AxiosResponse } from 'axios';

import App, {Routes} from '../client/App';
import config from './config';


// All the routes of the application
export const routes = [
  {
    path: '/',
    exact: true,
    strict: false,
    dataFetcher: fetchMainPageData
  },
  {
    path: '/c/:chatName',
    exact: true,
    strict: false,
    dataFetcher: fetchChatPageData
  },
  {
    path: '/create_account',
    exact: true,
    strict: false,
    dataFetcher: fetchSignupPage
  },
  {
    path: '/login',
    exact: true,
    strict: false,
    dataFetcher: fetchLoginPage
  },
  {
    path: '/create_chat',
    exact: true,
    strict: false,
    dataFetcher: fetchChatCreationPage
  }
];

// A function that helps to handle fetch requests error messages
function handleBadFetchStatus(response : AxiosResponse, requestPath : string, respondWith? : string ) {
  if (response.status !== 200) {
    console.error(`[-] Bad fetch request to: '${requestPath}'. the response was: ${response.statusText}`);
    if (respondWith) 
      console.error(`[-] ${respondWith}`);
    return true;
  }
  return false;
}

// Server Render Function
export function serverRender(req : express.Request) {
  const match : any = routes.filter(route => matchPath(req.originalUrl, route))[0];
  
  return match.dataFetcher(req);
}

// route: '/'
function fetchMainPageData() {
  return axios.get(`${config.endpoint}/api/chats`)
    .then(response => {
      if(handleBadFetchStatus(response, `${config.endpoint}/api/chats`)) {
        return null;
      }
      const chats = response.data;
      const __INITIAL_DATA__ = defaultAppState;
      __INITIAL_DATA__.display = Routes.MAIN;
      __INITIAL_DATA__.chatRooms = chats;

      return ({
        __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
        __INITIAL_DATA__
      });
    })
    .catch(err => {
      console.error(`[-] Could not fetch /api/chats Error: ${err}`);
    });  
}

// route: '/c/:chatName'
function fetchChatPageData(req : express.Request) {
  const chatName : string = req.params.chatName;
  const endpoint = `${config.endpoint}/api/chats/full/name/${chatName}`;

  return axios.get(endpoint)
    .then(response => {
      if(handleBadFetchStatus(response, endpoint)) {
        return null;
      }
      const data = response.data;
      
      if (data) {
        const __INITIAL_DATA__ = defaultAppState;
        __INITIAL_DATA__.display = Routes.CHAT_ROOM;
        __INITIAL_DATA__.currentChat = data.currentChat;
        __INITIAL_DATA__.messages = data.messages;
  
        return ({
          __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
          __INITIAL_DATA__
        });
      }
    })
    .catch(err => {
      console.error(`[-] Could not fetch ${endpoint} Error: ${err}`);
    });  
}

// route '/create_account'
async function fetchSignupPage(req : express.Request) {
  const __INITIAL_DATA__ = defaultAppState;
  __INITIAL_DATA__.display = Routes.SIGN_UP;

  return ({
    __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
    __INITIAL_DATA__
  });
}

// route '/login'
async function fetchLoginPage(req : express.Request) {
  const __INITIAL_DATA__ = defaultAppState;
  __INITIAL_DATA__.display = Routes.LOG_IN;

  return ({
    __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
    __INITIAL_DATA__
  });
}

// route '/create_chat'
async function fetchChatCreationPage(req : express.Request) {
  const __INITIAL_DATA__ = defaultAppState;
  __INITIAL_DATA__.display = Routes.CHAT_CREATION;

  return ({
    __INITIAL_MARKUP__: ReactDOMServer.renderToString(<App {...__INITIAL_DATA__} />),
    __INITIAL_DATA__
  });
}

const defaultAppState : IAppState= {
  display: Routes.MAIN, // default to main in Routes.enum
  chatRooms: null,
  currentChat: null,
  messages: undefined,
  user: undefined
}
