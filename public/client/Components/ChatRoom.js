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
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var Message_1 = __importDefault(require("./Message"));
var scrollTarget;
var ChatRoom = /** @class */ (function (_super) {
    __extends(ChatRoom, _super);
    function ChatRoom(props) {
        var _this = _super.call(this, props) || this;
        _this.addUserToChatRoom = function (user) {
            return;
        };
        _this.sendMessage = function () {
            return;
        };
        /**
         * This function grabs all the messages we fetched from the
         * db, related to this chat-room id, and then displays them
         * all. If there are not messages at all, display a default
         * message.
         */
        _this.loadFetchedMessages = function () {
            if (_this.props.chat && (!_this.state.messages || _this.state.messages.length == 0)) {
                // if there are no messages in the chat, sends a default message inviting people to chat.
                return (react_1.default.createElement(Message_1.default, __assign({}, {
                    _id: '1234567890',
                    chatId: _this.props.chat._id,
                    user: { username: 'Chatter Bot', specialColor: '#be28d2', avatar: '/chatter-icon.ico' },
                    body: 'There are no messages on this chat yet... C\'mon! Be the first to send a message! ; )',
                    timestamp: new Date().toString(),
                    votes: []
                })));
            }
            // if there are any messages fetched from the db, loads them and display in the chat.
            else if (_this.state.messages) {
                var messagesMarkup = _this.state.messages.map(function (m) { return react_1.default.createElement(Message_1.default, __assign({ key: m._id }, m)); });
                return messagesMarkup;
            }
        };
        /**
         * This shows an input form to send messages if the users
         * is logged in. otherwise, it tells the user he needs to
         * log in or sign up.
         */
        _this.restrictGuests = function (user) {
            if (user) {
                return (react_1.default.createElement("div", { className: "ui action input", id: "input-segment" },
                    react_1.default.createElement("input", { id: "messageText", type: "text", autoFocus: true }),
                    react_1.default.createElement("button", { type: "submit", id: "sendButton", className: "ui blue button" }, "Send")));
            }
            return (react_1.default.createElement("div", { className: "ui action input", id: "input-segment" },
                react_1.default.createElement("div", { className: "ui message center aligned", id: "needUser" },
                    "You need a ",
                    react_1.default.createElement("b", { className: "chatter-color" }, "Chatter"),
                    " account to send messages in chatrooms. You can ",
                    react_1.default.createElement("a", { id: "link", onClick: _this.props.goToSignup }, "sign up"),
                    " now. Or, if you already have an account ",
                    react_1.default.createElement("a", { id: "link", onClick: _this.props.goToLogin }, "log in"),
                    " here.")));
        };
        /**
         * When called, makes the chat scroll down, to display the
         * last messages that was sent.
         */
        _this.ScrollDown = function () {
            if (scrollTarget)
                scrollTarget.scrollIntoView({ behavior: 'smooth' });
        };
        _this.state = {
            messages: props.messages,
            users: props.chat.users
        };
        return _this;
    }
    ChatRoom.prototype.componentDidMount = function () {
        if (this.props.user) {
            this.addUserToChatRoom(this.props.user);
        }
    };
    ChatRoom.prototype.render = function () {
        if (this.props.chat && this.state.messages && this.state.users)
            return (react_1.default.createElement("div", { className: "eleven wide column chatroom-container" },
                react_1.default.createElement("form", { onSubmit: this.sendMessage },
                    react_1.default.createElement("div", { className: "chatFlex" },
                        react_1.default.createElement("div", { id: "chat-header-container", className: "ui top attached purple segment" },
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("img", { src: this.props.chat.chatImage, id: "true-circle", className: "ui circular image" }),
                                react_1.default.createElement("h3", null, this.props.chat.chatName),
                                react_1.default.createElement("p", null,
                                    react_1.default.createElement("i", { className: "certificate icon chatter-color" }),
                                    react_1.default.createElement("b", null, this.props.chat.chatOwner))),
                            react_1.default.createElement("div", { className: "messagesCount" },
                                this.state.messages.length,
                                " ",
                                react_1.default.createElement("i", { className: "envelope icon" })),
                            react_1.default.createElement("div", { className: "inChatUsersCount" },
                                this.state.users.length,
                                " ",
                                react_1.default.createElement("i", { className: "user icon" }))),
                        react_1.default.createElement("div", { className: "chat-area", id: "scroll" },
                            react_1.default.createElement("div", { className: "ui celled list", id: "messages-list" }, this.loadFetchedMessages()),
                            react_1.default.createElement("div", { style: { float: 'left', clear: 'both' }, ref: function (st) { scrollTarget = st; } })),
                        this.restrictGuests(this.props.user)))));
        else
            return react_1.default.createElement("div", null, "sorry :\\");
    };
    return ChatRoom;
}(react_1.default.Component));
exports.default = ChatRoom;
