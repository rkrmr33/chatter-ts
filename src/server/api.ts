import assert from 'assert';
import express from 'express';
import mongodb, { ObjectID, MongoError } from 'mongodb';
import axios from 'axios';
import { check, validationResult } from 'express-validator/check';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';

import config from './config';

const router = express.Router();

let mdb : mongodb.Db;

// Connect to DB
(function connectDB(){
  mongodb.MongoClient.connect(config.DB_CONN_STR, { useNewUrlParser: true})
    .then(client => {
      mdb = client.db(config.DB_NAME)
      console.log('[+] Connected to db...');
    })
    .catch(err => 
      console.error(`[-] Could not connect to remote db. Error: ${err}`
    ));
})()



/**
 *    Users creation & Users authorization
 */

// Fetch a random color for the user generation
router.get('/api/color', (req : express.Request, res : express.Response) => {
  return axios.get(config.RANDOM_COLOR_API)
    .then(response => {
      if(response.status === 200 && response.data.colors) 
        res.send(response.data.colors[0].hex)
      else
        res.send('fffff').status(response.status);
    })
    .catch(err => {
      console.error(`[-] Could not find color from ${config.RANDOM_COLOR_API}. Error: ${err}`);
    });
});

// Inserts a new user to db
router.post('/api/users/create', 
// server-side validation with express-validator
[
  //first name
  check('firstName').isLength({ min:2, max:25 }).isAlpha()
  .withMessage('first-name must between 2-25 characters, with no numbers'),
  //last name
  check('lastName').isLength({ min:2, max:25 }).isAlpha()
  .withMessage('last-name must between 2-25 characters, with no numbers'),
  //username
  check('username').isAscii().matches('[a-zA-Z][a-zA-Z0-9_]{5,31}')
  .withMessage('username must be between 6-31 characters long, and can only contain letters, numbers and \'_\''),
  //email
  check('email').isEmail()
  .withMessage('invalid email address'),
  //password
  check('password').isLength({ min:8, max:100 })
  .withMessage('password must be atleast 8 characters long and contain letters and numbers')
  .matches('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Za-z])([a-zA-Z0-9\%\!\#\^\&\@_]){8,30}$')
  .withMessage('password must be atleast 8 characters long and contain letters and numbers')
  ],
 (req : express.Request, res : express.Response) => {
  
  const user : IUser = req.body;

  // checks if the request has a user object
  if (!user) {
    // the request is invalid
    res.send({ created: false }).status(400)
    return;
  }

  // checking server-side validation results
  const userDataValidation = validationResult(req);
  if (!userDataValidation.isEmpty()) {
    // the user tried to pass the client side validation but got caught
    res.send({ created: false, errors: userDataValidation.mapped() }).status(400);
    return;
  }

  // assigning an avatar img url using the avatar api 
  user.avatar = config.AVATAR_API_URL + user.email;
  user.votes = 0;
  user.cp = 0;

  mdb.collection('users').findOne({ username: user.username })
    .then((foundUser : any) : any=> {
      if(foundUser) {
        res.send({ created: false, errors: { username: { msg: 'username already exists'}} }).status(400);
        return null;
      }
      return bcrypt.hash(user.password, 10);
    })
    .catch((err : any) => {
      console.error(`[-] Could not search for username: ${JSON.stringify(user.username)}.\nError:${err}`);
      res.send(null).status(404);
    })

  // generating a password hash
    .then((hash : any) : any => {
      if (!hash) return;
      (user as any).password = hash;
      return axios.get(config.RANDOM_COLOR_API);
    })
    .catch((err : any) => { 
      console.error(`[-] Could not generate password from ${user.password}. Error: ${err}`);
      res.send({ created: false }).status(500);
      throw err;
    })

    // fetching a random hex color from the random color api
    .then((response : any) : any => {
      if (!response) return;
      if(response.status === 200 && response.data.colors) // worked
        user.specialColor = response.data.colors[0].hex;
      else  // if has'nt worked, go to default color
        user.specialColor = '7b06ff';

      return mdb.collection('users').insertOne(user)
    })
    .catch((err : any)=> {
      console.error(`[-] Could not fetch color from ${config.RANDOM_COLOR_API}. Error: ${err}`);
      res.send({ created: false }).status(500);
      throw err;
    })

    // finally inserting the user into the DB
    .then((result : any) : any => {
      if(!result) return;
      // The user has been successfuly created
      if(result.insertedCount === 1) { 
        res.send({
          created: true,
          user: result.ops[0]
        }).status(200);
      }
      // Could not insert user into the DB
      else {
        console.error(`[-] Could not insert user: ${JSON.stringify(user)}.`);
        res.send({ created: false }).status(400);
      }
    })
    .catch((err : any)=> {
      console.error(`[-] Could not insert user: ${JSON.stringify(user)}.\nError:${err}`);
      res.send({ created: false }).status(400);
    });
});

