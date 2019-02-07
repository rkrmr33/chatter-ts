"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
function isLoggedIn(props) {
    if (props.user) {
        return (react_1.default.createElement("div", { className: "right menu" },
            react_1.default.createElement("a", { className: "item", onClick: props.logout }, "Log out"),
            react_1.default.createElement("a", { className: "item" },
                react_1.default.createElement("div", { id: "userLabel", className: "ui horizontal label", style: { backgroundColor: "#" + props.user.specialColor } }, props.user.username))));
    }
    return (react_1.default.createElement("div", { className: "right menu" },
        react_1.default.createElement("a", { className: "item", onClick: props.goToSignup }, "Sign up"),
        react_1.default.createElement("a", { className: "item", onClick: props.goToLogin }, "Log in")));
}
function Header(props) {
    return (react_1.default.createElement("div", { className: " sixteen wide column" },
        react_1.default.createElement("div", { id: "header-menu", className: "ui secondary pointing menu" },
            react_1.default.createElement("a", { className: "active item", onClick: props.goToChatter },
                react_1.default.createElement("span", null,
                    react_1.default.createElement("img", { id: "header-icon", src: "/chatter-icon.ico" }),
                    "Chatter")),
            react_1.default.createElement("a", { className: "item" }, "Chats"),
            isLoggedIn(props))));
}
exports.default = Header;
;
