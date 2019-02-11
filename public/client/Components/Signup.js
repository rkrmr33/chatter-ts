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
var nameRegex = RegExp('^(([A-za-z]+[\s]{1}[A-za-z]+)|([A-Za-z]+))$');
var usernameRegex = RegExp('[a-zA-Z][a-zA-Z0-9_]{5,31}');
var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
var passwordRegex = RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Za-z])([a-zA-Z0-9\%\!\#\^\&\@_]){8,30}$');
var util;
var Signup = /** @class */ (function (_super) {
    __extends(Signup, _super);
    function Signup(props) {
        var _this = _super.call(this, props) || this;
        _this.handleSubmit = function (e) {
            e.preventDefault();
            if (_this.validate(_this.state)) {
                var formElement_1 = document.getElementById('registerForm');
                if (formElement_1)
                    formElement_1.setAttribute('class', 'ui loading form');
                else
                    return;
                var user = {
                    firstName: _this.state.firstName,
                    lastName: _this.state.lastName,
                    email: _this.state.email,
                    username: _this.state.username,
                    password: _this.state.password1,
                };
                // Here we should check for any errors from the server-side-validation.
                util.createAccount(user)
                    .then(function (result) {
                    // user was successfuly created, now login..
                    if (result.created) {
                        formElement_1.setAttribute('class', 'ui form success');
                        _this.props.login(result.user);
                    }
                    // If there are server validation errors, display them
                    else if (result.errors) {
                        var errors_1 = result.errors;
                        var formErrors_1 = _this.state.formErrors;
                        Object.keys(errors_1).forEach(function (key) {
                            formErrors_1[key] = errors_1[key].msg;
                        });
                        _this.setState({ formErrors: formErrors_1 }, function () {
                            formElement_1.setAttribute('class', 'ui form error');
                        });
                    }
                    // Another server error, check server log...
                    else {
                        formElement_1.setAttribute('class', 'ui form warning');
                    }
                });
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
                case 'firstName':
                    formErrors.firstName = nameRegex.test(value) ? '' : 'cannot contain numbers, spaces or special characters!';
                    if (formErrors.firstName === '')
                        formErrors.firstName = value.length > 1 ? '' : 'minimum 2 characters required!';
                    break;
                case 'lastName':
                    formErrors.lastName = nameRegex.test(value) ? '' : 'cannot contain numbers, spaces or special characters!';
                    if (formErrors.lastName === '')
                        formErrors.lastName = value.length > 1 ? '' : 'minimum 2 characters required!';
                    break;
                case 'email':
                    formErrors.email = emailRegex.test(value) ? '' : 'invalid email address!';
                    break;
                case 'username':
                    formErrors.username = value.length > 5 ? '' : 'needs to be at least 6 characters long!';
                    if (formErrors.username === '')
                        formErrors.username = usernameRegex.test(value) ? '' : 'can contain only letters, numbers and the \'_\' character!';
                    break;
                case 'password1':
                    formErrors.password1 = value.length > 7 ? '' : 'needs to be at least 8 characters long!';
                    if (formErrors.password1 === '')
                        formErrors.password1 = passwordRegex.test(value) ? '' : 'needs to contain a combination of at least 8 letters and numbers.';
                    break;
                case 'password2':
                    formErrors.password2 = value === _this.state.password1 ? '' : 'does not match the password';
                    if (formErrors.password2 === '')
                        formErrors.password2 = value.length > 0 ? '' : 'please enter confirmation password';
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
        _this.checkUsername = function (e) {
            _this.handleChange(e);
            var formElement = document.getElementById('registerForm');
            var usernameFieldIcon = document.getElementById('usernameFieldIcon');
            var usernameField = document.getElementsByName('username')[0];
            var formErrors = _this.state.formErrors;
            if (formErrors.username === '') {
                util.checkUsernameTaken(e.target.value)
                    .then(function (taken) {
                    if (taken) {
                        formErrors.username = 'This username is taken. Please choose another one.';
                        _this.setState({ formErrors: formErrors });
                        if (formElement && usernameField && usernameFieldIcon) {
                            formElement.setAttribute('class', 'ui form error');
                            usernameField.removeAttribute('class');
                            usernameFieldIcon.setAttribute('class', 'x icon red icon');
                        }
                    }
                    else {
                        if (formElement && usernameField && usernameFieldIcon) {
                            formElement.setAttribute('class', 'ui form');
                            usernameField.setAttribute('class', 'success-field');
                            usernameFieldIcon.setAttribute('class', 'check green icon');
                        }
                    }
                });
            }
            else {
                if (usernameFieldIcon) {
                    usernameFieldIcon.removeAttribute('class');
                }
                if (usernameField) {
                    usernameField.removeAttribute('class');
                }
            }
        };
        _this.state = {
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            password1: '',
            password2: '',
            formErrors: {
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password1: '',
                password2: ''
            }
        };
        return _this;
    }
    Signup.prototype.componentDidMount = function () {
        util = require('../util');
    };
    Signup.prototype.render = function () {
        return (react_1.default.createElement("div", { className: "ui seven wide column", id: "registrationDiv" },
            react_1.default.createElement("form", { onSubmit: this.handleSubmit },
                react_1.default.createElement("div", { className: 'ui form', id: 'registerForm' },
                    react_1.default.createElement("h3", { className: "ui dividing header chatter-color" },
                        "Create a new ",
                        react_1.default.createElement("b", { className: "chatter-color" }, "Chatter"),
                        " account"),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("label", null, "Name"),
                        react_1.default.createElement("div", { className: "two fields" },
                            react_1.default.createElement("div", { className: this.state.formErrors.firstName === '' ? 'field' : 'field error' },
                                react_1.default.createElement("input", { type: "text", placeholder: "first name", name: "firstName", onChange: this.handleChange })),
                            react_1.default.createElement("div", { className: this.state.formErrors.lastName === '' ? 'field' : 'field error' },
                                react_1.default.createElement("input", { type: "text", placeholder: "last name", name: "lastName", onChange: this.handleChange })))),
                    react_1.default.createElement("div", { className: "two fields" },
                        react_1.default.createElement("div", { className: this.state.formErrors.email === '' ? 'required field' : 'required field error' },
                            react_1.default.createElement("label", null, "Email"),
                            react_1.default.createElement("input", { type: "email", placeholder: "joe@schmoe.com", name: "email", onChange: this.handleChange })),
                        react_1.default.createElement("div", { className: this.state.formErrors.username === '' ? 'required field' : 'required field error' },
                            react_1.default.createElement("label", null, "Username"),
                            react_1.default.createElement("input", { type: "text", placeholder: "username", name: "username", onChange: this.checkUsername }),
                            react_1.default.createElement("i", { id: "usernameFieldIcon" }))),
                    react_1.default.createElement("div", { className: "required field" },
                        react_1.default.createElement("label", null, "Password"),
                        react_1.default.createElement("div", { className: "two fields" },
                            react_1.default.createElement("div", { className: this.state.formErrors.password1 === '' ? 'field' : 'field error' },
                                react_1.default.createElement("input", { type: "password", placeholder: "password", name: "password1", onChange: this.handleChange })),
                            react_1.default.createElement("div", { className: this.state.formErrors.password2 === '' ? 'field' : 'field error' },
                                react_1.default.createElement("input", { type: "password", placeholder: "confirm password", name: "password2", onChange: this.handleChange })))),
                    react_1.default.createElement("div", { id: "submit-register", className: "ui submit button", onClick: this.handleSubmit }, "Create Account"),
                    react_1.default.createElement("div", { className: "ui error message" },
                        react_1.default.createElement("div", { className: "header" }, "Please fix the errors below:"),
                        react_1.default.createElement("ul", { className: "list" },
                            this.state.formErrors.firstName === '' ? '' : react_1.default.createElement("li", null,
                                "First Name: ",
                                this.state.formErrors.firstName),
                            this.state.formErrors.lastName === '' ? '' : react_1.default.createElement("li", null,
                                "Last Name: ",
                                this.state.formErrors.lastName),
                            this.state.formErrors.email === '' ? '' : react_1.default.createElement("li", null,
                                "Email: ",
                                this.state.formErrors.email),
                            this.state.formErrors.username === '' ? '' : react_1.default.createElement("li", null,
                                "Username: ",
                                this.state.formErrors.username),
                            this.state.formErrors.password1 === '' ? '' : react_1.default.createElement("li", null,
                                "Password: ",
                                this.state.formErrors.password1),
                            this.state.formErrors.password2 === '' ? '' : react_1.default.createElement("li", null,
                                "Confirmation password: ",
                                this.state.formErrors.password2))),
                    react_1.default.createElement("div", { className: "ui warning message" },
                        react_1.default.createElement("div", { className: "header" }, "Your account was not created due to a server error. Please reload this page and try again.")),
                    react_1.default.createElement("div", { className: "ui success message" },
                        react_1.default.createElement("div", { className: "header" }, "Sign up complete!"),
                        react_1.default.createElement("p", null,
                            "Welcome to ",
                            react_1.default.createElement("b", { className: "chatter-color" }, "Chatter"),
                            "! Now go ahead and chat!"))),
                react_1.default.createElement("button", { type: "submit", style: { display: 'none' } })),
            react_1.default.createElement("div", { className: "ui warning message" },
                react_1.default.createElement("i", { className: "icon help" }),
                "Already signed up? ",
                react_1.default.createElement("a", { id: "link", onClick: this.props.goToLogin }, "Log in here"),
                " instead.")));
    };
    return Signup;
}(react_1.default.Component));
exports.default = Signup;
