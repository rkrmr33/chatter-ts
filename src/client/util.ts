import axios, { AxiosError, AxiosResponse, AxiosPromise } from 'axios';
import { response } from 'express';
const loadProgressBar = require('axios-progress-bar').loadProgressBar;

loadProgressBar({ showSpinner: false});

export const serverUrl = 'http://localhost:8080';

function handleBadFetchStatus(response : AxiosResponse, requestPath : string, respondWith : string) : boolean {
  if (response.status !== 200) {
    console.log(`[-] Bad fetch request to: '${requestPath}'. the reponse was: ${response.statusText}`);
    return true;
  }
  return false;
}

export function fetchAllChats() : AxiosPromise {
  return axios.get('/api/chats')
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/chats`, 'oops')) {
        return response.data;
      }
      console.log('[-] Could not fetch chats...');
      return null;
    })
    .catch((err : AxiosError) => {
      console.log(`[-] Error while fetching chats: ${err.message}`);
    })
}

export function fetchChatById(chatId : string) : AxiosPromise {
  return axios.get(`/api/chats/${chatId}`)
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/chats/${chatId}`, 'oops')) {
        console.log(response.data);
        return response.data;
      }
      console.log(`[-] Could not fetch chat with Id: ${chatId}...`);
      return null;
    })
}

export function fetchChatAndMessagesById(chatId : string) : AxiosPromise {
  return axios.get(`/api/chats/full/id/${chatId}`)
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/chats/full/${chatId}`, 'oops')) {
        return response.data;
      }
      return null;
    })
}

export function checkUsernameTaken(username:string) : AxiosPromise {
  return axios.get(`/api/users/check/${username}`)
    .then(response => {
      handleBadFetchStatus(response, `${serverUrl}/api/users/check/${username}`, 'oops')
      return response.data;
    });
}

export function createAccount(user:IUser) : AxiosPromise {
  return axios.post('/api/users/create', user)
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/users/create/${user}`, 'oops'))
        return response.data;
      return { created: false };
    })
}

