"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var passport_1 = __importDefault(require("passport"));
var express_flash_1 = __importDefault(require("express-flash"));
var express_session_1 = __importDefault(require("express-session"));
var MongoStore = require('connect-mongo')(express_session_1.default);
var config_1 = __importDefault(require("./config"));
var api_1 = __importDefault(require("./api"));
var serverRender_1 = require("./serverRender");
var app_routes = serverRender_1.routes.map(function (r) { return r.path; });
var server = express_1.default();
server.set('view engine', 'ejs');
server.set('trust proxy', 1);
server.use(express_1.default.static('static'));
server.use(body_parser_1.default.json());
server.use(express_session_1.default({
    secret: config_1.default.SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ url: config_1.default.DB_CONN_STR })
}));
server.use(express_flash_1.default());
server.use(passport_1.default.initialize());
server.use(api_1.default);
server.get(app_routes, function (req, res) {
    serverRender_1.serverRender(req)
        .then(function (_a) {
        var __INITIAL_MARKUP__ = _a.__INITIAL_MARKUP__, __INITIAL_DATA__ = _a.__INITIAL_DATA__;
        res.render('index', { __INITIAL_MARKUP__: __INITIAL_MARKUP__, __INITIAL_DATA__: __INITIAL_DATA__ });
    });
});
server.listen(config_1.default.PORT, function () {
    console.log("[+] Server is listening on port " + config_1.default.PORT + "...");
});
