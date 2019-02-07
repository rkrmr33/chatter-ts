"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
function handleClick(props) {
    props.onChatClick(props.chat._id);
}
function ChatPreview(props) {
    return (react_1.default.createElement("div", { className: "item", onClick: function () { handleClick(props); } },
        react_1.default.createElement("img", { className: "ui avatar image chat-preview-icon", src: props.chat.chatImage }),
        react_1.default.createElement("div", { className: "content" },
            react_1.default.createElement("div", { className: "header" },
                react_1.default.createElement("span", null, props.chat.chatName)),
            props.chat.chatDescription),
        react_1.default.createElement("div", { className: "right floated content" },
            react_1.default.createElement("span", { className: "userCount" },
                props.chat.users.length,
                " "),
            react_1.default.createElement("i", { className: "user circle icon" }))));
}
exports.default = ChatPreview;
