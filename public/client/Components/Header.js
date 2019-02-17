"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var App_1 = require("../App");
function isLoggedInRightMenu(props) {
    if (props.user) {
        return (react_1.default.createElement("div", { className: "right menu" },
            react_1.default.createElement("a", { className: "ui image label", id: "userParentItem", style: { backgroundColor: "#" + props.user.specialColor } },
                react_1.default.createElement("img", { src: props.user.avatar }),
                props.user.username,
                react_1.default.createElement("div", { className: "detail" },
                    react_1.default.createElement("img", { src: "/CP.png" }),
                    " ",
                    props.user.cp),
                react_1.default.createElement("div", { className: "detail" },
                    react_1.default.createElement("i", { className: "icon thumbs up outline" }),
                    " ",
                    props.user.votes),
                react_1.default.createElement("div", { id: "logout-btn", className: "detail", onClick: props.logout }, "Log out"))));
    }
    return (react_1.default.createElement("div", { className: "right menu" },
        react_1.default.createElement("a", { className: props.display === App_1.Routes.SIGN_UP ? 'active item' : 'item', onClick: props.goToSignup }, "Sign up"),
        react_1.default.createElement("a", { className: props.display === App_1.Routes.LOG_IN ? 'active item' : 'item', onClick: props.goToLogin }, "Log in")));
}
function isLoggedInLeftMenu(props) {
    if (props.user) {
        return (react_1.default.createElement("a", { className: props.display === App_1.Routes.CHAT_CREATION ? 'active item' : 'item', onClick: function () { props.goToChatCreation(); } }, "Create a chat"));
    }
    return;
}
function Header(props) {
    return (react_1.default.createElement("div", { className: " sixteen wide column" },
        react_1.default.createElement("div", { id: "header-menu", className: "ui secondary pointing menu" },
            react_1.default.createElement("a", { className: props.display === App_1.Routes.MAIN ? 'active item' : 'item', href: "/" },
                react_1.default.createElement("span", null,
                    react_1.default.createElement("img", { id: "header-icon", src: "/chatter-icon.ico" }),
                    "Chatter")),
            isLoggedInLeftMenu(props),
            isLoggedInRightMenu(props))));
}
exports.default = Header;
;
