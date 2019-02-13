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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var ChatPreview_1 = __importDefault(require("./ChatPreview"));
var dataStream;
var ChatList = /** @class */ (function (_super) {
    __extends(ChatList, _super);
    function ChatList(props) {
        var _this = _super.call(this, props) || this;
        _this.componentCleanup = function () {
            if (dataStream)
                dataStream.close();
        };
        _this.handleUsersEvents = function (e) {
            if (_this.state.chatList) {
                var data_1 = JSON.parse(e.data);
                var chatsObj = _this.state.chatList;
                switch (e.type) {
                    case 'user-enter':
                        chatsObj[data_1.chatId].users.push(data_1.username);
                        break;
                    case 'user-quit':
                        chatsObj[data_1.chatId].users = chatsObj[data_1.chatId].users.filter(function (user) { return user !== data_1.username; });
                        break;
                    default: break;
                }
                _this.setState({ chatList: chatsObj });
            }
        };
        _this.state = { chatList: props.chatList };
        return _this;
    }
    ChatList.prototype.componentDidMount = function () {
        window.addEventListener('beforeunload', this.componentCleanup);
        var queryString;
        if (this.state.chatList)
            queryString = Object.keys(this.state.chatList).join(',');
        try {
            dataStream = new EventSource("/api/stream/all_chats/" + queryString);
            dataStream.addEventListener('user-enter', this.handleUsersEvents);
            dataStream.addEventListener('user-quit', this.handleUsersEvents);
        }
        catch (e) {
            console.error(e);
        }
    };
    ChatList.prototype.render = function () {
        var _this = this;
        return (react_1.default.createElement("div", { className: "ui celled list nine wide column", id: "mainDiv" }, Object.keys(this.state.chatList).map(function (chatId) { return react_1.default.createElement(ChatPreview_1.default, { key: chatId, onChatClick: _this.props.onChatClick, chat: _this.state.chatList[chatId] }); })));
    };
    return ChatList;
}(react_1.default.Component));
exports.default = ChatList;
