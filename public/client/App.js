"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./Components/interfaces.d.ts" />
var react_1 = __importStar(require("react"));
var Header_1 = __importDefault(require("./Components/Header"));
var ChatList_1 = __importDefault(require("./Components/ChatList"));
var ChatRoom_1 = __importDefault(require("./Components/ChatRoom"));
var Signup_1 = __importDefault(require("./Components/Signup"));
var Login_1 = __importDefault(require("./Components/Login"));
// utils file will be imported once the document has been defined
var util;
var Routes;
(function (Routes) {
    Routes[Routes["MAIN"] = 0] = "MAIN";
    Routes[Routes["CHAT_ROOM"] = 1] = "CHAT_ROOM";
    Routes[Routes["SIGN_UP"] = 2] = "SIGN_UP";
    Routes[Routes["LOG_IN"] = 3] = "LOG_IN";
})(Routes = exports.Routes || (exports.Routes = {}));
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        _this.loadMain = function () {
            util.fetchAllChats()
                .then(function (chats) {
                _this.setState({
                    display: Routes.MAIN,
                    chatRooms: chats
                }, function () {
                    // push a new state to the history object
                    history.pushState(_this.state, 'Chatter', '/');
                });
            });
        };
        _this.loadChat = function (chatId) {
            util.fetchChatAndMessagesById(chatId)
                .then(function (result) {
                _this.setState({
                    display: Routes.CHAT_ROOM,
                    currentChat: result.currentChat,
                    messages: result.messages
                }, function () {
                    history.pushState(_this.state, result.currentChat.chatName, "/c/" + result.currentChat.chatName);
                });
            });
        };
        _this.loadLogin = function () {
            _this.setState({
                display: Routes.LOG_IN,
            }, function () {
                history.pushState(_this.state, 'Login', "/login");
            });
        };
        _this.loadSignup = function () {
            _this.setState({
                display: Routes.SIGN_UP,
            }, function () {
                history.pushState(_this.state, 'Signup', "/create_account");
            });
        };
        _this.login = function (credentials) {
            return util.login(credentials)
                .then(function (result) {
                if (result.success) {
                    _this.setState({ user: result.user }, function () { return _this.loadMain(); });
                }
                return result;
            });
        };
        _this.logout = function () {
            util.logout()
                .then(function (result) {
                if (result) {
                    console.log('user was logged out');
                    _this.setState({ user: undefined }, function () {
                        history.replaceState(_this.state, '');
                    });
                }
                else {
                    console.log('tried to logout with-out user token');
                }
            });
        };
        _this.relogin = function () {
            util.relogin()
                .then(function (user) {
                if (!user)
                    return;
                _this.setState({ user: user }, function () {
                    history.replaceState(_this.state, '');
                });
            });
        };
        _this.state = props;
        return _this;
    }
    App.prototype.componentDidMount = function () {
        var _this = this;
        // Load utils and apply nProgress progress bar
        util = require('./util');
        // try to re-login user using the session token
        this.relogin();
        // determain initial status and push it to the history state
        switch (this.state.display) {
            case Routes.MAIN:
                history.replaceState(this.state, 'Chatter', "/");
                break;
            case Routes.CHAT_ROOM:
                if (this.state.currentChat)
                    history.replaceState(this.state, this.state.currentChat.chatName, "/c/" + this.state.currentChat.chatName);
                break;
            case Routes.SIGN_UP:
                history.replaceState(this.state, 'Signup', '/create_account');
                break;
            case Routes.LOG_IN:
                history.replaceState(this.state, 'Login', '/login');
                break;
            default:
                console.log("[-] Something went wrong, the initial data is: " + this.props.__INITIAL_DATA__);
                break;
        }
        // removes the unneeded initial data variable from the global object
        delete window.__INITIAL_DATA__;
        // handle popstate event
        window.addEventListener('popstate', function (e) {
            _this.setState(e.state);
        });
    };
    App.prototype.contentSwitch = function () {
        switch (this.state.display) {
            case Routes.MAIN: // route: '/'
                return (react_1.default.createElement(ChatList_1.default, { onChatClick: this.loadChat, chatList: this.state.chatRooms }));
            case Routes.CHAT_ROOM: // route: '/chat/[chatName]'
                return (react_1.default.createElement(ChatRoom_1.default, { chat: this.state.currentChat, user: this.state.user, messages: this.state.messages, goToLogin: this.loadLogin, goToSignup: this.loadSignup }));
            case Routes.SIGN_UP: // route: '/create_account'
                return (react_1.default.createElement(Signup_1.default, { login: this.login, goToLogin: this.loadLogin, goToChatter: this.loadMain }));
            case Routes.LOG_IN: // route: '/login'
                return (react_1.default.createElement(Login_1.default, { login: this.login, goToSignup: this.loadSignup, goToChatter: this.loadMain }));
            default:
                return "Something went wrong, the initial data is: " + JSON.stringify(this.props.__INITIAL_DATA__);
        }
    };
    App.prototype.render = function () {
        return (react_1.default.createElement("div", { id: "flexer", className: "ui grid" },
            react_1.default.createElement(Header_1.default, { goToChatter: this.loadMain, goToLogin: this.loadLogin, goToSignup: this.loadSignup, user: this.state.user, logout: this.logout }),
            this.contentSwitch()));
    };
    return App;
}(react_1.Component));
exports.default = App;
