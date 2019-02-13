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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        dataFetcher: fetchSignupPage
    },
    {
        path: '/login',
        exact: true,
        strict: false,
        dataFetcher: fetchLoginPage
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
// route: '/c/:chatName'
function fetchChatPageData(req) {
    var chatName = req.params.chatName;
    var endpoint = config_1.default.endpoint + "/api/chats/full/name/" + chatName;
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
// route '/create_account'
function fetchSignupPage(req) {
    return __awaiter(this, void 0, void 0, function () {
        var __INITIAL_DATA__;
        return __generator(this, function (_a) {
            __INITIAL_DATA__ = defaultAppState;
            __INITIAL_DATA__.display = App_1.Routes.SIGN_UP;
            return [2 /*return*/, ({
                    __INITIAL_MARKUP__: server_1.default.renderToString(react_1.default.createElement(App_1.default, __assign({}, __INITIAL_DATA__))),
                    __INITIAL_DATA__: __INITIAL_DATA__
                })];
        });
    });
}
// route '/login'
function fetchLoginPage(req) {
    return __awaiter(this, void 0, void 0, function () {
        var __INITIAL_DATA__;
        return __generator(this, function (_a) {
            __INITIAL_DATA__ = defaultAppState;
            __INITIAL_DATA__.display = App_1.Routes.LOG_IN;
            return [2 /*return*/, ({
                    __INITIAL_MARKUP__: server_1.default.renderToString(react_1.default.createElement(App_1.default, __assign({}, __INITIAL_DATA__))),
                    __INITIAL_DATA__: __INITIAL_DATA__
                })];
        });
    });
}
var defaultAppState = {
    display: App_1.Routes.MAIN,
    chatRooms: null,
    currentChat: null,
    messages: undefined,
    user: undefined
};
