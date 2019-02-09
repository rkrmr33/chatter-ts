"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
function Message(props) {
    return (react_1.default.createElement("div", { className: "item" },
        react_1.default.createElement("img", { src: props.user.avatar, className: "ui avatar image" }),
        react_1.default.createElement("div", { className: "content" },
            react_1.default.createElement("div", { className: "metadata" },
                react_1.default.createElement("div", { className: "ui horizontal label", id: "commentUser", style: { backgroundColor: props.user.specialColor } }, props.user.username),
                new Date(props.timestamp).toLocaleTimeString()),
            props.body)));
}
exports.default = Message;
;
