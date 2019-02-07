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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var server_1 = __importDefault(require("react-dom/server"));
var react_router_dom_1 = require("react-router-dom");
var axios_1 = __importDefault(require("axios"));
var App_1 = __importDefault(require("../client/App"));
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
        path: '/create_account',
        exact: true,
        strict: false,
        dataFetcher: fetchMainPageData
    }
];
// Server Render Function
function serverRender(path) {
    var match = exports.routes.filter(function (route) { return react_router_dom_1.matchPath(path, route); })[0];
    return match.dataFetcher(path);
}
exports.serverRender = serverRender;
// route: '/'
function fetchMainPageData() {
    return axios_1.default.get(config_1.default.endpoint + "/api/chats")
        .then(function (response) {
        var chats = response.data;
        var __INITIAL_DATA__ = {
            display: 'main',
            chats: chats
        };
        return ({
            __INITIAL_MARKUP__: server_1.default.renderToString(react_1.default.createElement(App_1.default, __assign({}, __INITIAL_DATA__))),
            __INITIAL_DATA__: __INITIAL_DATA__
        });
    })
        .catch(function (err) {
        console.error("[-] Couldd not fetch /api/chats Error: " + err);
    });
}
