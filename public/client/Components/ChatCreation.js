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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./interfaces.d.ts" />
var react_1 = __importDefault(require("react"));
var chatNameRegex = RegExp('[a-zA-Z][a-zA-Z0-9_]{2,50}');
var util;
var PRICE = 10;
var ChatCreation = /** @class */ (function (_super) {
    __extends(ChatCreation, _super);
    function ChatCreation(props) {
        var _this = _super.call(this, props) || this;
        _this.handleSubmit = function (e) {
            e.preventDefault();
            if (_this.validate(_this.state)) {
                var formElement_1 = document.getElementById('registerForm');
                if (formElement_1)
                    formElement_1.setAttribute('class', 'ui loading form');
                else
                    return;
                if (_this.props.user) {
                    util.payCP(_this.props.user._id, PRICE) // pay chat price
                        .then(function (response) {
                        if (!response) {
                            var errorMsg = 'You do not have enough Chatter-Points';
                            _this.setState({ resultMsg: errorMsg });
                        }
                        else {
                            if (_this.props.user) {
                                var newChat = {
                                    chatName: _this.state.chatName,
                                    chatDescription: _this.state.chatDescription,
                                    chatOwner: _this.props.user.username,
                                    chatImage: _this.state.chatImageUrl,
                                    users: []
                                };
                                util.createChat(newChat) // create the chat
                                    .then(function (result) {
                                    if (result.created) {
                                        formElement_1.setAttribute('class', 'ui form success');
                                    }
                                    else if (result.errors) {
                                        var errors_1 = result.errors;
                                        var formErrors_1 = _this.state.formErrors;
                                        Object.keys(errors_1).forEach(function (key) {
                                            formErrors_1[key] = errors_1[key].msg;
                                        });
                                        _this.setState({
                                            formErrors: formErrors_1
                                        }, function () {
                                            formElement_1.setAttribute('class', 'ui form error');
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
            else {
                var formElement = document.getElementById('registerForm');
                if (formElement)
                    formElement.setAttribute('class', 'ui form error');
            }
        };
        _this.validate = function (_a) {
            var formErrors = _a.formErrors, rest = __rest(_a, ["formErrors"]);
            var valid = true;
            Object.keys(formErrors).forEach(function (key) {
                formErrors[key].length > 0 && (valid = false); // if the error val len is more the 0 than the second operation will execute.
            });
            Object.keys(rest).forEach(function (key) {
                if (rest[key] === '' && formErrors[key] === '') {
                    valid = false;
                    formErrors[key] = 'is required';
                    _this.setState({ formErrors: formErrors });
                }
            });
            return valid;
        };
        _this.handleChange = function (e) {
            var _a;
            e.preventDefault();
            var _b = e.target, name = _b.name, value = _b.value;
            var formErrors = _this.state.formErrors;
            switch (name) {
                case 'chatName':
                    formErrors.chatName = chatNameRegex.test(value) ? '' : 'only numbers, letters and \'_\' allowed! at-least one letter';
                    if (formErrors.chatName === '')
                        formErrors.chatName = value.length > 2 ? '' : 'minimum 3 characters required!';
                    break;
                case 'chatDescription':
                    formErrors.chatDescription = value.length > 2 ? '' : 'minimum 3 characters required!';
                    break;
                case 'chatImageUrl':
                    if (value.length === 0)
                        _this.setState({ chatImageUrl: 'chatter-icon.png' });
                    else {
                        var img = new Image();
                        img.onload = function () { _this.setState({ chatImageUrl: value }); };
                        img.onerror = function () { _this.setState({ chatImageUrl: 'chatter-icon.png' }); };
                        img.src = value;
                    }
                    break;
            }
            var valid = true;
            Object.keys(formErrors).forEach(function (key) {
                formErrors[key] !== '' && (valid = false);
            });
            if (valid) {
                var formElement = document.getElementById('registerForm');
                if (formElement)
                    formElement.setAttribute('class', 'ui form');
                else
                    console.log('[-] cannot find element with id: registerForm');
            }
            _this.setState((_a = {
                    formErrors: formErrors
                },
                _a[name] = value,
                _a));
        };
        _this.checkChatName = function (e) {
            _this.handleChange(e);
            var formElement = document.getElementById('registerForm');
            var chatNameFieldIcon = document.getElementById('chatNameFieldIcon');
            var chatNameField = document.getElementsByName('chatName')[0];
            var formErrors = _this.state.formErrors;
            if (formErrors.chatName === '') {
                util.checkChatNameTaken(e.target.value)
                    .then(function (taken) {
                    if (taken) {
                        formErrors.chatName = 'This chat name is taken. Please choose another one.';
                        _this.setState({ formErrors: formErrors });
                        if (formElement && chatNameField && chatNameFieldIcon) {
                            formElement.setAttribute('class', 'ui form error');
                            chatNameField.removeAttribute('class');
                            chatNameFieldIcon.setAttribute('class', 'x icon red icon');
                        }
                    }
                    else {
                        if (formElement && chatNameField && chatNameFieldIcon) {
                            formElement.setAttribute('class', 'ui form');
                            chatNameField.setAttribute('class', 'success-field');
                            chatNameFieldIcon.setAttribute('class', 'check green icon');
                        }
                    }
                });
            }
            else {
                if (chatNameFieldIcon) {
                    chatNameFieldIcon.removeAttribute('class');
                }
                if (chatNameField) {
                    chatNameField.removeAttribute('class');
                }
            }
        };
        if (props.user && props.user.cp && props.user.cp < PRICE) { // if the user does not have enough cp
            _this.state = {
                chatName: '',
                chatDescription: '',
                chatImageUrl: '/chatter-icon.png',
                formErrors: {
                    chatName: '',
                    chatDescription: '',
                },
                resultMsg: '',
                notEnoughCP: 'You do not have enough Chatter-Points'
            };
        }
        else {
            _this.state = {
                chatName: '',
                chatDescription: '',
                chatImageUrl: '/chatter-icon.png',
                formErrors: {
                    chatName: '',
                    chatDescription: '',
                },
                resultMsg: '',
                notEnoughCP: ''
            };
        }
        return _this;
    }
    ChatCreation.prototype.componentDidMount = function () {
        util = require('../util');
    };
    ChatCreation.prototype.componentWillReceiveProps = function (nextProps) {
        if (!nextProps.user) { // if user is not logged in than go back to main page
            this.props.goToChatter();
        }
        else if (nextProps.user.cp && nextProps.user.cp < PRICE) { // user does not have enough cp to create a chat
            this.setState({ notEnoughCP: 'You do not have enough Chatter-Points' });
        }
    };
    ChatCreation.prototype.render = function () {
        return (react_1.default.createElement("div", { className: "ui seven wide column", id: "registrationDiv" },
            react_1.default.createElement("form", { onSubmit: this.handleSubmit },
                react_1.default.createElement("div", { className: this.state.notEnoughCP === '' ? 'ui form' : 'ui form error', id: 'registerForm' },
                    react_1.default.createElement("h3", { className: "ui dividing header chatter-color" }, "Create a new public chat room"),
                    react_1.default.createElement("div", { className: "ui message" },
                        react_1.default.createElement("a", { className: "ui mini label" },
                            react_1.default.createElement("img", { src: "/CP.png" })),
                        "\u00A0 Creating a chat will cost you 10 chatter-points."),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("div", { className: "two fields" },
                            react_1.default.createElement("div", { className: "new-chat-image" },
                                react_1.default.createElement("img", { src: this.state.chatImageUrl ? this.state.chatImageUrl : '/chatter-icon.png' })),
                            react_1.default.createElement("div", { className: this.state.formErrors.chatName === '' ? 'field' : 'field error' },
                                react_1.default.createElement("label", null, "Chat Name"),
                                react_1.default.createElement("input", { type: "text", placeholder: "chat name (max: 50 characters)", maxLength: 50, name: "chatName", onChange: this.checkChatName }),
                                react_1.default.createElement("i", { id: "chatNameFieldIcon" })))),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("div", { className: this.state.formErrors.chatDescription === '' ? 'field' : 'field error' },
                            react_1.default.createElement("label", null, "Chat description"),
                            react_1.default.createElement("textarea", { rows: 2, style: { marginTop: '0px', marginBottom: '0px', height: '76px' }, maxLength: 250, name: "chatDescription", placeholder: "chat description (max: 250 characters)", onChange: this.handleChange }))),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("div", { className: "field" },
                            react_1.default.createElement("label", null, "Chat image (url)"),
                            react_1.default.createElement("input", { type: "text", placeholder: "chat img (url)", name: "chatImageUrl", onChange: this.handleChange }))),
                    react_1.default.createElement("div", { id: "submit-register", className: this.state.notEnoughCP === '' ? 'ui submit button' : 'ui disabled submit button', onClick: this.handleSubmit }, "Create Chat"),
                    react_1.default.createElement("div", { className: "ui error message" },
                        react_1.default.createElement("div", { className: "header" }, "Please fix the errors below:"),
                        react_1.default.createElement("ul", { className: "list" },
                            this.state.formErrors.chatName === '' ? '' : react_1.default.createElement("li", null,
                                "Chat Name: ",
                                this.state.formErrors.chatName),
                            this.state.formErrors.chatDescription === '' ? '' : react_1.default.createElement("li", null,
                                "Chat Description: ",
                                this.state.formErrors.chatDescription),
                            this.state.notEnoughCP === '' ? '' : react_1.default.createElement("li", null, this.state.notEnoughCP))),
                    react_1.default.createElement("div", { className: "ui warning message" },
                        react_1.default.createElement("div", { className: "header" }, this.state.resultMsg)),
                    react_1.default.createElement("div", { className: "ui success message" },
                        react_1.default.createElement("div", { className: "header" },
                            this.state.chatName,
                            " chat was created"),
                        react_1.default.createElement("p", null,
                            "Click ",
                            react_1.default.createElement("a", { href: "/c/" + this.state.chatName }, "here"),
                            " to go there now and chat!"))),
                react_1.default.createElement("button", { type: "submit", style: { display: 'none' } }))));
    };
    return ChatCreation;
}(react_1.default.Component));
exports.default = ChatCreation;
