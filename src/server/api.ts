import assert from 'assert';
import express from 'express';
import mongodb, { ObjectID, MongoError } from 'mongodb';
import axios from 'axios';
import { check, validationResult } from 'express-validator/check';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './config';
import { Session } from 'inspector';


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

  mdb.collection('chats').findOne({ chatName: chatName })
    .then(chat => {
      mdb.collection('messages').find({ chatId: chat._id })
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

// Fetch messages of [chatId]
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
      console.log(messages);
      res.send(messages);
    })
});

// Inserts messages to the db
router.post('/api/messages/send', (req : express.Request, res : any) => {
  const message : IMessage = (req.body as IMessage);
  mdb.collection('messages').insertOne(message)
    .then(result => console.log(result))
    .catch(err => {
      console.error(`[-] Could not send message: ${JSON.stringify(message)}.\nError:${err}`);
      res.send(null).status(404);
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

        // all is good, sending user object
        jwt.sign(user, config.SECRET_KEY, (err : any, userToken : string) => {
          if (err) throw err;
          if (req.session) {
            req.session.userToken = userToken;
          }
          res.send({success: true, user})
        })
      });

    })
    .catch(err => { throw err });
});


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
export default router;