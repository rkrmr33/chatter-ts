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
var axios_1 = __importDefault(require("axios"));
var check_1 = require("express-validator/check");
var bcrypt_1 = __importDefault(require("bcrypt"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var events_1 = require("events");
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
/**
 *    Users creation & Users authorization
 */
// Fetch a random color for the user generation
router.get('/api/color', function (req, res) {
    return axios_1.default.get(config_1.default.RANDOM_COLOR_API)
        .then(function (response) {
        if (response.status === 200 && response.data.colors)
            res.send(response.data.colors[0].hex);
        else
            res.send('fffff').status(response.status);
    })
        .catch(function (err) {
        console.error("[-] Could not find color from " + config_1.default.RANDOM_COLOR_API + ". Error: " + err);
    });
});
// Inserts a new user to db
router.post('/api/users/create', 
// server-side validation with express-validator
[
    //first name
    check_1.check('firstName').isLength({ min: 2, max: 25 }).isAlpha()
        .withMessage('first-name must between 2-25 characters, with no numbers'),
    //last name
    check_1.check('lastName').isLength({ min: 2, max: 25 }).isAlpha()
        .withMessage('last-name must between 2-25 characters, with no numbers'),
    //username
    check_1.check('username').isAscii().matches('[a-zA-Z][a-zA-Z0-9_]{5,31}')
        .withMessage('username must be between 6-31 characters long, and can only contain letters, numbers and \'_\''),
    //email
    check_1.check('email').isEmail()
        .withMessage('invalid email address'),
    //password
    check_1.check('password').isLength({ min: 8, max: 100 })
        .withMessage('password must be atleast 8 characters long and contain letters and numbers')
        .matches('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Za-z])([a-zA-Z0-9\%\!\#\^\&\@_]){8,30}$')
        .withMessage('password must be atleast 8 characters long and contain letters and numbers')
], function (req, res) {
    var user = req.body;
    // checks if the request has a user object
    if (!user) {
        // the request is invalid
        res.send({ created: false }).status(400);
        return;
    }
    // checking server-side validation results
    var userDataValidation = check_1.validationResult(req);
    if (!userDataValidation.isEmpty()) {
        // the user tried to pass the client side validation but got caught
        res.send({ created: false, errors: userDataValidation.mapped() }).status(400);
        return;
    }
    // assigning an avatar img url using the avatar api 
    user.avatar = config_1.default.AVATAR_API_URL + user.email;
    user.votes = 0;
    user.cp = 0;
    mdb.collection('users').findOne({ username: user.username })
        .then(function (foundUser) {
        if (foundUser) {
            res.send({ created: false, errors: { username: { msg: 'username already exists' } } }).status(400);
            return null;
        }
        return bcrypt_1.default.hash(user.password, 10);
    })
        .catch(function (err) {
        console.error("[-] Could not search for username: " + JSON.stringify(user.username) + ".\nError:" + err);
        res.send(null).status(404);
    })
        // generating a password hash
        .then(function (hash) {
        if (!hash)
            return;
        user.password = hash;
        return axios_1.default.get(config_1.default.RANDOM_COLOR_API);
    })
        .catch(function (err) {
        console.error("[-] Could not generate password from " + user.password + ". Error: " + err);
        res.send({ created: false }).status(500);
        throw err;
    })
        // fetching a random hex color from the random color api
        .then(function (response) {
        if (!response)
            return;
        if (response.status === 200 && response.data.colors) // worked
            user.specialColor = response.data.colors[0].hex;
        else // if has'nt worked, go to default color
            user.specialColor = '7b06ff';
        return mdb.collection('users').insertOne(user);
    })
        .catch(function (err) {
        console.error("[-] Could not fetch color from " + config_1.default.RANDOM_COLOR_API + ". Error: " + err);
        res.send({ created: false }).status(500);
        throw err;
    })
        // finally inserting the user into the DB
        .then(function (result) {
        if (!result)
            return;
        // The user has been successfuly created
        if (result.insertedCount === 1) {
            res.send({
                created: true,
                user: result.ops[0]
            }).status(200);
        }
        // Could not insert user into the DB
        else {
            console.error("[-] Could not insert user: " + JSON.stringify(user) + ".");
            res.send({ created: false }).status(400);
        }
    })
        .catch(function (err) {
        console.error("[-] Could not insert user: " + JSON.stringify(user) + ".\nError:" + err);
        res.send({ created: false }).status(400);
    });
});
// Checks if username is taken, true if taken, false otherwise
router.get('/api/users/check/:username', function (req, res) {
    if (!req.params.username) {
        res.send(false);
        return;
    }
    var username = req.params.username;
    mdb.collection('users').findOne({ username: username })
        .then(function (result) {
        if (!result)
            res.send(false);
        else
            res.send(true);
    })
        .catch(function (err) {
        console.error("[-] Could not search for username: " + JSON.stringify(username) + ".\nError:" + err);
        res.send(null).status(404);
    });
});
// handles user login
router.post('/api/users/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
        // wrong request
        res.sendStatus(500).send({ error: 'request invalid.' }).sendStatus(401);
    }
    mdb.collection('users').findOne({ username: username })
        .then(function (user) {
        if (!user) {
            // username is not registered
            res.send({ success: false, error: 'username does not exist' });
            return;
        }
        // checking if the password matches the hash in the db
        bcrypt_1.default.compare(password, user.password, function (err, same) {
            if (err) {
                // encryption error
                res.sendStatus(500).send({ success: false, error: 'encryption error' });
            }
            // password does not match hash
            if (!same) {
                res.send({ success: false, error: 'Incorrect password.' });
                return;
            }
            var credentials = {
                _id: user._id,
                password: user.password
            };
            // all is good, sending user credetials object
            jsonwebtoken_1.default.sign(credentials, config_1.default.SECRET_KEY, function (err, userToken) {
                if (err)
                    throw err;
                if (req.session) {
                    req.session.userToken = userToken;
                }
                delete user.password;
                res.send({ success: true, user: user });
            });
        });
    })
        .catch(function (err) { throw err; });
});
// handles user logout
router.get('/api/users/logout', function (req, res) {
    if (!req.session || !req.session.userToken) {
        res.send(false);
        return;
    }
    req.session.destroy(function (err) {
        if (err)
            throw err;
        res.send(true);
    });
});
// gets the request session user token and sends back the user object to store in the app state
router.get('/api/users/current_user', function (req, res) {
    if (!req.session || !req.session.userToken) {
        res.send(false);
    }
    else {
        jsonwebtoken_1.default.verify(req.session.userToken, config_1.default.SECRET_KEY, function (err, user) {
            if (err)
                throw err;
            res.send(user);
        });
    }
});
// gets the request session user token and sends back the user object to store in the app state
router.get('/api/users/authenticate', function (req, res) {
    var userCredentials;
    if (req.session)
        console.log(req.session.userToken);
    if (!req.session || !req.session.userToken) {
        res.send(false);
        return;
    }
    else {
        jsonwebtoken_1.default.verify(req.session.userToken, config_1.default.SECRET_KEY, function (err, user) {
            if (err)
                throw err;
            userCredentials = user;
        });
    }
    if (!userCredentials) {
        res.send(false);
        return;
    }
    mdb.collection('users').findOne({ _id: new mongodb_1.ObjectID(userCredentials._id) })
        .then(function (result) {
        if (!result) {
            res.status(404).send("user with id " + userCredentials._id + " was not found.");
            return;
        }
        if (result.password !== userCredentials.password) {
            res.status(400).send(undefined);
            return;
        }
        delete result.password;
        res.send(result);
    })
        .catch(function (e) {
        console.error(e);
        res.status(500).send(false);
    });
});
/**
 *    Chats data fetchers
 */
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
        if (!chat) {
            res.sendStatus(404); // chat not found
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
        if (!chat) {
            res.sendStatus(404); // chat not found
            return;
        }
        // find messages of the chat
        var chatId = chat._id;
        mdb.collection('messages').find({ chatId: chatId.toString() })
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
// Fetch messages of [chatId] -- not in use --
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
        res.send(messages);
    });
});
/**
 *    Chat Rooms Handlers
 */
