"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var loadProgressBar = require('axios-progress-bar').loadProgressBar;
loadProgressBar({ showSpinner: false });
exports.serverUrl = 'http://localhost:8080';
function handleBadFetchStatus(response, requestPath, respondWith) {
    if (response.status !== 200) {
        console.log("[-] Bad fetch request to: '" + requestPath + "'. the reponse was: " + response.statusText);
        return true;
    }
    return false;
}
function fetchAllChats() {
    return axios_1.default.get('/api/chats')
        .then(function (response) {
        if (!handleBadFetchStatus(response, exports.serverUrl + "/api/chats", 'oops')) {
            return response.data;
        }
        console.log('[-] Could not fetch chats...');
        return null;
    })
        .catch(function (err) {
        console.log("[-] Error while fetching chats: " + err.message);
    });
}
exports.fetchAllChats = fetchAllChats;
function fetchChatById(chatId) {
    return axios_1.default.get("/api/chats/" + chatId)
        .then(function (response) {
        if (!handleBadFetchStatus(response, exports.serverUrl + "/api/chats/" + chatId, 'oops')) {
            console.log(response.data);
            return response.data;
        }
        console.log("[-] Could not fetch chat with Id: " + chatId + "...");
        return null;
    });
}
exports.fetchChatById = fetchChatById;
function fetchChatAndMessagesById(chatId) {
    return axios_1.default.get("/api/chats/full/id/" + chatId)
        .then(function (response) {
        if (!handleBadFetchStatus(response, exports.serverUrl + "/api/chats/full/" + chatId, 'oops')) {
            return response.data;
        }
        return null;
    });
}
exports.fetchChatAndMessagesById = fetchChatAndMessagesById;
function checkUsernameTaken(username) {
    return axios_1.default.get("/api/users/check/" + username)
        .then(function (response) {
        handleBadFetchStatus(response, exports.serverUrl + "/api/users/check/" + username, 'oops');
        return response.data;
    });
}
exports.checkUsernameTaken = checkUsernameTaken;
function createAccount(user) {
    return axios_1.default.post('/api/users/create', user)
        .then(function (response) {
        if (!handleBadFetchStatus(response, exports.serverUrl + "/api/users/create/" + user, 'oops'))
            return response.data;
        return { created: false };
    });
}
exports.createAccount = createAccount;
