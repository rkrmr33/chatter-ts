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
var Login = /** @class */ (function (_super) {
    __extends(Login, _super);
    function Login(props) {
        var _this = _super.call(this, props) || this;
        _this.validate = function (e) {
            if (e)
                e.preventDefault();
            var formElement = document.getElementById('loginForm');
            var username = document.getElementsByName('username')[0];
            var password = document.getElementsByName('password')[0];
            var errors = _this.state.errors;
            errors.result = '';
            if (username.value === '') {
                username.setAttribute('class', 'required field error');
                errors.username = 'Please enter a valid username';
            }
            else {
                username.setAttribute('class', 'required field');
                errors.username = '';
            }
            if (password.value === '') {
                password.setAttribute('class', 'required field error');
                errors.password = 'Please enter a valid password';
            }
            else {
                password.setAttribute('class', 'required field');
                errors.password = '';
            }
            _this.setState({ errors: errors });
            var valid = true;
            Object.keys(_this.state.errors).forEach(function (key) {
                _this.state.errors[key] !== '' && (valid = false);
            });
            // if all is valid attempt password & username validation against the server
            if (valid && formElement) {
                formElement.setAttribute('class', 'ui loading form');
            }
            else if (formElement) {
                formElement.setAttribute('class', 'ui form error');
            }
        };
        _this.state = {
            errors: {
                username: '',
                password: '',
                result: ''
            }
        };
        return _this;
    }
    Login.prototype.render = function () {
        return (react_1.default.createElement("div", { className: "ui four wide column", id: "registrationDiv" },
            react_1.default.createElement("h3", { className: "ui dividing header" },
                "Log in to your ",
                react_1.default.createElement("b", { className: "chatter-color" }, "Chatter"),
                " account!"),
            react_1.default.createElement("form", { onSubmit: this.validate },
                react_1.default.createElement("div", { id: "loginForm", className: 'ui form' },
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("label", null, "Username"),
                        react_1.default.createElement("input", { type: "text", placeholder: "Username", name: "username", autoFocus: true, autoComplete: "username" })),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("label", null, "Password"),
                        react_1.default.createElement("input", { type: "password", placeholder: "Password", name: "password", autoComplete: "off" })),
                    react_1.default.createElement("div", { id: "submit-register", className: "ui submit button", onClick: this.validate }, "Log In"),
                    react_1.default.createElement("div", { className: "ui error message" },
                        react_1.default.createElement("div", { className: "header" }, "Please fix the errors below:"),
                        react_1.default.createElement("ul", { className: "list" },
                            this.state.errors.username === '' ? '' : react_1.default.createElement("li", null,
                                "Username: ",
                                this.state.errors.username),
                            this.state.errors.password === '' ? '' : react_1.default.createElement("li", null,
                                "Password: ",
                                this.state.errors.password),
                            this.state.errors.result === '' ? '' : react_1.default.createElement("li", null, this.state.errors.result)))),
                react_1.default.createElement("button", { type: "submit", style: { display: 'none' } })),
            react_1.default.createElement("div", { className: "ui warning message" },
                react_1.default.createElement("i", { className: "icon help" }),
                "Don't have a Chatter account yet? ",
                react_1.default.createElement("a", { id: "link", onClick: this.props.goToSignup }, "Sign Up"),
                " now!")));
    };
    return Login;
}(react_1.default.Component));
exports.default = Login;