var newMessage = new events_1.EventEmitter().setMaxListeners(10000); // emits every time a new message is sent
var newUser = new events_1.EventEmitter().setMaxListeners(10000); // emits every time a user leaves or joins a chat-room
var newVote = new events_1.EventEmitter().setMaxListeners(10000); // emits every time a message gets a vote
// Chat Stream
router.get('/api/stream/:chatId', function (req, res) {
    var chatId = req.params.chatId;
    res.writeHead(200, {
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });
    // handles new messages
    newMessage.addListener('new-message', function (msg) {
        if (msg.chatId === chatId) {
            res.write('event: new-message\n');
            res.write("data: " + JSON.stringify(msg));
            res.write('\n\n');
        }
    });
    // handles user enter chat
    newUser.addListener('user-enter', function (username, _id) {
        if (chatId === _id) {
            res.write('event: user-enter\n');
            res.write("data: " + username);
            res.write('\n\n');
        }
    });
    // handles user quit chat
    newUser.addListener('user-quit', function (username, _id) {
        if (chatId === _id) {
            res.write('event: user-quit\n');
            res.write("data: " + username);
            res.write('\n\n');
        }
    });
    // handles user quit chat
    newVote.addListener('new-vote', function (msg) {
        if (chatId === msg.chatId) {
            res.write('event: new-vote\n');
            res.write("data: " + JSON.stringify(msg));
            res.write('\n\n');
        }
    });
    // sets the client re-connection time to 1-sec 
    res.write('retry: 1000\n\n');
});
// Main page chat event stream
router.get('/api/stream/all_chats/:chatIds', function (req, res) {
    var chatIdsList = req.params.chatIds.split(',');
    res.writeHead(200, {
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });
    // handles user enter chat
    newUser.addListener('user-enter', function (username, _id) {
        if (chatIdsList.indexOf(_id) > -1) {
            res.write('event: user-enter\n');
            res.write('data: { \n');
            res.write("data: \"username\" : \"" + username + "\",\n");
            res.write("data: \"chatId\" : \"" + _id + "\"\n");
            res.write('data: } \n\n');
            res.write('\n\n');
        }
    });
    // handles user quit chat
    newUser.addListener('user-quit', function (username, _id) {
        if (chatIdsList.indexOf(_id) > -1) {
            res.write('event: user-quit\n');
            res.write('data: { \n');
            res.write("data: \"username\" : \"" + username + "\",\n");
            res.write("data: \"chatId\" : \"" + _id + "\"\n");
            res.write('data: } \n\n');
        }
    });
    // sets the client re-connection time to 5-sec 
    res.write('retry: 5000\n\n');
});
// Sends a messages to the db
router.post('/api/messages/send', function (req, res) {
    var message = req.body;
    config_1.default.VERBAL && console.log("a new message was sent in " + req.body.chatId);
    mdb.collection('messages').insertOne(message)
        .then(function (result) {
        if (result.insertedCount === 1 && result.ops[0]) {
            newMessage.emit('new-message', result.ops[0]); // emit a new event to stream
            res.send(result.ops[0]);
        }
        else {
            res.send(null).status(500);
        }
    })
        .catch(function (err) {
        console.error("[-] Could not send message: " + JSON.stringify(message) + ".\nError:" + err);
        res.send(null).status(500);
    });
});
// Inserts [username] to [chatId] users list
router.post('/api/chats/enter', function (req, res) {
    var username = req.body.username;
    var chatId = req.body.chatId;
    config_1.default.VERBAL && console.log(username + " entered chat: " + chatId);
    if (!chatId || !username) {
        res.status(400).send("could not push " + username + " to chat " + chatId);
        return;
    }
    //find the chat
    mdb.collection('chats').findOne({ _id: new mongodb_1.ObjectID(chatId) })
        .then(function (chat) {
        if (!chat) { // if chat is not found
            res.send("could not find chat with id " + chat._id).status(400);
            return;
        }
        if (chat.users.indexOf(username) > -1) { // if tried to push same username twice
            res.status(400).send(username + " is already in the chat user list " + JSON.stringify(chat.users));
            return;
        }
        // update chat users list
        mdb.collection('chats').updateOne({ _id: new mongodb_1.ObjectID(chatId) }, { $push: { users: username } }).then(function (result) {
            if (result.result.ok) { // inserted username
                newUser.emit('user-enter', username, chatId);
                res.status(200).send(true);
            }
            else
                res.send(null);
        })
            .catch(function (e) {
            console.error(e);
            res.status(404).send('Somthing went wrong');
        });
    })
        .catch(function (e) {
        console.error(e);
        res.status(404).send('Somthing went wrong');
    });
});
// Removes [username] from [chatId] users list
router.post('/api/chats/quit', function (req, res) {
    var username = req.body.username;
    var chatId = req.body.chatId;
    config_1.default.VERBAL && console.log(username + " quit chat: " + chatId);
    if (!chatId || !username) {
        res.status(400).send("could not push " + username + " to chat " + chatId);
        return;
    }
    mdb.collection('chats').findOneAndUpdate({ _id: new mongodb_1.ObjectID(chatId) }, { $pull: { users: username } }).then(function (result) {
        if (result && result.ok && result.ok == 1) { // user quit
            setTimeout(function () {
                newUser.emit('user-quit', username, chatId);
                res.status(200).send(true);
            }, 1000);
        }
        else
            res.status(400).send(false);
    })
        .catch(function (e) {
        console.error(e);
        res.status(404).send('Somthing went wrong');
    });
});
// Adds a vote of [username] to [message] and updates receiving users vote
router.post('/api/messages/vote', function (req, res) {
    var message = req.body.message;
    var givingUsername = req.body.username;
    if (!message || !givingUsername) {
        res.status(400).send("could not add vote from " + givingUsername + " to message " + message);
        return;
    }
    if (message.votes.indexOf(givingUsername) > -1) {
        res.status(400).send(givingUsername + " already gave a vote to message " + message);
        return;
    }
    var gettingUsername = message.user.username;
    mdb.collection('messages').updateOne({ _id: new mongodb_1.ObjectID(message._id) }, { $push: { votes: givingUsername } })
        .then(function (result) {
        if (result.result.ok) { // added vote
            return mdb.collection('users').updateOne({ username: gettingUsername }, { $inc: { votes: 1, cp: 1 } } // increase the votes
            );
        }
        else // was unable to add vote
            res.send(null);
    })
        .catch(function (e) {
        console.error(e);
        res.status(500).send('Somthing went wrong');
    })
        .then(function (result) {
        if (result.result.ok) { // added vote
            newVote.emit('new-vote', message);
            res.status(200).send(true);
        }
    })
        .catch(function (e) {
        console.error(e);
        res.status(500).send('Somthing went wrong');
    });
});
// takes [amount] ChatterPoints from [userId]
router.post('/api/users/pay', function (req, res) {
    var userId = req.body.userId;
    var amount = req.body.amount;
    if (!userId || !amount) {
        res.status(400).send("could not take " + amount + " cp from " + userId);
        return;
    }
    mdb.collection('users').findOne({ _id: new mongodb_1.ObjectID(userId) })
        .then(function (result) {
        if (!result) {
            res.status(404).send("user with id " + userId + " not found");
            return;
        }
        if (result.cp < amount) {
            res.status(404).send("user with id " + userId + " has " + result.cp + " cp but the amount needed is " + amount);
            return;
        }
        return mdb.collection('users').updateOne({ _id: new mongodb_1.ObjectID(userId) }, { $inc: { cp: -amount } });
    })
        .catch(function (e) {
        console.error(e);
        res.status(500).send('Somthing went wrong');
    })
        .then(function (result) {
        if (result.result.ok) { // taken cp
            res.status(200).send(true);
        }
    })
        .catch(function (e) {
        console.error(e);
        res.status(500).send('Somthing went wrong');
    });
});
exports.default = router;