// Checks if username is taken, true if taken, false otherwise
router.get('/api/users/check/:username', (req : express.Request, res : express.Response) => {
  if (!req.params.username) {
    res.send(false);
    return;
  }

  const username = req.params.username;

  mdb.collection('users').findOne({username})
    .then(result => {
      if(!result)
        res.send(false);
      else
        res.send(true);
    })
    .catch(err => {
      console.error(`[-] Could not search for username: ${JSON.stringify(username)}.\nError:${err}`);
      res.send(null).status(404);
    });
});

// handles user login
router.post('/api/users/login', (req : express.Request, res : express.Response) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    // wrong request
    res.sendStatus(500).send({error: 'request invalid.'}).sendStatus(401);
  }

  mdb.collection('users').findOne({ username })
    .then(user => {
      if (!user) {
        // username is not registered
        res.send({success: false, error: 'username does not exist'});
        return;
      }

      // checking if the password matches the hash in the db
      bcrypt.compare(password, user.password, (err, same) => {
        if (err) {
          // encryption error
          res.sendStatus(500).send({success: false, error: 'encryption error'});
        }

        // password does not match hash
        if (!same) {
          res.send({success: false, error: 'Incorrect password.'});
          return;
        }

        let credentials = {
          _id: user._id,
          password: user.password
        }

        // all is good, sending user credetials object
        jwt.sign(credentials, config.SECRET_KEY, (err : any, userToken : string) => {
          if (err) throw err;
          if (req.session) {
            req.session.userToken = userToken;
          }
          delete user.password;
          res.send({success: true, user})
        })
      });

    })
    .catch(err => { throw err });
});

// handles user logout
router.get('/api/users/logout', (req : express.Request, res : express.Response) => {
  if (!req.session || !req.session.userToken) {
    res.send(false);
    return;
  }

  req.session.destroy(err => {
    if (err) throw err;
    res.send(true);
  })
    
});

// gets the request session user token and sends back the user object to store in the app state
router.get('/api/users/current_user', (req : express.Request, res : express.Response) => {
  if (!req.session || !req.session.userToken) {
    res.send(false);
  }
  else {
    jwt.verify(req.session.userToken, config.SECRET_KEY, (err : any, user : any) => {
      if (err) throw err;
      res.send(user);
    })
  }
});

// gets the request session user token and sends back the user object to store in the app state
router.get('/api/users/authenticate', (req : express.Request, res : express.Response) => {
  let userCredentials : any;
  
  if(req.session)
    console.log(req.session.userToken);

  if (!req.session || !req.session.userToken) {
    res.send(undefined);
    return;
  }
  else {
    jwt.verify(req.session.userToken, config.SECRET_KEY, (err : any, user : any) => {
      if (err) throw err;
      userCredentials = user;
    })
  }
  

  if (!userCredentials) {
    res.send(false);
    return;
  }

  mdb.collection('users').findOne({ _id: new ObjectID(userCredentials._id) })
    .then(result => {
      if (!result) {
        res.status(404).send(`user with id ${userCredentials._id} was not found.`);
        return;
      }

      if (result.password !== userCredentials.password) {
        res.status(400).send(undefined);
        return;
      }

      delete result.password;

      res.send(result);
    })
    .catch(e => {
      console.error(e);
      res.status(500).send(false);
    })
});



