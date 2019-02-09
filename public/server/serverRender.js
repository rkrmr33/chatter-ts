"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../client/Components/interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var server_1 = __importDefault(require("react-dom/server"));
var react_router_dom_1 = require("react-router-dom");
var axios_1 = __importDefault(require("axios"));
var App_1 = __importStar(require("../client/App"));
var config_1 = __importDefault(require("./config"));
// All the routes of the application
exports.routes = [
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
        dataFetcher: fetchMainPageData
    }
];
// A function that helps to handle fetch requests error messages
function handleBadFetchStatus(response, requestPath, respondWith) {
    if (response.status !== 200) {
        console.error("[-] Bad fetch request to: '" + requestPath + "'. the response was: " + response.statusText);
        if (respondWith)
            console.error("[-] " + respondWith);
        return true;
    }
    return false;
}
// Server Render Function
function serverRender(req) {
    var match = exports.routes.filter(function (route) { return react_router_dom_1.matchPath(req.originalUrl, route); })[0];
    return match.dataFetcher(req);
}
exports.serverRender = serverRender;
// route: '/'
function fetchMainPageData() {
    console.log("requesting: " + config_1.default.endpoint + "/api/chats");
    return axios_1.default.get(config_1.default.endpoint + "/api/chats")
        .then(function (response) {
        if (handleBadFetchStatus(response, config_1.default.endpoint + "/api/chats")) {
            return null;
        }
        var chats = response.data;
        var __INITIAL_DATA__ = defaultAppState;
        __INITIAL_DATA__.display = App_1.Routes.MAIN;
        __INITIAL_DATA__.chatRooms = chats;
        return ({
            __INITIAL_MARKUP__: server_1.default.renderToString(react_1.default.createElement(App_1.default, __assign({}, __INITIAL_DATA__))),
            __INITIAL_DATA__: __INITIAL_DATA__
        });
    })
        .catch(function (err) {
        console.error("[-] Could not fetch /api/chats Error: " + err);
    });
}
// route: '/c/:chatName
function fetchChatPageData(req) {
    var chatName = req.params.chatName;
    var endpoint = config_1.default.endpoint + "/api/chats/full/name/" + chatName;
    console.log("requesting: " + endpoint);
    return axios_1.default.get(endpoint)
        .then(function (response) {
        if (handleBadFetchStatus(response, endpoint)) {
            return null;
        }
        var data = response.data;
        if (data) {
            var __INITIAL_DATA__ = defaultAppState;
            __INITIAL_DATA__.display = App_1.Routes.CHAT_ROOM;
            __INITIAL_DATA__.currentChat = data.currentChat;
            __INITIAL_DATA__.messages = data.messages;
            return ({
                __INITIAL_MARKUP__: server_1.default.renderToString(react_1.default.createElement(App_1.default, __assign({}, __INITIAL_DATA__))),
                __INITIAL_DATA__: __INITIAL_DATA__
            });
        }
    })
        .catch(function (err) {
        console.error("[-] Could not fetch " + endpoint + " Error: " + err);
    });
}
var defaultAppState = {
    display: App_1.Routes.MAIN,
    chatRooms: null,
    currentChat: null,
    messages: undefined,
    user: undefined
};
