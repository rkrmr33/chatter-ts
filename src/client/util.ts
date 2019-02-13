import axios, { AxiosError, AxiosResponse, AxiosPromise } from 'axios';
import { response } from 'express';
import { func } from 'prop-types';
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

export function login({username, password} : {username: string, password: string}) : AxiosPromise {
  return axios.post('/api/users/login', {username, password})
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/users/login/${username},${password}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

export function relogin() : AxiosPromise {
  return axios.get('/api/users/current_user')
  .then(response => {
    if (!handleBadFetchStatus(response, `${serverUrl}/api/users/current_user`, 'oops'))
      return response.data;
    return response.statusText;
  })
}

export function authenticate(userCredentials : any) : AxiosPromise {
  return axios.get('/api/users/authenticate')
  .then(response => {
    if (!handleBadFetchStatus(response, `${serverUrl}/api/users/current_user`, 'oops'))
      return response.data; // the authenticated user or undefined if the credentials were wrong
    return response.statusText;
  })
}

export function logout() : AxiosPromise {
  return axios.get('/api/users/logout')
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/users/logout/`, 'oops'))
      return response.data;
      return response.statusText;
    })
}

export function sendMessage(message:IMessage) : AxiosPromise {
  return axios.post('/api/messages/send', message)
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/messages/send/${JSON.stringify(message)}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

export function enterChat(username:string, chatId:string) : AxiosPromise {
  return axios.post('/api/chats/enter', {username, chatId})
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/chat/enter/${JSON.stringify({username, chatId})}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

export function quitChat(username:string, chatId:string) : AxiosPromise {
  return axios.post('/api/chats/quit', {username, chatId})
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/chat/quit/${JSON.stringify({username, chatId})}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

export function newVote(message:IMessage, username:string) : AxiosPromise {
  return axios.post('/api/messages/vote', {message, username})
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/messages/vote/${JSON.stringify({message, username})}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

export function payCP(userId:string, amount:number) : AxiosPromise {
  return axios.post('/api/users/pay', {userId, amount})
    .then(response => {
      if (!handleBadFetchStatus(response, `${serverUrl}/api/users/pay/${JSON.stringify({userId, amount})}`, 'oops'))
        return response.data;
      return response.statusText;
    })
}

