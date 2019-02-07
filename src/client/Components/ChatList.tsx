/// <reference path="./interfaces.d.ts" />
import React from 'react';

import ChatPreview from './ChatPreview';

export default function ChatList(props : IChatList) {
  return (
    <div className="ui celled list nine wide column" id="mainDiv">
      { Object.keys(props.chatList).map(chatId => <ChatPreview key={chatId} onChatClick={props.onChatClick} chat={props.chatList[chatId]}/> ) }
    </div>
  );
}