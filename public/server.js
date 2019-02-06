"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = __importDefault(require("./config"));
var serverRender_1 = require("./serverRender");
var get_routes = serverRender_1.routes.map(function (r) { return r.path; });
var server = express_1.default();
server.set('view engine', 'ejs');
server.get(get_routes, function (req, res) {
    res.render('index', {
        appTitle: 'Chatter',
        initialMarkup: 'is this working'
    });
});
server.listen(config_1.default.PORT, function () {
    console.log("server is listening on port " + config_1.default.PORT + "...");
});
