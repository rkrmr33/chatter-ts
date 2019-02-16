"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
function Message(props) {
    return ( // if user is logged in and not already in the votes list of the message, than it is able to vote
    react_1.default.createElement("div", { className: (props.currentUser && props.message.votes.indexOf(props.currentUser.username) <= -1) ? 'item message-item' : 'item', onClick: (props.currentUser && props.message.votes.indexOf(props.currentUser.username) <= -1) ? function () { props.voteMessage(props.message); } : function () { } },
        react_1.default.createElement("img", { src: props.message.user.avatar, className: "ui avatar image chat-image" }),
        react_1.default.createElement("div", { className: "metadata" },
            react_1.default.createElement("div", { className: "ui horizontal label", id: "commentUser", style: { backgroundColor: props.message.user.specialColor } }, props.message.user.username),
            new Date(props.message.timestamp).toLocaleTimeString(),
            react_1.default.createElement("span", { id: "vote-option", className: "votes info" },
                react_1.default.createElement("i", { className: "plus icon" }),
                "1"),
            react_1.default.createElement("a", { id: "vote-counter", className: "ui label" }, props.message.votes.length)),
        react_1.default.createElement("div", { className: "content message-content" }, props.message.body)));
}
exports.default = Message;
;
