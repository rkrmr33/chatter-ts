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
// utils file will be imported once the document has been defined
var util;
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        _this.loadMain = function () {
            util.fetchAllChats()
                .then(function (chats) {
                _this.setState({
                    chatRooms: chats
                });
            });
        };
        _this.state = {
            display: props.display,
            chatRooms: props.chats
        };
        return _this;
    }
    App.prototype.componentDidMount = function () {
        console.log(this.state);
        util = require('./util');
    };
    App.prototype.loadChat = function (chatId) {
        console.log(chatId);
    };
    App.prototype.loadLogin = function () {
    };
    App.prototype.loadSignup = function () {
    };
    App.prototype.logout = function () {
    };
    App.prototype.contentSwitch = function () {
        switch (this.state.display) {
            case 'main':
                return (react_1.default.createElement(ChatList_1.default, { onChatClick: this.loadChat, chatList: this.state.chatRooms }));
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
