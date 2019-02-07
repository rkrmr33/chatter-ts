"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var ChatPreview_1 = __importDefault(require("./ChatPreview"));
function ChatList(props) {
    return (react_1.default.createElement("div", { className: "ui celled list nine wide column", id: "mainDiv" }, Object.keys(props.chatList).map(function (chatId) { return react_1.default.createElement(ChatPreview_1.default, { key: chatId, onChatClick: props.onChatClick, chat: props.chatList[chatId] }); })));
}
exports.default = ChatList;