/**
 *    Chats data fetchers
 */

// Fetch all the chats from the db
router.get('/api/chats', (req : express.Request, res) => {
  let chats : any = {};
  mdb.collection('chats').find({})
    .toArray((err, chatsArray) => {
      try {
        assert.equal(null, err);
        assert.notEqual(0, chatsArray.length);
      } catch(e) {
        console.error(`[-] Assertion Error: ${e}`);
        res.send('no chats found').status(404);
      }
      chatsArray.forEach(chat => {
        chats[chat._id] = chat;
      });

      res.send(chats);
      res.end();
    })
});

// Fetch one chat by [chatId]
router.get('/api/chats/:chatId', (req : express.Request, res) => {
  let chatId = req.params.chatId;
  try {
    new ObjectID(chatId);
  } catch (e) {
    console.error(`[-] Could not build ObjectID from: ${req.params.chatId}`);
    res.status(404).end(null);
    return;
  }
  mdb.collection('chats').findOne({ _id: new ObjectID(chatId) })
    .then(chat => res.send(chat))
    .catch(err => {
      console.error(`[-] Could not find chat with id: ${chatId}.\nError:${err}`);
      res.send(null).status(404);
    });
});

// Fetch one chat by [chatId] and then find messages related to chat
router.get('/api/chats/full/id/:chatId', (req : express.Request, res) => {
  let chatId = req.params.chatId;
  try {
    new ObjectID(chatId);
  } catch (e) {
    console.error(`[-] Could not build ObjectID from: ${req.params.chatId}`);
    res.status(404).end(null);
    return;
  }
  mdb.collection('chats').findOne({ _id: new ObjectID(chatId) })
    .then(chat => {
      if (!chat) {
        res.sendStatus(404) // chat not found
        return;
      }
      mdb.collection('messages').find({ chatId })
        .toArray((err : MongoError, messages) => {
          try {
            assert.equal(null, err);
          } catch(e) {
            console.error(`[-] Assertion Error: ${e}`);
            res.send([]).status(404);
            return;
          }
          res.send({
            currentChat: chat,
            messages
          });
        })
    })
    .catch(err => {
      console.error(`[-] Could not find chat with id: ${chatId}.\nError:${err}`);
      res.send(null).status(404);
    });
});

// Fetch one chat by [chatName] and then find messages related to chat
router.get('/api/chats/full/name/:chatName', (req : express.Request, res) => {
  let chatName = req.params.chatName;
  // no chat name
  if (chatName === '') {
    res.send(null).status(404);
    return;
  }

  mdb.collection('chats').findOne({ chatName })
    .then(chat => {
      if (!chat) {
        res.sendStatus(404) // chat not found
        return;
      }

      // find messages of the chat
      const chatId = chat._id; 
      mdb.collection('messages').find({ chatId: chatId.toString() })
        .toArray((err : MongoError, messages) => {
          try {
            assert.equal(null, err);
          } catch(e) {
            console.error(`[-] Assertion Error: ${e}`);
            res.send([]).status(404);
            return;
          }
          res.send({
            currentChat: chat,
            messages
          });
        })
    })
    .catch(err => {
      console.error(`[-] Could not find chat with name: ${chatName}.\nError:${err}`);
      res.send(null).status(404);
    });
});

// Fetch messages of [chatId] -- not in use --
router.get('/api/messages/:chatId', (req : express.Request, res) => {
  let chatId = req.params.chatId;
  try {
    new ObjectID(chatId);
  } catch (e) {
    console.error(`[-] Could not build ObjectID from: ${req.params.chatId}`);
    res.status(404).end(null);
    return;
  }
  mdb.collection('messages').find({ chatId: chatId })
    .toArray((err, messages) => {
      try {
        assert.equal(null, err);
      } catch(e) {
        console.error(`[-] Assertion Error: ${e}`);
        res.send([]).status(404);
        return;
      }
      res.send(messages);
    })
});



/**
 *    Chat Rooms Handlers
 */

