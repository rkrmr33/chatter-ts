"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = __importDefault(require("./config"));
var server = express_1.default();
server.get('/', function (req, res) {
    res.send('Hello world');
});
server.listen(config_1.default.PORT, function () {
    console.log("server is listening on port " + config_1.default.PORT + "...");
});
