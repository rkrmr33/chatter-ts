"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var express_1 = __importDefault(require("express"));
var mongodb_1 = __importDefault(require("mongodb"));
var config_1 = __importDefault(require("./config"));
var router = express_1.default.Router();
var mdb;
// Connect to DB
mongodb_1.default.MongoClient.connect(config_1.default.DB_CONN_STR, { useNewUrlParser: true })
    .then(function (client) {
    mdb = client.db(config_1.default.DB_NAME);
    console.log('[+] Connected to db...');
})
    .catch(function (err) {
    return console.log("[-] Could not connect to remote db. Error: " + err);
});
router.get('/api/chats', function (req, res) {
    var chats = {};
    mdb.collection('chats').find({})
        .toArray(function (err, chatsArray) {
        try {
            assert_1.default.equal(null, err);
            assert_1.default.notEqual(0, chatsArray.length);
        }
        catch (e) {
            console.error("[-] Assertion Error: " + e);
            res.statusCode = 404;
            res.send('404');
            res.end;
        }
        chatsArray.forEach(function (chat) {
            chats[chat._id] = chat;
        });
        res.send(chats);
        res.end();
    });
});
exports.default = router;
