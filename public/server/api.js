"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var express_1 = __importDefault(require("express"));
var mongodb_1 = __importStar(require("mongodb"));
var config_1 = __importDefault(require("./config"));
var router = express_1.default.Router();
var mdb;
// Connect to DB
(function connectDB() {
    mongodb_1.default.MongoClient.connect(config_1.default.DB_CONN_STR, { useNewUrlParser: true })
        .then(function (client) {
        mdb = client.db(config_1.default.DB_NAME);
        console.log('[+] Connected to db...');
    })
        .catch(function (err) {
        return console.error("[-] Could not connect to remote db. Error: " + err);
    });
})();
// Fetch all the chats from the db
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
            res.send('no chats found').status(404);
        }
        chatsArray.forEach(function (chat) {
            chats[chat._id] = chat;
        });
        res.send(chats);
        res.end();
    });
});
// Fetch one chat by [chatId]
router.get('/api/chats/:chatId', function (req, res) {
    var chatId = req.params.chatId;
    try {
        new mongodb_1.ObjectID(chatId);
    }
    catch (e) {
        console.error("[-] Could not build ObjectID from: " + req.params.chatId);
        res.status(404).end(null);
        return;
    }
    mdb.collection('chats').findOne({ _id: new mongodb_1.ObjectID(chatId) })
        .then(function (chat) { return res.send(chat); })
        .catch(function (err) {
        console.error("[-] Could not find chat with id: " + chatId + ".\nError:" + err);
        res.send(null).status(404);
    });
});
// Fetch one chat by [chatId] and then find messages related to chat
router.get('/api/chats/full/id/:chatId', function (req, res) {
    var chatId = req.params.chatId;
    try {
        new mongodb_1.ObjectID(chatId);
    }
    catch (e) {
        console.error("[-] Could not build ObjectID from: " + req.params.chatId);
        res.status(404).end(null);
        return;
    }
    mdb.collection('chats').findOne({ _id: new mongodb_1.ObjectID(chatId) })
        .then(function (chat) {
        mdb.collection('messages').find({ chatId: chatId })
            .toArray(function (err, messages) {
            try {
                assert_1.default.equal(null, err);
            }
            catch (e) {
                console.error("[-] Assertion Error: " + e);
                res.send([]).status(404);
                return;
            }
            res.send({
                currentChat: chat,
                messages: messages
            });
        });
    })
        .catch(function (err) {
        console.error("[-] Could not find chat with id: " + chatId + ".\nError:" + err);
        res.send(null).status(404);
    });
});
// Fetch one chat by [chatName] and then find messages related to chat
router.get('/api/chats/full/name/:chatName', function (req, res) {
    var chatName = req.params.chatName;
    // no chat name
    if (chatName === '') {
        res.send(null).status(404);
        return;
    }
    mdb.collection('chats').findOne({ chatName: chatName })
        .then(function (chat) {
        mdb.collection('messages').find({ chatId: chat._id })
            .toArray(function (err, messages) {
            try {
                assert_1.default.equal(null, err);
            }
            catch (e) {
                console.error("[-] Assertion Error: " + e);
                res.send([]).status(404);
                return;
            }
            res.send({
                currentChat: chat,
                messages: messages
            });
        });
    })
        .catch(function (err) {
        console.error("[-] Could not find chat with name: " + chatName + ".\nError:" + err);
        res.send(null).status(404);
    });
});
// Fetch messages of [chatId]
router.get('/api/messages/:chatId', function (req, res) {
    var chatId = req.params.chatId;
    try {
        new mongodb_1.ObjectID(chatId);
    }
    catch (e) {
        console.error("[-] Could not build ObjectID from: " + req.params.chatId);
        res.status(404).end(null);
        return;
    }
    mdb.collection('messages').find({ chatId: chatId })
        .toArray(function (err, messages) {
        try {
            assert_1.default.equal(null, err);
        }
        catch (e) {
            console.error("[-] Assertion Error: " + e);
            res.send([]).status(404);
            return;
        }
        console.log(messages);
        res.send(messages);
    });
});
// Inserts messages to the db
router.post('/api/messages/send', function (req, res) {
    var message = req.body;
    mdb.collection('messages').insertOne(message)
        .then(function (result) { return console.log(result); })
        .catch(function (err) {
        console.error("[-] Could not send message: " + JSON.stringify(message) + ".\nError:" + err);
        res.send(null).status(404);
    });
});
exports.default = router;
