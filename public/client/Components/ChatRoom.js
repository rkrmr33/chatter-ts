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
var dataStream;
var util;
var enteredChat = false;
var ChatRoom = /** @class */ (function (_super) {
    __extends(ChatRoom, _super);
    function ChatRoom(props) {
        var _this = _super.call(this, props) || this;
        _this.componentCleanup = function () {
            if (_this.props.chat && _this.props.user)
                util.quitChat(_this.props.user.username, _this.props.chat._id);
            if (dataStream) {
                dataStream.close();
            }
        };
        /***
         *  if a user clicks on logout, handle the leave before the state cleans
         **/
        _this.logoutBail = function () {
            var logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function (e) {
                    _this.componentCleanup();
                });
            }
        };
        /**
         *   EVENTS HANDLERS
         */
        // Handles Messages Events
        _this.handleMessagesEvents = function (e) {
            var newMessage = JSON.parse(e.data);
            var chatMessages = _this.state.messages;
            if (chatMessages && newMessage) {
                chatMessages.push(newMessage);
                _this.setState({ messages: chatMessages });
            }
        };
        // Handles Users Events
        _this.handleUsersEvents = function (e) {
            var users = _this.state.users;
            if (users) {
                switch (e.type) {
                    case 'user-enter':
                        users.push(e.data);
                        break;
                    case 'user-quit':
                        users = users.filter(function (user) { return user !== e.data; });
                        break;
                    default: break;
                }
                // update users list
                _this.setState({ users: users });
            }
        };
        _this.addUserToChatRoom = function () {
            enteredChat = true;
            if (_this.props.user && _this.props.chat)
                util.enterChat(_this.props.user.username, _this.props.chat._id);
        };
        _this.sendMessage = function (e) {
            e.preventDefault();
            var messageText = document.getElementById('messageText');
            if (messageText && messageText.value && _this.props.chat && _this.props.user) {
                var message = {
                    chatId: _this.props.chat._id,
                    user: {
                        username: _this.props.user.username,
                        specialColor: _this.props.user.specialColor,
                        avatar: _this.props.user.avatar
                    },
                    body: messageText.value,
                    votes: [],
                    timestamp: new Date()
                };
                util.sendMessage(message)
                    .then(function (sentMessage) {
                    if (sentMessage) {
                        messageText.value = '';
                    }
                });
            }
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
                    react_1.default.createElement("input", { id: "messageText", type: "text", placeholder: "Type a message...", autoFocus: true }),
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
            users: props.chat.users,
            loading: true
        };
        enteredChat = false;
        return _this;
    }
    ChatRoom.prototype.componentDidMount = function () {
        var _this = this;
        window.addEventListener('beforeunload', this.componentCleanup);
        this.logoutBail();
        // import utils after initial load
        util = require('../util');
        try {
            if (this.props.chat)
                dataStream = new EventSource("/api/stream/" + this.props.chat._id);
            // when the connection is open stop loading
            dataStream.onopen = function () {
                _this.setState({ loading: false });
                if (!enteredChat && _this.props.user) {
                    _this.addUserToChatRoom();
                }
            };
            dataStream.addEventListener('new-message', this.handleMessagesEvents);
            dataStream.addEventListener('user-enter', this.handleUsersEvents);
            dataStream.addEventListener('user-quit', this.handleUsersEvents);
        }
        catch (err) {
            throw err;
        }
    };
    ChatRoom.prototype.componentWillUnmount = function () {
        this.componentCleanup();
        window.removeEventListener('beforeunload', this.componentCleanup);
    };
    ChatRoom.prototype.componentDidUpdate = function () {
        if (!enteredChat && this.props.user) {
            this.addUserToChatRoom();
        }
        this.ScrollDown();
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
                        react_1.default.createElement("div", { className: this.state.loading ? 'ui loading form chat-area' : 'chat-area', id: "scroll" },
                            react_1.default.createElement("div", { className: "ui celled list", id: "messages-list" }, this.loadFetchedMessages()),
                            react_1.default.createElement("div", { style: { float: 'left', clear: 'both' }, ref: function (st) { scrollTarget = st; } })),
                        this.restrictGuests(this.props.user)))));
        else
            return react_1.default.createElement("div", null, "sorry :\\");
    };
    return ChatRoom;
}(react_1.default.Component));
exports.default = ChatRoom;
