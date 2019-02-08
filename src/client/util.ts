import axios, { AxiosError, AxiosResponse } from 'axios';
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

export function fetchAllChats() : any {
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