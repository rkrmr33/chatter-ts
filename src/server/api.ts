import assert from 'assert';
import express from 'express';
import mongodb, { ObjectID, MongoError } from 'mongodb';

import config from './config';
import axios from 'axios';
import { url } from 'inspector';

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

router.get('/api/avatar/:generator', (req : express.Request, res : express.Response) => {
  if (req.params.generator) {
    return axios.get(config.AVATAR_API_URL + req.params.generator)
      .then(response => {
        if (response.status === 200) 
          res.send(response.data);
        else {
          res.send('').status(response.status);
          console.log(response.data);
        }
      })
      .catch(err => {
        console.error(`[-] Could not fetch avatar frpm ${config.AVATAR_API_URL}. Error: ${err}`);
      });
  }
  res.send(null).status(404);
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
router.post('/api/users/create', (req : express.Request, res : express.Response) => {
  const user : IUser = req.body;
  if (!user) {
    res.send(null).status(400) // the request is invalid
    return;
  }

  user.avatar = config.AVATAR_API_URL + user.email;
  

  mdb.collection('users').insertOne(user)
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(`[-] Could not register user: ${JSON.stringify(user)}.\nError:${err}`);
      res.send(null).status(400);
    })
});


export default router;