import assert from 'assert';
import express from 'express';
import React from 'react';
import mongodb, { MongoClient } from 'mongodb';

import config from './config';

const router = express.Router();

let mdb : mongodb.Db;

// Connect to DB
mongodb.MongoClient.connect(config.DB_CONN_STR, { useNewUrlParser: true})
  .then(client => {
    mdb = client.db(config.DB_NAME)
    console.log('[+] Connected to db...');
  })
  .catch(err => 
    console.log(`[-] Could not connect to remote db. Error: ${err}`
  ));

router.get('/api/chats', (req, res) => {
  let chats : any = {};
  mdb.collection('chats').find({})
    .toArray((err, chatsArray) => {
      try {
        assert.equal(null, err);
        assert.notEqual(0, chatsArray.length);
      } catch(e) {
        console.error(`[-] Assertion Error: ${e}`);
        res.statusCode = 404;
        res.send('404');
        res.end;
      }
      chatsArray.forEach(chat => {
        chats[chat._id] = chat;
      });

      res.send(chats);
      res.end();
    });
});



export default router;