const newMessage = new EventEmitter().setMaxListeners(10000);  // emits every time a new message is sent
const newUser    = new EventEmitter().setMaxListeners(10000);  // emits every time a user leaves or joins a chat-room
const newVote    = new EventEmitter().setMaxListeners(10000);  // emits every time a message gets a vote

// Chat Stream
router.get('/api/stream/:chatId', (req : express.Request, res : express.Response) => {

  const chatId = req.params.chatId;

  res.writeHead(200, {
		Connection: 'keep-alive',
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  
  // handles new messages
  newMessage.addListener('new-message', (msg : IMessage) => {
    if (msg.chatId === chatId) {
      res.write('event: new-message\n');
      res.write(`data: ${JSON.stringify(msg)}`);
      res.write('\n\n');
    }
  });

  // handles user enter chat
  newUser.addListener('user-enter', (username : string, _id : string) => {
    if (chatId === _id) {
      res.write('event: user-enter\n');
      res.write(`data: ${username}`);
      res.write('\n\n');
    }
  });

  // handles user quit chat
  newUser.addListener('user-quit', (username : string, _id : string) => {
    if (chatId === _id) {
      res.write('event: user-quit\n');
      res.write(`data: ${username}`);
      res.write('\n\n');
    }
  });

    // handles user quit chat
  newVote.addListener('new-vote', (msg : IMessage) => {
    if (chatId === msg.chatId) {
      res.write('event: new-vote\n');
      res.write(`data: ${JSON.stringify(msg)}`);
      res.write('\n\n');
    }
  });

  // sets the client re-connection time to 1-sec 
  res.write('retry: 1000\n\n');
});

// Main page chat event stream
router.get('/api/stream/all_chats/:chatIds', (req : express.Request, res : express.Response) => {

  const chatIdsList = req.params.chatIds.split(',');

  res.writeHead(200, {
		Connection: 'keep-alive',
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*'
  });

  // handles user enter chat
  newUser.addListener('user-enter', (username : string, _id : string) => {
    if (chatIdsList.indexOf(_id) > -1) {
      res.write('event: user-enter\n');
      res.write('data: { \n');
      res.write(`data: "username" : "${username}",\n`);
      res.write(`data: "chatId" : "${_id}"\n`);
      res.write('data: } \n\n');
      res.write('\n\n');
    }
  });

  // handles user quit chat
  newUser.addListener('user-quit', (username : string, _id : string) => {
    if (chatIdsList.indexOf(_id) > -1) {
      res.write('event: user-quit\n');
      res.write('data: { \n');
      res.write(`data: "username" : "${username}",\n`);
      res.write(`data: "chatId" : "${_id}"\n`);
      res.write('data: } \n\n');
    }
  });

  // sets the client re-connection time to 5-sec 
  res.write('retry: 5000\n\n');
});

// Sends a messages to the db
router.post('/api/messages/send', (req : express.Request, res : express.Response) => {

  const message : IMessage = (req.body as IMessage);

  config.VERBAL && console.log(`a new message was sent in ${req.body.chatId}`);

  mdb.collection('messages').insertOne(message)
    .then(result => {
      if (result.insertedCount === 1 && result.ops[0]) {
        newMessage.emit('new-message', result.ops[0]); // emit a new event to stream
        res.send(result.ops[0])
      }
      else {
        res.send(null).status(500);
      }
    })
    .catch(err => {
      console.error(`[-] Could not send message: ${JSON.stringify(message)}.\nError:${err}`);
      res.send(null).status(500);
    });
});

// Inserts [username] to [chatId] users list
router.post('/api/chats/enter', (req : express.Request, res : express.Response) => {
  const username = req.body.username;
  const chatId = req.body.chatId;

  config.VERBAL && console.log(`${username} entered chat: ${chatId}`);

  if (!chatId || !username) {
    res.status(400).send(`could not push ${username} to chat ${chatId}`);
    return;
  }

  //find the chat
  mdb.collection('chats').findOne({ _id: new ObjectID(chatId)	})
    .then(chat => {
      if (!chat) { // if chat is not found
        res.send(`could not find chat with id ${chat._id}`).status(400);
        return;
      }
      if (chat.users.indexOf(username) > -1) { // if tried to push same username twice
        res.status(400).send(`${username} is already in the chat user list ${JSON.stringify(chat.users)}`);
        return;
      }
      // update chat users list
      mdb.collection('chats').updateOne(
        { _id: new ObjectID(chatId) },
        { $push: { users: username } }
      ).then((result : any)=> {
        if(result.result.ok) { // inserted username
          newUser.emit('user-enter', username, chatId)
          res.status(200).send(true); 
        }
        else
          res.send(null);
      })
      .catch(e => {
        console.error(e);
        res.status(404).send('Somthing went wrong');
      });
    })
		.catch(e => {
			console.error(e);
			res.status(404).send('Somthing went wrong');
		});
});

// Removes [username] from [chatId] users list
router.post('/api/chats/quit', (req : express.Request, res : express.Response) => {
  const username = req.body.username;
  const chatId = req.body.chatId;
  
  config.VERBAL && console.log(`${username} quit chat: ${chatId}`);
  

  if (!chatId || !username) {
    res.status(400).send(`could not push ${username} to chat ${chatId}`);
    return;
  }

	mdb.collection('chats').findOneAndUpdate(
		{ _id: new ObjectID(chatId)	},
		{ $pull: { users: username } }
	).then(result => {
		if(result && result.ok && result.ok == 1) { // user quit
      newUser.emit('user-quit', username, chatId)
			res.status(200).send(true);
    }
		else
			res.status(400).send(false);
	})
		.catch(e => {
			console.error(e);
			res.status(404).send('Somthing went wrong');
		});
});

// Adds a vote of [username] to [message] and updates receiving users vote
router.post('/api/messages/vote', (req : express.Request, res : express.Response) => {
  const message : IMessage = req.body.message;
  const givingUsername = req.body.username;

  if (!message || !givingUsername) {
    res.status(400).send(`could not add vote from ${givingUsername} to message ${message}`);
    return;
  }

  if (message.votes.indexOf(givingUsername) > -1) {
    res.status(400).send(`${givingUsername} already gave a vote to message ${message}`);
    return;
  }

  const gettingUsername = message.user.username;

  mdb.collection('messages').updateOne(
    { _id: new ObjectID(message._id)},
    { $push: { votes: givingUsername }}
    )
    .then((result : any) : any => {
      if(result.result.ok) { // added vote
        
        return mdb.collection('users').updateOne(
          { username: gettingUsername },
          { $inc: { votes: 1, cp: 1 }}  // increase the votes
          );
      }
      else  // was unable to add vote
        res.send(null);
    })
    .catch(e => {
      console.error(e);
      res.status(500).send('Somthing went wrong');
    })
    .then((result: any) => {
      if(result.result.ok) { // added vote
        newVote.emit('new-vote', message)
        res.status(200).send(true);
      }
    })
    .catch(e => {
      console.error(e);
      res.status(500).send('Somthing went wrong');
    })
});

// takes [amount] ChatterPoints from [userId]
router.post('/api/users/pay', (req : express.Request, res : express.Response) => {
  const userId = req.body.userId;
  const amount : number = req.body.amount;

  if (!userId || !amount) {
    res.status(400).send(`could not take ${amount} cp from ${userId}`);
    return;
  }
  
  mdb.collection('users').findOne({ _id: new ObjectID(userId) })
    .then((result : any) : any => {
      if (!result) {
        res.status(404).send(`user with id ${userId} not found`);
        return;
      }

      if (result.cp < amount) {
        res.status(404).send(`user with id ${userId} has ${result.cp} cp but the amount needed is ${amount}`);
        return;
      }

      return mdb.collection('users').updateOne(
        { _id: new ObjectID(userId) },
        { $inc: { cp: -amount }}
        )
    })
    .catch(e => {
      console.error(e);
      res.status(500).send('Somthing went wrong');
    })
    .then((result: any) => {
      if(result.result.ok) { // taken cp
        res.status(200).send(true);
      }
    })
    .catch(e => {
      console.error(e);
      res.status(500).send('Somthing went wrong');
    })
});



export default router;